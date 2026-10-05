import React from 'react';
import { CheckCircle2, LogOut, Shield } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <div style={styles.logoIcon}>
          <CheckCircle2 color="#FFFFFF" size={20} />
        </div>
        <span style={styles.brandName}>TaskFlow</span>
      </div>

      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          {user?.picture ? (
            <img src={user.picture} alt="Profile" style={styles.avatar} />
          ) : (
            <div style={styles.avatarFallback}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div style={styles.userDetails}>
            <span style={styles.userName}>{user?.name || 'User'}</span>
            <span style={styles.userRole}>
              {user?.role === 'admin' && <Shield size={12} style={{ marginRight: 4 }} />}
              {user?.role || 'user'}
            </span>
          </div>
        </div>

        <button onClick={onLogout} style={styles.logoutBtn} title="Log Out">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  brand: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: { backgroundColor: '#2563EB', padding: '6px', borderRadius: '8px', display: 'flex' },
  brandName: { fontSize: '18px', fontWeight: '700', color: '#0F172A' },
  userSection: { display: 'flex', alignItems: 'center', gap: '20px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' },
  avatarFallback: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '14px'
  },
  userDetails: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: '14px', fontWeight: '600', color: '#0F172A' },
  userRole: { fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', textTransform: 'capitalize' },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    color: '#475569',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};