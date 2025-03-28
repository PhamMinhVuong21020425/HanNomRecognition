export type NotificationType = {
  key: string;
  title: string;
  description: string;
  time: Date;
  status: 'success' | 'info' | 'warning' | 'error';
};
