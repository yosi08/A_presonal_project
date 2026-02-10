import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  Clock,
  BookOpen,
  TrendingUp,
  Plus,
  ArrowRight,
  FileText,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { getSessionColor, Note } from '../types';
import { boxShadow } from '../utils/styles';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t, sessions, notes } = useApp();
  const { c } = useTheme();

  // Calculate today's date info
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Get sessions for today
  const todaySessions = useMemo(
    () => sessions.filter((s) => s.date === todayStr),
    [sessions, todayStr]
  );

  // Calculate this week's date range (Sunday to Saturday)
  const startOfWeek = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }, [todayStr]);

  const endOfWeek = useMemo(() => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [startOfWeek]);

  // Get this week's sessions
  const weekSessions = useMemo(
    () =>
      sessions.filter((s) => {
        const sessionDate = new Date(s.date);
        return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
      }),
    [sessions, startOfWeek, endOfWeek]
  );

  // Calculate total study hours this week
  const totalHours = useMemo(
    () =>
      weekSessions.reduce((acc, s) => {
        const start = s.startTime.split(':').map(Number);
        const end = s.endTime.split(':').map(Number);
        const hours = end[0] + end[1] / 60 - (start[0] + start[1] / 60);
        return acc + hours;
      }, 0),
    [weekSessions]
  );

  // Stats data
  const stats = [
    { icon: Calendar, labelKey: 'today', value: todaySessions.length.toString() },
    { icon: Clock, labelKey: 'thisWeek', value: `${Math.round(totalHours)}h` },
    { icon: BookOpen, labelKey: 'notes', value: notes.length.toString() },
    { icon: TrendingUp, labelKey: 'sessions', value: sessions.length.toString() },
  ];

  // Generate week days dynamically
  const weekDays = useMemo(() => {
    const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const daySessions = sessions.filter((s) => s.date === dateStr);
      const isToday = dateStr === todayStr;

      return {
        day: shortDays[date.getDay()],
        date: date.getDate(),
        labelKey: isToday ? 'today' : dayNames[date.getDay()],
        isToday,
        sessions: daySessions.length,
      };
    });
  }, [sessions, startOfWeek, todayStr]);

  // Get recent notes (last 3)
  const recentNotes = useMemo(() => notes.slice(0, 3), [notes]);

  const renderNoteCard = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={[styles.noteCard, { backgroundColor: c.surface, borderColor: c.borderLight }]}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('Notes')}
    >
      <View style={[styles.noteColorBar, { backgroundColor: item.color }]} />
      <Text style={[styles.noteTitle, { color: c.text }]} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={[styles.noteSubject, { color: c.textSecondary }]} numberOfLines={1}>
        {item.subject} {'\u2022'} {item.date}
      </Text>
      <Text style={[styles.noteContent, { color: c.textTertiary }]} numberOfLines={2}>
        {item.content || item.summary || item.notes || ''}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#2563EB', '#1E3A8A']}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView>
            <View style={styles.heroContent}>
              {/* Welcome Text */}
              <Text style={styles.welcomeText}>
                {t('welcomeBack')}, {user?.name || 'User'}!
              </Text>
              <Text style={styles.stayOrganized}>{t('stayOrganized')}</Text>

              {/* 2x2 Stats Grid */}
              <View style={styles.statsGrid}>
                {stats.map((stat) => {
                  const IconComponent = stat.icon;
                  return (
                    <View key={stat.labelKey} style={styles.statCard}>
                      <View style={styles.statIconContainer}>
                        <IconComponent color="#FFFFFF" size={20} />
                      </View>
                      <View style={styles.statTextContainer}>
                        <Text style={styles.statLabel}>{t(stat.labelKey)}</Text>
                        <Text style={styles.statValue}>{stat.value}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Content Section (overlaps hero) */}
        <View style={[styles.contentSection, { backgroundColor: c.background }]}>
          {/* Today's Schedule Card */}
          <View style={[styles.sectionCard, { backgroundColor: c.surface }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>
                {t('todaysSchedule')}
              </Text>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('Calendar')}
                activeOpacity={0.7}
              >
                <Text style={[styles.viewAllText, { color: c.primary }]}>
                  {t('viewCalendar')}
                </Text>
                <ArrowRight color={c.primary} size={14} />
              </TouchableOpacity>
            </View>

            {todaySessions.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: c.surfaceSecondary }]}>
                  <Calendar color={c.textTertiary} size={28} />
                </View>
                <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                  {t('noSessionsToday')}
                </Text>
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: c.primary }]}
                  onPress={() => navigation.navigate('Calendar')}
                  activeOpacity={0.7}
                >
                  <Plus color="#FFFFFF" size={16} />
                  <Text style={styles.addButtonText}>{t('scheduleSession')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.sessionsList}>
                {todaySessions.map((session) => {
                  const resolvedColor = getSessionColor(session.color);
                  return (
                    <TouchableOpacity
                      key={session.id}
                      style={[
                        styles.sessionCard,
                        {
                          backgroundColor: c.surface,
                          borderColor: c.borderLight,
                          borderLeftColor: resolvedColor,
                        },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('Calendar')}
                    >
                      <View style={styles.sessionInfo}>
                        <Text style={[styles.sessionTitle, { color: c.text }]}>
                          {session.title}
                        </Text>
                        <View style={styles.sessionTimeRow}>
                          <Clock color={c.textTertiary} size={13} />
                          <Text style={[styles.sessionTime, { color: c.textSecondary }]}>
                            {session.startTime} - {session.endTime}
                          </Text>
                        </View>
                        <View style={[styles.subjectBadge, { backgroundColor: c.tagBg }]}>
                          <Text style={[styles.subjectBadgeText, { color: c.tagText }]}>
                            {session.subject}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Week Overview Card */}
          <View style={[styles.sectionCard, { backgroundColor: c.surface }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>
                {t('weekOverview')}
              </Text>
            </View>

            <View style={styles.weekList}>
              {weekDays.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.weekDayRow,
                    day.isToday && styles.weekDayRowToday,
                    day.isToday && { backgroundColor: 'rgba(37,99,235,0.08)', borderColor: 'rgba(37,99,235,0.2)' },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('Calendar')}
                >
                  <View style={styles.weekDayLeft}>
                    <View
                      style={[
                        styles.weekDayDateBox,
                        day.isToday
                          ? { backgroundColor: '#2563EB' }
                          : { backgroundColor: c.surfaceSecondary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.weekDayName,
                          { color: day.isToday ? '#FFFFFF' : c.textSecondary },
                        ]}
                      >
                        {day.day}
                      </Text>
                      <Text
                        style={[
                          styles.weekDayDate,
                          { color: day.isToday ? '#FFFFFF' : c.text },
                        ]}
                      >
                        {day.date}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.weekDayLabel,
                        {
                          color: day.isToday ? '#1D4ED8' : c.textSecondary,
                          fontWeight: day.isToday ? '600' : '400',
                        },
                      ]}
                    >
                      {t(day.labelKey)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.sessionCountBadge,
                      day.sessions > 0
                        ? { backgroundColor: '#2563EB' }
                        : { backgroundColor: 'transparent', borderWidth: 1, borderColor: c.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sessionCountText,
                        { color: day.sessions > 0 ? '#FFFFFF' : c.textSecondary },
                      ]}
                    >
                      {day.sessions} {t('session')}
                      {day.sessions !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Notes Card */}
          <View style={[styles.sectionCard, { backgroundColor: c.surface, marginBottom: 24 }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>
                {t('recentNotes')}
              </Text>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('Notes')}
                activeOpacity={0.7}
              >
                <Text style={[styles.viewAllText, { color: c.primary }]}>
                  {t('viewAllNotes')}
                </Text>
                <ArrowRight color={c.primary} size={14} />
              </TouchableOpacity>
            </View>

            {recentNotes.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: c.surfaceSecondary }]}>
                  <BookOpen color={c.textTertiary} size={28} />
                </View>
                <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                  {t('createFirstNote')}
                </Text>
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: c.primary }]}
                  onPress={() => navigation.navigate('Notes')}
                  activeOpacity={0.7}
                >
                  <Plus color="#FFFFFF" size={16} />
                  <Text style={styles.addButtonText}>{t('createNote')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={recentNotes}
                renderItem={renderNoteCard}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.notesListContent}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const NOTE_CARD_WIDTH = width * 0.65;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  // Hero Section
  heroGradient: {
    paddingBottom: 32,
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  stayOrganized: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginBottom: 20,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: (width - 50) / 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  // Content Section
  contentSection: {
    marginTop: -16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  // Section Cards
  sectionCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    ...boxShadow('#000', 0, 2, 0.06, 8, 3),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    ...boxShadow('#2563EB', 0, 2, 0.3, 4, 3),
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  // Session Cards
  sessionsList: {
    gap: 10,
  },
  sessionCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 14,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  sessionTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  sessionTime: {
    fontSize: 13,
  },
  subjectBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subjectBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Week Overview
  weekList: {
    gap: 6,
  },
  weekDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  weekDayRowToday: {
    borderWidth: 1,
  },
  weekDayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weekDayDateBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekDayName: {
    fontSize: 10,
    fontWeight: '600',
  },
  weekDayDate: {
    fontSize: 14,
    fontWeight: '700',
  },
  weekDayLabel: {
    fontSize: 14,
  },
  sessionCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sessionCountText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Recent Notes
  notesListContent: {
    paddingRight: 4,
  },
  noteCard: {
    width: NOTE_CARD_WIDTH,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  noteColorBar: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    marginBottom: 10,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  noteSubject: {
    fontSize: 12,
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 12,
    lineHeight: 18,
  },
});
