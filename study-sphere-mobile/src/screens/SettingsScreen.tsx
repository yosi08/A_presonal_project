import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, LogOut, Trash2, Sun, Moon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { boxShadow } from '../utils/styles';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const languages = [
  { code: 'ko', name: '한국어', flag: '🇰🇷', desc: '한국어로 앱 사용하기' },
  { code: 'en', name: 'English', flag: '🇺🇸', desc: 'Use the app in English' },
];

export default function SettingsScreen() {
  const { c, isDark } = useTheme();
  const { t, language, setLanguage, settings, setSettings } = useApp();
  const { user, signOut } = useAuth();

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setSettings({ ...settings, theme });
  };

  const handleNotificationChange = (key: keyof typeof settings.notifications) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(t('deleteAccount'), t('deleteAccountConfirmMsg'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('deleteAccount'),
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove([
            'sessions',
            'notes',
            'settings',
            'language',
            'timerPresets',
            'authToken',
            'userInfo',
            'lastEmailDate',
            'lastWeeklyReportDate',
          ]);
          signOut();
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert(t('logout'), t('logoutConfirm'), [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yes'),
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <LinearGradient colors={['#2563EB', '#1E3A8A']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{t('settings')}</Text>
            <Text style={styles.headerSubtitle}>{t('manageAccount')}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={[styles.card, { backgroundColor: c.surface, marginTop: -12 }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>{t('profile')}</Text>
          <View style={styles.profileRow}>
            {user?.image ? (
              <Image source={{ uri: user.image }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarText}>
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: c.text }]}>{user?.name || 'User'}</Text>
              <Text style={[styles.profileEmail, { color: c.textSecondary }]}>{user?.email || ''}</Text>
              <Text style={[styles.profileHint, { color: c.textTertiary }]}>{t('googleProfileReadOnly')}</Text>
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>{t('notificationPreferences')}</Text>
          <Text style={[styles.sectionDesc, { color: c.textSecondary }]}>{t('chooseNotifications')}</Text>

          <View style={styles.toggleList}>
            <View style={[styles.toggleRow, { backgroundColor: c.surfaceSecondary }]}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleTitle, { color: c.text }]}>{t('studyReminders')}</Text>
                <Text style={[styles.toggleDesc, { color: c.textSecondary }]}>{t('studyRemindersDesc')}</Text>
              </View>
              <Switch
                value={settings.notifications.studyReminders}
                onValueChange={() => handleNotificationChange('studyReminders')}
                trackColor={{ false: c.toggleInactive, true: c.toggleActive }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.toggleRow, { backgroundColor: c.surfaceSecondary }]}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleTitle, { color: c.text }]}>{t('weeklyReport')}</Text>
                <Text style={[styles.toggleDesc, { color: c.textSecondary }]}>{t('weeklyReportDesc')}</Text>
              </View>
              <Switch
                value={settings.notifications.weeklyReport}
                onValueChange={() => handleNotificationChange('weeklyReport')}
                trackColor={{ false: c.toggleInactive, true: c.toggleActive }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>{t('appearance')}</Text>
          <Text style={[styles.sectionDesc, { color: c.textSecondary }]}>{t('customizeAppearance')}</Text>

          <View style={styles.themeRow}>
            <TouchableOpacity
              onPress={() => handleThemeChange('light')}
              style={[
                styles.themeCard,
                {
                  borderColor: settings.theme === 'light' ? '#2563EB' : c.border,
                  borderWidth: settings.theme === 'light' ? 2 : 1,
                },
              ]}
            >
              <View style={[styles.themePreview, { backgroundColor: '#F8FAFC' }]}>
                <Sun color="#F59E0B" size={24} />
              </View>
              <Text style={[styles.themeLabel, { color: c.text }]}>{t('light')}</Text>
              {settings.theme === 'light' && (
                <View style={styles.themeCheck}>
                  <Check color="#fff" size={14} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleThemeChange('dark')}
              style={[
                styles.themeCard,
                {
                  borderColor: settings.theme === 'dark' ? '#2563EB' : c.border,
                  borderWidth: settings.theme === 'dark' ? 2 : 1,
                },
              ]}
            >
              <View style={[styles.themePreview, { backgroundColor: '#1F2937' }]}>
                <Moon color="#93C5FD" size={24} />
              </View>
              <Text style={[styles.themeLabel, { color: c.text }]}>{t('dark')}</Text>
              {settings.theme === 'dark' && (
                <View style={styles.themeCheck}>
                  <Check color="#fff" size={14} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Language Section */}
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>{t('languageSettings')}</Text>
          <Text style={[styles.sectionDesc, { color: c.textSecondary }]}>{t('selectLanguage')}</Text>

          <View style={styles.langList}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => setLanguage(lang.code)}
                style={[
                  styles.langCard,
                  {
                    borderColor: language === lang.code ? '#2563EB' : c.border,
                    borderWidth: language === lang.code ? 2 : 1,
                    backgroundColor: language === lang.code ? (isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF') : 'transparent',
                  },
                ]}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <View style={styles.langInfo}>
                  <Text style={[styles.langName, { color: c.text }]}>{lang.name}</Text>
                  <Text style={[styles.langDesc, { color: c.textSecondary }]}>{lang.desc}</Text>
                </View>
                {language === lang.code && (
                  <View style={styles.langCheck}>
                    <Check color="#fff" size={14} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Privacy Section */}
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>{t('privacySecurity')}</Text>

          <View style={[styles.deleteCard, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', borderColor: isDark ? '#7F1D1D' : '#FECACA' }]}>
            <Trash2 color="#EF4444" size={20} />
            <View style={styles.deleteInfo}>
              <Text style={[styles.deleteTitle, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>{t('deleteAccount')}</Text>
              <Text style={[styles.deleteDesc, { color: isDark ? '#F87171' : '#DC2626' }]}>{t('deleteAccountDesc')}</Text>
            </View>
            <TouchableOpacity onPress={handleDeleteAccount} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>{t('deleteAccount')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutBtn, { borderColor: '#EF4444' }]}
        >
          <LogOut color="#EF4444" size={20} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: 20 },
  headerContent: { paddingHorizontal: 20, paddingTop: 8 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...boxShadow('#000', 0, 2, 0.08, 8, 3),
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  sectionDesc: { fontSize: 13, marginBottom: 16 },
  // Profile
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarFallback: { backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '600' },
  profileEmail: { fontSize: 14, marginTop: 2 },
  profileHint: { fontSize: 12, marginTop: 4 },
  // Notifications
  toggleList: { gap: 10 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12 },
  toggleInfo: { flex: 1, marginRight: 12 },
  toggleTitle: { fontSize: 15, fontWeight: '500' },
  toggleDesc: { fontSize: 12, marginTop: 2 },
  // Appearance
  themeRow: { flexDirection: 'row', gap: 12 },
  themeCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  themePreview: { width: '100%', height: 64, borderRadius: 8, marginBottom: 10, justifyContent: 'center', alignItems: 'center' },
  themeLabel: { fontSize: 14, fontWeight: '600' },
  themeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Language
  langList: { gap: 10 },
  langCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, gap: 14 },
  langFlag: { fontSize: 28 },
  langInfo: { flex: 1 },
  langName: { fontSize: 15, fontWeight: '600' },
  langDesc: { fontSize: 12, marginTop: 2 },
  langCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Privacy
  deleteCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, gap: 12 },
  deleteInfo: { flex: 1 },
  deleteTitle: { fontSize: 14, fontWeight: '600' },
  deleteDesc: { fontSize: 12, marginTop: 2 },
  deleteBtn: { backgroundColor: '#DC2626', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  deleteBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
});
