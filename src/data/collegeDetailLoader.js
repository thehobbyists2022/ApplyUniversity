// 詳情層動態載入器
// collegesDetail/{STATE}.js 是 Vite 靜態已知的檔案，動態 import() 會被 code-split
const cache = {};

/**
 * 依學校載入完整詳情 (summary/pros/cons/vibeTags/peerSchools/popularMajors)
 * @param {object} slim 精簡層學校物件 (含 detailKey 與 location.state)
 */
export async function loadCollegeDetail(slim) {
  if (!slim) return null;
  const state = slim.location && slim.location.state;
  const detailKey = slim.detailKey || slim.id;
  if (!state) return { ...slim };

  // 快取: 同一州只載一次
  if (!cache[state]) {
    cache[state] = import(`./collegesDetail/${state}.js`).then((mod) => {
      const key = Object.keys(mod).find((k) => k.startsWith('DETAILS_'));
      return key ? mod[key] : [];
    }).catch((err) => {
      console.warn(`載入詳情層 ${state} 失敗:`, err);
      return [];
    });
  }

  const list = await cache[state];
  const detail = list.find((d) => d.id === detailKey) || list.find((d) => d.id === slim.id);
  return { ...slim, ...(detail || {}) };
}

/** 批次載入多所學校詳情 (供 saved/compare 使用) */
export async function loadCollegeDetails(list) {
  const results = [];
  for (const c of list) {
    results.push(await loadCollegeDetail(c));
  }
  return results;
}
