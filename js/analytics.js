// GA4 イベント送信
// 仕様書§15のイベント設計に準拠
(function () {
  'use strict';

  const ANALYTICS = {};
  const EVENTS = {
    DIAGNOSIS_START: 'diagnosis_start',
    QUESTION_ANSWERED: 'question_answered',
    DIAGNOSIS_COMPLETED: 'diagnosis_completed',
    EMAIL_SUBMITTED: 'email_submitted',
    RESULT_PREVIEW_VIEWED: 'result_preview_viewed',
    CTA_CLICKED: 'cta_clicked'
    // EMAIL_OPENED は Measurement Protocol 経由（メール側）
    // CONSULTATION_BOOKED は問合せフォーム側の計測
  };

  ANALYTICS.EVENTS = EVENTS;

  ANALYTICS.init = function (measurementId) {
    if (!measurementId) {
      console.info('[Analytics] GA4 Measurement ID未設定。イベント送信はスキップされます。');
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId);
  };

  ANALYTICS.send = function (eventName, params) {
    if (typeof window.gtag !== 'function') {
      console.debug('[Analytics] gtag未初期化:', eventName, params);
      return;
    }
    window.gtag('event', eventName, params || {});
  };

  window.ANALYTICS = ANALYTICS;
})();
