import { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, Shield, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import './SettingsPage.css';

export default function FarmerSettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    region: user?.region || '',
    farmSize: '',
    cropTypes: 'Paddy, Wheat, Sugarcane',
  });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [notifications, setNotifications] = useState({
    newRequest: true, requestAccepted: true, pickupReminder: true,
    weeklyDigest: false, marketAlerts: true,
  });

  const handleProfileChange = (e) => setProfile(p => ({ ...p, [e.target.name]: e.target.value }));
  const handlePassChange = (e) => setPasswords(p => ({ ...p, [e.target.name]: e.target.value }));
  const toggleNotif = (key) => setNotifications(n => ({ ...n, [key]: !n[key] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppShell pageTitle="Settings">
      <div className="settings-header">
        <div>
          <h2 className="settings-title">Account Settings</h2>
          <p className="settings-sub">Manage your profile, security and notification preferences</p>
        </div>
        <Button variant="primary" leftIcon={<Save size={15} />} onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      {saved && (
        <div className="settings-saved-banner animate-fadeIn">
          <CheckCircle size={15} /> Changes saved successfully!
        </div>
      )}

      <div className="settings-layout">
        <div className="settings-main">
          {/* Profile */}
          <Card>
            <CardHeader title="Profile Information" subtitle="Your public farmer profile" />
            <div className="settings-avatar-row">
              <div className="settings-avatar">{user?.name?.charAt(0) || 'F'}</div>
              <div>
                <p className="settings-avatar-name">{user?.name}</p>
                <p className="settings-avatar-role">Farmer · AgriCycle</p>
                <Button variant="ghost" size="sm" style={{ marginTop: 6 }}>Change Photo</Button>
              </div>
            </div>
            <div className="settings-form-grid">
              <Input id="s-name" name="name" label="Full Name"
                value={profile.name} onChange={handleProfileChange}
                leftIcon={<User size={15} />} />
              <Input id="s-email" name="email" label="Email Address" type="email"
                value={profile.email} onChange={handleProfileChange}
                leftIcon={<Mail size={15} />} />
              <Input id="s-phone" name="phone" label="Phone Number" type="tel"
                value={profile.phone} onChange={handleProfileChange}
                leftIcon={<Phone size={15} />} />
              <Input id="s-region" name="region" label="Region / District"
                value={profile.region} onChange={handleProfileChange}
                leftIcon={<MapPin size={15} />} />
              <Input id="s-farmsize" name="farmSize" label="Farm Size (acres)"
                type="number" placeholder="e.g., 5"
                value={profile.farmSize} onChange={handleProfileChange}
                hint="Helps buyers understand your scale" />
              <Input id="s-crops" name="cropTypes" label="Primary Crops Grown"
                value={profile.cropTypes} onChange={handleProfileChange}
                hint="Comma-separated: Paddy, Wheat…" />
            </div>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader title="Security" subtitle="Change your password" />
            <div className="settings-form-grid">
              <Input id="s-curpass" name="current" label="Current Password"
                type={showPass ? 'text' : 'password'}
                value={passwords.current} onChange={handlePassChange}
                leftIcon={<Shield size={15} />} />
              <Input id="s-newpass" name="newPass" label="New Password"
                type={showPass ? 'text' : 'password'}
                value={passwords.newPass} onChange={handlePassChange} />
              <Input id="s-confirm" name="confirm" label="Confirm New Password"
                type={showPass ? 'text' : 'password'}
                value={passwords.confirm} onChange={handlePassChange} />
            </div>
            <button className="show-pass-btn" onClick={() => setShowPass(v => !v)}>
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPass ? 'Hide passwords' : 'Show passwords'}
            </button>
            <Button variant="outline" size="sm" style={{ marginTop: 12 }}
              onClick={() => alert('Password update — connect to PUT /api/v1/auth/password')}>
              Update Password
            </Button>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader title="Notifications" subtitle="Choose what you want to be notified about" />
            <div className="notif-list">
              {Object.entries({
                newRequest: 'New buyer request received',
                requestAccepted: 'Your listing is accepted',
                pickupReminder: 'Pickup date reminder',
                weeklyDigest: 'Weekly market digest email',
                marketAlerts: 'Market price alerts',
              }).map(([key, label]) => (
                <div key={key} className="notif-row">
                  <div>
                    <p className="notif-label">{label}</p>
                  </div>
                  <button
                    className={`notif-toggle ${notifications[key] ? 'on' : 'off'}`}
                    onClick={() => toggleNotif(key)}
                    aria-label={`Toggle ${label}`}
                  >
                    <span className="notif-thumb" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="settings-sidebar">
          <Card padding="sm">
            <h4 className="settings-side-title">Account Status</h4>
            <div className="account-status">
              <div className="status-item">
                <span className="status-dot active" />
                <span>Account Active</span>
              </div>
              <div className="status-item">
                <CheckCircle size={14} style={{ color: 'var(--agri-success)' }} />
                <span>Email Verified</span>
              </div>
              <div className="status-item">
                <CheckCircle size={14} style={{ color: 'var(--agri-success)' }} />
                <span>Phone Verified</span>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <h4 className="settings-side-title">Danger Zone</h4>
            <p className="settings-side-desc">Permanently delete your account and all listings.</p>
            <Button variant="ghost" size="sm" style={{ color: 'var(--agri-danger)', marginTop: 8 }}
              onClick={() => alert('Contact support to delete account')}>
              Delete Account
            </Button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
