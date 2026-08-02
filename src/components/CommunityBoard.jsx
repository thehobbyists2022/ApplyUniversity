import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Plus, Share2, X, Send } from 'lucide-react';
import { COMMUNITY_TOPICS } from '../data/community';

export default function CommunityBoard() {
  const [topics, setTopics] = useState(COMMUNITY_TOPICS);
  const [upvotedIds, setUpvotedIds] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newRole, setNewRole] = useState("High School Student");
  const [newCategory, setNewCategory] = useState("Major Advice");

  const categories = ["All", "Major Advice", "Essays & Admissions", "Parent Questions"];

  const handleUpvote = (id) => {
    const isUpvoted = !!upvotedIds[id];
    setUpvotedIds(prev => ({ ...prev, [id]: !isUpvoted }));
    setTopics(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, upvotes: isUpvoted ? t.upvotes - 1 : t.upvotes + 1 };
      }
      return t;
    }));
  };

  const handleAddPost = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost = {
      id: `post-${Date.now()}`,
      author: "You (User)",
      role: newRole,
      category: newCategory,
      title: newTitle,
      content: newContent,
      upvotes: 1,
      repliesCount: 0,
      tags: [newCategory, "New Question"],
      timeAgo: "Just now"
    };

    setTopics([newPost, ...topics]);
    setNewTitle("");
    setNewContent("");
    setIsModalOpen(false);
  };

  const filteredTopics = selectedCategory === "All" 
    ? topics 
    : topics.filter(t => t.category === selectedCategory);

  return (
    <div className="community-grid">
      {/* Category Pills & Info */}
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Student & Parent Advice Community</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Curated insights, questions, and honest experiences from students & parents</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="detail-btn"
            style={{ background: '#4f46e5', color: '#ffffff', padding: '0.5rem 1rem' }}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            <span>Ask a Question</span>
          </button>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {categories.map(cat => (
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

      {/* Posts */}
      {filteredTopics.map((post) => {
        const isUpvoted = !!upvotedIds[post.id];
        return (
          <div key={post.id} className="post-card">
            <div className="post-meta">
              <div>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{post.author}</span>
                <span className="author-badge">{post.role}</span>
              </div>
              <span>{post.timeAgo}</span>
            </div>

            <h3 className="post-title">{post.title}</h3>
            <p className="post-content">{post.content}</p>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {post.tags.map((tag, idx) => (
                <span key={idx} style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                  #{tag}
                </span>
              ))}
            </div>

            <div className="post-footer">
              <button 
                className={`upvote-btn ${isUpvoted ? 'upvoted' : ''}`}
                onClick={() => handleUpvote(post.id)}
              >
                <ThumbsUp size={16} />
                <span>{post.upvotes} Upvotes</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b' }}>
                <MessageSquare size={16} />
                <span>{post.repliesCount} Replies</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Submit Question Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Ask the Campuso Community</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>Post your college or major question for peer and parent advice.</p>
            </div>

            <form onSubmit={handleAddPost} className="modal-body">
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>I AM A...</label>
                <select 
                  value={newRole} 
                  onChange={e => setNewRole(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="High School Student">High School Student</option>
                  <option value="Parent of High Schooler">Parent of High Schooler</option>
                  <option value="Current College Student">Current College Student</option>
                  <option value="High School Counselor">High School Counselor</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>CATEGORY</label>
                <select 
                  value={newCategory} 
                  onChange={e => setNewCategory(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="Major Advice">Major Advice</option>
                  <option value="Essays & Admissions">Essays & Admissions</option>
                  <option value="Parent Questions">Parent Questions</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>QUESTION TITLE</label>
                <input 
                  type="text" 
                  placeholder="e.g. Is Bioengineering a good pre-med major?" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>DETAILS / CONTEXT</label>
                <textarea 
                  rows={4}
                  placeholder="Provide any background context (e.g. GPA, interests, budget)..." 
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontFamily: 'inherit' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="chip-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="detail-btn" style={{ flex: 1, justifyContent: 'center', background: '#4f46e5', color: '#ffffff' }}>
                  <Send size={16} />
                  <span>Post Question</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
