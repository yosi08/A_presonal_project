import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Loader2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { boxShadow } from '../utils/styles';
import { useTheme } from '../theme/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { t } = useApp();
  const { c } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      signIn();
    } catch (err) {
      console.error('Google login error:', err);
      setError(t('googleLoginFailed'));
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#2563EB', '#1E3A8A']}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Top Section - Logo & App Name */}
          <View style={styles.topSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <BookOpen color="#2563EB" size={40} />
              </View>
            </View>
            <Text style={styles.appName}>StudySphere</Text>
            <Text style={styles.subtitle}>{t('studyManagement')}</Text>
          </View>
        </SafeAreaView>

        {/* Bottom Card */}
        <View style={styles.cardContainer}>
          <View style={[styles.card, { backgroundColor: c.surface }]}>
            <Text style={[styles.loginTitle, { color: c.text }]}>{t('login')}</Text>

            {error !== '' && (
              <View style={[styles.errorBox, { backgroundColor: c.errorBg, borderColor: c.error }]}>
                <Text style={[styles.errorText, { color: c.error }]}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.googleButton, { borderColor: c.border }]}
              onPress={handleGoogleLogin}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="small" color={c.primary} />
              ) : (
                <View style={styles.googleButtonContent}>
                  {/* Google-styled icon replacement */}
                  <View style={styles.googleIconContainer}>
                    <View style={styles.googleIcon}>
                      <View style={[styles.googleDot, { backgroundColor: '#4285F4' }]} />
                      <View style={[styles.googleDot, { backgroundColor: '#EA4335' }]} />
                      <View style={[styles.googleDot, { backgroundColor: '#FBBC05' }]} />
                      <View style={[styles.googleDot, { backgroundColor: '#34A853' }]} />
                    </View>
                  </View>
                  <Text style={[styles.googleButtonText, { color: c.text }]}>
                    {t('continueWithGoogle')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={[styles.description, { color: c.textSecondary }]}>
              {t('loginDescription')}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...boxShadow('#000', 0, 4, 0.15, 12, 8),
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    fontWeight: '500',
  },
  cardContainer: {
    paddingBottom: 0,
  },
  card: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 32,
    paddingTop: 36,
    paddingBottom: 48,
    ...boxShadow('#000', 0, -4, 0.1, 16, 12),
  },
  loginTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 28,
  },
  errorBox: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
  },
  googleButton: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    width: 20,
    height: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  googleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
  },
});
