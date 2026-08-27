// Campuso Phase 2 — Activity Polisher 規則引擎 (純前端, 不呼叫任何 API)
// 將 Common App 活動草稿潤色為專業有力的 150 字描述

export const TIP_QUANTIFY = '[Tip: Add a number to quantify impact, e.g., "trained 20+ members"]';

// 弱動詞 → 依語氣 (impact / academic / leadership) 給出替換詞, 各組第 0 個為主要選項
const VERB_TABLE = [
  { pattern: /was responsible for/gi, impact: ['led', 'managed'], academic: ['managed', 'coordinated'], leadership: ['led', 'directed'] },
  { pattern: /worked on/gi, impact: ['developed', 'built'], academic: ['developed', 'researched'], leadership: ['spearheaded', 'led'] },
  { pattern: /helped/gi, impact: ['supported', 'aided'], academic: ['aided', 'assisted in'], leadership: ['mentored', 'guided'] },
  { pattern: /participated in/gi, impact: ['contributed to', 'drove'], academic: ['engaged in', 'joined'], leadership: ['championed', 'led'] },
  { pattern: /\bdid\b/gi, impact: ['executed', 'delivered'], academic: ['conducted', 'performed'], leadership: ['orchestrated', 'led'] },
  { pattern: /\bmade\b/gi, impact: ['created', 'produced'], academic: ['created', 'developed'], leadership: ['established', 'built'] },
  { pattern: /tried to/gi, impact: ['', ''], academic: ['', ''], leadership: ['', ''] },
  { pattern: /attempted to/gi, impact: ['', ''], academic: ['', ''], leadership: ['', ''] }
];

function collapseSpaces(str) {
  return String(str).replace(/\s{2,}/g, ' ').trim();
}

function stripFirstPersonI(str) {
  // Common App 活動描述慣例不寫 "I" — 移除獨立出現的 I
  return String(str).replace(/\bI\s+/g, ' ');
}

function truncateAtWordBoundary(str, max = 150) {
  if (str.length <= max) return str;
  let cut = str.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > 60) cut = cut.slice(0, lastSpace);
  cut = cut.replace(/[,;:\-]\s*$/, '').trim();
  if (cut && !/[.!?]$/.test(cut)) cut += '.';
  return cut;
}

/**
 * 主入口 — 純前端規則引擎
 * @param {object} params
 *   text         活動描述草稿 (必填)
 *   role         職位 / 角色 (選填, 目前僅作語境參考)
 *   activityType 活動類型 (選填, 語境參考)
 *   tone         'impact' | 'academic' | 'leadership'
 *   options      { quantify, strongVerbs, leadership, trimTo150 }
 *   variant      重新潤色用: 0/1/2... 切換同義詞組
 */
export function polishActivity({ text, role, activityType, tone = 'impact', options = {}, variant = 0 }) {
  let out = String(text || '').trim();
  if (!out) return '';

  // 1) 基本精簡: 去 I 開頭慣例 + 清多餘空白
  out = collapseSpaces(stripFirstPersonI(out));

  // 2) 動詞替換表 (勾選「動詞有力」時啟動; 預設開啟)
  const strongVerbs = options.strongVerbs !== false;
  if (strongVerbs) {
    const v = Math.abs(parseInt(variant, 10) || 0);
    const verbTone = options.leadership ? 'leadership' : tone;
    for (const entry of VERB_TABLE) {
      const pool = entry[verbTone] || entry.impact;
      out = out.replace(entry.pattern, pool[v % pool.length]);
    }
    out = collapseSpaces(out);
  }

  // 3) 150 字截斷 (僅勾選「精簡到 150 字以內」時啟動)
  if (options.trimTo150) {
    out = truncateAtWordBoundary(out, 150);
  }

  // 4) 量化提示: 無任何數字時, 在結果末尾追加提示。
  //    為尊重「150 字以內」目標, 啟用截斷時不追加 (提示本身即超過 150 字)
  if (options.quantify && !options.trimTo150 && !/\d/.test(out)) {
    out = `${out} ${TIP_QUANTIFY}`;
  }

  return out.trim();
}