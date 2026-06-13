# 单词导入流程

从日语教材 PDF 识别单词，导入 Supabase，上传音频到 Cloudflare R2 的完整流程。

---

## 总览

```
PDF
 │
 ▼ (手动 / LLM 提取)
chapter JSON          ← 中间格式，所有脚本的输入
 │
 ├─▶ json_to_sql.py  →  import.sql  →  Supabase SQL Editor（写入 books/chapters/words）
 │
 ├─▶ generate_audio.py  →  audio/*.mp3（Edge TTS 合成）
 │
 └─▶ upload_audio.py   →  R2（上传 mp3）+ audio-urls-XX.sql  →  Supabase SQL Editor（回填 audio_url）
```

全程幂等：重复运行同一 JSON 只会 upsert，不产生重复数据。

---

## 环境准备

### Python 依赖

```bash
pip install edge-tts boto3 python-dotenv
```

### `.env.local`（项目根目录，**不提交**）

```
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<key>
R2_SECRET_ACCESS_KEY=<secret>
R2_BUCKET=kana-jump-audio
R2_PUBLIC_BASE=https://<public-url>.r2.dev
```

R2 API Token 在 Cloudflare Dashboard → R2 → Manage API tokens 创建，权限选 Object Read & Write。

---

## Chapter JSON 格式

所有脚本统一读取这个格式：

```json
{
  "book": {
    "code": "minna-1",
    "title": "みんなの日本語 初級I",
    "publisher": "スリーエーネットワーク"
  },
  "chapter": {
    "order_idx": 3,
    "title": "第3課"
  },
  "words": [
    {
      "order_idx": 1,
      "kana": "おはようございます",
      "kanji": null,
      "pitch_accent": 0,
      "pos": ["感動詞"],
      "meaning_zh": "早上好",
      "notes": null
    }
  ]
}
```

字段说明：

- `book.code` — 唯一标识，用于 R2 路径和 SQL upsert key（如 `minna-1`、`minna-2`）
- `chapter.order_idx` — 课序号（整数），决定 R2 路径中的 `lesson-NN`
- `words[].order_idx` — 单词在本章的序号（从 1 开始），决定 mp3 文件名（`001.mp3`）
- `words[].kana` — 读音（平假名），TTS 合成的文本来源；`～` / `〜` 占位符会自动去除
- `words[].pos` — 词性数组，可为 `null`
- `words[].pitch_accent` — 声调型（整数），可为 `null`

### 本地目录布局约定

```
kana-jump-resources/
  library/
    minna-1/
      lesson-03/
        data/
          lesson-03.json   ← chapter JSON 放这里
        audio/             ← generate_audio.py 输出到这里
          001.mp3
          002.mp3
          ...
```

---

## Step 1 — PDF 提取 → Chapter JSON

自动化工作流见 skill：`skill_view(name='vocab-import-from-pdf')`

流程简述（由 AI 配合你完成）：

1. **macOS OCR** 逐页识别 PDF 扫描件
2. **LLM 解析** OCR 文本并对照教材，按 JSON schema 整理数据
3. **只报问题** — AI 只列出有疑问的项目，你人工 review 修正
4. 确认无误后保存为 `lesson-NN/data/lesson-NN.json`

注意事项（AI 帮你把握）：

- `order_idx` 必须从 1 连续编号，不能跳号（决定音频文件名）
- `kana` 填实际读音假名，不要填汉字
- 有汉字写法的填 `kanji`，无则 `null`
- `pitch_accent` 未知时可先 `null`，后续补

> **人工审核阀门** — 这是整个流程中唯一需要你参与的步骤。JSON 确认无误后再跑后面的脚本。

---

## Step 2 — 写入 Supabase（books / chapters / words）

```bash
python3 scripts/json_to_sql.py path/to/lesson-03/data/lesson-03.json 25 > import-03.sql
```

第二个参数是该教材总章节数（默认 25），写入 `books.total_chapters`。

产出 `import-03.sql`，在 **Supabase Dashboard → SQL Editor** 中运行。

操作内容：

- upsert `books`（按 `code`）
- upsert `chapters`（按 `book_id + order_idx`）
- upsert `words`（按 `chapter_id + order_idx`，不含 `audio_url`）

---

## Step 3 — 生成音频（Edge TTS）

```bash
python3 scripts/generate_audio.py path/to/lesson-03/data/lesson-03.json
```

可选参数：

| 参数      | 默认值               | 说明              |
| --------- | -------------------- | ----------------- |
| `--voice` | `ja-JP-NanamiNeural` | Edge TTS 声音名称 |
| `--rate`  | `-10%`               | 语速调整          |

mp3 输出到 JSON 同级的 `../audio/` 目录（即 `lesson-03/audio/001.mp3`）。

已存在且非空的文件自动跳过，可断点续传。

---

## Step 4 — 上传 R2 + 回填 audio_url

```bash
python3 scripts/upload_audio.py path/to/lesson-03/data/lesson-03.json
```

- 读取 `.env.local` 中的 R2 凭证
- 将 `lesson-03/audio/*.mp3` 上传到 R2，key 格式：`<book_code>/lesson-<NN>/<order_idx:03d>.mp3`
- 自动在 JSON 同目录输出 `audio-urls-03.sql`

在 **Supabase Dashboard → SQL Editor** 中运行生成的 `audio-urls-03.sql`，回填 `words.audio_url`。

指定输出路径：

```bash
python3 scripts/upload_audio.py lesson-03/data/lesson-03.json --sql-out /tmp/audio-03.sql
```

---

## Step 5 — 验证

在 Supabase SQL Editor 快速核查：

```sql
-- 检查章节词数
select b.code, c.order_idx, c.title, c.word_count,
       count(w.id) as actual_count,
       count(w.audio_url) as with_audio
from chapters c
join books b on b.id = c.book_id
join words w on w.chapter_id = c.id
where b.code = 'minna-1' and c.order_idx = 3
group by b.code, c.order_idx, c.title, c.word_count;
```

`actual_count` 应与 `word_count` 一致，`with_audio` 应等于词数。

---

## check-env.js

`scripts/check-env.js` 是构建时的前置检查，确认 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 已设置。由 `package.json` 在 `build` 命令前自动调用，无需手动运行。

---

## 常见问题

**`edge_tts` 合成失败** — 检查网络，Edge TTS 需要访问微软服务器。失败的词会在末尾打印，重新运行会跳过已成功的文件。

**R2 上传 403** — API Token 权限不够或 token 已过期，在 Cloudflare 重新生成。

**Supabase SQL 报 conflict** — 正常，脚本设计为 upsert，不是错误。

**`order_idx` 编号错了** — 需要手动修正 JSON 后重新跑 Step 2-4，R2 对象会被覆盖，Supabase 会 upsert。
