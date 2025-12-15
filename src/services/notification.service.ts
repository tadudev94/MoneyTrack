import { PermissionsAndroid } from "react-native";
import PushNotification from "react-native-push-notification";

export async function checkExactAlarmPermission() {
   console.log("Exact Alarm permission:111");
  const granted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.SCHEDULE_EXACT_ALARM
  );
  console.log("Exact Alarm permission:", granted);
}

export const createChannel = () => {
  PushNotification.createChannel(
    {
      channelId: "reminder-channel",
      channelName: "Daily Reminder",
      importance: 4,
    },
    (created) => console.log("channel created:", created)
  );
};

export const scheduleDaily = (hour, minute = 0) => {
  // Hủy lịch cũ
  PushNotification.cancelAllLocalNotifications();
  const now = new Date();
  const time = new Date();
  time.setHours(hour);
  time.setMinutes(minute);
  time.setSeconds(0);

  if (time < now) {
    time.setDate(time.getDate() + 1);
  }

  // PushNotification.localNotificationSchedule({
  //   channelId: "reminder-channel",
  //   title: "Nhắc nhở chi tiêu",
  //   message: "Bạn đã cập nhật chi tiêu hôm nay chưa?",
  //   date: time,
  //   repeatType: "day",
  //   allowWhileIdle: false,
  //   exact: false,
  // });

  PushNotification.localNotificationSchedule({
    channelId: "reminder-channel",
    title: "Nhắc nhở chi tiêu",
    message: "Bạn đã cập nhật chi tiêu hôm nay chưa?",
    repeatType: 'day',   // Lặp mỗi ngày (INEXACT)
    allowWhileIdle: false,
    date: new Date(Date.now() + 2 * 60 * 1000), // 2 phút sau
    exact: false, // Quan trọng để Android 12 không dùng EXACT ALARM
  });

  console.log("Scheduled at:", hour, ":", minute);
};
