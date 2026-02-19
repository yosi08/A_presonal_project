import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Edit3, Trash2, Check, X } from 'lucide-react-native';
import * as Crypto from 'expo-crypto';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { boxShadow } from '../utils/styles';
import { getTodayStr } from '../utils/date';
import { SUBJECTS, Note } from '../types';

const getSubjectColor = (subject: string): string => {
  const found = SUBJECTS.find((s) => s.name === subject);
  return found ? found.color : 'rgb(100, 116, 139)';
};

export default function NoteDetailScreen() {
  const { c, isDark } = useTheme();
  const { t, notes, setNotes } = useApp();
  const navigation = useNavigation();
  const route = useRoute<any>();

  const { noteId, isNew } = route.params || {};

  const existingNote = useMemo(
    () => notes.find((n) => n.id === noteId) || null,
    [notes, noteId]
  );

  const [isEditing, setIsEditing] = useState(!!isNew);
  const [title, setTitle] = useState(existingNote?.title || '');
  const [subject, setSubject] = useState(existingNote?.subject || 'Other');
  const [cues, setCues] = useState(existingNote?.cues || '');
  const [noteContent, setNoteContent] = useState(existingNote?.notes || '');
  const [summary, setSummary] = useState(existingNote?.summary || '');

  const getSubjectTranslation = (subj: string) => {
    const map: Record<string, string> = {
      Mathematics: t('mathematics'),
      Physics: t('physics'),
      Chemistry: t('chemistry'),
      Biology: t('biology'),
      'Computer Science': t('computerScience'),
      Other: t('other'),
    };
    return map[subj] || subj;
  };

  const handleSave = () => {
    if (!title.trim()) return;

    if (isNew) {
      const newNote: Note = {
        id: Crypto.randomUUID(),
        title: title.trim(),
        subject,
        date: getTodayStr(),
        color: getSubjectColor(subject),
        cues,
        notes: noteContent,
        summary,
      };
      setNotes([newNote, ...notes]);
    } else if (existingNote) {
      setNotes(
        notes.map((n) =>
          n.id === existingNote.id
            ? {
                ...n,
                title: title.trim(),
                subject,
                color: getSubjectColor(subject),
                cues,
                notes: noteContent,
                summary,
              }
            : n
        )
      );
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(t('delete'), `"${existingNote?.title}"`, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => {
          if (existingNote) {
            setNotes(notes.filter((n) => n.id !== existingNote.id));
          }
          navigation.goBack();
        },
      },
    ]);
  };

  const noteColor = existingNote?.color || getSubjectColor(subject);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ArrowLeft color={c.text} size={22} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: c.text }]} numberOfLines={1}>
          {isNew ? t('createNote') : isEditing ? t('editNote') : existingNote?.title || ''}
        </Text>

        <View style={styles.headerRight}>
          {!isEditing && existingNote ? (
            <>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerBtn}>
                <Edit3 color={c.primary} size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
                <Trash2 color="#EF4444" size={20} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => (isNew ? navigation.goBack() : setIsEditing(false))}
                style={styles.headerBtn}
              >
                <X color={c.textSecondary} size={22} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
                <Check color={c.primary} size={22} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isEditing ? (
          /* ===== EDIT MODE ===== */
          <View style={styles.editContainer}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t('title')}</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={t('noteTitlePlaceholder')}
                placeholderTextColor={c.textTertiary}
                style={[styles.input, { backgroundColor: c.inputBg, borderColor: c.inputBorder, color: c.text }]}
              />
            </View>

            {/* Subject Chips */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: c.textSecondary }]}>{t('subject')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {SUBJECTS.map((subj) => {
                  const isActive = subject === subj.name;
                  return (
                    <TouchableOpacity
                      key={subj.name}
                      onPress={() => setSubject(subj.name)}
                      style={[
                        styles.subjectChip,
                        isActive
                          ? { backgroundColor: subj.color }
                          : { backgroundColor: c.surfaceSecondary, borderWidth: 1, borderColor: c.border },
                      ]}
                    >
                      <Text style={{ color: isActive ? '#fff' : c.textSecondary, fontSize: 13, fontWeight: '500' }}>
                        {getSubjectTranslation(subj.name)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Cornell Note Structure */}
            <View style={[styles.cornellContainer, { borderColor: c.border }]}>
              {/* Cue Section */}
              <View style={[styles.cornellSection, { backgroundColor: isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF' }]}>
                <View style={[styles.cornellHeader, { borderBottomColor: c.border, backgroundColor: isDark ? 'rgba(37,99,235,0.2)' : '#DBEAFE' }]}>
                  <Text style={[styles.cornellHeaderTitle, { color: isDark ? '#93C5FD' : '#1D4ED8' }]}>
                    {t('cueColumn')}
                  </Text>
                  <Text style={[styles.cornellHeaderDesc, { color: isDark ? '#60A5FA' : '#2563EB' }]}>
                    {t('cueDescription')}
                  </Text>
                </View>
                <TextInput
                  value={cues}
                  onChangeText={setCues}
                  placeholder={t('cuePlaceholder')}
                  placeholderTextColor={c.textTertiary}
                  multiline
                  textAlignVertical="top"
                  style={[styles.cornellInput, { color: c.text, minHeight: 100 }]}
                />
              </View>

              {/* Notes Section */}
              <View style={[styles.cornellSection, { borderTopWidth: 2, borderTopColor: c.border }]}>
                <View style={[styles.cornellHeader, { borderBottomColor: c.border, backgroundColor: c.surfaceSecondary }]}>
                  <Text style={[styles.cornellHeaderTitle, { color: c.text }]}>{t('notesColumn')}</Text>
                  <Text style={[styles.cornellHeaderDesc, { color: c.textSecondary }]}>{t('notesDescription')}</Text>
                </View>
                <TextInput
                  value={noteContent}
                  onChangeText={setNoteContent}
                  placeholder={t('notesPlaceholder')}
                  placeholderTextColor={c.textTertiary}
                  multiline
                  textAlignVertical="top"
                  style={[styles.cornellInput, { color: c.text, minHeight: 180 }]}
                />
              </View>

              {/* Summary Section */}
              <View style={[styles.cornellSection, { borderTopWidth: 2, borderTopColor: c.border, backgroundColor: c.surfaceSecondary }]}>
                <View style={[styles.cornellHeader, { borderBottomColor: c.border, backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                  <Text style={[styles.cornellHeaderTitle, { color: c.text }]}>{t('summarySection')}</Text>
                  <Text style={[styles.cornellHeaderDesc, { color: c.textSecondary }]}>{t('summaryDescription')}</Text>
                </View>
                <TextInput
                  value={summary}
                  onChangeText={setSummary}
                  placeholder={t('summaryPlaceholder')}
                  placeholderTextColor={c.textTertiary}
                  multiline
                  textAlignVertical="top"
                  style={[styles.cornellInput, { color: c.text, minHeight: 80 }]}
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveBtn, { opacity: title.trim() ? 1 : 0.5 }]}
              disabled={!title.trim()}
            >
              <Text style={styles.saveBtnText}>
                {isNew ? t('createNote') : t('saveChanges')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : existingNote ? (
          /* ===== VIEW MODE ===== */
          <View style={styles.viewContainer}>
            {/* Color Bar */}
            <View style={[styles.viewColorBar, { backgroundColor: noteColor }]} />

            {/* Title & Meta */}
            <Text style={[styles.viewTitle, { color: c.text }]}>{existingNote.title}</Text>
            <Text style={[styles.viewMeta, { color: c.textSecondary }]}>
              {getSubjectTranslation(existingNote.subject)} · {existingNote.date}
            </Text>

            {/* Cornell Layout */}
            <View style={[styles.cornellContainer, { borderColor: c.border }]}>
              {/* Cue */}
              <View style={[styles.cornellSection, { backgroundColor: isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF' }]}>
                <View style={[styles.cornellHeader, { borderBottomColor: c.border, backgroundColor: isDark ? 'rgba(37,99,235,0.2)' : '#DBEAFE' }]}>
                  <Text style={[styles.cornellHeaderTitle, { color: isDark ? '#93C5FD' : '#1D4ED8' }]}>
                    {t('cueColumn')}
                  </Text>
                </View>
                <View style={styles.cornellViewContent}>
                  <Text style={[styles.cornellViewText, { color: c.text }]}>
                    {existingNote.cues || (
                      <Text style={{ color: c.textTertiary, fontStyle: 'italic' }}>{t('noCues')}</Text>
                    )}
                  </Text>
                </View>
              </View>

              {/* Notes */}
              <View style={[styles.cornellSection, { borderTopWidth: 2, borderTopColor: c.border }]}>
                <View style={[styles.cornellHeader, { borderBottomColor: c.border, backgroundColor: c.surfaceSecondary }]}>
                  <Text style={[styles.cornellHeaderTitle, { color: c.text }]}>{t('notesColumn')}</Text>
                </View>
                <View style={styles.cornellViewContent}>
                  <Text style={[styles.cornellViewText, { color: c.text }]}>
                    {existingNote.notes || (
                      <Text style={{ color: c.textTertiary, fontStyle: 'italic' }}>{t('noNotes')}</Text>
                    )}
                  </Text>
                </View>
              </View>

              {/* Summary */}
              <View style={[styles.cornellSection, { borderTopWidth: 2, borderTopColor: c.border, backgroundColor: c.surfaceSecondary }]}>
                <View style={[styles.cornellHeader, { borderBottomColor: c.border, backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                  <Text style={[styles.cornellHeaderTitle, { color: c.text }]}>{t('summarySection')}</Text>
                </View>
                <View style={styles.cornellViewContent}>
                  <Text style={[styles.cornellViewText, { color: c.text }]}>
                    {existingNote.summary || (
                      <Text style={{ color: c.textTertiary, fontStyle: 'italic' }}>{t('noSummary')}</Text>
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: 8 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', textAlign: 'center', marginHorizontal: 4 },
  headerRight: { flexDirection: 'row', gap: 4 },
  content: { flex: 1, paddingHorizontal: 16 },
  // Edit Mode
  editContainer: { paddingTop: 16, paddingBottom: 40 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  subjectChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  cornellContainer: { borderWidth: 2, borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
  cornellSection: {},
  cornellHeader: { padding: 12, borderBottomWidth: 1 },
  cornellHeaderTitle: { fontSize: 14, fontWeight: '600' },
  cornellHeaderDesc: { fontSize: 12, marginTop: 2 },
  cornellInput: { padding: 14, fontSize: 14, lineHeight: 20 },
  saveBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    ...boxShadow('#2563EB', 0, 4, 0.3, 6, 4),
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  // View Mode
  viewContainer: { paddingTop: 16, paddingBottom: 40 },
  viewColorBar: { height: 4, borderRadius: 2, marginBottom: 16 },
  viewTitle: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  viewMeta: { fontSize: 14, marginBottom: 20 },
  cornellViewContent: { padding: 16 },
  cornellViewText: { fontSize: 14, lineHeight: 22 },
});
