import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  SlidersHorizontal, 
  Store, 
  TrendingUp, 
  Bell, 
  Mic, 
  Sprout, 
  ShoppingBag,
  CloudSun,
  Building2,
  User,
  LogIn
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/overview', key: 'overview', icon: LayoutDashboard, badge: 'Live' },
  { path: '/direct-market', key: 'directMarket', icon: ShoppingBag, badge: '0% Fee', badgeType: 'yellow' },
  { path: '/weather', key: 'weather', icon: CloudSun, badge: 'Radar', badgeType: 'yellow' },
  { path: '/heatmap', key: 'heatmap', icon: Map, badge: 'NDVI' },
  { path: '/what-if', key: 'whatIf', icon: SlidersHorizontal },
  { path: '/markets', key: 'markets', icon: Store, badge: 'Arbitrage' },
  { path: '/trends', key: 'trends', icon: TrendingUp, badge: '30-Day' },
  { path: '/alerts', key: 'alerts', icon: Bell, badge: '2 New', badgeType: 'rose' },
  { path: '/copilot', key: 'copilot', icon: Mic, badge: 'AI Voice' },
  { path: '/crop-health', key: 'cropHealth', icon: Sprout, badge: '10m' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { t, currentLanguageObj } = useLanguage();
  const { isAuthenticated, role, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid var(--border-card)' }}>
        <div style={{ 
          width: '38px', 
          height: '38px', 
          borderRadius: '8px', 
          background: '#FEF3C7', 
          border: '1px solid #FCD34D',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
        }}>
          <Sprout size={22} color="#D97706" />
        </div>
        <div className="logo-text">
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', lineHeight: 1.1, color: '#0F172A' }}>
            AgriPulse <span style={{ color: '#D97706' }}>AI</span>
          </h2>
          <span style={{ fontSize: '0.7rem', color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: '600' }}>
            Decision Intelligence
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-link ${isActive ? 'active' : ''}`
              }
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                color: isActive ? '#92400E' : '#334155',
                backgroundColor: isActive ? '#FEF3C7' : 'transparent',
                fontWeight: isActive ? '700' : '500',
                borderLeft: isActive ? '3px solid #D97706' : '3px solid transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} color={item.badgeType === 'rose' ? '#DC2626' : 'currentColor'} />
                <span className="nav-text" style={{ fontSize: '0.9rem' }}>{t(item.key)}</span>
              </div>
              {item.badge && (
                <span 
                  className={`badge ${item.badgeType === 'rose' ? 'badge-rose' : 'badge-yellow'} nav-text`}
                  style={{ fontSize: '0.65rem', padding: '2px 6px' }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Auth Portal Section */}
      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-card)' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 4px' }}>Portals</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate(role === 'farmer' ? '/dashboard/farmer' : '/dashboard/buyer')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '6px', border: 'none',
                  background: '#FEF3C7', color: '#92400E', fontWeight: '700',
                  fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left', width: '100%'
                }}
              >
                {role === 'farmer' ? <Sprout size={16} color="#D97706" /> : <Building2 size={16} color="#D97706" />}
                <span className="nav-text">{user?.name?.split(' ')[0]} Dashboard</span>
              </button>
              <button
                onClick={logout}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0',
                  background: 'transparent', color: '#64748B', fontWeight: '600',
                  fontSize: '0.82rem', cursor: 'pointer', textAlign: 'left', width: '100%'
                }}
              >
                <LogIn size={15} />
                <span className="nav-text">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '6px', textDecoration: 'none',
                background: isActive ? '#FEF3C7' : 'transparent',
                color: isActive ? '#92400E' : '#334155', fontWeight: isActive ? '700' : '500',
                fontSize: '0.88rem', borderLeft: isActive ? '3px solid #D97706' : '3px solid transparent'
              })}>
                <Sprout size={16} color="#D97706" />
                <span className="nav-text">{t('farmerPortal').split('(')[0].trim()}</span>
              </NavLink>
              <NavLink to="/login" style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '6px', textDecoration: 'none',
                background: isActive ? '#F1F5F9' : 'transparent',
                color: isActive ? '#0F172A' : '#334155', fontWeight: isActive ? '700' : '500',
                fontSize: '0.88rem', borderLeft: isActive ? '3px solid #0F172A' : '3px solid transparent'
              })}>
                <Building2 size={16} color="#0F172A" />
                <span className="nav-text">{t('buyerPortal').split('(')[0].trim()}</span>
              </NavLink>
            </>
          )}
        </div>
      </div>

      {/* Status Card Footer */}
      <div style={{ 
        marginTop: '12px', 
        padding: '12px', 
        borderRadius: '6px', 
        background: '#F8FAFC', 
        border: '1px solid #E2E8F0' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div className="pulse-dot" />
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Sentinel-2 Live
          </span>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '500' }}>
          {currentLanguageObj.native} Active • 2,847 APMCs
        </div>
      </div>
    </aside>
  );
}
