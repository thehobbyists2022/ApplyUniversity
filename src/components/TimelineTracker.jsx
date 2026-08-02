import React from 'react';
import { Compass, Target, Send, CheckCircle2, Printer } from 'lucide-react';
import { TIMELINE_STAGES } from '../data/timeline';
import { getTranslation } from '../utils/i18n';

const STAGE_ICON_MAP = {
  Compass: Compass,
  Target: Target,
  Send: Send,
  CheckCircle2: CheckCircle2
};

export default function TimelineTracker({ completedTasks, onToggleTask, lang }) {
  const t = (k) => getTranslation(lang, k);
  const totalTasks = TIMELINE_STAGES.reduce((acc, stage) => acc + stage.tasks.length, 0);
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  const handlePrintPlan = () => {
    window.print();
  };

  return (
    <div className="timeline-container">
      {/* Overall Progress Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        color: '#ffffff',
        padding: '1.5rem',
        borderRadius: '16px',
        marginBottom: '1rem',
        boxShadow: '0 4px 15px rgba(49, 46, 129, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t('timelineTitle')}</h3>
            <p style={{ fontSize: '0.875rem', color: '#c7d2fe' }}>{t('timelineSubtitle')}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={handlePrintPlan}
              className="detail-btn"
              style={{ background: '#ffffff', color: '#1e1b4b', fontWeight: 800, padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
            >
              <Printer size={15} />
              <span>{t('exportPlan')}</span>
            </button>
            
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>{progressPercent}%</span>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{completedCount} of {totalTasks} Tasks Done</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ background: 'rgba(255, 255, 255, 0.2)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{
            background: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)',
            height: '100%',
            width: `${progressPercent}%`,
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Stage Cards */}
      {TIMELINE_STAGES.map((stage, idx) => {
        const IconComponent = STAGE_ICON_MAP[stage.icon] || Target;
        return (
          <div key={idx} className="timeline-stage-card">
            <div className="stage-header">
              <div className="stage-icon-circle">
                <IconComponent size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase' }}>
                  {stage.grade}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{stage.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{stage.subtitle}</p>
              </div>
            </div>

            <div className="task-list">
              {stage.tasks.map((task) => {
                const isChecked = !!completedTasks[task.id];
                return (
                  <div 
                    key={task.id} 
                    className={`task-item ${isChecked ? 'completed' : ''}`}
                    onClick={() => onToggleTask(task.id)}
                  >
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by parent div click
                      className="task-checkbox"
                    />
                    <span className="task-text">{task.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
