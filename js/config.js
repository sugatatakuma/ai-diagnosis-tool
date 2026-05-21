// アプリ設定（公開可能な範囲のみ。シークレットは含めない）
window.APP_CONFIG = {
  // GA4 Measurement ID（GA4セットアップ後に置換）
  ga4MeasurementId: '',

  // Cloudflare Turnstile Site Key（公開してOK）
  // 開発時: '1x00000000000000000000AA'（常にPASSするテストキー）
  turnstileSiteKey: '1x00000000000000000000AA',

  // Make Webhook URL（実装時に Make から取得して差し替え）
  // 開発時: モックエンドポイント（実際にはPOSTしない）
  webhookUrl: '',

  // プライバシーポリシーURL
  privacyPolicyUrl: './privacy.html',

  // 問い合わせフォームURL（メール内CTAリンク先・後で確定）
  contactFormUrl: 'https://forms.gle/PLACEHOLDER',

  // テストモード判定（?test=type_A 等のクエリパラメータ）
  isTestMode: function () {
    const params = new URLSearchParams(window.location.search);
    return params.has('test');
  },

  // テストモードのパターン取得
  getTestPattern: function () {
    const params = new URLSearchParams(window.location.search);
    return params.get('test');
  }
};
