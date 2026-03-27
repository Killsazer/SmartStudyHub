export class DeadlineNotificationManager {
  // Статичне посилання на єдиний екземпляр
  private static instance: DeadlineNotificationManager;
  
  // Пул з'єднань (userId -> WebSocket зв'язок)
  private activeConnections: Map<string, any> = new Map(); 
  private notificationQueue: Set<string> = new Set(); // Використовуємо Set щоб уникати дублікатів

  // Приватний конструктор унеможливлює створення об'єктів через оператор new
  private constructor() {}

  // Глобальна точка доступу до екземпляра
  public static getInstance(): DeadlineNotificationManager {
    if (!DeadlineNotificationManager.instance) {
      // Lazy initialization (відкладена ініціалізація)
      DeadlineNotificationManager.instance = new DeadlineNotificationManager();
    }
    return DeadlineNotificationManager.instance;
  }

  // Управління пулом з'єднань
  public registerConnection(userId: string, connection: any): void {
    if (this.activeConnections.has(userId)) {
      console.warn(`User ${userId} already has an active WS connection. Dropping the old one.`);
      // Закриваємо старе з'єднання (щоб не було дублювань повідомлень на кількох пристроях тощо)
    }
    this.activeConnections.set(userId, connection);
  }

  // Обробка "гарячих" сповіщень
  public queueHotNotification(userId: string, message: string): void {
    const alertKey = `${userId}:${message}`;
    
    if (!this.notificationQueue.has(alertKey)) {
      this.notificationQueue.add(alertKey);
      this.flushQueueForUser(userId);
    }
  }

  private flushQueueForUser(userId: string): void {
    const connection = this.activeConnections.get(userId);
    if (connection) {
      // ... logic to send over WebSocket
      console.log(`[WebSocket Manager] Sent push notification to ${userId}`);
      
      // Clear specific user's queue
      const itemsToRemove = Array.from(this.notificationQueue).filter(item => item.startsWith(userId));
      itemsToRemove.forEach(item => this.notificationQueue.delete(item));
    }
  }
}
