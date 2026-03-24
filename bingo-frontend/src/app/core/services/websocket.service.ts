import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private client: any = null;
  private subjects = new Map<string, Subject<any>>();
  private connected = false;

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      const { Client } = await import('@stomp/stompjs');
      const SockJS = (await import('sockjs-client')).default;

      this.client = new Client({
        webSocketFactory: () => new SockJS(environment.wsUrl),
        reconnectDelay: 5000,
        onConnect: () => {
          this.connected = true;
          this.subjects.forEach((subject, topic) => {
            this.client.subscribe(topic, (message: any) => {
              subject.next(JSON.parse(message.body));
            });
          });
        },
        onDisconnect: () => {
          this.connected = false;
        },
        onStompError: (frame: any) => {
          console.error('WebSocket error:', frame);
        }
      });

      this.client.activate();
    } catch (e) {
      console.warn('WebSocket connection failed:', e);
    }
  }

  subscribe<T>(topic: string): Observable<T> {
    if (!this.subjects.has(topic)) {
      this.subjects.set(topic, new Subject<T>());

      if (this.connected && this.client) {
        this.client.subscribe(topic, (message: any) => {
          this.subjects.get(topic)?.next(JSON.parse(message.body));
        });
      }
    }

    return this.subjects.get(topic)!.asObservable() as Observable<T>;
  }

  disconnect(): void {
    this.subjects.forEach(subject => subject.complete());
    this.subjects.clear();
    this.client?.deactivate();
    this.client = null;
    this.connected = false;
  }
}
