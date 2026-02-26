interface NotificationCategory {
  id: string;
  title: string;
  icon: string;
  settings: NotificationSetting[];
}

interface NotificationSetting {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}
