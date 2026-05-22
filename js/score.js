// スコア計算ロジック
// scoring_config.json を読み込んで Make 側と同一の計算を行う
// ★ HTML 側は即時画面表示用のプレビュー計算。最終計算は Make 側が再実行する（v2.0仕様書§7 SSOT）

(function () {
  'use strict';

  const SCORE = {};

  // 課題スコア計算 (Q2-Q7、合計50点)
  SCORE.calcProblemScore = function (answers, config) {
    let total = 0;

    // Q2: 高ロス3部署の含有数 → 0/3/6/8
    const q2 = answers.q2 || [];
    const highLossCount = config.q2_high_loss_departments.filter(d => q2.includes(d)).length;
    total += config.q2_score_by_high_loss_count[Math.min(highLossCount, 3)];

    // Q3: 0/3/6/9
    const q3Index = config.q3_options.indexOf(answers.q3);
    if (q3Index >= 0) total += config.q3_score[q3Index];

    // Q4: 0/3/6/9
    const q4Index = config.q4_options.indexOf(answers.q4);
    if (q4Index >= 0) total += config.q4_score[q4Index];

    // Q5: 0/3/5/8
    const q5Index = config.q5_options.indexOf(answers.q5);
    if (q5Index >= 0) total += config.q5_score[q5Index];

    // Q6: 0/3/5/8
    const q6Index = config.q6_options.indexOf(answers.q6);
    if (q6Index >= 0) total += config.q6_score[q6Index];

    // Q7: 0/3/5/8
    const q7Index = config.q7_options.indexOf(answers.q7);
    if (q7Index >= 0) total += config.q7_score[q7Index];

    return total;
  };

  // 準備度スコア計算 (Q8/Q9/Q10/Q12、合計50点)
  // Q9=未利用 の場合は上限20点 cap
  SCORE.calcReadinessScore = function (answers, config) {
    let total = 0;

    // Q8: 逆転項目 15/10/5/0
    const q8Index = config.q8_options_reverse.indexOf(answers.q8);
    if (q8Index >= 0) total += config.q8_score_reverse[q8Index];

    // Q9: 20/12/5/0
    const q9Index = config.q9_options.indexOf(answers.q9);
    if (q9Index >= 0) total += config.q9_score[q9Index];

    // Q10: 選択数で配点
    const q10Count = (answers.q10 || []).length;
    const q10Key = String(Math.min(q10Count, 6));
    total += config.q10_score_by_count[q10Key] || 0;

    // Q12: 5/3/2/0
    const q12Index = config.q12_options.indexOf(answers.q12);
    if (q12Index >= 0) total += config.q12_score[q12Index];

    // Q9=未利用 cap
    if (answers.q9 === '未利用' && total > config.q9_unused_readiness_cap) {
      total = config.q9_unused_readiness_cap;
    }

    return total;
  };

  // 診断タイプ判定
  SCORE.calcDiagType = function (problemScore, readinessScore, config) {
    const highProblem = problemScore >= config.thresholds.problem;
    const highReadiness = readinessScore >= config.thresholds.readiness;

    if (highProblem && highReadiness) return 'A';
    if (highProblem && !highReadiness) return 'B';
    if (!highProblem && highReadiness) return 'C';
    return 'D';
  };

  // 削減時間算出（レンジ表示）
  // - 逓減係数を大きい順に適用
  // - 規模係数 × 課題スコア比 × 上限cap
  // - 下限 = 上限 × 0.55
  SCORE.calcReduction = function (answers, problemScore, config) {
    const q11 = answers.q11 || [];
    const q1 = answers.q1;

    if (q11.length === 0 || !q1) {
      return {
        hoursMonthLow: 0, hoursMonthHigh: 0,
        costMonthLow: 0, costMonthHigh: 0,
        hoursYearLow: 0, hoursYearHigh: 0,
        costYearLow: 0, costYearHigh: 0
      };
    }

    // Q11業務基準値を取得し、大きい順にソート
    const baseHours = q11
      .map(task => config.task_base_hours_per_month[task] || 0)
      .sort((a, b) => b - a);

    // 逓減係数を適用
    let weightedSum = 0;
    for (let i = 0; i < baseHours.length; i++) {
      const coef = config.decay_coefs[i] !== undefined ? config.decay_coefs[i] : 0.1;
      weightedSum += baseHours[i] * coef;
    }

    // 課題スコア比 × 規模係数 × Q10ボーナス係数
    const sizeCoef = config.size_coef[q1] || 1.0;
    const problemRatio = problemScore / config.problem_score_max;
    const q10Count = (answers.q10 || []).length;
    const q10Key = String(Math.min(q10Count, 6));
    const q10Bonus = (config.q10_bonus_by_count && config.q10_bonus_by_count[q10Key]) || 1.0;
    let rawHours = weightedSum * problemRatio * sizeCoef * q10Bonus;

    // 上限cap
    const cap = config.monthly_cap_hours[q1] || 9999;
    const hoursMonthHigh = Math.min(Math.round(rawHours), cap);
    const hoursMonthLow = Math.round(hoursMonthHigh * config.low_range_factor);

    const costMonthHigh = hoursMonthHigh * config.hourly_rate;
    const costMonthLow = hoursMonthLow * config.hourly_rate;

    return {
      hoursMonthLow: hoursMonthLow,
      hoursMonthHigh: hoursMonthHigh,
      costMonthLow: costMonthLow,
      costMonthHigh: costMonthHigh,
      hoursYearLow: hoursMonthLow * 12,
      hoursYearHigh: hoursMonthHigh * 12,
      costYearLow: costMonthLow * 12,
      costYearHigh: costMonthHigh * 12,
      // 計算根拠 (UI表示用)
      basis: {
        weightedTaskHours: Math.round(weightedSum * 10) / 10,
        problemRatio: Math.round(problemRatio * 100),
        sizeCoef: sizeCoef,
        q10Bonus: q10Bonus,
        taskCount: q11.length,
        cappedByLimit: Math.round(rawHours) > cap
      }
    };
  };

  // 一括計算
  SCORE.calcAll = function (answers, config) {
    const problemScore = SCORE.calcProblemScore(answers, config);
    const readinessScore = SCORE.calcReadinessScore(answers, config);
    const diagType = SCORE.calcDiagType(problemScore, readinessScore, config);
    const reduction = SCORE.calcReduction(answers, problemScore, config);

    return {
      problemScore: problemScore,
      readinessScore: readinessScore,
      totalScore: problemScore + readinessScore,
      diagType: diagType,
      diagTypeName: config.diag_types[diagType].name,
      reduction: reduction
    };
  };

  // 数値の3桁カンマ区切り
  SCORE.formatNumber = function (n) {
    return new Intl.NumberFormat('ja-JP').format(n);
  };

  window.SCORE = SCORE;
})();
