// Campuso Phase 1 — College finance & matching helpers
// 供 Net Price 估算器、ROI 等級、起薪估算與相似學校(Peer)演算法共用
import { COLLEGES } from '../data/colleges';

export const INCOME_BANDS = [
  { id: 'lt40', label: '<$40k', min: 0, max: 40000, aidRate: 0.70 },
  { id: '40-80', label: '$40k–$80k', min: 40000, max: 80000, aidRate: 0.55 },
  { id: '80-130', label: '$80k–$130k', min: 80000, max: 130000, aidRate: 0.40 },
  { id: '130-200', label: '$130k–$200k', min: 130000, max: 200000, aidRate: 0.25 },
  { id: 'gt200', label: '>$200k', min: 200000, max: Infinity, aidRate: 0.10 }
];

export function parseMoney(str) {
  if (str == null) return null;
  const cleaned = String(str).replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
}

export function parseAcceptance(str) {
  if (str == null) return null;
  const cleaned = String(str).replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
}

export function parseRank(str) {
  if (str == null) return null;
  const cleaned = String(str).replace(/[^0-9]/g, '');
  if (!cleaned) return null;
  const num = parseInt(cleaned, 10);
  return Number.isFinite(num) ? num : null;
}

// ==== 需求 1: Net Price 估算 ====
export function estimateNetPrice(college, band, residency) {
  const inState = parseMoney(college.tuitionInState);
  const outState = parseMoney(college.tuitionOutState);
  let tuition;
  if (residency === 'inState') tuition = inState || outState;
  else tuition = outState || inState;
  if (tuition == null) tuition = 45000;

  const isPublic = (college.type || '').toLowerCase().includes('public');
  const roomBoard = isPublic ? 13500 : 16500;
  // 公立校對外州學生幾乎不提供機構助學金, aidRate 上限收緊到 10%
  const effectiveAidRate = (isPublic && residency === 'outState')
    ? Math.min(band ? band.aidRate : 0.1, 0.10)
    : (band ? band.aidRate : 0.4);
  const aidOffered = Math.round(tuition * effectiveAidRate);
  const net = Math.round((tuition - aidOffered + roomBoard) / 1000) * 1000;
  return { net, tuition, roomBoard, aidOffered };
}

export function getFinancialRisk(net) {
  if (net < 25000) {
    return { level: 'safe', label: '🟢 Financial Safety (经济安全校)' };
  }
  if (net <= 55000) {
    return { level: 'target', label: '🟡 Financial Target (经济匹配校)' };
  }
  return { level: 'reach', label: '🔴 Financial Reach / ED Warning (经济高压校，慎填 ED)' };
}

// ==== 需求 3: ROI 等級 + 中位起薪估算 ====
export function computeRoiGrade(college) {
  const acc = parseAcceptance(college.acceptanceRate);
  const tuition = parseMoney(college.tuitionOutState);
  let score = 0;

  if (acc === null) score += 14;
  else if (acc <= 10) score += 40;
  else if (acc <= 20) score += 32;
  else if (acc <= 30) score += 26;
  else if (acc <= 45) score += 20;
  else if (acc <= 60) score += 15;
  else if (acc <= 75) score += 10;
  else score += 6;

  if (tuition === null) score += 16;
  else if (tuition <= 15000) score += 30;
  else if (tuition <= 25000) score += 26;
  else if (tuition <= 35000) score += 21;
  else if (tuition <= 45000) score += 16;
  else if (tuition <= 55000) score += 11;
  else score += 6;

  const type = (college.type || '').toLowerCase();
  if (type.includes('private nonprofit')) score += 7;
  else if (type.includes('for-profit')) score -= 8;

  if (acc !== null && acc <= 12) score += 15;

  const rank = parseRank(college.ranking);
  if (rank !== null) {
    if (rank <= 10) score += 18;
    else if (rank <= 30) score += 12;
    else if (rank <= 60) score += 8;
    else if (rank <= 100) score += 4;
  }

  if (score >= 78) return 'A+';
  if (score >= 62) return 'A';
  if (score >= 48) return 'B+';
  if (score >= 34) return 'B';
  return 'C+';
}

export function estimateSalaryRange(college) {
  const acc = parseAcceptance(college.acceptanceRate);
  let base = 62;
  if (acc === null) base = 68;
  else if (acc <= 12) base = 100;
  else if (acc <= 20) base = 90;
  else if (acc <= 30) base = 82;
  else if (acc <= 45) base = 75;
  else if (acc <= 60) base = 70;
  else if (acc <= 75) base = 65;
  else base = 60;

  const type = (college.type || '').toLowerCase();
  if (type.includes('private nonprofit')) base += 4;
  else if (type.includes('for-profit')) base -= 8;

  const rank = parseRank(college.ranking);
  if (rank !== null) {
    if (rank <= 10) base += 15;
    else if (rank <= 30) base += 10;
    else if (rank <= 60) base += 6;
    else if (rank <= 100) base += 3;
  }

  const low = Math.round((base - 8) / 5) * 5;
  const high = Math.round((base + 22) / 5) * 5;
  return { low: Math.max(low, 45), high: Math.max(high, low + 15) };
}

export function formatSalaryRange(range) {
  return `$${range.low}k–$${range.high}k`;
}

// ==== 需求 2: 相似學校 (Peer Schools) 演算法 ====
export function findPeerColleges(college, limit = 4) {
  if (!college) return [];
  const peers = [];
  const myType = college.type || '';
  const myRegion = college.location && college.location.region;
  const myAcc = parseAcceptance(college.acceptanceRate);
  const myTuition = parseMoney(college.tuitionOutState);

  for (const c of COLLEGES) {
    if (!c || c.id === college.id || !c.name) continue;

    let score = 0;
    if ((c.type || '') === myType) score += 25;
    if (c.location && c.location.region && c.location.region === myRegion) score += 25;

    const acc = parseAcceptance(c.acceptanceRate);
    if (myAcc !== null && acc !== null) {
      const diff = Math.abs(myAcc - acc);
      if (diff <= 5) score += 18;
      else if (diff <= 15) score += 10;
      else if (diff <= 30) score += 4;
    }

    const tuition = parseMoney(c.tuitionOutState);
    if (myTuition && tuition && myTuition > 0) {
      const ratio = Math.abs(myTuition - tuition) / myTuition;
      if (ratio <= 0.2) score += 15;
      else if (ratio <= 0.5) score += 8;
    }

    peers.push({ college: c, score });
  }

  peers.sort((a, b) => b.score - a.score);
  return peers.slice(0, limit).map(p => p.college);
}