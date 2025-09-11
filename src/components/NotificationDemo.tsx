import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Bell, Play, CheckCircle } from 'lucide-react';

export function NotificationDemo() {
  const [isDemo, setIsDemo] = useState(false);

  const runDemo = () => {
    setIsDemo(true);
    
    // Simulate notification after a short delay
    setTimeout(() => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('📋 Demo Notification', {
          body: 'This is what your daily task reminders will look like!',
          icon: '/favicon.ico'
        });
      }
      setIsDemo(false);
    }, 1000);
  };

  return (
    <Card className="p-4 border-dashed border-2 border-muted-foreground/30 bg-muted/20">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
          <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div>
          <h3 className="font-medium text-foreground mb-1">Daily Task Reminders</h3>
          <p className="text-sm text-muted-foreground">
            Get notified about your pending tasks every day at your chosen time
          </p>
        </div>

        <Button 
          onClick={runDemo}
          disabled={isDemo}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isDemo ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Sent!
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Try Demo
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground">
          Notifications work even when the app is closed
        </div>
      </div>
    </Card>
  );
}