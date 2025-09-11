import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ThemeToggle } from './ThemeToggle';
import { NotificationManager } from './NotificationManager';
import { NotificationDemo } from './NotificationDemo';
import { FamilyTaskDemo } from './FamilyTaskDemo';
import { Users, CheckSquare, Heart, LogOut } from 'lucide-react';

interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
  type?: 'individual' | 'shared';
}

interface UserSelectionProps {
  users: User[];
  onSelectUser: (userId: string) => void;
  getUserTaskCount: (userId: string) => { total: number; completed: number };
  onLogout?: () => void;
}

export function UserSelection({ users, onSelectUser, getUserTaskCount, onLogout }: UserSelectionProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto p-4 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pt-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Our Tasks</h1>
              <p className="text-sm text-muted-foreground">Choose your profile</p>
            </div>
          </div>
          <div className="flex gap-2">
            <NotificationManager />
            <ThemeToggle />
            {onLogout && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="h-9 w-9"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* User Cards */}
        <div className="space-y-4">
          {users.map((user) => {
            const { total, completed } = getUserTaskCount(user.id);
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isShared = user.type === 'shared';
            
            return (
              <div key={user.id}>
                <Card 
                  className={`p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20 ${
                    isShared ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800' : ''
                  }`}
                  onClick={() => onSelectUser(user.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback 
                          className={`${user.color} text-white text-lg font-bold`}
                        >
                          {user.initials}
                        </AvatarFallback>
                      </Avatar>
                      {isShared && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <Heart className="w-3 h-3 text-white fill-current" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-foreground">
                          {user.name}
                        </h3>
                        {isShared && (
                          <div className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-xs text-white font-medium">
                            Shared
                          </div>
                        )}
                      </div>
                      
                      {total > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckSquare className="w-4 h-4" />
                            <span>{completed} of {total} tasks completed</span>
                            {isShared && <span>• Our goals</span>}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  isShared 
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                                    : user.id === 'user1' ? 'bg-blue-500' : 'bg-purple-500'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                              {progress}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {isShared 
                            ? 'No shared goals yet - create family tasks!' 
                            : 'No tasks yet - tap to get started!'
                          }
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      className="opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      Open →
                    </Button>
                  </div>
                </Card>

                {/* Show our Task Demo only for shared profile with no tasks */}
                {isShared && total === 0 && (
                  <div className="mt-3">
                    <FamilyTaskDemo />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Notification Demo */}
        <NotificationDemo />

        {/* Quick Stats */}
        <Card className="p-4 bg-muted/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-6 text-sm">
              {users.map((user) => {
                const { total } = getUserTaskCount(user.id);
                return (
                  <div key={user.id} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      user.id === 'user1' ? 'bg-blue-500' : 
                      user.id === 'user2' ? 'bg-purple-500' : 
                      'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`} />
                    <span className="text-muted-foreground">
                      {user.name}: {total} tasks
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}