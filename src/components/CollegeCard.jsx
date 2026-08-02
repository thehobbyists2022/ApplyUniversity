import React from 'react';
import { MapPin, Heart, ArrowRight, Users } from 'lucide-react';

export default function CollegeCard({ college, isSaved, onToggleSave, onViewDetails }) {
  return (
    <div className="college-card">
      <div className="card-header">
        <div>
          <h3 className="college-name">{college.name}</h3>
          <div className="college-location">
            <MapPin size={15} />
            <span>{college.location.city}, {college.location.state} • {college.location.region} ({college.location.setting})</span>
          </div>
        </div>
        <button 
          className={`fav-btn ${isSaved ? 'active' : ''}`}
          onClick={() => onToggleSave(college.id)}
          title={isSaved ? "Remove from saved" : "Save college"}
        >
          <Heart size={20} fill={isSaved ? "#ef4444" : "none"} />
        </button>
      </div>

      <div className="badge-row">
        <span className="badge badge-type">{college.type}</span>
        <span className="badge badge-rate">Acceptance: {college.acceptanceRate}</span>
        {college.ranking && college.ranking !== '—' && (
          <span className="badge badge-rank">{college.ranking}</span>
        )}
      </div>

      <div className="badge-row">
        <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
          <Users size={12} style={{ verticalAlign: '-1px', marginRight: '3px' }} />{college.undergradsCount} undergrads
        </span>
        <span className="badge" style={{ background: '#f1f5f9', color: '#334155' }}>
          In-state {college.tuitionInState}
        </span>
      </div>

      <div className="card-footer">
        <div className="tuition-info">
          <div>Out-of-State / Private</div>
          <div className="tuition-val">{college.tuitionOutState} / year</div>
        </div>
        <button className="detail-btn" onClick={() => onViewDetails(college)}>
          <span>View Details</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
