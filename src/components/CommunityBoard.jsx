import React, { useState, useEffect, useCallback } from 'react';
import { ThumbsUp, MessageSquare, Plus, X, Send, Sparkles, RefreshCw } from 'lucide-react';
import { getTranslation } from '../utils/i18n';
import { fetchQuestions, addQuestion, fetchReplies, addReply, askAICounselor } from '../firebaseCommunity';

export default function CommunityBoard({ lang }) {
  const t = (k) => getTranslation(lang, k);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 發問表單
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newRole, setNewRole] = useState('High School Student');
  const [newCategory, setNewCategory] = useState('Major Advice');

  // 回答
  const [openReplies, setOpenReplies] = useState({});
  const [repliesCache, setRepliesCache] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [aiLoading, setAiLoading] = useState({});

  const categories = ['All', 'Major Advice', 'Essays & Admissions', 'Parent Questions'];

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchQuestions();
      setQuestions(list);
    } catch (err) {
      console.error('載入問題失敗:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleAddPost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      await addQuestion({ title: newTitle, content: newContent, role: newRole, category: newCategory });
      setNewTitle('');
      setNewContent('');
      setIsModalOpen(false);
      await loadQuestions();
    } catch (err) {
      console.error('發佈失敗:', err);
    }
  };

  const toggleReplies = async (qid) => {
    const next = { ...openReplies, [qid]: !openReplies[qid] };
    setOpenReplies(next);
    if (next[qid] && !repliesCache[qid]) {
      try {
        const replies = await fetchReplies(qid);
        setRepliesCache((prev) => ({ ...prev, [qid]: replies }));
      } catch (err) {
        console.error('載入回答失敗:', err);
      }
    }
  };

  const handleReply = async (qid) => {
    const content = (replyDrafts[qid] || '').trim();
    if (!content) return;
    try {
      await addReply({ questionId: qid, content });
      setReplyDrafts((prev) => ({ ...prev, [qid]: '' }));
      const replies = await fetchReplies(qid);
      setRepliesCache((prev) => ({ ...prev, [qid]: replies }));
    } catch (err) {
      console.error('回覆失敗:', err);
    }
  };

  const handleAskAI = async (qid, questionText) => {
    setAiLoading((prev) => ({ ...prev, [qid]: true }));
    setOpenReplies((prev) => ({ ...prev, [qid]: true }));
    try {
      const answer = await askAICounselor({ question: questionText, lang });
      await addReply({ questionId: qid, content: answer, isAI: true });
      const replies = await fetchReplies(qid);
      setRepliesCache((prev) => ({ ...prev, [qid]: replies }));
    } catch (err) {
      console.error('AI 回答失敗:', err);
    } finally {
      setAiLoading((prev) => ({ ...prev, [qid]: false }));
    }
  };

  const filteredQuestions = selectedCategory === 'All'
    ? questions
    : questions.filter((q) => q.category === selectedCategory);

  return (
    <div className="community-grid">
      {/* Header */}
      <div style={{
        background: '#ffffff',
        padding: '1.25rem',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        marginBottom: '0.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t('communityTitle')}</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{t('communitySubtitle')}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="detail-btn"
            style={{ background: '#4f46e5', color: '#ffffff', padding: '0.5rem 1rem' }}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            <span>{t('askQuestion')}</span>
          </button>

          <button
            className="chip-btn"
            onClick={loadQuestions}
            title="Refresh"
            style={{ padding: '0.45rem 0.75rem' }}
          >
            <RefreshCw size={15} />
          </button>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`chip-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          {t('loading')}...
        </div>
      )}

      {/* No questions */}
      {!loading && filteredQuestions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <MessageSquare size={32} color="#cbd5e1" style={{ marginBottom: '0.5rem' }} />
          <p style={{ color: '#64748b' }}>{t('noQuestions')}</p>
        </div>
      )}

      {/* Questions */}
      {filteredQuestions.map((q) => {
        const isOpen = !!openReplies[q.id];
        const replies = repliesCache[q.id] || [];
        return (
          <div key={q.id} className="post-card">
            <div className="post-meta">
              <div>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{q.author}</span>
                {q.role && <span className="author-badge">{q.role}</span>}
              </div>
              <span>{q.category}</span>
            </div>

            <h3 className="post-title">{q.title}</h3>
            <p className="post-content">{q.content}</p>

            <div className="post-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b' }}>
                <ThumbsUp size={16} />
                <span>{q.upvotes || 0} {t('upvotes')}</span>
              </div>

              <button
                onClick={() => toggleReplies(q.id)}
                style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <MessageSquare size={16} />
                <span>{replies.length > 0 ? `${replies.length} ` : ''}{isOpen ? t('hideAnswers') : t('viewAnswers')}</span>
              </button>

              <button
                onClick={() => handleAskAI(q.id, q.title + ' ' + (q.content || ''))}
                disabled={!!aiLoading[q.id]}
                style={{
                  background: aiLoading[q.id] ? '#e0e7ff' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: aiLoading[q.id] ? 'default' : 'pointer',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Sparkles size={14} />
                <span>{aiLoading[q.id] ? t('aiThinking') : t('askAI')}</span>
              </button>
            </div>

            {/* Replies section */}
            {isOpen && (
              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '1rem', paddingTop: '1rem' }}>
                {replies.length === 0 && (
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                    {t('noQuestions')}
                  </p>
                )}
                {replies.map((r) => (
                  <div key={r.id} style={{
                    background: r.isAI ? '#eef2ff' : '#f8fafc',
                    border: r.isAI ? '1px solid #c7d2fe' : '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    marginBottom: '0.6rem'
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: r.isAI ? '#4338ca' : '#64748b', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {r.isAI && <Sparkles size={12} />} {r.isAI ? t('aiAnswered') : r.author}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#0f172a', whiteSpace: 'pre-wrap' }}>{r.content}</div>
                  </div>
                ))}

                {/* Reply input */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder={t('yourReply')}
                    value={replyDrafts[q.id] || ''}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    style={{ flex: 1, padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                  <button className="detail-btn" style={{ padding: '0.55rem 0.9rem' }} onClick={() => handleReply(q.id)}>
                    <Send size={15} />
                    <span>{t('postReply')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Ask Question Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{t('askCommunityTitle')}</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>{t('askCommunityDesc')}</p>
            </div>

            <form onSubmit={handleAddPost} className="modal-body">
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>{t('iAmA')}</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="High School Student">{t('highSchoolStudent')}</option>
                  <option value="Parent of High Schooler">{t('parentOfHighSchooler')}</option>
                  <option value="Current College Student">{t('currentCollegeStudent')}</option>
                  <option value="High School Counselor">{t('highSchoolCounselor')}</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>{t('category')}</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="Major Advice">{t('majorAdvice')}</option>
                  <option value="Essays & Admissions">{t('essaysAdmissions')}</option>
                  <option value="Parent Questions">{t('parentQuestions')}</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>{t('questionTitle')}</label>
                <input
                  type="text"
                  placeholder={t('postQuestionHint')}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>{t('detailsContext')}</label>
                <textarea
                  rows={4}
                  placeholder={t('detailsHint')}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontFamily: 'inherit' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="chip-btn" onClick={() => setIsModalOpen(false)}>{t('cancel')}</button>
                <button type="submit" className="detail-btn" style={{ flex: 1, justifyContent: 'center', background: '#4f46e5', color: '#ffffff' }}>
                  <Send size={16} />
                  <span>{t('postQuestion')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
