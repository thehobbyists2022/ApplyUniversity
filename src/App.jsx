import React, { useState, useEffect, useRef } from 'react';
import { Search, Compass, BookOpen, Calendar, MessageSquare, Heart, Sparkles, Filter, X, Trophy, ChevronDown, Loader, CheckCircle2, Pencil, FileText, Users } from 'lucide-react';
import { COLLEGES } from './data/colleges';
import { MAJORS } from './data/majors';
import { loadCollegeDetail, loadCollegeDetails } from './data/collegeDetailLoader';
import { LEGACY_COLLEGE_ID_MAP } from './data/legacyCollegeIdMap';
import { getTranslation } from './utils/i18n';
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
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <div className="banner-badge">
            <Sparkles size={14} />
            <span>{t('bannerBadge')}</span>
          </div>
          <a
            href="https://steponecareer.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Switch to StepOne Career - AI Resume ATS & Job Search Companion"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '99px',
              background: 'rgba(79, 70, 229, 0.1)',
              border: '1px solid rgba(79, 70, 229, 0.25)',
              color: '#4f46e5',
              fontSize: '0.78rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
          >
            💼 StepOne Career (Job Search & ATS) ↗
          </a>
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
            onClick={() => setIsPolisherOpen(true)}
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #cbd5e1', padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Pencil size={16} color="#7c3aed" />
            {t('activityPolisher')}
          </button>

          <button 
            className="chip-btn"
            onClick={() => setIsEssayOpen(true)}
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #cbd5e1', padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FileText size={16} color="#0891b2" />
            {t('essayRecycle')}
          </button>

          <button 
            className="chip-btn"
            onClick={() => setIsAlignmentOpen(true)}
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #cbd5e1', padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Users size={16} color="#d97706" />
            {t('alignmentDashboard')}
          </button>

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

      {/* 輕量 Toast */}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* StepOne Education Suite Footer */}
      <footer style={{
        marginTop: '4rem',
        padding: '2.5rem 1.5rem',
        borderTop: '1px solid #e2e8f0',
        textAlign: 'center',
        background: '#ffffff',
        color: '#64748b',
        fontSize: '0.85rem'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.5rem 1.25rem',
          borderRadius: '99px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <span style={{ fontWeight: 800, color: '#4f46e5', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            StepOne Education Suite:
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: '#0f172a' }}>
            🎓 StepOne College <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>(US University Search)</span>
          </span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <a
            href="https://steponecareer.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Explore StepOne Career - AI Resume ATS & Job Search Companion"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 700,
              color: '#4f46e5',
              textDecoration: 'none'
            }}
          >
            💼 StepOne Career <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>(Job Search & ATS)</span> ↗
          </a>
        </div>

        <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
          StepOne College © 2026 · Operated by Clarity Clinical Solutions LLC
        </p>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Smart US College, Academic Majors & Career Navigator for Students and Parents
        </p>
      </footer>
    </div>
  );
}
