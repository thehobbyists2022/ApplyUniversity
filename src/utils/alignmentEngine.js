// StepOne College Phase 4 — Parent-Student Alignment Engine (純前端演算法)
// 雙重視角 (學生 vs 家長) 打分、家庭共識度、衝突判定與家庭溝通建議
import {
  parseMoney,
  parseAcceptance,
  parseRank,
  computeRoiGrade,
  estimateSalaryRange,
  formatSalaryRange
} from './collegeFinance';

export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

export function formatMoney(n) {
  const v = Math.round(Number(n) || 0);
  return '$' + v.toLocaleString('en-US');
}

// 保守估計家庭每年自付成本: 州外標價學費 + 食宿, 扣除極保守的典型機構助學金
export function estimateAnnualCost(college) {
  if (!college) return 45000;
  const isPublic = (college.type || '').toLowerCase().includes('public');
  const tuition = parseMoney(college.tuitionOutState) || parseMoney(college.tuitionInState) || 45000;
  const roomBoard = isPublic ? 13500 : 16500;
  const typicalAid = Math.round(tuition * (isPublic ? 0.10 : 0.15));
  return Math.round((tuition - typicalAid + roomBoard) / 1000) * 1000;
}

// 學生打分 0–100: 地區匹配度 + 校園氛圍/聲望 (排名加權)
export function computeStudentScore(college, studentPref = {}) {
  const locW = clamp(studentPref.locationImportance ?? 3, 1, 5);
  const vibW = clamp(studentPref.vibeImportance ?? 3, 1, 5);
  const region = studentPref.preferredRegion || 'All';
  const regionMatch = region === 'All' || (college && college.location && college.location.region === region);
  const regionScore = regionMatch ? 100 : 38;

  const rank = parseRank(college && college.ranking);
  let vibeScore = 60;
  if (rank !== null) {
    if (rank <= 10) vibeScore = 92;
    else if (rank <= 30) vibeScore = 86;
    else if (rank <= 60) vibeScore = 78;
    else if (rank <= 100) vibeScore = 70;
  }
  const acc = parseAcceptance(college && college.acceptanceRate);
  if (acc !== null && acc <= 25) vibeScore += 6;
  const setting = college && college.location && college.location.setting;
  if (setting === 'Urban') vibeScore += 2;
  else if (setting === 'College Town') vibeScore += 4;
  vibeScore = clamp(vibeScore, 0, 100);

  return Math.round((regionScore * locW + vibeScore * vibW) / (locW + vibW));
}

// 家長打分 0–100: 預算符合度 + 排名聲望 + ROI 等級
export function computeParentScore(college, parentPref = {}) {
  const maxBudget = Number(parentPref.maxBudget) || 65000;
  const rankW = clamp(parentPref.rankImportance ?? 3, 1, 5);
  const roiW = clamp(parentPref.roiImportance ?? 3, 1, 5);

  const annualCost = estimateAnnualCost(college);
  const overage = annualCost - maxBudget;
  let budgetScore = 100;
  if (overage > 0) budgetScore = clamp(100 - overage / 800, 15, 95);

  const rank = parseRank(college && college.ranking);
  let rankScore = 55;
  if (rank !== null) {
    if (rank <= 10) rankScore = 98;
    else if (rank <= 30) rankScore = 92;
    else if (rank <= 60) rankScore = 84;
    else if (rank <= 100) rankScore = 74;
    else rankScore = 62;
  }

  const roiMap = { 'A+': 96, A: 86, 'B+': 74, B: 62, 'C+': 46 };
  const roiScore = roiMap[computeRoiGrade(college)] ?? 60;

  // 預算自帶固定權重 2, 排名/ROI 依家長重視度 1–5
  return Math.round(
    (budgetScore * 2 + rankScore * rankW + roiScore * roiW) / (2 + rankW + roiW)
  );
}

// 家庭共識度 0–100: 100 − 分數差*0.6 − 超預算懲罰25
export function computeConsensus(studentScore, parentScore, overBudget) {
  const gap = Math.abs(studentScore - parentScore);
  const consensus = 100 - gap * 0.6 - (overBudget ? 25 : 0);
  return clamp(Math.round(consensus), 0, 100);
}

// 共識診斷狀態
// 🟢 High Consensus: 共識≥75 且在預算內
// 🟡 Alignment Needed: 共識50–74 或輕微超預算
// 🔴 High Risk Gap: 超預算>$20k 或分數差>35
export function getConsensusStatus({ studentScore, parentScore, consensus, overage }) {
  const gap = Math.abs(studentScore - parentScore);
  let status = 'alignment';
  if (overage > 20000 || gap > 35) status = 'highRisk';
  else if (consensus >= 75 && overage <= 0) status = 'high';
  return {
    status,
    gap,
    emoji: status === 'high' ? '🟢' : status === 'alignment' ? '🟡' : '🔴'
  };
}

// 產出完整診斷報告
export function buildAlignmentReport(colleges = [], studentPref = {}, parentPref = {}) {
  const list = (colleges || []).filter(Boolean);
  const maxBudget = Number(parentPref.maxBudget) || 65000;

  const results = list.map(college => {
    const studentScore = computeStudentScore(college, studentPref);
    const parentScore = computeParentScore(college, { ...parentPref, maxBudget });
    const annualCost = estimateAnnualCost(college);
    const overage = annualCost - maxBudget;
    const overBudget = overage > 0;
    const consensus = computeConsensus(studentScore, parentScore, overBudget);
    const status = getConsensusStatus({ studentScore, parentScore, consensus, overage });
    return {
      college,
      studentScore,
      parentScore,
      consensus,
      annualCost,
      overage,
      overBudget,
      roiGrade: computeRoiGrade(college),
      salaryRange: formatSalaryRange(estimateSalaryRange(college)),
      ...status
    };
  });

  const overall = results.length
    ? Math.round(results.reduce((s, r) => s + r.consensus, 0) / results.length)
    : 0;
  const counts = results.reduce(
    (c, r) => { c[r.status] += 1; return c; },
    { high: 0, alignment: 0, highRisk: 0 }
  );
  const advice = generateAdvice(results, studentPref, overall);

  return { overall, results, counts, advice, maxBudget };
}

// 家庭溝通行動建議 (2–3 條, 依診斷結果自動生成)
function generateAdvice(results, studentPref, overall) {
  const advice = [];
  const shortName = r => r.college.shortName || r.college.name;

  const overBudgetSorted = [...results].filter(r => r.overBudget).sort((a, b) => b.overage - a.overage);
  if (overBudgetSorted.length) {
    const top = overBudgetSorted[0];
    advice.push({
      key: top.overage > 20000 ? 'adviceFinancialWarning' : 'adviceBudgetGap',
      vars: { school: shortName(top), gap: formatMoney(top.overage) },
      tone: top.overage > 20000 ? 'danger' : 'warn'
    });
  }

  const worstGap = [...results].sort((a, b) => b.gap - a.gap)[0];
  if (worstGap && worstGap.gap >= 20) {
    advice.push({
      key: 'adviceScoreGap',
      vars: { school: shortName(worstGap), gap: worstGap.gap },
      tone: 'warn'
    });
  }

  const region = studentPref.preferredRegion || 'All';
  if (region !== 'All') {
    const matchCount = results.filter(r => r.college && r.college.location && r.college.location.region === region).length;
    if (matchCount < Math.ceil(results.length / 2)) {
      advice.push({
        key: 'adviceRegionMismatch',
        vars: { region, count: matchCount, total: results.length },
        tone: 'warn'
      });
    }
  }

  const highList = results.filter(r => r.status === 'high');
  if (highList.length) {
    const names = highList.slice(0, 2).map(shortName).join(', ');
    advice.push({ key: 'adviceTopConsensus', vars: { schools: names }, tone: 'good' });
  }

  if (advice.length < 2) {
    advice.push({ key: 'adviceNeedsTalk', vars: { overall }, tone: 'warn' });
  }

  return advice.slice(0, 3);
}