import { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, Shield, Eye, EyeOff, CheckCircle, Building2 } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import '../farmer/SettingsPage.css';

const BUYER_TYPE_OPTS = [
  { value: 'compost', label: 'Compost Manufacturer' },
  { value: 'biogas', label: 'Biogas Plant' },
  { value: 'biochar', label: 'Biochar Producer' },
  { value: 'animal_feed', label: 'Animal Feed Supplier' },
  { value: 'paper', label: 'Paper / Pulp Industry' },
  { value: 'other', label: 'Other' },
];

export default function BuyerSettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    region: user?.region || '',
    companyName: 'Agro Compost Co.',
    buyerType: 'compost',
    gstNumber: '',
  });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [notifications, setNotifications] = useState({
    newListing: true, requestUpdate: true, pickupReminder: true,
    weeklyDigest: true, priceAlerts: false,
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
          <p className="settings-sub">Manage your buyer profile, security and preferences</p>
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
            <CardHeader title="Profile & Company" subtitle="Your buyer account information" />
            <div className="settings-avatar-row">
              <div className="settings-avatar">{user?.name?.charAt(0) || 'B'}</div>
              <div>
                <p className="settings-avatar-name">{user?.name}</p>
                <p className="settings-avatar-role">Buyer · AgriCycle</p>
                <Button variant="ghost" size="sm" style={{ marginTop: 6 }}>Change Photo</Button>
              </div>
            </div>
            <div className="settings-form-grid">
              <Input id="b-name" name="name" label="Full Name"
                value={profile.name} onChange={handleProfileChange}
                leftIcon={<User size={15} />} />
              <Input id="b-email" name="email" label="Email Address" type="email"
                value={profile.email} onChange={handleProfileChange}
                leftIcon={<Mail size={15} />} />
              <Input id="b-phone" name="phone" label="Phone Number" type="tel"
                value={profile.phone} onChange={handleProfileChange}
                leftIcon={<Phone size={15} />} />
              <Input id="b-region" name="region" label="Operating Region"
                value={profile.region} onChange={handleProfileChange}
                leftIcon={<MapPin size={15} />} />
              <Input id="b-company" name="companyName" label="Company / Organisation Name"
                value={profile.companyName} onChange={handleProfileChange}
                leftIcon={<Building2 size={15} />} />
              <Select id="b-type" name="buyerType" label="Buyer Type"
                options={BUYER_TYPE_OPTS}
                value={profile.buyerType} onChange={handleProfileChange} />
              <Input id="b-gst" name="gstNumber" label="GST Number (optional)"
                value={profile.gstNumber} onChange={handleProfileChange}
                hint="Increases farmer trust in your profile" />
            </div>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader title="Security" subtitle="Update your password" />
            <div className="settings-form-grid">
              <Input id="b-curpass" name="current" label="Current Password"
                type={showPass ? 'text' : 'password'}
                value={passwords.current} onChange={handlePassChange}
                leftIcon={<Shield size={15} />} />
              <Input id="b-newpass" name="newPass" label="New Password"
                type={showPass ? 'text' : 'password'}
                value={passwords.newPass} onChange={handlePassChange} />
              <Input id="b-confirm" name="confirm" label="Confirm New Password"
                type={showPass ? 'text' : 'password'}
                value={passwords.confirm} onChange={handlePassChange} />
            </div>
            <button className="show-pass-btn" onClick={() => setShowPass(v => !v)}>
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPass ? 'Hide passwords' : 'Show passwords'}
            </button>
            <Button variant="outline" size="sm" style={{ marginTop: 12 }}
              onClick={() => alert('Connect to PUT /api/v1/auth/password')}>
              Update Password
            </Button>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader title="Notifications" subtitle="Choose what you want to be notified about" />
            <div className="notif-list">
              {Object.entries({
                newListing: 'New listing in your preferred area',
                requestUpdate: 'Update on your sent requests',
                pickupReminder: 'Upcoming pickup reminders',
                weeklyDigest: 'Weekly market digest email',
                priceAlerts: 'Crop price change alerts',
              }).map(([key, label]) => (
                <div key={key} className="notif-row">
                  <p className="notif-label">{label}</p>
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
            <p className="settings-side-desc">Permanently delete your account and all requests.</p>
            <Button variant="ghost" size="sm" style={{ color: 'var(--agri-danger)', marginTop: 8 }}
              onClick={() => alert('Contact support to delete your account')}>
              Delete Account
            </Button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
