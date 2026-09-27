# AP Study Hub

AP Precalculus / Calculus / Physics のReferenceとPractice Problemを、Unit・Topicごとに探せる日英対応の自主学習サイトです。Vite + Reactで生成する完全静的サイトで、GitHub Pages上でバックエンドやAPIキーなしに動作します。

## 主な機能

- 6科目のCourse → Unit → Topic → Reference / Problem閲覧
- キーワード、Course、Unit、Topic、TagによるReference検索
- Difficulty、Question Typeを加えたPractice Problem検索
- Reference ↔ Practice Problemの相互リンク
- ページ遷移なしの日本語 / English切り替え
- 解答・解説の開閉表示
- KaTeXによる数式表示
- PC、iPad、スマートフォン対応

## ローカル起動

Node.js 22以上を推奨します。

```bash
npm install
npm run dev
```

表示されたURL（通常は `http://localhost:5173`）をブラウザで開いてください。

本番ビルドとデータ検証は次で実行できます。

```bash
npm test
npm run preview
```

## GitHub Pagesへのデプロイ

1. GitHubにリポジトリを作り、このフォルダーを `main` ブランチへpushします。
2. GitHubのリポジトリで **Settings → Pages** を開きます。
3. **Build and deployment → Source** を **GitHub Actions** にします。
4. `main` へpushすると `.github/workflows/deploy-pages.yml` が自動実行されます。

Actionsは依存関係を復元し、教材JSONの整合性検査、Viteビルド、`dist/` のPagesアーティファクト化、デプロイを順に行います。`vite.config.ts` の `base: "./"` とハッシュベースのURLにより、ユーザーページとプロジェクトページの両方に対応します。

## ディレクトリ構成

```text
.
├── .github/workflows/deploy-pages.yml  # GitHub Pages自動デプロイ
├── scripts/validate-data.mjs          # 教材JSONの整合性検査
├── src/
│   ├── App.tsx                        # 画面、検索、日英切替、ルーティング
│   ├── styles.css                     # レスポンシブUI
│   ├── types.ts                       # 教材データの型定義
│   └── data/
│       ├── courses.json               # Course情報と公式CEDのURL
│       ├── frameworks/                # 科目別の公式Unit / Topic構成
│       ├── references/<course>/       # Reference JSON
│       └── problems/<course>/         # Problem JSON
├── index.html
├── package.json
└── vite.config.ts
```

`App.tsx` の検索部分は現在、ブラウザ内でJSONを直接絞り込みます。データ層は `src/data/index.ts` に分離しているため、将来Fuse.js、Pagefind、AI検索APIなどに差し替えやすい構成です。学習履歴もProblem IDをキーにすれば追加できます。

## PDF・教科書・ワークブックの扱い

公開しない教材ファイルは、プロジェク直下の `private-materials/` に保管します。このフォルダーとPDF・Word・PowerPoint・Excelファイルは `.gitignore` の対象で、GitHubへpushされません。Viteの `publicDir` も無効化しているため、GitHub Pagesの成果物にはコピーされません。

生徒が開く教材は、ファイル本体ではなくGoogle Driveの共有URLだけをJSONに登録します。URLは、対象の生徒がGoogleアカウントでアクセスできる共有設定にしてください。サイト側にファイル本体やGoogleの認証情報を保存する必要はありません。

## Referenceの追加

対象科目の `src/data/references/<course>/references.json` にオブジェクトを追加します。

```json
{
  "id": "physics-c-em-electric-field-002",
  "course": "ap-physics-c-em",
  "unit": "electric-charges-fields-gauss-law",
  "topic": "electric-fields",
  "title": { "en": "Field Lines", "ja": "電気力線" },
  "description": { "en": "Read field-line diagrams.", "ja": "電気力線の図を読み取ります。" },
  "content": { "en": "...", "ja": "..." },
  "tags": ["electric-field", "field-lines"],
  "relatedProblems": ["physics-c-em-p003"]
}
```

`id` はReferenceとProblemを通じて重複しない値にしてください。本文のインライン数式は `$...$`、独立した数式は1行の `$$...$$` で記述します。

## Problemの追加

対象科目の `src/data/problems/<course>/problems.json` へ追加します。

`private-materials/` 内のAP Exam・Practice Examを参考にする場合は、原題を転載せず、測定する技能や典型的な解法だけを参考にして類題を作成します。状況設定、数値、式、問い方、選択肢、解説は新しく書き起こしてください。元PDFや解答ファイルを公開データへコピーしないでください。

```json
{
  "id": "physics-c-em-p003",
  "course": "ap-physics-c-em",
  "unit": "electric-charges-fields-gauss-law",
  "topic": "electric-fields",
  "title": { "en": "Direction of a Field", "ja": "電場の向き" },
  "difficulty": 2,
  "questionType": "conceptual",
  "question": { "en": "...", "ja": "..." },
  "solution": { "en": "...", "ja": "..." },
  "tags": ["electric-field"],
  "relatedReferences": ["physics-c-em-electric-field-001"]
}
```

`difficulty` は1〜5、`questionType` は `multiple-choice` / `free-response` / `conceptual` / `calculation` のいずれかです。選択式では任意の `choices` 配列も追加できます。

全Topicの練習とReferenceのカバレッジは `npm run generate-problems` で、ProblemとReferenceそれぞれの `coverage.json` へ生成します。各TopicにReferenceが1件以上と難易度1〜5のProblemが1問ずつ揃い、相互にリンクされます。`npm run check-data` は欠落、関連ID、英語表示データへの日本語混入を検出します。`coverage.json` は直接編集せず、テンプレートを `scripts/generate-coverage-problems.mjs` で管理してください。

## Unit / Topicの追加

Unit / TopicはCollege Boardの公式Course and Exam Description（CED）に合わせて `src/data/frameworks/<course>.json` で管理します。各Unitには `number`、日英の `name`、日英の `examWeighting`、`topics` を持たせ、各Topicには公式番号の `code` を指定します。AP Calculus AB / BCは共通の `ap-calculus.json` を使い、BC専用項目を `bcOnly: true` で管理します。

Reference / Problemの `course`、`unit`、`topic` は、フレームワークで定義したIDと一致させてください。各Courseから公式CEDを開くURLは `src/data/courses.json` の `sourceUrl` で管理します。

## 日英翻訳データ

表示文言は以下の形で英語と日本語を必ずセットで持ちます。

```json
{ "en": "Electric Field", "ja": "電場" }
```

Course / Unit / Topicの `name`、Referenceの `title` / `description` / `content`、Problemの `title` / `question` / `solution` / `choices` が対象です。Course / Unit / Topic名とProblemのタイトル・問題文・選択肢は、日本語モードでも英語を表示します。Referenceは日本語モードで日本語の説明を表示し、中心用語は「電荷（Electric Charge）」のように日英併記します。複合用語は「電荷（Electric Charge）と電気力（Electric Force）」のように、各用語の直後に英語を付けます。Problemの解答・解説と操作画面も日本語へ切り替わります。`npm run check-data` は必須の日英テキストと、Unit / Topic / 関連教材IDの整合性を検査します。
