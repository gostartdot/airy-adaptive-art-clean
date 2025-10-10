export interface ServerToClientEvents {
  'receive-message': (message: any) => void;
  'user-typing': (data: { userId: string; isTyping: boolean }) => void;
  'match-revealed': (data: { matchId: string }) => void;
  'new-notification': (notification: any) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  'join-room': (matchId: string) => void;
  'leave-room': (matchId: string) => void;
  'send-message': (data: { matchId: string; content: string; senderId: string; receiverId: string }) => void;
  'typing': (data: { matchId: string; isTyping: boolean; userId: string }) => void;
  'join-user-room': (userId: string) => void;
  'profile-revealed': (data: { matchId: string; userId: string }) => void;
  'send-notification': (data: any) => void;
}

