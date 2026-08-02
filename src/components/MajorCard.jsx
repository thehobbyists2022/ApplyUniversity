import React from 'react';
import { 
  Code, TrendingUp, ShieldCheck, Cpu, Zap, DollarSign, Briefcase, 
  Share2, BarChart3, HeartPulse, Activity, Brain, Scale, Palette, 
  Home, Video, Leaf, Fish, Dna, Stethoscope, Pill, Globe, Sparkles, ArrowRight 
} from 'lucide-react';

const ICON_MAP = {
  Code: Code,
  TrendingUp: TrendingUp,
  ShieldCheck: ShieldCheck,
  Cpu: Cpu,
  Zap: Zap,
  DollarSign: DollarSign,
  Briefcase: Briefcase,
  Share2: Share2,
  BarChart3: BarChart3,
  HeartPulse: HeartPulse,
  Activity: Activity,
  Brain: Brain,
  Scale: Scale,
  Palette: Palette,
  Home: Home,
  Video: Video,
  Leaf: Leaf,
  Fish: Fish,
  Dna: Dna,
  Stethoscope: Stethoscope,
  Pill: Pill,
  Globe: Globe,
  Sparkles: Sparkles
};

export default function MajorCard({ major, onViewMajorDetails, collegesMap }) {
  const IconComponent = ICON_MAP[major.icon] || Code;

  return (
    <div className="major-card">
      <div className="major-icon-box">
        <IconComponent size={24} />
      </div>

      <div style={{ fontSize: '0.775rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {major.category}
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.2rem', marginBottom: '0.5rem' }}>
        {major.name}
      </h3>

      <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {major.description}
      </p>

      <div className="salary-hero">
        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>EST. STARTING SALARY</div>
        <div className="salary-num">{major.avgStartingSalary}</div>
      </div>

      <div style={{ margin: '0.75rem 0' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>TYPICAL CAREERS</div>
        <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>
          {major.careerPaths.map(c => c.title).slice(0, 2).join(" • ")}
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
        <button 
          className="detail-btn" 
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => onViewMajorDetails(major)}
        >
          <span>View Career Roadmap</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
