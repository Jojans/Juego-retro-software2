import { Server, Socket } from 'socket.io';
import GameSession from '../models/GameSession';
import User from '../models/User';
import { logger } from '../utils/logger';

export class SocketService {
  private io: Server;
  private connectedUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`Socket connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', async (data: { token: string }) => {
        try {
          // In a real implementation, you would verify the JWT token here
          // For now, we'll just store the socket with a placeholder
          this.connectedUsers.set(socket.id, 'authenticated');
          socket.emit('authenticated', { success: true });
        } catch (error) {
          socket.emit('authentication_error', { message: 'Invalid token' });
        }
      });

      // Handle game session events
      socket.on('join_game_session', async (data: { sessionId: string, userId: string }) => {
        try {
          const gameSession = await GameSession.findOne({ 
            where: { sessionId } 
          });
          if (!gameSession) {
            socket.emit('session_error', { message: 'Game session not found' });
            return;
          }

          socket.join(`session_${data.sessionId}`);
          this.connectedUsers.set(socket.id, data.userId);
          
          socket.emit('joined_session', { sessionId: data.sessionId });
          logger.info(`User ${data.userId} joined game session ${data.sessionId}`);
        } catch (error) {
          socket.emit('session_error', { message: 'Failed to join game session' });
        }
      });

      // Handle real-time game events
      socket.on('game_event', async (data: {
        sessionId: string;
        type: string;
        data: any;
        timestamp: number;
      }) => {
        try {
          const gameSession = await GameSession.findOne({ 
            where: { sessionId: data.sessionId } 
          });
          if (!gameSession) {
            socket.emit('session_error', { message: 'Game session not found' });
            return;
          }

          // Add event to session
          await gameSession.addEvent(data.type as any, data.data);

          // Broadcast to other players in the same session
          socket.to(`session_${data.sessionId}`).emit('game_event', data);
          
          logger.debug(`Game event received: ${data.type} for session ${data.sessionId}`);
        } catch (error) {
          socket.emit('event_error', { message: 'Failed to process game event' });
        }
      });

      // Handle leaderboard updates
      socket.on('request_leaderboard', async (data: { difficulty?: string }) => {
        try {
          const leaderboard = await GameSession.getLeaderboard(data.difficulty, 10);
          socket.emit('leaderboard_update', { leaderboard });
        } catch (error) {
          socket.emit('leaderboard_error', { message: 'Failed to get leaderboard' });
        }
      });

      // Handle user stats requests
      socket.on('request_user_stats', async (data: { userId: string }) => {
        try {
          const stats = await GameSession.getUserStats(data.userId);
          socket.emit('user_stats_update', { stats: stats[0] || {} });
        } catch (error) {
          socket.emit('stats_error', { message: 'Failed to get user stats' });
        }
      });

      // Handle global analytics requests
      socket.on('request_analytics', async () => {
        try {
          const analytics = await GameSession.getAnalytics();
          socket.emit('analytics_update', { analytics: analytics[0] || {} });
        } catch (error) {
          socket.emit('analytics_error', { message: 'Failed to get analytics' });
        }
      });

      // Handle chat messages (if implemented)
      socket.on('chat_message', async (data: {
        sessionId: string;
        message: string;
        userId: string;
      }) => {
        try {
          const user = await User.findById(data.userId);
          if (!user) {
            socket.emit('chat_error', { message: 'User not found' });
            return;
          }

          const chatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: data.userId,
            username: user.username,
            message: data.message,
            timestamp: Date.now()
          };

          // Broadcast to all players in the session
          this.io.to(`session_${data.sessionId}`).emit('chat_message', chatMessage);
          
          logger.info(`Chat message from ${user.username} in session ${data.sessionId}`);
        } catch (error) {
          socket.emit('chat_error', { message: 'Failed to send chat message' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        const userId = this.connectedUsers.get(socket.id);
        if (userId) {
          logger.info(`User ${userId} disconnected`);
        }
        this.connectedUsers.delete(socket.id);
      });
    });
  }

  // Method to broadcast to all connected users
  public broadcastToAll(event: string, data: any): void {
    this.io.emit(event, data);
  }

  // Method to broadcast to specific user
  public broadcastToUser(userId: string, event: string, data: any): void {
    // Find socket by userId (this is a simplified approach)
    for (const [socketId, connectedUserId] of this.connectedUsers) {
      if (connectedUserId === userId) {
        this.io.to(socketId).emit(event, data);
        break;
      }
    }
  }

  // Method to broadcast to game session
  public broadcastToSession(sessionId: string, event: string, data: any): void {
    this.io.to(`session_${sessionId}`).emit(event, data);
  }

  // Method to get connected users count
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Method to get connected users
  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.values());
  }
}
