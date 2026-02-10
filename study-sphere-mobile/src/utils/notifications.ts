import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Session } from '../types';

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('study-reminders', {
      name: 'Study Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return finalStatus === 'granted';
}

export async function scheduleSessionReminder(session: Session, language: string) {
  const [hours, minutes] = session.startTime.split(':').map(Number);
  const sessionDate = new Date(session.date + 'T00:00:00');
  sessionDate.setHours(hours, minutes, 0, 0);

  // 5 minutes before
  const triggerDate = new Date(sessionDate.getTime() - 5 * 60 * 1000);

  if (triggerDate <= new Date()) return;

  const isKo = language === 'ko';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: isKo ? '📚 학습 세션 시작 임박!' : '📚 Study Session Starting Soon!',
      body: isKo
        ? `"${session.title}" 세션이 5분 후에 시작됩니다.`
        : `"${session.title}" starts in 5 minutes.`,
      data: { sessionId: session.id },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
    identifier: `session-${session.id}`,
  });
}

export async function cancelSessionReminder(sessionId: number) {
  await Notifications.cancelScheduledNotificationAsync(`session-${sessionId}`);
}

export async function rescheduleAllReminders(sessions: Session[], language: string) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const session of sessions) {
    await scheduleSessionReminder(session, language);
  }
}
