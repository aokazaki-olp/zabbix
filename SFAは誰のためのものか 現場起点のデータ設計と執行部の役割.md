# SFAは誰のためのものか:現場起点のデータ設計と執行部の役割

Oct 27, 2026 · @岡崎 有寛

## 要旨

SFAの主たる利用者は営業担当者であり、経営が見たい数字はその活動が正しく記録された結果として出てくる副産物である。失敗の原因は現場の意識ではなく、管理目的の設計、データの種類を無視した手入力一辺倒、そして部門間の境界(定義・データの継ぎ目)に持ち主がいないことにある。

- 執行部の役割は、データの利用者としては受け身、環境の所有者としては能動であること。
- フェーズなどの定義はSFAの設定ではなく社内共通語として外に出し、SFAのメタデータはその機械可読な投影として管理する。
- メタデータはAIに渡す仕様書そのものであり、その品質がAI活用の上限を決める。
- 執行部には仕組みの理解ではなく、定義の持ち主と変更管理のルールという小さな決定を求める。

## Sales Cloudのゴールは誰のためか

製品本来の思想は営業担当者と顧客中心であり、「経営が数字を見られること」を最上位に置く説明は日本式の稟議書の書き方に近い。

- **英語圏の公式ページ**:AIエージェントで営業の時間を生み、顧客の信頼構築と受注に集中させることを前面に出している。SFAの主な効果は生産性向上と説明している。
- **日本法人のページ**:SFA導入失敗の解説の中で、売上目標の達成度合いを「見える化」することの重要性を強調している。同じ会社でも語り口が違う。
- **欧米の分業モデル**:SDR・AE・CSMの分業(Predictable Revenue)では、CRMは引き継ぎのバトンそのものになる。ただしSDR-AE型には欠点も指摘されている。
- **「If it's not in Salesforce, it didn't happen」**:実在するフレーズだが、公式管理者ブログでは上意下達のポリシーとして紹介されている。欧米でも入力は管理側の強制で回っている現場が多く、日本との違いは程度と語り口の差と見るのが正確。

ゴールは特定の役割ではなく、会社と顧客の取引関係そのものに置かれている。経営の数字、マネージャーの管理、AIの判断材料は、その記録が正しく回っていることから派生する。

## 経営と現場の乖離と失敗の連鎖

管理目的で設計されたSFAは、現場の形だけの入力、データ不信、管理側の別ルート作成を経て、再び管理強化に戻る循環に入る。

**現場から見たSFA**

- SFAは普及当初から、管理職が一挙手一投足を追う道具と受け取られてきた。恩恵は主に管理職側に偏ってきたという論考もある。
- CRM入力は「入力する本人以外の全員が得をする作業」と表現され、担当者は上司のデータ入力係になった感覚を持つ。
- 営業が実際に売っている時間は週の28%(Salesforce調査、2026年版の二次引用では40%)。
- 国内でも、SFAが上司への報告のための管理の道具に成り下がり、確度は担当者のさじ加減で入力されているという指摘がある(元freee執行役員・村尾祐弥氏)。

**失敗が失敗を生むループ**

&#91;embedded content: SFA失敗のループ · 5段階\]

管理側が必須項目と督促を増やすと、現場は検証を通すためのダミー値を入れ、確度や予定日を演出する(グッドハートの法則)。データ不信から管理側が手補正や別報告に走り、現場は「SFAは報告用」と確信して①に戻る。入口の①を変えられるのは執行側だけである。

**変革そのものへの冷笑**

失敗した導入は次の施策への「変化疲れ」と抵抗を生み、再導入は1回目と同じやり方で同じ結果になりがちである。Wanousらの研究では、変革への冷笑は将来への悲観と過去の失敗を誰かの性質に帰属させることの組み合わせで、その原因は一部の不満分子ではなく、社員の不参加と非効果的なリーダーシップだった。

## 執行側が変わるべき理由

変革失敗の主因は経営陣の行動であり、ループを断てるレバーは執行側にしかない。

- **失敗の主因**:McKinseyは変革の約70%が失敗し、失敗企業は社員の抵抗または経営陣の行動を主な障壁(72%)に挙げるとしている。根深いマインドセットを変えた企業は成功の自己評価が4倍。
- **抵抗は警告信号**:抵抗は設計の悪い変革への合理的な反応になりうる。現場の不使用を意識の問題で片付けると、この信号を捨てることになる。
- **言行不一致**:経営が称賛するのに自分では開かないCRMは任意のものと読まれる。役に立つことを示さずに使用だけ命じると、命じないより速く定着を壊す。
- **レバーの所在**:営業レビューの進め方、パイプラインをどこに置くか、評価制度との接続は事業側の意思決定。執行権限のない担当者にスポンサーシップを委任すると導入は行き詰まる。
- **失敗率の数字は扱いに注意**:Gartner 50%、Forrester 47%などの数字は定義に合意がなく誇張との反論もある。一方で原因の内訳(組織変革29%、社内政治22%、ソフトウェア2%など)は「技術ではなく組織と人」で一貫している。

## データ品質:発生源で4つに分ける

SFAのデータ品質の問題は、性質の違う4種類のデータを全部人の手入力で一律に扱っていることから起きる。

| データの種類 | 例 | 劣化の仕方 | 技術の役割 | 人の役割 |
| --- | --- | --- | --- | --- |
| ① 観測できる事実 | メール、会議、電話 | 手入力では記録が選択的になり偏る | 自動取得する | 入力しない |
| ② 外部世界の属性 | 企業情報、役職、連絡先 | 持った瞬間から腐る(年22.5〜67%の推計) | 外部マスタを参照・同期する(法人番号等) | 例外の判断のみ |
| ③ 人の判断 | フェーズ、確度、予定日、金額 | 定義の不一致、詰問による演出 | 定義を構造で強制する | 判断する、責められずに正直に入れる |
| ④ 会話の中身 | 課題、意思決定者、競合 | 構造化されず会話に残る | AIで抽出し下書きにする | 確認・修正する |

- **信頼の非対称**:データ部門の57%が正確性に完全な自信を持つのに対し、営業リーダーは42%。
- **AIで増幅する**:AIを本番運用するデータ部門リーダーの89%が不正確な出力を経験している。
- **品質は発生源で決まる**:修正コストは「1-10-100の法則」で後工程ほど高い。ただし発生源での強制(必須項目、入力規則)は③④を無理に埋めさせ、ダミー値という「正しそうに見える嘘」を増やす。発生源対策とは、データの種類に合った取り方に変えること。
- **責任の所在**:Gartnerは、品質施策が技術偏重で、業務部門に品質の責任を持たせる意思決定権のモデルがない組織が多いと指摘している。
- **統計の注意**:「年1,290万ドルの損失」はベンダー参照顧客154組織の2020年調査が元。59%の組織がデータ品質を測っていないという事実の方が論拠として強い。

## 誰が活用すべきか

主たる利用者は営業担当者であり、執行部にとっては「分析できるデータがそこにあった」という状態が望ましい。ただしその「たまたま」は偶然には起きず、設計された副産物でなければならない。

現場が自由に使ったデータは、フェーズの意味や金額の計上ルールが担当ごとに違い、集計した瞬間に意味を失うことがある。そこで執行部の役割を二面に分ける。

- **データの利用者としては受け身**:入力を求めない、Excelで別報告させない、数字が気に入らなくても担当者にデータを直させない。
- **環境の所有者としては能動**:部門横断の定義、自動取得や外部マスタ参照への投資、評価制度との接続を決める。現場が好きに使っても数字が壊れない構造を用意する。

中間の営業マネージャーの位置づけも決めておく。担当者と同じ画面で案件を一緒に動かすなら現場側の利用者、確度や予定日の追及に使えば「管理の道具」に戻る。現場主体が崩れるのは多くの場合この中間層からである。

## フェーズ定義を社内共通語へ

フェーズの定義はSFAの設定ではなく業務の言葉であり、SFAの外に正本を置き、SFAはそれを映す側に回るべきである。定義がツールの中にしかないと、ツールの乗り換えで意味ごと失われる。

- **DDDのユビキタス言語**:業務の言葉を先に決め、システムはそれを映す。データ分析で指標定義をBIの外のセマンティックレイヤーに置く発想と同じ。
- **境界の契約になる**:マーケ、営業、CS、経理が同じ言葉を指すようになり、現場と執行部が同じ言葉で話せる。
- **判断データが事実に寄る**:完了要件を「意思決定者が同席した」「見積を提出した」のような観測できる事実で書けば、フェーズは選ぶものから導出できるものに近づく。導出できなくても、事実と矛盾するフェーズを検知できる。

**境界づけられたコンテキスト**:「受注」は営業、経理、CSで意味が違い、それぞれの中では正しい。全社で一つの辞書に潰すのではなく、部門ごとの言葉と、その間の翻訳ルール(対応表)の組み合わせとして設計する。

**注意点**

- 持ち主を決める(業務側が持ち、システム側が従う)。
- 版管理する(どの版の定義で記録されたデータかが分かるように)。
- 統一しすぎない(新規と更新など進み方が違うなら複数プロセスを許し、それぞれを共通語の中で定義する)。

## 境界の破綻とデータ

境界が業務やデータの性質ではなく、予算・契約・組織の切れ目で引かれることで破綻が始まり、データの破綻は静かに進むため障害として認識されない。

**なぜ境界が利害の線で引かれるか**

- コンウェイの法則:システムは作る組織のコミュニケーション構造を写す。
- 日本のSIでは、部門予算での発注、請負でのスコープ固定、ベンダーごとの担当範囲により、境界が「お金と責任の境目」になる。
- 継ぎ目(取引先の定義、フェーズの意味、受け渡しの約束事)には持ち主がおらず、どこかのシステムに私有化される。
- 業務を理解したIT人材がベンダー側に多く、発注側が境界を設計できない。
- 欧米との違いは程度の差。内製でプロダクトを育てる文化では、組織を境界に合わせて変えやすい。

**データの破綻に気づけない理由**

- 各システムの中では正しく、壊れているのは継ぎ目だけ。
- 破綻のコストが突合や名寄せなど人の作業に吸収される(隠れたデータ工場)。59%の組織がデータ品質を測っていない。
- 症状が「予測が当たらない」「SFAが定着しない」「AIのPoCが失敗」と別の名前で現れ、原因の帰属を誤る。対策の新ツールが継ぎ目を一つ増やす。

**AIが検知器になる**:人間は継ぎ目の矛盾を黙って補正してきたが、AIはできない。AIがうまくいかないとき、モデルより先に「AIが見ているデータの境界」を疑う。

**理想**:正しい境界を最初に引くより、境界を引き直せる構造にしておく(疎結合、境界の約束事の明文化、継ぎ目の持ち主)。破綻は、特化した部分が境界まで飲み込んで内部の都合を外に漏らし始めたときに起きる。

## メタデータはAIに渡す仕様書

Salesforceでは、項目名、ラベル、説明、ヘルプテキスト、選択リストの値、リレーション、入力規則といったメタデータがAIにとっての仕様書であり、その品質がAIの理解の上限になる。

- **メタデータの負債は仕様書の負債**:説明が空欄の項目、転用された項目、使われない項目、重複した選択リスト値、例外を足し続けた入力規則は、AIにとって矛盾した仕様書である。
- **共通語との関係**:社内共通語が正本、メタデータはそれを機械が読める形に投影したもの。メタデータを取り出して人が読める仕様書にする作業は、投影の正しさを検証する作業でもある。
- **注意1:仕様と実データの乖離**:メタデータは意図を書いたもので、実データがそのとおりとは限らない。AIは仕様を信じて自信を持って間違えるため、実データが仕様に適合しているかを確かめる仕組み(ソフトウェアでいうテスト)が要る。
- **注意2:システム内の言葉しか語れない**:他システムとの翻訳ルールはどのメタデータにも属さず、外に置くしかない。

**実務**:メタデータの変更をコードの変更と同じに扱う。新規項目は説明を必須にする、転用せず新設する、変更をGitで管理してレビューする。

## 執行部への説明方法

壊れていても今日の業務は回っているため、仕組みを理解してもらうより、執行部の言葉と関心に翻訳して小さな決定を求める。

1. **勘定科目の比喩**:「部署ごとに『売上』の意味が違い、科目表に説明もない会社は決算できない。営業データは今その状態」。メタデータは営業データの勘定科目表と言い換える。
2. **AIはマニュアルしか読まない優秀な新人**:先輩に質問しない新人に、空白と矛盾だらけのマニュアルを渡していれば間違える。AI投資の前にマニュアル整備。
3. **説明より失敗を見せる**:実データでAIに質問し、誤答の原因が「説明のない項目」「同じ顧客の三重登録」だと示す。
4. **隠れたコストを数字にする**:一つの顧客が全システムでいくつのIDと名前を持つか、会議資料のための突合に毎月何時間かかるかを実測する。
5. **理解ではなく小さな決定を求める**:「営業用語の定義の持ち主を決める」「新規項目の説明記入とレビューを必須にする」。既存の変更管理の枠組み(ISMSの資産管理・変更管理など)に乗せる。

**避ける言葉**:メタデータ、DDD、境界づけられたコンテキスト、データガバナンス。勘定科目、マニュアル、定義の持ち主で通す。

## 出典

- [Sales Cloud features | Salesforce](https://www.salesforce.com/ca/products/sales-cloud/features/)
- [SFA導入に失敗してしまうのはなぜ? | Salesforce Japan](https://www.salesforce.com/jp/hub/sales/sfa-failure/)
- [Aaron Ross Leadership Style | Rework](https://resources.rework.com/vi/libraries/leadership-legends/aaron-ross-leadership)
- [Why The Predictable Revenue Sales Model Is Overrated | Bowery Capital](https://bowerycap.com/blog/podcasts/predictable-revenue)
- [Salesforce Admins blog](https://admin.salesforce.com/blog/author/editarobinson)
- [Is SFA/CRM Every Rep's Best Friend? | CustomerThink](https://customerthink.com/is_sfacrm_every_rep_s_best_friend/)
- [5 Painfully Common Ways Managers Sabotage CRM | CRM Buyer](https://crmbuyer.com/?p=97611)
- [Why Sales Reps Hate Updating the CRM | LowCode Agency](https://www.lowcode.agency/blog/why-sales-reps-hate-updating-crm)
- [Sales reps spend less than 30% of time selling | Salesforce](https://www.salesforce.com/news/stories/sales-research-2023/)
- [「入力は営業の仕事ではない」SFA再構築が"ツールの乗り換え"で終わる理由 | AdverTimes](https://www.advertimes.com/20260929/article558724/)
- [2023 RevOps Trends Report | RevOps Co-op](https://www.revopscoop.com/reports/2023-revops-trends-report)
- [Why CRM implementations fail | Advaiya](https://advaiya.com/case-study/crm/)
- [On Your Second (or Third) Try at CRM? | Distribution Strategy](https://distributionstrategy.com/on-your-second-or-third-try-at-crm-how-to-overcome-internal-objections)
- [Cynicism about organizational change | PubMed](https://pubmed.ncbi.nlm.nih.gov/15362427)
- [Viewpoint: A Case of Cynicism | IndustryWeek](https://www.industryweek.com/leadership/companies-executives/article/21949326/viewpoint-a-case-of-cynicism)
- [Organizations do not change. People change! | McKinsey](https://www.mckinsey.com/capabilities/people-and-organization/our-insights/the-organization-blog/organizations-do-not-change-people-change)
- [Understanding why corporate transformations fail](https://isitworking.substack.com/p/understanding-why-almost-all-corporate)
- [How to Improve CRM Adoption in Enterprise | Huble](https://huble.com/blog/improve-crm-adoption-enterprise)
- [Custom CRM Adoption and Change Management | LowCode Agency](https://www.lowcode.agency/blog/custom-crm-adoption-change-management)
- [The CRM Software Failure Rate is 55% | Johnny Grow](https://johnnygrow.com/?p=7251)
- [Why SFA Failure Rates Will Increase | CustomerThink](https://customerthink.com/why_sfa_failure_rates_will_increase/)
- [State of Data and Analytics | Salesforce](https://www.salesforce.com/uk/news/?p=73104)
- [Get data shipshape for GenAI | Decision Marketing](https://www.decisionmarketing.co.uk/news/get-data-shipshape-for-genai-or-risk-sinking-firms-told)
- [Gartner: 12 Actions to Improve Data Quality | Verato](https://verato.com/resources/gartner-dq)
- [Cost of Bad Manufacturing Data | Reliable](https://reliamag.com/topics/guides/cost-of-bad-manufacturing-data/index.md)
- [Data Quality: The Cost of Bad Data | Formtek](https://formtek.com/blog/data-quality-the-cost-of-bad-data)
- [State of B2B Data Quality 2026 | Cleanlist](https://www.cleanlist.ai/blog/2026-04-07-state-of-b2b-data-quality-2026)
- [Manual vs. Automatic Activity Logging | Backstory](https://www.backstory.ai/library/manual-vs-automatic-activity-logging-whats-the-difference)
- [CRM Data Enrichment | AskElephant](https://askelephant.ai/blog/what-is-crm-data-enrichment-how-conversation-data-fills-the-gaps-automatically)
- [データクレンジングツール比較 | SalesNow](https://salesnow.jp/media/242/)
- [SFAが定着しない・形骸化する5つの原因 | SalesNow](https://salesnow.jp/media/236/)
- [SFA導入で躓かない選び方ガイド 2026 | Aurant](https://aurant-technologies.com/blog/how-to-choose-implementation-guide-failure-success-efficienc-160/)
