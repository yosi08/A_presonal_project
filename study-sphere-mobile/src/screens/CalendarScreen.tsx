import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { boxShadow } from '../utils/styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar as RNCalendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Plus, Clock, Edit3, Trash2, X } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { SUBJECTS, getSessionColor } from '../types';

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: '#6366F1',
  Physics: '#F43F5E',
  Chemistry: '#22C55E',
  Biology: '#A855F7',
  'Computer Science': '#3B82F6',
  Other: '#64748B',
};

export default function CalendarScreen() {
  const { c, isDark } = useTheme();
  const { t, language, sessions, setSessions } = useApp();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [newSession, setNewSession] = useState({
    title: '',
    startTime: '09:00',
    endTime: '10:00',
    subject: 'Mathematics',
  });

  // Time picker states
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const selectedDateSessions = useMemo(
    () => sessions.filter((s) => s.date === selectedDate),
    [sessions, selectedDate]
  );

  const markedDates = useMemo(() => {
    const marks: any = {};
    sessions.forEach((s) => {
      if (!marks[s.date]) {
        marks[s.date] = { dots: [] };
      }
      const color = getSessionColor(s.color);
      if (marks[s.date].dots.length < 3) {
        marks[s.date].dots.push({ key: String(s.id), color });
      }
    });
    // Mark selected date
    if (marks[selectedDate]) {
      marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: '#2563EB' };
    } else {
      marks[selectedDate] = { selected: true, selectedColor: '#2563EB', dots: [] };
    }
    // Mark today
    if (todayStr !== selectedDate && !marks[todayStr]) {
      marks[todayStr] = { dots: [], marked: true };
    }
    return marks;
  }, [sessions, selectedDate, todayStr]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', options);
  };

  const getSubjectTranslation = (subject: string) => {
    const map: Record<string, string> = {
      Mathematics: t('mathematics'),
      Physics: t('physics'),
      Chemistry: t('chemistry'),
      Biology: t('biology'),
      'Computer Science': t('computerScience'),
      Other: t('other'),
    };
    return map[subject] || subject;
  };

  const handleAddSession = () => {
    if (!newSession.title.trim()) return;

    if (editingSession) {
      setSessions(
        sessions.map((s) =>
          s.id === editingSession.id
            ? { ...editingSession, ...newSession, date: selectedDate }
            : s
        )
      );
      setEditingSession(null);
    } else {
      setSessions([
        ...sessions,
        {
          id: Date.now(),
          ...newSession,
          date: selectedDate,
          color: '#2563EB',
        },
      ]);
    }
    setNewSession({ title: '', startTime: '09:00', endTime: '10:00', subject: 'Mathematics' });
    setIsModalOpen(false);
  };

  const handleEditSession = (session: any) => {
    setEditingSession(session);
    setNewSession({
      title: session.title,
      startTime: session.startTime,
      endTime: session.endTime,
      subject: session.subject,
    });
    setIsModalOpen(true);
  };

  const handleDeleteSession = (sessionId: number) => {
    setSessions(sessions.filter((s) => s.id !== sessionId));
  };

  const openAddModal = () => {
    setEditingSession(null);
    setNewSession({ title: '', startTime: '09:00', endTime: '10:00', subject: 'Mathematics' });
    setIsModalOpen(true);
  };

  const timeToDate = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  const onStartTimeChange = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setShowStartPicker(false);
    if (date) {
      const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      setNewSession({ ...newSession, startTime: timeStr });
    }
  };

  const onEndTimeChange = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setShowEndPicker(false);
    if (date) {
      const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      setNewSession({ ...newSession, endTime: timeStr });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <LinearGradient colors={['#2563EB', '#1E3A8A']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{t('calendar')}</Text>
            <Text style={styles.headerSubtitle}>{t('manageSchedule')}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <View style={[styles.card, { backgroundColor: c.surface, marginTop: -12 }]}>
          <RNCalendar
            markingType="multi-dot"
            markedDates={markedDates}
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            theme={{
              backgroundColor: c.surface,
              calendarBackground: c.surface,
              textSectionTitleColor: c.textSecondary,
              selectedDayBackgroundColor: '#2563EB',
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: '#2563EB',
              dayTextColor: c.text,
              textDisabledColor: c.textTertiary,
              arrowColor: c.primary,
              monthTextColor: c.text,
              textDayFontWeight: '500',
              textMonthFontWeight: '700',
              textDayFontSize: 14,
              textMonthFontSize: 16,
            }}
          />
        </View>

        {/* Selected Date Sessions */}
        <View style={[styles.card, { backgroundColor: c.surface, marginBottom: 100 }]}>
          <View style={styles.dateHeader}>
            <View>
              <Text style={[styles.dateText, { color: c.text }]}>{formatDate(selectedDate)}</Text>
              <Text style={[styles.sessionCount, { color: c.textSecondary }]}>
                {selectedDateSessions.length} {t('session')}(s)
              </Text>
            </View>
            <TouchableOpacity
              onPress={openAddModal}
              style={[styles.addBtn, { backgroundColor: '#2563EB' }]}
            >
              <Plus color="#fff" size={20} />
            </TouchableOpacity>
          </View>

          {selectedDateSessions.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: c.surfaceSecondary }]}>
                <Clock color={c.textTertiary} size={28} />
              </View>
              <Text style={[styles.emptyText, { color: c.textSecondary }]}>{t('noSessionsScheduled')}</Text>
              <TouchableOpacity onPress={openAddModal}>
                <Text style={[styles.addLink, { color: c.primary }]}>{t('addASession')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.sessionList}>
              {selectedDateSessions.map((session) => {
                const sessionColor = getSessionColor(session.color);
                return (
                  <View
                    key={session.id}
                    style={[styles.sessionCard, { borderColor: c.border, borderLeftColor: sessionColor }]}
                  >
                    <View style={styles.sessionInfo}>
                      <Text style={[styles.sessionTitle, { color: c.text }]}>{session.title}</Text>
                      <Text style={[styles.sessionTime, { color: c.textSecondary }]}>
                        {session.startTime} - {session.endTime}
                      </Text>
                      <View style={[styles.subjectBadge, { backgroundColor: c.surfaceSecondary }]}>
                        <Text style={[styles.subjectText, { color: c.textSecondary }]}>
                          {getSubjectTranslation(session.subject)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.sessionActions}>
                      <TouchableOpacity
                        onPress={() => handleEditSession(session)}
                        style={styles.actionBtn}
                      >
                        <Edit3 color={c.textTertiary} size={18} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteSession(session.id)}
                        style={styles.actionBtn}
                      >
                        <Trash2 color="#EF4444" size={18} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal} activeOpacity={0.8}>
        <Plus color="#fff" size={26} />
      </TouchableOpacity>

      {/* Add/Edit Session Modal */}
      <Modal visible={isModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.text }]}>
                {editingSession ? t('edit') : t('addStudySession')}
              </Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X color={c.textSecondary} size={22} />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t('title')}</Text>
              <TextInput
                value={newSession.title}
                onChangeText={(v) => setNewSession({ ...newSession, title: v })}
                placeholder={t('sessionTitlePlaceholder')}
                placeholderTextColor={c.textTertiary}
                style={[styles.input, { backgroundColor: c.inputBg, borderColor: c.inputBorder, color: c.text }]}
              />
            </View>

            {/* Time Pickers */}
            <View style={styles.timeRow}>
              <View style={styles.timeCol}>
                <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t('startTime')}</Text>
                <TouchableOpacity
                  onPress={() => setShowStartPicker(true)}
                  style={[styles.timeBtn, { backgroundColor: c.inputBg, borderColor: c.inputBorder }]}
                >
                  <Clock color={c.textSecondary} size={16} />
                  <Text style={[styles.timeBtnText, { color: c.text }]}>{newSession.startTime}</Text>
                </TouchableOpacity>
                {showStartPicker && (
                  <DateTimePicker
                    value={timeToDate(newSession.startTime)}
                    mode="time"
                    is24Hour={true}
                    onChange={onStartTimeChange}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  />
                )}
              </View>
              <View style={styles.timeCol}>
                <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t('endTime')}</Text>
                <TouchableOpacity
                  onPress={() => setShowEndPicker(true)}
                  style={[styles.timeBtn, { backgroundColor: c.inputBg, borderColor: c.inputBorder }]}
                >
                  <Clock color={c.textSecondary} size={16} />
                  <Text style={[styles.timeBtnText, { color: c.text }]}>{newSession.endTime}</Text>
                </TouchableOpacity>
                {showEndPicker && (
                  <DateTimePicker
                    value={timeToDate(newSession.endTime)}
                    mode="time"
                    is24Hour={true}
                    onChange={onEndTimeChange}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  />
                )}
              </View>
            </View>

            {/* Subject */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t('subject')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectScroll}>
                {SUBJECTS.map((subj) => {
                  const isActive = newSession.subject === subj.name;
                  return (
                    <TouchableOpacity
                      key={subj.name}
                      onPress={() => setNewSession({ ...newSession, subject: subj.name })}
                      style={[
                        styles.subjectChip,
                        isActive
                          ? { backgroundColor: subj.color }
                          : { backgroundColor: c.surfaceSecondary, borderWidth: 1, borderColor: c.border },
                      ]}
                    >
                      <Text style={[styles.subjectChipText, { color: isActive ? '#fff' : c.textSecondary }]}>
                        {getSubjectTranslation(subj.name)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                style={[styles.modalBtn, { borderColor: c.border, borderWidth: 1 }]}
              >
                <Text style={{ color: c.textSecondary, fontWeight: '500' }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddSession}
                style={[styles.modalBtn, { backgroundColor: '#2563EB' }]}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {editingSession ? t('saveChanges') : t('addSession')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: 16,
    marginBottom: 16,
    ...boxShadow('#000', 0, 2, 0.08, 8, 3),
  },
  dateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  dateText: { fontSize: 16, fontWeight: '600' },
  sessionCount: { fontSize: 13, marginTop: 2 },
  addBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  emptyText: { fontSize: 14, marginBottom: 8 },
  addLink: { fontSize: 14, fontWeight: '500' },
  sessionList: { gap: 10 },
  sessionCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: 12,
    padding: 14,
  },
  sessionInfo: { flex: 1 },
  sessionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  sessionTime: { fontSize: 13, marginBottom: 6 },
  subjectBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  subjectText: { fontSize: 12 },
  sessionActions: { justifyContent: 'center', gap: 12 },
  actionBtn: { padding: 4 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    ...boxShadow('#2563EB', 0, 4, 0.35, 8, 6),
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', borderRadius: 16, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  timeRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  timeCol: { flex: 1 },
  timeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  timeBtnText: { fontSize: 15, fontWeight: '500' },
  subjectScroll: { marginTop: 4 },
  subjectChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  subjectChipText: { fontSize: 13, fontWeight: '500' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
});
