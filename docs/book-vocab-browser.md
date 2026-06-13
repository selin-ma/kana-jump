# 书级词汇浏览（Book Vocab Browser）

## 背景

现在单词模块的词表浏览藏在"选课 → 章节内展开"里，体验割裂，用户无法跨章节搜索。

## 目标

进入某本书后，可以直接看到全书所有单词，并支持实时搜索。

## 交互流程

1. 书架 → 点击某本书
2. **新增"全部单词"入口** —— 在章节列表页顶部加一个"全部单词 (N词)"按钮
3. 点击进入 BookBrowser 视图：
   - 顶部搜索框（placeholder：搜索假名、汉字或释义…）
   - 实时过滤（client-side，数据一次性全量加载）
   - 每行：序号 | 假名 | 汉字 | 释义 | 章节标签 | 音频按钮
   - 章节标签用浅色 badge 显示（如"第2课"）
4. 返回按钮回到章节列表

## 技术方案

- 新增 `fetchWordsByBook(bookId)` in `services/vocab.ts`：JOIN chapters，按 `chapter.order_idx + word.order_idx` 排序
- 新增 `useBookWords(bookId)` hook：封装上面的 fetch，返回 `{ words, loading, error }`
- 新增 `BookBrowser` 组件（`src/components/vocab/BookBrowser.tsx`）：接收 allWords + chapterMap，内置搜索 state
- `VocabApp.tsx` 中在 chapter picker 之前加入 BookBrowser 路由分支（新增 `browsing: boolean` state）

## 不做的事

- 不分页（全量渲染，500–600 词没问题）
- 不改 ChapterList 现有逻辑
- 不引入新依赖（搜索用原生 string includes）

## 组件 Props 接口（草案）

```ts
interface BookBrowserProps {
  bookTitle: string
  chapters: Chapter[] // 用于生成 chapterMap
  words: WordWithChapter[] // Word + chapterTitle
  loading: boolean
  error: string | null
  onBack: () => void
}

interface WordWithChapter extends Word {
  chapterTitle: string
  chapterOrderIdx: number
}
```
