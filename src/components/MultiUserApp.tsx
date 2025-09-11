import { useState } from 'react';
import { UserSelection } from './UserSelection';
import { UserTodoApp } from './UserTodoApp';

interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
  type?: 'individual' | 'shared';
}

const USERS: User[] = [
  {
    id: 'user1',
    name: 'Ceanna',
    initials: 'CE',
    color: 'bg-purple-500',
    type: 'individual'
  },
  {
    id: 'user2',
    name: 'Giscard',
    initials: 'GI',
    color: 'bg-blue-500',
    type: 'individual'
  },
  {
    id: 'shared',
    name: 'Shared Tasks',
    initials: 'CG',
    color: 'bg-gradient-to-r from-blue-500 to-purple-500',
    type: 'shared'
  }
];

interface MultiUserAppProps {
  onLogout?: () => void;
}

export function MultiUserApp({ onLogout }: MultiUserAppProps = {}) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const selectedUser = USERS.find(user => user.id === selectedUserId);

  const getUserTaskCount = (userId: string) => {
    const savedTodos = localStorage.getItem(`todos_${userId}`);
    if (!savedTodos) {
      return { total: 0, completed: 0 };
    }
    
    const todos = JSON.parse(savedTodos);
    const total = todos.length;
    const completed = todos.filter((todo: any) => todo.completed).length;
    
    return { total, completed };
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleBack = () => {
    setSelectedUserId(null);
  };

  // Show user selection screen
  if (!selectedUser) {
    return (
      <UserSelection
        users={USERS}
        onSelectUser={handleSelectUser}
        getUserTaskCount={getUserTaskCount}
        onLogout={onLogout}
      />
    );
  }

  // Show individual user's todo app
  return (
    <UserTodoApp
      user={selectedUser}
      onBack={handleBack}
    />
  );
}