import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Coffee,
  BookOpen,
  Plus,
  X,
  Bookmark,
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useTheme } from '../theme/ThemeContext';
import { boxShadow } from '../utils/styles';
import { useApp } from '../context/AppContext';

export default function TimerScreen() {
  const { c, isDark } = useTheme();
  const { t, timerPresets, setTimerPresets } = useApp();

  const [studyMinutes, setStudyMinutes] = useState(50);
  const [breakMinutes, setBreakMinutes] = useState(10);
  const [totalCycles, setTotalCycles] = useState(4);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [isStudyTime, setIsStudyTime] = useState(true);
  const [timeLeft, setTimeLeft] = useState(50 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [showPresetSave, setShowPresetSave] = useState(false);
  const [presetName, setPresetName] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bgTimestampRef = useRef<number | null>(null);

  // Keep screen awake while timer is running
  useEffect(() => {
    if (isRunning) {
      activateKeepAwakeAsync('timer');
    } else {
      deactivateKeepAwake('timer');
    }
    return () => {
      deactivateKeepAwake('timer');
    };
  }, [isRunning]);

  // Handle app background/foreground for timer accuracy
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' && isRunning) {
        bgTimestampRef.current = Date.now();
      } else if (nextAppState === 'active' && bgTimestampRef.current && isRunning) {
        const elapsed = Math.floor((Date.now() - bgTimestampRef.current) / 1000);
        bgTimestampRef.current = null;
        setTimeLeft((prev) => Math.max(0, prev - elapsed));
      }
    });
    return () => subscription.remove();
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handlePhaseComplete();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const handlePhaseComplete = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (isStudyTime) {
      setIsStudyTime(false);
      setTimeLeft(breakMinutes * 60);
      setIsRunning(true);
    } else {
      if (currentCycle < totalCycles) {
        setCurrentCycle((prev) => prev + 1);
        setCompletedCycles((prev) => prev + 1);
        setIsStudyTime(true);
        setTimeLeft(studyMinutes * 60);
        setIsRunning(true);
      } else {
        setCompletedCycles((prev) => prev + 1);
        setIsRunning(false);
      }
    }
  };

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentCycle(1);
    setCompletedCycles(0);
    setIsStudyTime(true);
    setTimeLeft(studyMinutes * 60);
  };

  const applySettings = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentCycle(1);
    setCompletedCycles(0);
    setIsStudyTime(true);
    setTimeLeft(studyMinutes * 60);
    setShowSettings(false);
  };

  const applyPreset = (preset: any) => {
    setStudyMinutes(preset.studyMinutes);
    setBreakMinutes(preset.breakMinutes);
    setTotalCycles(preset.totalCycles);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentCycle(1);
    setCompletedCycles(0);
    setIsStudyTime(true);
    setTimeLeft(preset.studyMinutes * 60);
    setActivePresetId(preset.id);
  };

  const savePreset = () => {
    if (!presetName.trim()) return;
    const newPreset = {
      id: String(Date.now()),
      name: presetName.trim(),
      studyMinutes,
      breakMinutes,
      totalCycles,
    };
    setTimerPresets([...timerPresets, newPreset]);
    setPresetName('');
    setShowPresetSave(false);
    setActivePresetId(newPreset.id);
  };

  const deletePreset = (id: string) => {
    Alert.alert(t('deletePreset'), '', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => {
          setTimerPresets(timerPresets.filter((p) => p.id !== id));
          if (activePresetId === id) setActivePresetId(null);
        },
      },
    ]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalSeconds = isStudyTime ? studyMinutes * 60 : breakMinutes * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <LinearGradient colors={['#2563EB', '#1E3A8A']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>{t('timer')}</Text>
              <Text style={styles.headerSubtitle}>{t('pomodoroDescription')}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowSettings(true)}
              style={styles.headerButton}
            >
              <Settings color="#fff" size={22} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Presets */}
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <View style={styles.presetHeader}>
            <View style={styles.row}>
              <Bookmark color={c.primary} size={18} />
              <Text style={[styles.cardTitle, { color: c.text }]}>{t('presets')}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowPresetSave(true)}
              style={[styles.addPresetBtn, { backgroundColor: isDark ? 'rgba(37,99,235,0.2)' : '#EFF6FF' }]}
            >
              <Plus color={c.primary} size={14} />
              <Text style={[styles.addPresetText, { color: c.primary }]}>{t('addPreset')}</Text>
            </TouchableOpacity>
          </View>

          {timerPresets.length === 0 ? (
            <Text style={[styles.emptyText, { color: c.textTertiary }]}>{t('noPresets')}</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {timerPresets.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  onPress={() => applyPreset(preset)}
                  onLongPress={() => deletePreset(preset.id)}
                  style={[
                    styles.presetCard,
                    {
                      borderColor: activePresetId === preset.id ? c.primary : c.border,
                      backgroundColor: activePresetId === preset.id
                        ? (isDark ? 'rgba(37,99,235,0.2)' : '#EFF6FF')
                        : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.presetName, { color: c.text }]}>{preset.name}</Text>
                  <Text style={[styles.presetInfo, { color: c.textSecondary }]}>
                    {preset.studyMinutes}{t('minutes')}/{preset.breakMinutes}{t('minutes')} · {preset.totalCycles}{t('cycle')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Main Timer */}
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: isDark ? 'rgba(37,99,235,0.3)' : '#DBEAFE' }]}>
              {isStudyTime ? (
                <BookOpen color={isDark ? '#93C5FD' : '#1D4ED8'} size={18} />
              ) : (
                <Coffee color={isDark ? '#93C5FD' : '#1D4ED8'} size={18} />
              )}
              <Text style={[styles.statusText, { color: isDark ? '#93C5FD' : '#1D4ED8' }]}>
                {isStudyTime ? t('studyTime') : t('breakTime')}
              </Text>
            </View>
          </View>

          {/* SVG Circle Timer */}
          <View style={styles.timerContainer}>
            <Svg width={260} height={260} style={{ transform: [{ rotate: '-90deg' }] }}>
              <Circle
                cx={130}
                cy={130}
                r={radius}
                stroke={isDark ? '#374151' : '#E5E7EB'}
                strokeWidth={8}
                fill="none"
              />
              <Circle
                cx={130}
                cy={130}
                r={radius}
                stroke={isStudyTime ? '#2563EB' : '#3B82F6'}
                strokeWidth={8}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={strokeDashoffset}
              />
            </Svg>
            <View style={styles.timerTextContainer}>
              <Text style={[styles.timerText, { color: c.text }]}>{formatTime(timeLeft)}</Text>
              <Text style={[styles.cycleText, { color: c.textSecondary }]}>
                {t('cycle')} {currentCycle} / {totalCycles}
              </Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={resetTimer}
              style={[styles.controlBtn, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}
            >
              <RotateCcw color={c.textSecondary} size={22} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTimer} style={[styles.playBtn, { backgroundColor: '#2563EB' }]}>
              {isRunning ? (
                <Pause color="#fff" size={28} />
              ) : (
                <Play color="#fff" size={28} style={{ marginLeft: 3 }} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowSettings(true)}
              style={[styles.controlBtn, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}
            >
              <Settings color={c.textSecondary} size={22} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cycle Progress */}
        <View style={[styles.card, { backgroundColor: c.surface, marginBottom: 32 }]}>
          <Text style={[styles.cardTitle, { color: c.text, marginBottom: 12 }]}>{t('cycleProgress')}</Text>
          <View style={styles.cycleGrid}>
            {Array.from({ length: totalCycles }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.cycleBox,
                  {
                    backgroundColor:
                      i < completedCycles
                        ? '#3B82F6'
                        : i === currentCycle - 1
                        ? '#2563EB'
                        : isDark
                        ? '#374151'
                        : '#F3F4F6',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cycleBoxText,
                    {
                      color:
                        i < completedCycles || i === currentCycle - 1
                          ? '#fff'
                          : isDark
                          ? '#6B7280'
                          : '#9CA3AF',
                    },
                  ]}
                >
                  {i + 1}
                </Text>
              </View>
            ))}
          </View>
          <Text style={[styles.completedText, { color: c.textSecondary }]}>
            {t('completedCycles')}: {completedCycles} / {totalCycles}
          </Text>
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={showSettings} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>{t('timerSettings')}</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: c.textSecondary }]}>
                {t('studyDuration')} ({t('minutes')})
              </Text>
              <TextInput
                value={String(studyMinutes)}
                onChangeText={(v) => setStudyMinutes(Math.min(120, parseInt(v) || 0))}
                keyboardType="number-pad"
                style={[styles.input, { backgroundColor: c.inputBg, borderColor: c.inputBorder, color: c.text }]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: c.textSecondary }]}>
                {t('breakDuration')} ({t('minutes')})
              </Text>
              <TextInput
                value={String(breakMinutes)}
                onChangeText={(v) => setBreakMinutes(Math.min(60, parseInt(v) || 0))}
                keyboardType="number-pad"
                style={[styles.input, { backgroundColor: c.inputBg, borderColor: c.inputBorder, color: c.text }]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t('numberOfCycles')}</Text>
              <TextInput
                value={String(totalCycles)}
                onChangeText={(v) => setTotalCycles(Math.min(10, parseInt(v) || 0))}
                keyboardType="number-pad"
                style={[styles.input, { backgroundColor: c.inputBg, borderColor: c.inputBorder, color: c.text }]}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowSettings(false)}
                style={[styles.modalBtn, { borderColor: c.border }]}
              >
                <Text style={{ color: c.textSecondary }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applySettings}
                style={[styles.modalBtn, { backgroundColor: '#2563EB' }]}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>{t('apply')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                setShowSettings(false);
                setShowPresetSave(true);
              }}
              style={[styles.savePresetBtn, { borderColor: c.primary }]}
            >
              <Bookmark color={c.primary} size={16} />
              <Text style={{ color: c.primary, fontWeight: '500' }}>{t('saveAsPreset')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Preset Save Modal */}
      <Modal visible={showPresetSave} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>{t('saveAsPreset')}</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t('presetName')}</Text>
              <TextInput
                value={presetName}
                onChangeText={setPresetName}
                placeholder={t('presetNamePlaceholder')}
                placeholderTextColor={c.textTertiary}
                style={[styles.input, { backgroundColor: c.inputBg, borderColor: c.inputBorder, color: c.text }]}
              />
            </View>

            <View style={[styles.presetSummary, { backgroundColor: isDark ? '#374151' : '#F9FAFB' }]}>
              <Text style={{ color: c.textSecondary, fontSize: 13 }}>
                {t('studyDuration')}: {studyMinutes}{t('minutes')}
              </Text>
              <Text style={{ color: c.textSecondary, fontSize: 13 }}>
                {t('breakDuration')}: {breakMinutes}{t('minutes')}
              </Text>
              <Text style={{ color: c.textSecondary, fontSize: 13 }}>
                {t('numberOfCycles')}: {totalCycles}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setShowPresetSave(false);
                  setPresetName('');
                }}
                style={[styles.modalBtn, { borderColor: c.border }]}
              >
                <Text style={{ color: c.textSecondary }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={savePreset}
                style={[styles.modalBtn, { backgroundColor: '#2563EB', opacity: presetName.trim() ? 1 : 0.5 }]}
                disabled={!presetName.trim()}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>{t('save')}</Text>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  headerButton: { padding: 8, borderRadius: 8 },
  content: { flex: 1, paddingHorizontal: 16, marginTop: -12 },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...boxShadow('#000', 0, 2, 0.08, 8, 3),
  },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  presetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addPresetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addPresetText: { fontSize: 13, fontWeight: '500' },
  emptyText: { fontSize: 13 },
  presetScroll: { marginTop: 4 },
  presetCard: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    minWidth: 140,
  },
  presetName: { fontSize: 14, fontWeight: '600' },
  presetInfo: { fontSize: 11, marginTop: 4 },
  statusContainer: { alignItems: 'center', marginBottom: 20 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  statusText: { fontSize: 14, fontWeight: '600' },
  timerContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  timerTextContainer: { position: 'absolute', alignItems: 'center' },
  timerText: { fontSize: 48, fontWeight: '700' },
  cycleText: { fontSize: 14, marginTop: 4 },
  controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20 },
  controlBtn: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  playBtn: { width: 68, height: 68, borderRadius: 34, justifyContent: 'center', alignItems: 'center' },
  cycleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cycleBox: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cycleBoxText: { fontSize: 14, fontWeight: '600' },
  completedText: { fontSize: 13, marginTop: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '88%', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: 'transparent', alignItems: 'center' },
  savePresetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 12,
  },
  presetSummary: { borderRadius: 10, padding: 12, gap: 4, marginBottom: 8 },
});
