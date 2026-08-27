// Campuso Phase 3 — Supplemental Essay 回收矩陣規則引擎 (純前端, 無外部資料檔)
// 依大學屬性 (公立/私立/錄取率/排名) 推導各校出「哪種 Supplement 題型」的機率分數
import { parseAcceptance, parseRank } from './collegeFinance';

export const ESSAY_TOPICS = [
  { id: 'why-school',    label: 'Why This School?',          keywords: ['research', 'leadership', 'community'] },
  { id: 'why-major',     label: 'Why This Major?',           keywords: ['research', 'stem', 'career', 'passion'] },
  { id: 'community',     label: 'Community / Diversity',     keywords: ['community', 'diversity', 'culture', 'identity'] },
  { id: 'challenge',     label: 'Challenge / Failure',       keywords: ['challenge', 'failure', 'growth', 'resilience'] },
  { id: 'activity',      label: 'Extracurricular / Activity', keywords: ['activity', 'club', 'sport', 'leadership'] },
  { id: 'short-answer',  label: 'Short Answer (<100 words)',  keywords: [] },
  { id: 'additional',    label: 'Additional Info',            keywords: [] }
];

// 分數 ≥ 此值視為「該校很可能出此題」→ 可計入回收數
export const REUSE_THRESHOLD = 55;

/**
 * 單校單題的「出題機率分」0-100 (啟發式規則)
 * @param {string} topicId  ESSAY_TOPICS[].id
 * @param {object} college  COLLEGES 中的精簡校資料
 */
export function computePromptLikelihood(topicId, college) {
  const acc = parseAcceptance(college.acceptanceRate);
  const rank = parseRank(college.ranking);
  const type = (college.type || '').toLowerCase();
  const isPrivate = type.includes('private');
  const isPublic = type.includes('public');

  let score;
  switch (topicId) {
    case 'why-school':
      // 私立/高排名更重「為什麼選我」; 公立通常較少問
      score = 55;
      if (isPrivate) score += 25;
      if (rank !== null && rank <= 30) score += 10;
      else if (rank !== null && rank <= 60) score += 5;
      if (isPublic) score -= 10;
      break;
    case 'why-major':
      score = 50;
      if (isPrivate) score += 20;
      if (rank !== null && rank <= 40) score += 10;
      if (acc !== null && acc <= 30) score += 10;
      break;
    case 'community':
      // 菁英私立 / 低錄取率更重視多樣性題
      score = 40;
      if (isPrivate) score += 25;
      if (acc !== null && acc <= 25) score += 15;
      break;
    case 'challenge':
      score = 45;
      if (rank !== null && rank <= 50) score += 10;
      if (acc !== null && acc <= 40) score += 5;
      break;
    case 'activity':
      score = 50;
      if (acc !== null && acc <= 40) score += 15;
      if (isPrivate) score += 10;
      break;
    case 'short-answer':
      score = 70;
      if (rank !== null && rank <= 100) score += 5;
      break;
    case 'additional':
      // 多數學校都有選填的 Additional Info
      score = 85;
      if (rank !== null && rank <= 50) score += 5;
      break;
    default:
      score = 50;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** 分數 → 色階: high ≥70 / mid ≥55 / low <55 */
export function getReuseLevel(score) {
  if (score >= 70) return 'high';
  if (score >= REUSE_THRESHOLD) return 'mid';
  return 'low';
}

/**
 * 建構回收矩陣
 * @param {object[]} colleges          選定學校 (≤4)
 * @param {string[]} writtenTopicIds   使用者已寫過的題型 id
 * @returns 每題一列: cells(逐校 likelihood/hasDraft) + recycleCount(可回收校數) + avgLikelihood
 */
export function buildRecycleMatrix(colleges, writtenTopicIds = []) {
  return ESSAY_TOPICS.map(topic => {
    const cells = colleges.map(college => {
      const likelihood = computePromptLikelihood(topic.id, college);
      return {
        college,
        likelihood,
        hasDraft: writtenTopicIds.includes(topic.id)
      };
    });
    const recycleCount = cells.filter(c => c.likelihood >= REUSE_THRESHOLD).length;
    const avgLikelihood = cells.length
      ? Math.round(cells.reduce((sum, c) => sum + c.likelihood, 0) / cells.length)
      : 0;
    return {
      ...topic,
      cells,
      recycleCount,
      avgLikelihood,
      written: writtenTopicIds.includes(topic.id)
    };
  });
}

/**
 * 最佳回收推薦: 回收校數最多, 其次平均機率最高
 * @returns {object|null} 對應 ESSAY_TOPICS 列 + 補充欄位
 */
export function findTopRecyclePick(rows) {
  if (!rows || rows.length === 0) return null;
  const scored = rows
    .filter(r => r.recycleCount >= 2)
    .sort((a, b) => b.recycleCount - a.recycleCount || b.avgLikelihood - a.avgLikelihood);
  return scored[0] || null;
}