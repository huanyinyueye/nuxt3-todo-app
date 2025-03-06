# Nuxt 3 Todo App / Nuxt 3 To-doアプリ

A modern To-do application built with Nuxt 3.  
Nuxt 3 で構築されたTo-doアプリケーションです。

🌐 **Live Demo**: [nuxt3-todo-app-drab.vercel.app](https://nuxt3-todo-app-drab.vercel.app)

## Features / 機能

- 🎯 Board layout / ボードレイアウト
- ✨ Drag and drop tasks / ドラッグ＆ドロップでタスク移動
- 🏷️ Task labels and priorities / ラベルと優先度の設定
- 📅 Due date management / 期限日の管理
- 🔍 Search and filter tasks / タスクの検索とフィルタリング

## Tech Stack / 使用技術

- [Nuxt 3](https://nuxt.com/) - Vue.js Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [DaisyUI](https://daisyui.com/) - UI Components
- [Pinia](https://pinia.vuejs.org/) - State Management

## Setup / セットアップ

```bash
# Install dependencies / 依存関係のインストール
npm install

# Start development server / 開発サーバーの起動
npm run dev

# Build for production / プロダクションビルド
npm run build

# Preview production build / プロダクションビルドのプレビュー
npm run preview
```

## Project Structure / プロジェクト構造

```
nuxt3-todo-app/
├── components/          # Vue components / Vueコンポーネント
│   ├── TaskBoard.vue   # Main kanban board / メインのかんばんボード
│   ├── TaskCard.vue    # Individual task card / 個別のタスクカード
│   └── TaskForm.vue    # Task creation form / タスク作成フォーム
├── stores/             # Pinia stores / Piniaストア
│   └── todo.ts         # Todo state management / Todoの状態管理
├── composables/        # Composable functions / 共通機能
│   └── useTheme.ts     # Theme management / テーマ管理
└── pages/             # Application pages / アプリケーションページ
    └── index.vue      # Main page / メインページ

```

## Features Details / 機能の詳細

### Task Management / タスク管理
- Create, edit, and delete tasks / タスクの作成・編集・削除
- Set task priorities (High, Medium, Low) / 優先度の設定（高、中、低）
- Add custom labels / カスタムラベルの追加
- Set due dates / 期限日の設定

### Task Board / タスクボード
- Four status columns / 4つのステータスカラム
  - New / 新規
  - Scheduled / スケジュール済み
  - In Progress / 進行中
  - Completed / 完了
- Drag and drop between columns / カラム間のドラッグ＆ドロップ
- Task count per column / カラムごとのタスク数表示

### Search and Filter / 検索とフィルター
- Search tasks by text / テキストによるタスク検索
- Filter by priority / 優先度でフィルター
- Sort by due date, priority, or creation date / 期限日、優先度、作成日でソート

## Contributing / コントリビューション
Contributions are welcome! Please feel free to submit a Pull Request.  
コントリビューションを歓迎します！Pull Requestをお気軽にご提出ください。
