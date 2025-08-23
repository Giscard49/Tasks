import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Bell, BellOff, Clock, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface NotificationSettings {
  enabled: boolean;
  time: string; // "HH:MM" format
  lastNotification?: string; // ISO date string
}

interface NotificationManagerProps {
  userId?: string;
  userName?: string;
  getTodoCount?: () => { total: number; active: number };
}

export function NotificationManager({ userId, userName, getTodoCount }: NotificationManagerProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    time: '09:00'
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load notification settings
  useEffect(() => {
    const storageKey = userId ? `notifications_${userId}` : 'notifications_global';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setSettings(JSON.parse(saved));
    }

    // Check current permission status
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, [userId]);

  // Save notification settings
  useEffect(() => {
    const storageKey = userId ? `notifications_${userId}` : 'notifications_global';
    localStorage.setItem(storageKey, JSON.stringify(settings));
  }, [settings, userId]);

  // Set up daily notification check
  useEffect(() => {
    if (!settings.enabled || !hasPermission) return;

    const checkAndNotify = () => {
      const now = new Date();
      const [hours, minutes] = settings.time.split(':').map(Number);
      const targetTime = new Date();
      targetTime.setHours(hours, minutes, 0, 0);

      // If target time has passed today, set for tomorrow
      if (now > targetTime) {
        targetTime.setDate(targetTime.getDate() + 1);
      }

      const timeUntilNotification = targetTime.getTime() - now.getTime();
      
      // Check if we already sent notification today
      const today = now.toDateString();
      const lastNotificationDate = settings.lastNotification ? new Date(settings.lastNotification).toDateString() : null;
      
      if (lastNotificationDate !== today && timeUntilNotification <= 60000) { // Within 1 minute
        sendNotification();
        setSettings(prev => ({ ...prev, lastNotification: now.toISOString() }));
      }

      // Schedule next check
      setTimeout(checkAndNotify, Math.min(timeUntilNotification, 60000)); // Check every minute or until target time
    };

    const timeout = setTimeout(checkAndNotify, 1000);
    return () => clearTimeout(timeout);
  }, [settings, hasPermission, getTodoCount, userName]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    setHasPermission(permission === 'granted');
    
    if (permission === 'granted') {
      // Send a test notification
      new Notification('Notifications Enabled! 🎉', {
        body: `You'll now receive daily task reminders at ${settings.time}`,
        icon: '/favicon.ico'
      });
    }
  };

  const sendNotification = () => {
    if (!hasPermission) return;

    let title = '📋 Daily Task Reminder';
    let body = 'Don\'t forget to check your tasks for today!';

    if (getTodoCount && userName) {
      const { active, total } = getTodoCount();
      if (total === 0) {
        title = `🌟 ${userName}, you're all caught up!`;
        body = 'No pending tasks. Great job staying organized!';
      } else if (active === 0) {
        title = `✅ ${userName}, all tasks completed!`;
        body = `You've completed all ${total} tasks. Excellent work!`;
      } else {
        title = `📝 ${userName}, you have ${active} pending task${active > 1 ? 's' : ''}`;
        body = `${active} of ${total} tasks remaining. You've got this!`;
      }
    }

    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    });
  };

  const testNotification = () => {
    if (hasPermission) {
      sendNotification();
    } else {
      requestPermission();
    }
  };

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return [`${hour}:00`, `${hour}:30`];
  }).flat();

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-10 w-10 p-0"
        >
          {settings.enabled && hasPermission ? (
            <Bell className="w-4 h-4 text-blue-500" />
          ) : (
            <BellOff className="w-4 h-4" />
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Daily Reminders
          </DialogTitle>
          <DialogDescription>
            Set up daily task reminders to stay on top of your todos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Permission Status */}
          <Card className={`p-4 border-2 ${hasPermission ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20'}`}>
            <div className="flex items-center gap-3">
              {hasPermission ? (
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Bell className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <BellOff className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">
                  {hasPermission ? 'Notifications Enabled' : 'Permission Required'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {hasPermission 
                    ? 'You\'ll receive daily task reminders' 
                    : 'Allow notifications to receive daily reminders'
                  }
                </p>
              </div>
            </div>
          </Card>

          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Daily Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about your pending tasks
              </p>
            </div>
            <Switch
              checked={settings.enabled && hasPermission}
              onCheckedChange={(enabled) => {
                if (enabled && !hasPermission) {
                  requestPermission();
                } else {
                  setSettings(prev => ({ ...prev, enabled }));
                }
              }}
            />
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Reminder Time
            </Label>
            <Select 
              value={settings.time} 
              onValueChange={(time) => setSettings(prev => ({ ...prev, time }))}
              disabled={!hasPermission}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          {/* <div className="flex gap-2">
            {!hasPermission ? (
              <Button onClick={requestPermission} className="flex-1">
                <Bell className="w-4 h-4 mr-2" />
                Enable Notifications
              </Button>
            ) : (
              <Button onClick={testNotification} variant="outline" className="flex-1">
                Test Notification
              </Button>
            )}
          </div> */}

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Notifications are sent once per day at your chosen time</p>
            <p>• You'll be reminded about your pending tasks</p>
            <p>• Notifications work even when the app is closed</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}