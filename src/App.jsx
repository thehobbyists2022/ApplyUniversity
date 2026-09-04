import React, { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Search, Compass, BookOpen, Calendar, MessageSquare, Heart, Sparkles, Filter, X, Trophy, ChevronDown, Loader, CheckCircle2, Pencil, FileText, Users, ExternalLink, UserRound, LogOut, Crown, ShieldCheck, Scale, Trash2 } from 'lucide-react';
import { MAJORS } from './data/majors';
import { loadCollegeDetail, loadCollegeDetails } from './data/collegeDetailLoader';
import { LEGACY_COLLEGE_ID_MAP } from './data/legacyCollegeIdMap';
import { getTranslation } from './utils/i18n';
import { getSession, onAuthStateChange, signOutUser } from './lib/auth';
import { getLocalPremium, setLocalPremium, fetchPremiumFromProfile } from './lib/subscription';
import LanguageSelector from './components/LanguageSelector';
import CollegeCard from './components/CollegeCard';
import CollegeDetailModal from './components/CollegeDetailModal';
import MajorCard from './components/MajorCard';
import MajorDetailModal from './components/MajorDetailModal';
import TimelineTracker from './components/TimelineTracker';
import CommunityBoard from './components/CommunityBoard';
import SpecializedGuides from './components/SpecializedGuides';
import SmartMatchQuizModal from './components/SmartMatchQuizModal';
import SavedCompareModal from './components/SavedCompareModal';
import ActivityPolisherModal from './components/ActivityPolisherModal';
import EssayRecycleModal from './components/EssayRecycleModal';
import ParentStudentAlignmentModal from './components/ParentStudentAlignmentModal';
import AuthModal from './components/AuthModal';
import PaywallModal from './components/PaywallModal';
import LegalModal from './components/LegalModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('colleges');
  const [currentLang, setCurrentLang] = useState(() => {
    try {
      return localStorage.getItem('campuso_lang') || 'en';
    } catch {
      return 'en';
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedSetting, setSelectedSetting] = useState('All');
  const [selectedMajorFilter, setSelectedMajorFilter] = useState('All');
  const [selectedMajorCategory, setSelectedMajorCategory] = useState('All');
  const [selectedTrack, setSelectedTrack] = useState('All');

  // 輕量 Toast 提示
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (message) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const t = (key, vars) => getTranslation(currentLang, key, vars);

  const [collegeLimit, setCollegeLimit] = useState(24);
  const [majorLimit, setMajorLimit] = useState(24);

  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isPolisherOpen, setIsPolisherOpen] = useState(false);
  const [isEssayOpen, setIsEssayOpen] = useState(false);
  const [isAlignmentOpen, setIsAlignmentOpen] = useState(false);

  // Phase 7 — Supabase Auth + Premium + Legal
  const [authUser, setAuthUser] = useState(null);
  const [premium, setPremium] = useState(() => getLocalPremium());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState('privacy');

  // 還原 session + 訂閱 auth 狀態變更
  useEffect(() => {
    let mounted = true;
    getSession().then(({ data }) => {
      if (mounted && data && data.session) setAuthUser(data.session.user);
    });
    const unsubscribe = onAuthStateChange((session) => {
      if (mounted) setAuthUser(session ? session.user : null);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // 登入時嘗試從 Supabase profiles 讀取訂閱狀態, 失敗則回退 localStorage
  useEffect(() => {
    let active = true;
    if (!authUser) {
      setPremium(getLocalPremium());
      return;
    }
    fetchPremiumFromProfile(authUser.id).then(fromDb => {
      if (!active) return;
      if (fromDb === null) setPremium(getLocalPremium());
      else {
        setPremium(fromDb);
        setLocalPremium(fromDb);
      }
    });
    return () => { active = false; };
  }, [authUser]);

  // 監聽 Stripe 支付完成回跳 (例如 ?checkout=success 或 ?session=success)，透過後端驗證而非本地直接賦權
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('checkout') === 'success' || params.get('session') === 'success') {
        window.history.replaceState({}, document.title, window.location.pathname);
        showToast(currentLang === 'zh' ? '正在验证您的订阅状态...' : 'Verifying your subscription status...');
        if (authUser && authUser.id) {
          fetchPremiumFromProfile(authUser.id).then((fromDb) => {
            if (fromDb) {
              setPremium(true);
              setLocalPremium(true);
              showToast(currentLang === 'zh' ? '🎉 欢迎加入 StepOne Pro！已成功同步会员状态' : '🎉 Welcome to StepOne Pro! Subscription confirmed.');
            } else {
              showToast(currentLang === 'zh' ? '支付处理中，稍后将自动激活' : 'Payment received. Subscription will activate shortly.');
            }
          });
        }
      }
    } catch {
      /* ignore */
    }
  }, [authUser, currentLang]);

  const ensurePro = (fn) => {
    if (premium) { fn(); return; }
    if (!authUser) {
      setIsAuthOpen(true);
      showToast(t('authRequired'));
      return;
    }
    setIsPaywallOpen(true);
  };

  const handleSignOut = async () => {
    await signOutUser();
    setPremium(getLocalPremium());
  };

  const handleDeleteAccount = async () => {
    const confirmMsg = currentLang === 'zh' 
      ? '确定要永久注销您的账户并清空所有升学档案与偏好数据吗？此操作无法撤销。' 
      : 'Are you sure you want to permanently delete your account and all associated college planning data? This action cannot be undone.';
    if (!window.confirm(confirmMsg)) return;

    try {
      const { deleteUserAccount } = await import('./services/authService');
      const res = await deleteUserAccount();
      if (res.success) {
        setAuthUser(null);
        setPremium(false);
        setLocalPremium(false);
        showToast(currentLang === 'zh' ? '✅ 账户及档案已永久清空注销' : '✅ Account and data permanently deleted');
      } else {
        showToast(currentLang === 'zh' ? '注销请求失败，请检查网络或稍后重试' : 'Deletion request failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      showToast(currentLang === 'zh' ? '操作异常，请稍后重试' : 'Error processing deletion request.');
    }
  };

  const handleUnlock = () => {
    setPremium(true);
    setLocalPremium(true);
    setIsPaywallOpen(false);
    showToast(t('proUnlockedToast'));
  };

  const openLegal = (tab) => {
    setLegalTab(tab);
    setIsLegalOpen(true);
  };

  useEffect(() => {
    localStorage.setItem('campuso_lang', currentLang);
  }, [currentLang]);

  // Reset pagination on filter change
  useEffect(() => {
    setCollegeLimit(24);
    setMajorLimit(24);
  }, [searchQuery, selectedRegion, selectedSetting, selectedMajorFilter, selectedMajorCategory]);

  // Saved Colleges Persistent State
  const [savedCollegeIds, setSavedCollegeIds] = useState(() => {
    try {
      const saved = localStorage.getItem('unipath_saved_colleges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Completed Timeline Tasks Persistent State
  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('unipath_timeline_tasks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('unipath_saved_colleges', JSON.stringify(savedCollegeIds));
  }, [savedCollegeIds]);

  useEffect(() => {
    localStorage.setItem('unipath_timeline_tasks', JSON.stringify(completedTasks));
  }, [completedTasks]);

  const toggleSaveCollege = (id) => {
    setSavedCollegeIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleTask = (taskId) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // 相似學校一鍵加入對比列表 + Toast
  const handleAddToCompare = (id) => {
    if (savedCollegeIds.includes(id)) {
      showToast(t('alreadyInCompare'));
      return;
    }
    if (savedCollegeIds.length >= 4) {
      showToast(t('compareLimitFull'));
      return;
    }
    const next = [...savedCollegeIds, id];
    setSavedCollegeIds(next);
    showToast(t('addedToCompare', { count: next.length }));
  };

  // Build colleges lookup map for Major modal (含舊 id 對映)
  const collegesMap = (COLLEGES || []).reduce((acc, c) => {
    if (c && c.id) acc[c.id] = c;
    return acc;
  }, {});
  // 舊 id (majors.topColleges) 也對應到新 unit id
  for (const [legacyId, unitId] of Object.entries(LEGACY_COLLEGE_ID_MAP)) {
    if (collegesMap[unitId]) collegesMap[legacyId] = collegesMap[unitId];
  }

  // Filter Colleges safely (精簡層欄位)
  const filteredColleges = (COLLEGES || []).filter(col => {
    if (!col) return false;
    
    if (selectedRegion === 'SAVED_ONLY') {
      return savedCollegeIds.includes(col.id);
    }

    const matchesSearch = !searchQuery || 
                          (col.name && col.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (col.shortName && col.shortName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (col.location && col.location.city && col.location.city.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRegion = selectedRegion === 'All' || (col.location && col.location.region === selectedRegion);
    const matchesSetting = selectedSetting === 'All' || (col.location && col.location.setting === selectedSetting);

    return matchesSearch && matchesRegion && matchesSetting;
  });

  // 點開學校: 動態載入該州詳情層
  const handleViewDetails = async (college) => {
    setIsLoadingDetail(true);
    try {
      const detail = await loadCollegeDetail(college);
      setSelectedCollege(detail);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const visibleColleges = filteredColleges.slice(0, collegeLimit);

  // Filter Majors safely
  const majorCategories = ['All', 'Healthcare & Life Sciences', 'STEM & Tech', 'Business & Management', 'Law, Policy & Social Sciences', 'Arts, Humanities & Design', 'Environment & Sustainability'];

  // 6 大高薪 / 熱門賽道快捷導航
  const MAJOR_TRACKS = [
    { id: 'premed', label: '🧬 Pre-Med 医科预科 & 生物医药', keywords: ['medical', 'biomedical', 'medicine', 'nursing', 'pharmac', 'neuro', 'genetic', 'biochem', 'bio', 'clinical', 'epidemiolog', 'kinesiology'] },
    { id: 'cs-ai', label: '💻 CS & AI 人工智能前沿', keywords: ['computer science', 'artificial intelligence', 'data science', 'machine learning', 'cybersecurity', 'software', 'computer engineering', 'information assurance', 'quantum'] },
    { id: 'quant-finance', label: '📈 量化金融 & 华尔街投行', keywords: ['finance', 'investment', 'quantitative', 'economics', 'actuarial', 'business', 'supply chain', 'marketing', 'real estate'] },
    { id: 'prelaw', label: '⚖️ Pre-Law 法学预科 & 公共政策', keywords: ['law', 'political science', 'government', 'policy', 'international relations', 'diplomacy'] },
    { id: 'aerospace-hw', label: '🚀 航空航天 & 智能硬件工程', keywords: ['aerospace', 'astronautical', 'mechanical', 'electrical', 'hardware', 'physics', 'automotive', 'robotics'] },
    { id: 'ux-hci', label: '🎨 UX/UI 设计 & 人机交互', keywords: ['ux', 'ui', 'design', 'interaction', 'human-computer', 'product', 'game', 'film', 'architecture'] }
  ];

  const filteredMajors = (MAJORS || []).filter(major => {
    if (!major) return false;
    const matchesSearch = !searchQuery ||
                          (major.name && major.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (major.description && major.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedMajorCategory === 'All' || major.category === selectedMajorCategory;

    const track = MAJOR_TRACKS.find(tr => tr.id === selectedTrack);
    const matchesTrack = !track ||
      (major.name && track.keywords.some(kw => major.name.toLowerCase().includes(kw)));

    return matchesSearch && matchesCategory && matchesTrack;
  });

  const visibleMajors = filteredMajors.slice(0, majorLimit);

  const regions = ['All', 'West Coast', 'East Coast', 'Midwest', 'South', 'New England', 'Pacific NW'];
  const settings = ['All', 'Urban', 'Suburban', 'College Town'];

  return (
    <div className="app-container">
      {/* Top Banner */}
      <header className="top-banner">
        {/* StepOne Ecosystem Switch Bar */}
        <div className="eco-bar">
          <div className="banner-badge">
            <Sparkles size={14} />
            <span>{t('bannerBadge')}</span>
          </div>

          <div className="eco-switch" role="group" aria-label="StepOne ecosystem">
            <div className="eco-switch-item eco-current">
              <span className="eco-switch-emoji">🎓</span>
              <span className="eco-switch-text">
                <span className="eco-switch-name">{t('ecoCollegeName')}</span>
                <span className="eco-switch-sub">{t('ecoCollegeSub')}</span>
              </span>
              <span className="eco-switch-flag">{t('ecoCurrentApp')}</span>
            </div>
            <span className="eco-switch-divider" aria-hidden="true" />
            <a
              className="eco-switch-item eco-switch-link"
              href="https://steponecareer.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Switch to StepOne Career - AI Resume ATS & Job Search Companion"
            >
              <span className="eco-switch-emoji">💼</span>
              <span className="eco-switch-text">
                <span className="eco-switch-name">{t('ecoCareerName')}</span>
                <span className="eco-switch-sub">{t('ecoCareerSub')}</span>
              </span>
              <ExternalLink size={13} className="eco-switch-ext" />
            </a>
          </div>
        </div>
        <h1 className="banner-title">{t('appName')}</h1>
        <p className="banner-subtitle">
          {t('bannerSubtitle')}
        </p>

        {/* Action Header Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.25rem' }}>
          <button 
            className="chip-btn active"
            onClick={() => setIsQuizOpen(true)}
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)' }}
          >
            <Sparkles size={16} />
            {t('smartMatchQuiz')}
          </button>

          <button 
            className="chip-btn"
            onClick={() => setIsCompareOpen(true)}
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #cbd5e1', padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Trophy size={16} color="#eab308" />
            {t('savedCompare')} ({savedCollegeIds.length})
          </button>

          <button 
            className="chip-btn"
            onClick={() => ensurePro(() => setIsPolisherOpen(true))}
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #cbd5e1', padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Pencil size={16} color="#7c3aed" />
            {t('activityPolisher')}
          </button>

          <button 
            className="chip-btn"
            onClick={() => ensurePro(() => setIsEssayOpen(true))}
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #cbd5e1', padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FileText size={16} color="#0891b2" />
            {t('essayRecycle')}
          </button>

          <button 
            className="chip-btn"
            onClick={() => ensurePro(() => setIsAlignmentOpen(true))}
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #cbd5e1', padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Users size={16} color="#d97706" />
            {t('alignmentDashboard')}
          </button>

          {authUser ? (
            <div className="user-chip">
              <span className="user-avatar">{(authUser.email || 'U').slice(0, 1).toUpperCase()}</span>
              <span className="user-email" title={authUser.email}>
                {authUser.email ? authUser.email.split('@')[0].slice(0, 14) : 'Member'}
              </span>
              {premium && (
                <span className="pro-badge"><Crown size={11} /> {t('premium')}</span>
              )}
              <button className="user-signout" onClick={handleSignOut} title={t('signOut')}>
                <LogOut size={14} />
              </button>
              <button 
                className="user-signout" 
                onClick={handleDeleteAccount} 
                title={currentLang === 'zh' ? '注销账户并删除所有数据 (Delete Account)' : 'Delete Account & Clear Data'} 
                style={{ color: '#ef4444', marginLeft: '2px' }}
                aria-label="Delete Account"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <button 
              className="chip-btn"
              onClick={() => setIsAuthOpen(true)}
              style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #cbd5e1', padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <UserRound size={16} color="#4f46e5" />
              {t('signIn')}
            </button>
          )}

          {!premium && (
            <button 
              className="chip-btn pro-chip"
              onClick={() => setIsPaywallOpen(true)}
              style={{ background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)' }}
            >
              <Crown size={16} />
              {Capacitor.isNativePlatform() ? (currentLang === 'zh' ? 'Pro 权益' : 'Pro Features') : t('upgradeToPro')}
            </button>
          )}

          <LanguageSelector currentLang={currentLang} onLangChange={setCurrentLang} />
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="tab-nav">
        <button 
          className={`tab-btn ${activeTab === 'colleges' ? 'active' : ''}`}
          onClick={() => setActiveTab('colleges')}
        >
          <Compass size={18} />
          <span>{t('navColleges')} ({COLLEGES ? COLLEGES.length : 0})</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'majors' ? 'active' : ''}`}
          onClick={() => setActiveTab('majors')}
        >
          <BookOpen size={18} />
          <span>{t('navMajors')} ({MAJORS ? MAJORS.length : 0})</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <Calendar size={18} />
          <span>{t('navTimeline')}</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'guides' ? 'active' : ''}`}
          onClick={() => setActiveTab('guides')}
        >
          <Sparkles size={18} />
          <span>{t('navGuides')}</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          <MessageSquare size={18} />
          <span>{t('navCommunity')}</span>
        </button>
      </nav>

      {/* Main Content Sections */}
      <main>
        {activeTab === 'colleges' && (
          <div>
            {/* Search & Filter Card */}
            <div className="search-filter-card">
              <div className="search-row">
                <div className="search-input-wrapper">
                  <Search size={18} className="search-icon" />
                  <input 
                    type="text"
                    className="search-input"
                    placeholder={t('searchCollegesPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div className="filter-group">
                  <span className="filter-label">{t('regionFilter')}</span>
                  <div className="filter-chips">
                    {regions.map(r => (
                      <button 
                        key={r}
                        className={`chip-btn ${selectedRegion === r ? 'active' : ''}`}
                        onClick={() => setSelectedRegion(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <span className="filter-label">{t('campusSetting')}</span>
                  <div className="filter-chips">
                    {settings.map(s => (
                      <button 
                        key={s}
                        className={`chip-btn ${selectedSetting === s ? 'active' : ''}`}
                        onClick={() => setSelectedSetting(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {selectedRegion === 'SAVED_ONLY' ? t('savedColleges') : t('topUSColleges')} ({filteredColleges.length})
              </h2>
              {savedCollegeIds.length > 0 && (
                <button 
                  onClick={() => setSelectedRegion(selectedRegion === 'SAVED_ONLY' ? 'All' : 'SAVED_ONLY')} 
                  style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {selectedRegion === 'SAVED_ONLY' ? t('showAllColleges') : `${t('showSavedOnly')} (${savedCollegeIds.length})`}
                </button>
              )}
            </div>

            {/* College Cards Grid */}
            <div className="college-grid">
              {visibleColleges.map(college => (
                <CollegeCard 
                  key={college.id}
                  college={college}
                  lang={currentLang}
                  isSaved={savedCollegeIds.includes(college.id)}
                  onToggleSave={toggleSaveCollege}
                  onViewDetails={handleViewDetails}
                  onAddToCompare={handleAddToCompare}
                />
              ))}
            </div>

            {/* Pagination Load More Button */}
            {filteredColleges.length > collegeLimit && (
              <div style={{ textAlign: 'center', margin: '2.5rem 0' }}>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  {t('showingOf', { shown: visibleColleges.length, total: filteredColleges.length })}
                </p>
                <button 
                  className="chip-btn active"
                  onClick={() => setCollegeLimit(prev => prev + 24)}
                  style={{ padding: '0.75rem 2rem', fontSize: '0.95rem', borderRadius: '30px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  <ChevronDown size={18} />
                  {t('loadMoreUniversities')}
                </button>
              </div>
            )}

            {filteredColleges.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#64748b' }}>{t('noCollegesMatch')}</h3>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem' }}>{t('noCollegesTry')}</p>
                <button 
                  className="chip-btn active"
                  style={{ marginTop: '1rem', cursor: 'pointer' }}
                  onClick={() => { setSearchQuery(''); setSelectedRegion('All'); setSelectedSetting('All'); }}
                >
                  {t('resetFilters')}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'majors' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{t('majorsTitle')} ({filteredMajors.length})</h2>
                  <p style={{ color: '#64748b', fontSize: '0.925rem' }}>{t('majorsSubtitle')}</p>
                </div>

                {/* Major Search Bar */}
                <div className="search-input-wrapper" style={{ maxWidth: '360px', width: '100%' }}>
                  <Search size={16} className="search-icon" />
                  <input 
                    type="text"
                    className="search-input"
                    placeholder={t('searchMajorsPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', fontSize: '0.875rem' }}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* 6 大高薪 / 熱門賽道快捷導航 */}
              <div className="track-pills-wrap">
                <div className="track-pills-title">
                  <Sparkles size={15} />
                  <span>{t('majorsTracksTitle')}</span>
                </div>
                <div className="track-pills">
                  <button
                    className={`track-pill ${selectedTrack === 'All' ? 'active' : ''}`}
                    onClick={() => setSelectedTrack('All')}
                  >
                    {t('allTracks')}
                  </button>
                  {MAJOR_TRACKS.map(track => (
                    <button
                      key={track.id}
                      className={`track-pill ${selectedTrack === track.id ? 'active' : ''}`}
                      onClick={() => setSelectedTrack(prev => (prev === track.id ? 'All' : track.id))}
                    >
                      {track.label}
                    </button>
                  ))}
                </div>
                <p className="track-pills-hint">{t('majorsTracksHint')}</p>
              </div>

              {/* Major Category Chips */}
              <div className="filter-chips" style={{ marginBottom: '1.5rem' }}>
                {majorCategories.map(cat => (
                  <button
                    key={cat}
                    className={`chip-btn ${selectedMajorCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedMajorCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Majors Grid */}
            <div className="major-grid">
              {visibleMajors.map(major => (
                <MajorCard 
                  key={major.id}
                  major={major}
                  lang={currentLang}
                  onViewMajorDetails={(m) => setSelectedMajor(m)}
                />
              ))}
            </div>

            {/* Major Load More Pagination */}
            {filteredMajors.length > majorLimit && (
              <div style={{ textAlign: 'center', margin: '2.5rem 0' }}>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  {t('showingMajorsOf', { shown: visibleMajors.length, total: filteredMajors.length })}
                </p>
                <button 
                  className="chip-btn active"
                  onClick={() => setMajorLimit(prev => prev + 24)}
                  style={{ padding: '0.75rem 2rem', fontSize: '0.95rem', borderRadius: '30px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  <ChevronDown size={18} />
                  {t('loadMoreMajors')}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <TimelineTracker 
            completedTasks={completedTasks}
            onToggleTask={toggleTask}
            lang={currentLang}
          />
        )}

        {activeTab === 'guides' && (
          <SpecializedGuides lang={currentLang} />
        )}

        {activeTab === 'community' && (
          <CommunityBoard lang={currentLang} />
        )}
      </main>

      {/* Modals */}
      {selectedCollege && (
        <CollegeDetailModal 
          college={selectedCollege}
          lang={currentLang}
          isSaved={savedCollegeIds.includes(selectedCollege.id)}
          onToggleSave={toggleSaveCollege}
          onClose={() => setSelectedCollege(null)}
          onAddToCompare={handleAddToCompare}
        />
      )}

      {selectedMajor && (
        <MajorDetailModal 
          major={selectedMajor}
          lang={currentLang}
          collegesMap={collegesMap}
          onClose={() => setSelectedMajor(null)}
        />
      )}

      {isQuizOpen && (
        <SmartMatchQuizModal 
          isOpen={isQuizOpen}
          lang={currentLang}
          onClose={() => setIsQuizOpen(false)}
          onApplyMatchFilters={(filters) => {
            if (filters.region && filters.region !== 'All') setSelectedRegion(filters.region);
            if (filters.setting && filters.setting !== 'All') setSelectedSetting(filters.setting);
            setIsQuizOpen(false);
          }}
        />
      )}

      {isCompareOpen && (
        <SavedCompareModal 
          isOpen={isCompareOpen}
          lang={currentLang}
          onClose={() => setIsCompareOpen(false)}
          savedIds={savedCollegeIds}
          onRemoveSave={toggleSaveCollege}
          isPremium={premium}
          onRequirePremium={() => ensurePro(() => {})}
        />
      )}

      {isPolisherOpen && (
        <ActivityPolisherModal
          isOpen={isPolisherOpen}
          lang={currentLang}
          onClose={() => setIsPolisherOpen(false)}
        />
      )}

      {isEssayOpen && (
        <EssayRecycleModal
          isOpen={isEssayOpen}
          lang={currentLang}
          onClose={() => setIsEssayOpen(false)}
          savedIds={savedCollegeIds}
        />
      )}

      {isAlignmentOpen && (
        <ParentStudentAlignmentModal
          isOpen={isAlignmentOpen}
          lang={currentLang}
          onClose={() => setIsAlignmentOpen(false)}
          savedIds={savedCollegeIds}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        lang={currentLang}
        onClose={() => setIsAuthOpen(false)}
      />

      <PaywallModal
        isOpen={isPaywallOpen}
        lang={currentLang}
        onClose={() => setIsPaywallOpen(false)}
        isSignedIn={Boolean(authUser)}
        onRequireAuth={() => {
          setIsPaywallOpen(false);
          setIsAuthOpen(true);
        }}
        onUnlocked={handleUnlock}
      />

      {isLegalOpen && (
        <LegalModal
          isOpen={isLegalOpen}
          lang={currentLang}
          onClose={() => setIsLegalOpen(false)}
          initialTab={legalTab}
        />
      )}

      {/* 輕量 Toast */}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* StepOne Education & Career Suite Footer */}
      <footer className="eco-footer">
        <div className="eco-suite">
          <div className="eco-suite-head">
            <span className="eco-suite-kicker">StepOne Ecosystem</span>
            <h2 className="eco-suite-title">{t('ecoSuiteTitle')}</h2>
            <p className="eco-suite-subtitle">{t('ecoSuiteSubtitle')}</p>
          </div>

          <div className="eco-suite-grid">
            {/* StepOne College (Current App) */}
            <div className="eco-product-card eco-college">
              <div className="eco-product-top">
                <span className="eco-product-emoji">🎓</span>
                <div>
                  <div className="eco-product-name">StepOne College</div>
                  <div className="eco-product-tag">{t('ecoCurrentApp')}</div>
                </div>
              </div>
              <p className="eco-product-desc">{t('steponeCollegeDesc')}</p>
              <div className="eco-product-features">
                {['College Matching', 'ROI & Net Price', 'Activity Polisher', 'Essay Recycler', 'Parent Alignment'].map(f => (
                  <span key={f} className="eco-feature">✓ {f}</span>
                ))}
              </div>
            </div>

            {/* StepOne Career */}
            <div className="eco-product-card eco-career">
              <div className="eco-product-top">
                <span className="eco-product-emoji">💼</span>
                <div>
                  <div className="eco-product-name">StepOne Career</div>
                  <div className="eco-product-tag">AI Resume • ATS • Jobs</div>
                </div>
              </div>
              <p className="eco-product-desc">{t('steponeCareerDesc')}</p>
              <div className="eco-product-features">
                {['AI Resume Builder', 'ATS Optimization', 'Job Matcher', 'Tech & Finance Roadmaps'].map(f => (
                  <span key={f} className="eco-feature">✓ {f}</span>
                ))}
              </div>
              <a
                href="https://steponecareer.com"
                target="_blank"
                rel="noopener noreferrer"
                className="eco-product-cta"
                title="Explore StepOne Career - AI Resume ATS & Job Search Companion"
              >
                {t('visitStepOneCareer')}
                <ExternalLink size={15} />
              </a>
            </div>
          </div>

          <p className="eco-suite-copy">
            StepOne College © 2026 · Operated by Clarity Clinical Solutions LLC · Smart US College, Academic Majors & Career Navigator for Students and Parents
          </p>

          <div className="footer-legal">
            <button onClick={() => openLegal('privacy')}><ShieldCheck size={13} /> {t('legalPrivacyTitle')}</button>
            <span className="footer-legal-dot">•</span>
            <button onClick={() => openLegal('terms')}><Scale size={13} /> {t('legalTermsTitle')}</button>
            <span className="footer-legal-dot">•</span>
            <button onClick={() => openLegal('security')}><Sparkles size={13} /> {t('legalSecurityTitle')}</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
