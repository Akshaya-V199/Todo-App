import React, { useState } from 'react';
import { CheckCircle2, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export default function AuthPage({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) return;
      const decoded = jwtDecode(credentialResponse.credential);

      const res = await fetch('https://taskflow-backend-x9ux.onrender.com/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture
        })
      });

      const data = await res.json();
      if (res.ok && typeof onLoginSuccess === 'function') {
        onLoginSuccess(data);
      } else {
        alert(data.message || 'Google login failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      if (typeof onLoginSuccess === 'function') {
        const decoded = jwtDecode(credentialResponse.credential);
        onLoginSuccess({
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture,
          role: 'user'
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://taskflow-backend-x9ux.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && typeof onLoginSuccess === 'function') {
        onLoginSuccess(data);
      } else {
        alert(data.message || 'Authentication failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess({
          name: formData.name || formData.email.split('@')[0],
          email: formData.email,
          picture: '',
          role: 'user'
        });
      }
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.cardWrapper}>

        {/* LEFT SECTION */}
        <div style={styles.leftSection}>
          <div style={styles.brandHeader}>
            <div style={styles.logoIcon}>
              <CheckCircle2 color="#FFFFFF" size={28} />
            </div>
            <h2 style={styles.brandTitle}>TaskFlow</h2>
          </div>

          <div style={styles.heroContent}>
            <h1 style={styles.heroHeading}>Master your daily productivity.</h1>
            <p style={styles.heroSubtext}>
              Organize tasks, track progress, and hit your goals with ease.
            </p>
          </div>

          <div style={styles.footerNote}>© 2026 TaskFlow Inc. All rights reserved.</div>
        </div>

        {/* RIGHT SECTION */}
        <div style={styles.rightSection}>
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>
              {isRegistering ? 'Create an account' : 'Welcome back'}
            </h2>
            <p style={styles.formSubtitle}>
              {isRegistering ? 'Enter your details below' : 'Please enter your credentials'}
            </p>

            <div style={styles.googleBtnWrapper}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert('Google Sign-In failed')}
                useOneTap={false}
              />
            </div>

            <div style={styles.divider}>
              <span style={styles.dividerLine}></span>
              <span style={styles.dividerText}>or continue with email</span>
              <span style={styles.dividerLine}></span>
            </div>

            <form onSubmit={handleSubmit} style={styles.formStack}>
              {isRegistering && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name</label>
                  <div style={styles.inputWrapper}>
                    <User color="#94A3B8" size={18} style={styles.inputIcon} />
                    <input
                      type="text"
                      placeholder="John Doe"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>
              )}

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.inputWrapper}>
                  <Mail color="#94A3B8" size={18} style={styles.inputIcon} />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.inputWrapper}>
                  <Lock color="#94A3B8" size={18} style={styles.inputIcon} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <button type="submit" style={styles.submitButton}>
                {isRegistering ? 'Sign Up' : 'Sign In'} <ArrowRight size={18} />
              </button>
            </form>

            <p style={styles.switchAuthText}>
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                style={styles.switchAuthBtn}
              >
                {isRegistering ? 'Log in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  pageContainer: { minHeight: '100vh', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, sans-serif' },
  cardWrapper: { display: 'flex', width: '100%', maxWidth: '960px', backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', minHeight: '580px' },
  leftSection: { width: '50%', backgroundColor: '#2563EB', color: '#FFFFFF', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  brandHeader: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoIcon: { backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '8px', borderRadius: '10px', display: 'flex' },
  brandTitle: { fontSize: '22px', fontWeight: '700', margin: 0 },
  heroContent: { margin: 'auto 0' },
  heroHeading: { fontSize: '30px', fontWeight: '800', lineHeight: '1.2', marginBottom: '16px' },
  heroSubtext: { fontSize: '15px', opacity: 0.9, lineHeight: '1.5' },
  footerNote: { fontSize: '12px', opacity: 0.7 },
  rightSection: { width: '50%', padding: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  formContainer: { width: '100%', maxWidth: '360px' },
  formTitle: { fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0' },
  formSubtitle: { fontSize: '14px', color: '#64748B', margin: '0 0 24px 0' },
  googleBtnWrapper: { display: 'flex', justifyContent: 'center', width: '100%', minHeight: '44px', position: 'relative', zIndex: 10 },
  divider: { display: 'flex', alignItems: 'center', margin: '20px 0' },
  dividerLine: { flex: 1, height: '1px', backgroundColor: '#E2E8F0' },
  dividerText: { fontSize: '12px', color: '#94A3B8', padding: '0 10px' },
  formStack: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#334155' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '12px' },
  input: { width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  submitButton: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
  switchAuthText: { textAlign: 'center', fontSize: '13px', color: '#64748B', marginTop: '20px' },
  switchAuthBtn: { background: 'none', border: 'none', color: '#2563EB', fontWeight: '600', cursor: 'pointer', padding: 0 }
};