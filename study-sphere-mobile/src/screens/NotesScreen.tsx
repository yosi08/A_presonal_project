import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { boxShadow } from '../utils/styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Plus, BookOpen } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { SUBJECTS, Note } from '../types';
import { RootStackParamList } from '../navigation/types';
import { HERO_GRADIENT_COLORS } from '../theme/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const getSubjectColor = (subject: string): string => {
  const found = SUBJECTS.find((s) => s.name === subject);
  return found ? found.color : 'rgb(100, 116, 139)';
};

const getSubjectTranslation = (subject: string, t: (key: string) => string): string => {
  const keyMap: Record<string, string> = {
    Mathematics: 'subjects.mathematics',
    Physics: 'subjects.physics',
    Chemistry: 'subjects.chemistry',
    Biology: 'subjects.biology',
    'Computer Science': 'subjects.computerScience',
    Other: 'subjects.other',
  };
  const key = keyMap[subject];
  return key ? t(key) : subject;
};

export default function NotesScreen() {
  const { c } = useTheme();
  const { t, notes, setNotes } = useApp();
  const navigation = useNavigation<NavigationProp>();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        searchTerm === '' ||
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.notes && note.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (note.cues && note.cues.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (note.summary && note.summary.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSubject =
        selectedSubject === 'All' || note.subject === selectedSubject;

      return matchesSearch && matchesSubject;
    });
  }, [notes, searchTerm, selectedSubject]);

  const handleDeleteNote = useCallback(
    (noteId: string, noteTitle: string) => {
      Alert.alert(
        t('calendar.delete'),
        `"${noteTitle}"`,
        [
          { text: t('calendar.cancel'), style: 'cancel' },
          {
            text: t('calendar.delete'),
            style: 'destructive',
            onPress: () => {
              setNotes(notes.filter((n) => n.id !== noteId));
            },
          },
        ]
      );
    },
    [notes, setNotes, t]
  );

  const handleLongPress = useCallback(
    (note: Note) => {
      Alert.alert(
        note.title,
        undefined,
        [
          {
            text: t('calendar.edit'),
            onPress: () =>
              navigation.navigate('NoteDetail', { noteId: note.id }),
          },
          {
            text: t('calendar.delete'),
            style: 'destructive',
            onPress: () => handleDeleteNote(note.id, note.title),
          },
          { text: t('calendar.cancel'), style: 'cancel' },
        ]
      );
    },
    [navigation, handleDeleteNote, t]
  );

  const subjectFilters = useMemo(() => {
    return [
      { name: 'All', label: t('notes.all') },
      ...SUBJECTS.map((s) => ({
        name: s.name,
        label: getSubjectTranslation(s.name, t),
      })),
    ];
  }, [t]);

  const renderNoteCard = useCallback(
    ({ item }: { item: Note }) => {
      const noteColor = item.color || getSubjectColor(item.subject);

      return (
        <TouchableOpacity
          style={[styles.card, { backgroundColor: c.cardBg, borderColor: c.border }]}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('NoteDetail', { noteId: item.id })}
          onLongPress={() => handleLongPress(item)}
        >
          {/* Color bar */}
          <View style={[styles.colorBar, { backgroundColor: noteColor }]} />

          {/* Card content */}
          <View style={styles.cardContent}>
            {/* Title */}
            <Text
              style={[styles.cardTitle, { color: c.text }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            {/* Subject + Date */}
            <Text style={[styles.cardMeta, { color: c.textSecondary }]}>
              {getSubjectTranslation(item.subject, t)} {' \u00B7 '} {item.date}
            </Text>

            {/* Cornell preview */}
            <View style={[styles.cornellPreview, { borderColor: c.border }]}>
              <View style={styles.cornellTop}>
                {/* Cue area */}
                <View
                  style={[
                    styles.cornellCue,
                    { backgroundColor: 'rgba(37, 99, 235, 0.06)', borderRightColor: c.border },
                  ]}
                >
                  <Text
                    style={[styles.cornellLabel, { color: c.primary }]}
                    numberOfLines={1}
                  >
                    {t('notes.cueColumn')}
                  </Text>
                  <Text
                    style={[styles.cornellText, { color: c.textSecondary }]}
                    numberOfLines={2}
                  >
                    {item.cues || t('notes.noCues')}
                  </Text>
                </View>

                {/* Notes area */}
                <View style={styles.cornellNotes}>
                  <Text
                    style={[styles.cornellLabel, { color: c.textTertiary }]}
                    numberOfLines={1}
                  >
                    {t('notes.notesColumn')}
                  </Text>
                  <Text
                    style={[styles.cornellText, { color: c.textSecondary }]}
                    numberOfLines={2}
                  >
                    {item.notes || t('notes.noNotes')}
                  </Text>
                </View>
              </View>

              {/* Summary area */}
              <View
                style={[
                  styles.cornellSummary,
                  { backgroundColor: c.surfaceSecondary, borderTopColor: c.border },
                ]}
              >
                <Text
                  style={[styles.cornellLabel, { color: c.textTertiary }]}
                  numberOfLines={1}
                >
                  {t('notes.summarySection')}
                </Text>
                <Text
                  style={[styles.cornellText, { color: c.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.summary || t('notes.noSummary')}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [c, t, navigation, handleLongPress]
  );

  const renderEmpty = useCallback(() => {
    const hasFilters = searchTerm !== '' || selectedSubject !== 'All';

    return (
      <View style={styles.emptyContainer}>
        <BookOpen color={c.textTertiary} size={48} />
        <Text style={[styles.emptyTitle, { color: c.text }]}>
          {t('notes.noNotesFound')}
        </Text>
        <Text style={[styles.emptySubtitle, { color: c.textSecondary }]}>
          {hasFilters ? t('notes.tryAdjusting') : t('notes.createFirstNote')}
        </Text>
        {!hasFilters && (
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: c.primary }]}
            onPress={() => navigation.navigate('NoteDetail', { isNew: true })}
          >
            <Plus color="#FFFFFF" size={18} />
            <Text style={styles.emptyButtonText}>{t('notes.createNote')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [c, t, searchTerm, selectedSubject, navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      {/* Hero header */}
      <LinearGradient
        colors={HERO_GRADIENT_COLORS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>{t('notes')}</Text>
            <Text style={styles.heroSubtitle}>{t('notes.cornellNoteDescription')}</Text>
          </View>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => navigation.navigate('NoteDetail', { isNew: true })}
          >
            <Plus color="#2563EB" size={18} />
            <Text style={styles.heroButtonText}>{t('notes.newNote')}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: c.background }]}>
        <View style={[styles.searchBar, { backgroundColor: c.inputBg, borderColor: c.inputBorder }]}>
          <Search color={c.textTertiary} size={18} />
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            placeholder={t('notes.searchNotes')}
            placeholderTextColor={c.textTertiary}
            value={searchTerm}
            onChangeText={setSearchTerm}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Subject filter chips */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {subjectFilters.map((filter) => {
            const isActive = selectedSubject === filter.name;
            const subjectEntry = SUBJECTS.find((s) => s.name === filter.name);

            return (
              <TouchableOpacity
                key={filter.name}
                style={[
                  styles.filterChip,
                  isActive
                    ? { backgroundColor: c.primary }
                    : { backgroundColor: c.surfaceSecondary, borderColor: c.border, borderWidth: 1 },
                ]}
                onPress={() => setSelectedSubject(filter.name)}
              >
                {subjectEntry && (
                  <View
                    style={[
                      styles.filterDot,
                      { backgroundColor: subjectEntry.color },
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.filterChipText,
                    isActive
                      ? { color: '#FFFFFF' }
                      : { color: c.textSecondary },
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notes list */}
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={renderNoteCard}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          filteredNotes.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary }]}
        onPress={() => navigation.navigate('NoteDetail', { isNew: true })}
        activeOpacity={0.8}
      >
        <Plus color="#FFFFFF" size={26} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  heroButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  filterContainer: {
    paddingBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    overflow: 'hidden',
    ...boxShadow('#000', 0, 1, 0.08, 4, 2),
  },
  colorBar: {
    height: 3,
    width: '100%',
  },
  cardContent: {
    padding: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    marginBottom: 10,
  },
  cornellPreview: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cornellTop: {
    flexDirection: 'row',
    minHeight: 60,
  },
  cornellCue: {
    flex: 1,
    padding: 8,
    borderRightWidth: 1,
  },
  cornellNotes: {
    flex: 2,
    padding: 8,
  },
  cornellLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  cornellText: {
    fontSize: 11,
    lineHeight: 15,
  },
  cornellSummary: {
    padding: 8,
    borderTopWidth: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    gap: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...boxShadow('#2563EB', 0, 4, 0.35, 8, 6),
  },
});
