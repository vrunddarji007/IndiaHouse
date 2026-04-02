import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Message, Conversation } from '../models/interfaces';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private socket!: Socket;
  private messageSubject = new BehaviorSubject<Message | null>(null);
  public newMessage$ = this.messageSubject.asObservable();
  
  private typingSubject = new BehaviorSubject<any>(null);
  public typing$ = this.typingSubject.asObservable();

  private reactionSubject = new BehaviorSubject<any>(null);
  public reaction$ = this.reactionSubject.asObservable();

  private onlineStatusSubject = new BehaviorSubject<{userId: string, status: string} | null>(null);
  public onlineStatus$ = this.onlineStatusSubject.asObservable();

  constructor(private http: HttpClient) { }

  connectSocket(userId: string) {
    if (this.socket?.connected) return;
    
    // FIX: Pass JWT token in handshake for server-side authentication
    const storedUser = localStorage.getItem('currentUser');
    const token = storedUser ? (JSON.parse(storedUser).token || '') : '';

    this.socket = io(environment.socketUrl, {
      query: { userId, token }
    });
    
    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('receiveMessage', (message: Message) => {
      this.messageSubject.next(message);
    });

    this.socket.on('typing', (user: any) => {
      this.typingSubject.next(user);
    });

    this.socket.on('receiveReaction', (data: any) => {
      this.reactionSubject.next(data);
    });

    this.socket.on('onlineStatusUpdate', (data: {userId: string, status: string}) => {
      this.onlineStatusSubject.next(data);
    });
  }

  joinRoom(room: string) {
    if (this.socket) {
      this.socket.emit('joinRoom', room);
    }
  }

  emitMessage(room: string, message: Message) {
    if (this.socket) {
      this.socket.emit('sendMessage', { room, message });
    }
  }

  emitTyping(room: string, user: any) {
    if (this.socket) {
      this.socket.emit('typing', { room, user });
    }
  }

  emitReaction(room: string, messageId: string, reactions: any[]) {
    if (this.socket) {
      this.socket.emit('sendReaction', { room, messageId, reactions });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // REST API methods
  getConversations(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/messages/conversations`);
  }

  getMessages(otherUserId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/messages/${otherUserId}`);
  }

  getEmojis(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/messages/emojis`);
  }

  reactToMessage(messageId: string, emojiCode: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/messages/react/${messageId}`, { emojiCode });
  }

  sendMessage(propertyId: string | null, to: string, text: string, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('to', to);
    if (text) formData.append('text', text);
    if (file) formData.append('file', file);
    
    const url = propertyId ? `${environment.apiUrl}/messages/${propertyId}/contact` : `${environment.apiUrl}/messages`;
    return this.http.post(url, formData);
  }

  clearChat(otherUserId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/messages/clear/${otherUserId}`, {});
  }

  deleteChat(otherUserId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/messages/delete/${otherUserId}`);
  }

  deleteMessages(messageIds: string[]): Observable<any> {
    return this.http.post(`${environment.apiUrl}/messages/delete-multiple`, { messageIds });
  }

  blockUser(userId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/messages/block/${userId}`, {});
  }

  unblockUser(userId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/messages/unblock/${userId}`, {});
  }
}
