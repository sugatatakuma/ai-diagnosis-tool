// アプリ本体: 12問フォーム → スコア計算 → 即時結果 → メアド入力 → Webhook送信 → サンクス
(function () {
  'use strict';

  // ステート
  let CONFIG = null;
  let answers = {};
  let currentQuestionIndex = 0;
  let result = null;
  let startedAt = null;
  let utmParams = {};

  // ====== 初期化 ======
  window.addEventListener('DOMContentLoaded', async function () {
    try {
      // scoring_config.json 読込
      const res = await fetch('./scoring_config.json');
      if (!res.ok) throw new Error('scoring_config.json読込失敗: ' + res.status);
      CONFIG = await res.json();

      // GA4 初期化
      window.ANALYTICS.init(window.APP_CONFIG.ga4MeasurementId);

      // UTM パラメータ取得
      captureUtmAndReferrer();

      // 開始画面表示
      renderStartScreen();

      // テストモードでの自動投入
      if (window.APP_CONFIG.isTestMode()) {
        const pattern = window.APP_CONFIG.getTestPattern();
        await loadTestPattern(pattern);
      }
    } catch (e) {
      showError('初期化に失敗しました: ' + e.message);
      console.error(e);
    }
  });

  // ====== UTM・流入元キャプチャ ======
  function captureUtmAndReferrer() {
    const params = new URLSearchParams(window.location.search);
    utmParams = {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_term: params.get('utm_term') || '',
      utm_content: params.get('utm_content') || '',
      referrer: document.referrer || '',
      landing_page: window.location.href
    };
  }

  // ====== 画面遷移 ======
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function showError(msg) {
    const el = document.getElementById('error-message');
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    }
  }

  // ====== 開始画面 ======
  function renderStartScreen() {
    showScreen('screen-start');
    const btn = document.getElementById('btn-start');
    btn.addEventListener('click', function () {
      startedAt = new Date().toISOString();
      window.ANALYTICS.send(window.ANALYTICS.EVENTS.DIAGNOSIS_START);
      currentQuestionIndex = 0;
      renderQuestion();
    }, { once: true });
  }

  // ====== 質問画面 ======
  function renderQuestion() {
    const q = window.QUESTIONS[currentQuestionIndex];
    if (!q) {
      // 全問完答 → 計算
      finishQuestions();
      return;
    }

    showScreen('screen-question');
    document.getElementById('progress-text').textContent = `Q${q.no} / ${window.QUESTIONS.length}`;
    const progressFill = document.getElementById('progress-fill');
    progressFill.style.width = ((q.no - 1) / window.QUESTIONS.length * 100) + '%';

    document.getElementById('question-no').textContent = `Q${q.no}`;
    document.getElementById('question-text').textContent = q.text;
    const hintEl = document.getElementById('question-hint');
    if (q.hint) {
      hintEl.textContent = q.hint;
      hintEl.style.display = 'block';
    } else {
      hintEl.style.display = 'none';
    }

    const optionsContainer = document.getElementById('question-options');
    optionsContainer.innerHTML = '';

    q.options.forEach((opt, idx) => {
      const optEl = document.createElement('label');
      optEl.className = 'option ' + (q.type === 'multiple' ? 'multi' : 'single');

      const input = document.createElement('input');
      input.type = q.type === 'multiple' ? 'checkbox' : 'radio';
      input.name = q.id;
      input.value = opt.value;

      // 既存回答の復元
      if (q.type === 'multiple') {
        if ((answers[q.id] || []).includes(opt.value)) input.checked = true;
      } else {
        if (answers[q.id] === opt.value) input.checked = true;
      }

      const span = document.createElement('span');
      span.textContent = opt.label;

      optEl.appendChild(input);
      optEl.appendChild(span);
      optionsContainer.appendChild(optEl);

      // 単一選択は選択した瞬間に次へ
      if (q.type === 'single') {
        input.addEventListener('change', function () {
          if (input.checked) {
            answers[q.id] = opt.value;
            window.ANALYTICS.send(window.ANALYTICS.EVENTS.QUESTION_ANSWERED, { question_no: q.no });
            setTimeout(() => goNext(), 250);
          }
        });
      }
    });

    // ボタン制御
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    btnPrev.style.visibility = currentQuestionIndex === 0 ? 'hidden' : 'visible';
    btnPrev.onclick = goPrev;

    if (q.type === 'multiple') {
      btnNext.style.display = 'inline-block';
      btnNext.textContent = '次へ';
      btnNext.onclick = function () {
        const checked = Array.from(document.querySelectorAll(`input[name="${q.id}"]:checked`)).map(i => i.value);
        answers[q.id] = checked;
        window.ANALYTICS.send(window.ANALYTICS.EVENTS.QUESTION_ANSWERED, { question_no: q.no });
        goNext();
      };
    } else {
      // 単一選択は自動遷移するが、戻ってきた時用にボタンも残す
      btnNext.style.display = answers[q.id] ? 'inline-block' : 'none';
      btnNext.textContent = '次へ';
      btnNext.onclick = goNext;
    }
  }

  function goNext() {
    currentQuestionIndex++;
    renderQuestion();
  }

  function goPrev() {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderQuestion();
    }
  }

  // ====== 全問完答 → スコア計算 → 即時結果 ======
  function finishQuestions() {
    window.ANALYTICS.send(window.ANALYTICS.EVENTS.DIAGNOSIS_COMPLETED);
    result = window.SCORE.calcAll(answers, CONFIG);
    renderPreviewResult();
  }

  function renderPreviewResult() {
    showScreen('screen-preview');
    window.ANALYTICS.send(window.ANALYTICS.EVENTS.RESULT_PREVIEW_VIEWED, {
      diag_type: result.diagType,
      problem_score: result.problemScore,
      readiness_score: result.readinessScore
    });

    document.getElementById('preview-diag-type').textContent = result.diagTypeName;
    document.getElementById('preview-problem-score').textContent = result.problemScore;
    document.getElementById('preview-readiness-score').textContent = result.readinessScore;
    document.getElementById('preview-total-score').textContent = result.totalScore;

    const hoursLow = result.reduction.hoursMonthLow;
    const hoursHigh = result.reduction.hoursMonthHigh;
    document.getElementById('preview-hours-range').textContent =
      `${hoursLow}〜${hoursHigh}時間`;

    // 問題スコア / 準備度スコアの進捗バー色分け
    setProgressBarColor('preview-problem-bar', result.problemScore, CONFIG.problem_score_max);
    setProgressBarColor('preview-readiness-bar', result.readinessScore, CONFIG.readiness_score_max);

    document.getElementById('btn-to-form').onclick = function () {
      renderEmailForm();
    };
  }

  function setProgressBarColor(elId, value, max) {
    const el = document.getElementById(elId);
    if (!el) return;
    const pct = (value / max) * 100;
    el.style.width = pct + '%';
    el.classList.remove('low', 'mid', 'high');
    if (pct >= 80) el.classList.add('high');
    else if (pct >= 31) el.classList.add('mid');
    else el.classList.add('low');
  }

  // ====== メアド入力フォーム ======
  function renderEmailForm() {
    showScreen('screen-form');

    const form = document.getElementById('email-form');
    form.onsubmit = async function (e) {
      e.preventDefault();
      const submitBtn = document.getElementById('btn-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = '送信中…';

      const formData = {
        email: document.getElementById('input-email').value.trim(),
        company: document.getElementById('input-company').value.trim(),
        company_type: document.getElementById('input-company-type').value,
        name: document.getElementById('input-name').value.trim(),
        privacy_consent: document.getElementById('input-consent').checked
      };

      if (!formData.email || !formData.privacy_consent) {
        showError('メールアドレスとプライバシーポリシー同意は必須です');
        submitBtn.disabled = false;
        submitBtn.textContent = '詳細レポートを受け取る';
        return;
      }

      // Turnstile トークン取得
      let turnstileToken = '';
      if (typeof window.turnstile !== 'undefined') {
        try {
          turnstileToken = window.turnstile.getResponse() || '';
        } catch (err) {
          console.warn('Turnstile token取得失敗:', err);
        }
      }

      // Webhook送信
      try {
        await submitToWebhook(formData, turnstileToken);
        window.ANALYTICS.send(window.ANALYTICS.EVENTS.EMAIL_SUBMITTED, {
          diag_type: result.diagType
        });
        renderThankYou();
      } catch (err) {
        showError('送信に失敗しました。時間をおいて再度お試しください。');
        submitBtn.disabled = false;
        submitBtn.textContent = '詳細レポートを受け取る';
        console.error(err);
      }
    };
  }

  async function submitToWebhook(formData, turnstileToken) {
    const payload = {
      lead_id_client_seed: Date.now().toString() + '-' + Math.random().toString(36).slice(2, 8),
      submitted_at: new Date().toISOString(),
      started_at: startedAt,
      answers: answers,
      // ★ HTML側計算スコアは「参考値」として送信
      //    Make側は raw answers から再計算するため、これは検証用ログ目的
      client_calculated: {
        problem_score: result.problemScore,
        readiness_score: result.readinessScore,
        total_score: result.totalScore,
        diag_type: result.diagType
      },
      lead: {
        email: formData.email,
        company: formData.company,
        company_type: formData.company_type,
        name: formData.name,
        privacy_consented_at: new Date().toISOString()
      },
      turnstile_token: turnstileToken,
      utm: utmParams,
      device: {
        user_agent: navigator.userAgent,
        language: navigator.language,
        screen_width: window.screen.width,
        screen_height: window.screen.height
      },
      is_test: window.APP_CONFIG.isTestMode()
    };

    const webhookUrl = window.APP_CONFIG.webhookUrl;
    if (!webhookUrl) {
      console.warn('[Webhook] URL未設定。送信をスキップしてサンクス画面に遷移します。');
      console.log('Payload (dry-run):', payload);
      return;
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Webhook送信失敗: ' + res.status);
  }

  // ====== サンクス画面 ======
  function renderThankYou() {
    showScreen('screen-thanks');

    // 簡易結果を再掲（メール待ち中の離脱を防ぐ）
    document.getElementById('thanks-diag-type').textContent = result.diagTypeName;
    document.getElementById('thanks-total-score').textContent = result.totalScore;
  }

  // ====== テストパターン自動投入 ======
  async function loadTestPattern(patternKey) {
    try {
      const res = await fetch('./test_answers.json');
      const testData = await res.json();
      const patternName = 'test_' + patternKey;
      const pattern = testData[patternName];
      if (!pattern) {
        console.warn('[TestMode] パターン未発見:', patternName);
        return;
      }
      for (let i = 1; i <= 12; i++) {
        const key = 'q' + i;
        if (pattern[key] !== undefined) answers[key] = pattern[key];
      }
      console.info('[TestMode] パターン自動投入完了:', patternName, answers);
      // 開始画面のボタンに「テストパターン投入済み」表示
      const btn = document.getElementById('btn-start');
      btn.textContent = '【テスト】' + patternName + ' で診断開始';
    } catch (e) {
      console.error('[TestMode] パターン読込失敗:', e);
    }
  }
})();
