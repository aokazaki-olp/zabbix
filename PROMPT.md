# 非エンジニア向けSalesforce Sandbox UI改修環境の構築

## 背景・目的

非エンジニアが、Salesforceの知識もLightning App Builder等のBuilder系ツールの理解もないまま、
Claude Desktopの「Code」タブを使って自然言語だけで、特定Sandbox内のオブジェクトUI
(ページレイアウト、FlexiPage、項目等)をトライアンドエラーで改修できる環境を構築する。

対象オブジェクト([対象オブジェクトAPI名]) にはValidation Ruleが80種以上存在するため、
変更前に必ず影響VRを提示し、人間の承認を経てからデプロイする設計にすること。

## 絶対制約(最優先・最重要)

1. **この環境は対象Sandbox(alias: [SANDBOX_ALIAS])以外のいかなるSalesforce組織
   (本番・他Sandbox)にも接続してはならない。**
2. これは「指示を守る」ことで実現するのではなく、以下の技術的制約の組み合わせで
   機械的に保証すること:
   - このマシン/このプロジェクトには [SANDBOX_ALIAS] 以外のorgを絶対に認証(sf org login)しない
   - hookによる強制検証(後述)
3. **LWC/Apexの実装が必要な変更は行わない。** その場合は「エンジニアへの相談が必要です」
   と案内し、変更作業を止めること。
4. 非エンジニアはsf CLI・Metadata API・Builder系ツールの存在や使い方を一切知らなくてよい
   前提で、全ての説明は自然言語で行うこと。

## ディレクトリ構成

以下の構成でプロジェクトを作成すること:

```
project-root/
├── CLAUDE.md              (このファイルの方針を要約して記載)
├── AGENTS.md               (@CLAUDE.mdを参照。運用ルールの説明書き)
├── sfdx-project.json
├── force-app/main/default/
│   ├── objects/            (カスタム項目・VR・リストビュー用)
│   └── flexipages/         (Lightning Page用)
├── .claude/
│   ├── settings.json        (hooks + mcpServers定義。後述)
│   └── skills/
│       └── (後述のスキルのみ配置。それ以外は入れない)
└── logs/
    └── operations.jsonl     (PostToolUseフックが機械的に追記するログ)
```

## MCPサーバー設定(`.claude/settings.json`内 `mcpServers`)

公式のSalesforce DX MCP Server(`@salesforce/mcp`)を使うこと。自作・他の非公式実装は使わない。

```json
{
  "mcpServers": {
    "Salesforce DX": {
      "command": "npx",
      "args": [
        "-y", "@salesforce/mcp",
        "--orgs", "[SANDBOX_ALIAS]",
        "--toolsets", "metadata,data",
        "--no-telemetry"
      ]
    }
  }
}
```

- `--orgs`には[SANDBOX_ALIAS]のみを指定し、他の値(ALLOW_ALL_ORGS等)は使わないこと
- `--toolsets`は`metadata`(deploy_metadata/retrieve_metadata)と`data`(run_soql_query、
  既存VR確認用)のみ。`orgs`ツールセットは有効化しないこと(他orgの存在を見せないため)

## Skills(`.claude/skills/`に配置するもの)

`forcedotcom/sf-skills`(旧afv-library)から以下のみを取得して配置すること。
コミットハッシュを固定してピン留めすること(頻繁に変更されるリポジトリのため)。

- `generating-flexipage`
- `generating-custom-field`
- `generating-list-view`
- `generating-validation-rule`
- `generating-permission-set`
- `fetching-salesforce-docs`(常時有効。機能説明時は必ずこれで公式ドキュメントを
  裏取りしてから回答する旨をCLAUDE.mdにも明記すること)

**以下は明示的に除外し、配置しないこと**:
- `switching-org`(org切り替え機能。統制方針と衝突)
- `configuring-connected-apps`(Connected App設定変更。統制方針と衝突)
- その他、上記6つ以外の全スキル(Data Cloud、OmniStudio、UI Bundle等は今回無関係)

さらに、以下の自作スキルを新規作成すること:

- `word-report-generator`: 非エンジニアが承認した変更内容を、エンジニアへの本番反映
  依頼用のWord文書として整理するスキル。監査ログではなく、非エンジニアが自然言語で
  うまく伝えられない部分をClaude が代わりに言語化するのが目的。含める内容:
  やりたいことの要約、Before/After、確認したVRとの整合性、エンジニアへの依頼事項。
  docxスキル(/mnt/skills/public/docx)を利用すること。

## Hooks(`.claude/settings.json`内 `hooks`)

**最重要**: 以下の2つの経路を両方とも捕捉するmatcherにすること。
MCPツール呼び出しだけを見るmatcherでは、bashツール経由でsf CLIやcurlを
直接呼ばれた場合に検証をすり抜けるため、必ず両方をカバーすること。

### PreToolUse(実行前の強制検証)

対象: MCPの`deploy_metadata`/`retrieve_metadata`/`run_soql_query`呼び出し、
および bashツールで `sf`, `curl`, `npx @salesforce/cli` 等Salesforce関連コマンドが
実行されようとした場合の両方。

検証内容:
1. `sf org display --json`相当の情報から、対象orgのOrganizationId・IsSandboxを取得
2. orgIdが[SANDBOX_ALIAS]に対応する許可済みIDと一致しない、または`IsSandbox`が
   `true`でない場合は、exit code非ゼロで処理を強制的にブロックする
3. bash経由のコマンドについても、コマンド文字列に`--target-org`や`-o`等で
   [SANDBOX_ALIAS]以外の値が含まれていないか正規表現でチェックし、一致しなければブロック

### PostToolUse(機械的なログ記録)

対象: 上記と同じ範囲(MCP呼び出し + bash経由のSalesforce操作)

`logs/operations.jsonl`に以下を1行追記(Claudeの判断を介さず、スクリプトとして機械的に実行):
- タイムスタンプ
- ツール名・引数
- 実行結果(成功/失敗)
- 検証したorgId/IsSandboxの値

## 運用フロー(CLAUDE.md/AGENTS.mdに明記すること)

1. 非エンジニアが自然言語で要望を伝える
2. Claudeは`fetching-salesforce-docs`で最新の公式仕様を確認しながら実現方法を提案
3. Sandbox内で変更を試行(hookが常に検証)
4. デプロイ前に、変更対象フィールドに関連する既存VRを全件抽出し、影響有無を提示
5. 非エンジニアが内容を確認し、承認した場合のみデプロイを実行
6. 非エンジニアが「エンジニアに本番反映を頼みたい」と言ったら、`word-report-generator`
   スキルでWord文書を生成する

## 実装後の検証項目(必ず実施し、結果を報告すること)

1. bashツールで意図的に他org(存在しないalias等)を指定したコマンドを実行させ、
   hookが実際にブロックすることを確認
2. MCPツール経由でも同様にブロックされることを確認
3. `logs/operations.jsonl`に上記の試行がすべて記録されていることを確認
4. `.claude/skills/`配下に、除外指定した`switching-org`等が含まれていないことを確認
