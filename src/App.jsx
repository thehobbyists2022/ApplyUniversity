import React, { useState, useEffect } from 'react';
import { Search, Compass, BookOpen, Calendar, MessageSquare, Heart, Sparkles, Filter, X, Trophy, ChevronDown, Loader } from 'lucide-react';
import { COLLEGES } from './data/colleges';
import { MAJORS } from './data/majors';
import { loadCollegeDetail, loadCollegeDetails } from './data/collegeDetailLoader';
import { LEGACY_COLLEGE_ID_MAP } from './data/legacyCollegeIdMap';
import CollegeCard from './components/CollegeCard';
import CollegeDetailModal from './components/CollegeDetailModal';
import MajorCard from './components/MajorCard';
import MajorDetailModal from './components/MajorDetailModal';
import TimelineTracker from './components/TimelineTracker';
import CommunityBoard from './components/CommunityBoard';
import SpecializedGuides from './components/SpecializedGuides';
import SmartMatchQuizModal from './components/SmartMatchQuizModal';
import SavedCompareModal from './components/SavedCompareModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('colleges');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedSetting, setSelectedSetting] = useState('All');
  const [selectedMajorFilter, setSelectedMajorFilter] = useState('All');
  const [selectedMajorCategory, setSelectedMajorCategory] = useState('All');

  const [collegeLimit, setCollegeLimit] = useState(24);
  const [majorLimit, setMajorLimit] = useState(24);

  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

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

  const filteredMajors = (MAJORS || []).filter(major => {
    if (!major) return false;
    const matchesSearch = !searchQuery ||
                          (major.name && major.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (major.description && major.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedMajorCategory === 'All' || major.category === selectedMajorCategory;

    return matchesSearch && matchesCategory;
  });

  const visibleMajors = filteredMajors.slice(0, majorLimit);

  const regions = ['All', 'West Coast', 'East Coast', 'Midwest', 'South', 'New England', 'Pacific NW'];
  const settings = ['All', 'Urban', 'Suburban', 'College Town'];

  return (
    <div className="app-container">
      {/* Top Banner */}
      <header className="top-banner">
        <div className="banner-badge">
          <Sparkles size={14} />
          <span>US Edition • High School & Parent Guide</span>
        </div>
        <h1 className="banner-title">Campuso</h1>
        <p className="banner-subtitle">
          Discover top 4-year degree-granting US universities, explore specialized CIP majors, track application milestones, and plan your career path.
        </p>

        {/* Action Header Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.25rem' }}>
          <button 
            className="chip-btn active"
            onClick={() => setIsQuizOpen(true)}
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)' }}
          >
            <Sparkles size={16} />
            Smart Match Quiz
          </button>

          <button 
            className="chip-btn"
            onClick={() => setIsCompareOpen(true)}
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #cbd5e1', padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Trophy size={16} color="#eab308" />
            Saved & Compare ({savedCollegeIds.length})
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="tab-nav">
        <button 
          className={`tab-btn ${activeTab === 'colleges' ? 'active' : ''}`}
          onClick={() => setActiveTab('colleges')}
        >
          <Compass size={18} />
          <span>Explore Colleges ({COLLEGES ? COLLEGES.length : 0})</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'majors' ? 'active' : ''}`}
          onClick={() => setActiveTab('majors')}
        >
          <BookOpen size={18} />
          <span>Academic Majors ({MAJORS ? MAJORS.length : 0})</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <Calendar size={18} />
          <span>Timeline Tracker</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'guides' ? 'active' : ''}`}
          onClick={() => setActiveTab('guides')}
        >
          <Sparkles size={18} />
          <span>Specialized Guides</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          <MessageSquare size={18} />
          <span>Advice Board</span>
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
                    placeholder="Search by college name, city, or vibe (e.g. Stanford, Tech, Silicon Valley)..."
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
                  <span className="filter-label">US Region Filter</span>
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
                  <span className="filter-label">Campus Setting</span>
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
                {selectedRegion === 'SAVED_ONLY' ? 'Saved Colleges' : 'Top US Colleges'} ({filteredColleges.length})
              </h2>
              {savedCollegeIds.length > 0 && (
                <button 
                  onClick={() => setSelectedRegion(selectedRegion === 'SAVED_ONLY' ? 'All' : 'SAVED_ONLY')} 
                  style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {selectedRegion === 'SAVED_ONLY' ? 'Show All Colleges' : `Show Saved Only (${savedCollegeIds.length})`}
                </button>
              )}
            </div>

            {/* College Cards Grid */}
            <div className="college-grid">
              {visibleColleges.map(college => (
                <CollegeCard 
                  key={college.id}
                  college={college}
                  isSaved={savedCollegeIds.includes(college.id)}
                  onToggleSave={toggleSaveCollege}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {/* Pagination Load More Button */}
            {filteredColleges.length > collegeLimit && (
              <div style={{ textAlign: 'center', margin: '2.5rem 0' }}>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  Showing {visibleColleges.length} of {filteredColleges.length} Universities
                </p>
                <button 
                  className="chip-btn active"
                  onClick={() => setCollegeLimit(prev => prev + 24)}
                  style={{ padding: '0.75rem 2rem', fontSize: '0.95rem', borderRadius: '30px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  <ChevronDown size={18} />
                  Load More Universities (+24)
                </button>
              </div>
            )}

            {filteredColleges.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#64748b' }}>No colleges match your current filters</h3>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem' }}>Try clearing your search query or selecting "All" regions.</p>
                <button 
                  className="chip-btn active"
                  style={{ marginTop: '1rem', cursor: 'pointer' }}
                  onClick={() => { setSearchQuery(''); setSelectedRegion('All'); setSelectedSetting('All'); }}
                >
                  Reset Filters
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
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Academic Majors & Career Pathways ({filteredMajors.length})</h2>
                  <p style={{ color: '#64748b', fontSize: '0.925rem' }}>Explore starting salaries, core coursework, and top US colleges for broad and specialized majors.</p>
                </div>

                {/* Major Search Bar */}
                <div className="search-input-wrapper" style={{ maxWidth: '360px', width: '100%' }}>
                  <Search size={16} className="search-icon" />
                  <input 
                    type="text"
                    className="search-input"
                    placeholder="Search any major (e.g. Marine Biology, Finance, AI)..."
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
                  onViewMajorDetails={(m) => setSelectedMajor(m)}
                />
              ))}
            </div>

            {/* Major Load More Pagination */}
            {filteredMajors.length > majorLimit && (
              <div style={{ textAlign: 'center', margin: '2.5rem 0' }}>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  Showing {visibleMajors.length} of {filteredMajors.length} Academic Majors
                </p>
                <button 
                  className="chip-btn active"
                  onClick={() => setMajorLimit(prev => prev + 24)}
                  style={{ padding: '0.75rem 2rem', fontSize: '0.95rem', borderRadius: '30px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  <ChevronDown size={18} />
                  Load More Majors (+24)
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <TimelineTracker 
            completedTasks={completedTasks}
            onToggleTask={toggleTask}
          />
        )}

        {activeTab === 'guides' && (
          <SpecializedGuides />
        )}

        {activeTab === 'community' && (
          <CommunityBoard />
        )}
      </main>

      {/* Modals */}
      {selectedCollege && (
        <CollegeDetailModal 
          college={selectedCollege}
          isSaved={savedCollegeIds.includes(selectedCollege.id)}
          onToggleSave={toggleSaveCollege}
          onClose={() => setSelectedCollege(null)}
        />
      )}

      {selectedMajor && (
        <MajorDetailModal 
          major={selectedMajor}
          collegesMap={collegesMap}
          onClose={() => setSelectedMajor(null)}
        />
      )}

      {isQuizOpen && (
        <SmartMatchQuizModal 
          isOpen={isQuizOpen}
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
          onClose={() => setIsCompareOpen(false)}
          savedIds={savedCollegeIds}
          onRemoveSave={toggleSaveCollege}
        />
      )}
    </div>
  );
}
