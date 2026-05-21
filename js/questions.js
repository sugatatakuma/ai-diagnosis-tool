// 質問定義（v2.0仕様書§4準拠・12問）
// scoring_config.json と整合
window.QUESTIONS = [
  {
    id: 'q1',
    no: 1,
    text: '従業員数を教えてください',
    type: 'single',
    options: [
      { value: '1-10', label: '1〜10名' },
      { value: '11-50', label: '11〜50名' },
      { value: '51-100', label: '51〜100名' },
      { value: '101-300', label: '101〜300名' },
      { value: '301+', label: '301名以上' }
    ],
    axis: '規模係数',
    hint: 'スコアではなく、削減時間の規模係数として使用します'
  },
  {
    id: 'q2',
    no: 2,
    text: '業務改善が必要だと思う部署を選んでください',
    type: 'multiple',
    options: [
      { value: '経営', label: '経営' },
      { value: '営業', label: '営業' },
      { value: 'マーケティング', label: 'マーケティング' },
      { value: '人事', label: '人事' },
      { value: 'バックオフィス', label: 'バックオフィス' },
      { value: 'カスタマーサポート', label: 'カスタマーサポート' },
      { value: '開発', label: '開発' }
    ],
    axis: '課題',
    hint: '当てはまる部署をすべて選択してください（複数選択可）'
  },
  {
    id: 'q3',
    no: 3,
    text: '社内で繰り返し発生する業務量はどのくらいですか',
    type: 'single',
    options: [
      { value: '少ない', label: '少ない' },
      { value: 'やや多い', label: 'やや多い' },
      { value: '多い', label: '多い' },
      { value: '非常に多い', label: '非常に多い' }
    ],
    axis: '課題'
  },
  {
    id: 'q4',
    no: 4,
    text: '資料作成・レポート作成の頻度はどのくらいですか',
    type: 'single',
    options: [
      { value: '月数回', label: '月数回' },
      { value: '週数回', label: '週数回' },
      { value: '毎日', label: '毎日' },
      { value: '1日複数回', label: '1日複数回' }
    ],
    axis: '課題'
  },
  {
    id: 'q5',
    no: 5,
    text: '社内問い合わせ件数はどのくらいですか',
    type: 'single',
    options: [
      { value: '少ない', label: '少ない' },
      { value: '月10件程度', label: '月10件程度' },
      { value: '月50件程度', label: '月50件程度' },
      { value: '月100件以上', label: '月100件以上' }
    ],
    axis: '課題'
  },
  {
    id: 'q6',
    no: 6,
    text: '会議後の議事録・共有作業の負担はどのくらいですか',
    type: 'single',
    options: [
      { value: 'ほぼない', label: 'ほぼない' },
      { value: '少し負担', label: '少し負担' },
      { value: '負担が大きい', label: '負担が大きい' },
      { value: '非常に大きい', label: '非常に大きい' }
    ],
    axis: '課題'
  },
  {
    id: 'q7',
    no: 7,
    text: 'Excel・手入力作業の量はどのくらいですか',
    type: 'single',
    options: [
      { value: '少ない', label: '少ない' },
      { value: 'やや多い', label: 'やや多い' },
      { value: '多い', label: '多い' },
      { value: '毎日大量', label: '毎日大量' }
    ],
    axis: '課題'
  },
  {
    id: 'q8',
    no: 8,
    text: '業務の属人化はどのくらいありますか',
    type: 'single',
    options: [
      { value: 'ない', label: 'ない' },
      { value: '一部ある', label: '一部ある' },
      { value: '多い', label: '多い' },
      { value: '非常に多い', label: '非常に多い' }
    ],
    axis: '準備度（逆転）',
    hint: '属人化が少ないほど AI 導入の準備が整っています'
  },
  {
    id: 'q9',
    no: 9,
    text: '現在のAI利用状況を教えてください',
    type: 'single',
    options: [
      { value: '全社導入済', label: '全社導入済' },
      { value: '一部利用', label: '一部利用' },
      { value: '個人利用', label: '個人利用' },
      { value: '未利用', label: '未利用' }
    ],
    axis: '準備度'
  },
  {
    id: 'q10',
    no: 10,
    text: '改善したいことを選んでください',
    type: 'multiple',
    options: [
      { value: '工数削減', label: '工数削減' },
      { value: '人件費削減', label: '人件費削減' },
      { value: 'ミス削減', label: 'ミス削減' },
      { value: '売上向上', label: '売上向上' },
      { value: '属人化解消', label: '属人化解消' },
      { value: '生産性向上', label: '生産性向上' }
    ],
    axis: '準備度',
    hint: '目的が複数あるほど改善意欲が高いと評価します（複数選択可）'
  },
  {
    id: 'q11',
    no: 11,
    text: '今すぐ改善したい業務を選んでください',
    type: 'multiple',
    options: [
      { value: '資料作成', label: '資料作成' },
      { value: '問い合わせ対応', label: '問い合わせ対応' },
      { value: '会議（議事録）', label: '会議（議事録）' },
      { value: '営業管理', label: '営業管理' },
      { value: 'マーケティング', label: 'マーケティング' },
      { value: 'バックオフィス', label: 'バックオフィス' },
      { value: '情報共有', label: '情報共有' }
    ],
    axis: '削減時間算出',
    hint: '選択した業務をもとに削減時間を試算します（複数選択可）'
  },
  {
    id: 'q12',
    no: 12,
    text: 'AI推進の担当者状況を教えてください',
    type: 'single',
    options: [
      { value: '専任の推進担当者がいる', label: '専任の推進担当者がいる' },
      { value: '兼任の推進担当者がいる', label: '兼任の推進担当者がいる' },
      { value: '担当者は決まっていないが推進したい人はいる', label: '担当者は決まっていないが推進したい人はいる' },
      { value: '推進担当者は不在', label: '推進担当者は不在' }
    ],
    axis: '準備度'
  }
];
