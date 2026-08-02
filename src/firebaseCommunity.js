// Firebase 社群服務: 問題與回答的 Firestore 操作
import { db } from './firebase';
import {
  collection, addDoc, getDocs, query, orderBy, limit,
  serverTimestamp, doc, getDoc
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// 匿名登入 (讓每個訪客有唯一 uid, 才能遵守安全規則)
let authPromise = null;
export function ensureAuth() {
  if (!authPromise) {
    const auth = getAuth();
    authPromise = signInAnonymously(auth).then(() => auth).catch((err) => {
      console.warn('匿名登入失敗:', err);
      return auth;
    });
  }
  return authPromise;
}

// 取得所有問題 (依時間倒序)
export async function fetchQuestions() {
  await ensureAuth();
  const q = query(collection(db, 'community_questions'), orderBy('createdAt', 'desc'), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// 發佈新問題
export async function addQuestion({ title, content, role, category }) {
  await ensureAuth();
  const auth = getAuth();
  const uid = auth.currentUser?.uid || 'anonymous';
  const docRef = await addDoc(collection(db, 'community_questions'), {
    title,
    content,
    role,
    category,
    uid,
    author: 'You',
    upvotes: 0,
    createdAt: serverTimestamp(),
    aiAnswered: false
  });
  return docRef.id;
}

// 取得某問題的回答
export async function fetchReplies(questionId) {
  await ensureAuth();
  const q = query(
    collection(db, 'community_replies'),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  // Firestore 無法直接過濾子集合, 這裡用 docId 關聯 (見下方 design)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((r) => r.questionId === questionId);
}

// 加入回答
export async function addReply({ questionId, content, isAI = false }) {
  await ensureAuth();
  const auth = getAuth();
  const uid = auth.currentUser?.uid || 'anonymous';
  await addDoc(collection(db, 'community_replies'), {
    questionId,
    content,
    uid,
    author: isAI ? 'AI Counselor' : 'You',
    isAI,
    createdAt: serverTimestamp()
  });
}

// 呼叫 AI 升學顧問 (Vercel Serverless, key 在後端)
export async function askAICounselor({ question, lang }) {
  try {
    const resp = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, lang })
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || 'AI request failed');
    }
    const data = await resp.json();
    return data.answer;
  } catch (err) {
    console.error('AI counselor error:', err);
    throw err;
  }
}

