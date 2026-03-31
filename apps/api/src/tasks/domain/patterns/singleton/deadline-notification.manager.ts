/**
 * ====================================================================
 * Патерн: Singleton (Породжувальний / Creational)
 * ====================================================================
 * Гарантує існування лише одного екземпляра менеджера сповіщень у
 * всьому застосунку. Це критично для управління WebSocket-з'єднаннями,
 * адже кілька екземплярів призвели б до дублювання та втрати повідомлень.
 *
 * Ключові ознаки патерну:
 * - Приватний конструктор (забороняє `new`)
 * - Статичний метод `getInstance()` — єдина точка доступу
 * - Lazy initialization — створюється при першому зверненні
 * ====================================================================
 */

/** Typed placeholder for WebSocket connection objects */
interface WebSocketConnection {
  send(data: string): void;
  close(): void;
}

export class DeadlineNotificationManager {
  /** Статичне посилання на єдиний екземпляр (Singleton instance) */
  private static instance: DeadlineNotificationManager;

  /** Пул активних WebSocket-з'єднань (userId → connection) */
  private activeConnections: Map<string, WebSocketConnection> = new Map();

  /** Черга сповіщень (Set унеможливлює дублікати) */
  private notificationQueue: Set<string> = new Set();

  /**
   * Приватний конструктор — ключовий елемент Singleton.
   * Унеможливлює створення об'єктів ззовні через `new`.
   */
  private constructor() {}

  /**
   * Глобальна точка доступу до єдиного екземпляра.
   * Якщо екземпляр ще не створено — ініціалізує його (Lazy Initialization).
   */
  public static getInstance(): DeadlineNotificationManager {
    if (!DeadlineNotificationManager.instance) {
      DeadlineNotificationManager.instance = new DeadlineNotificationManager();
    }
    return DeadlineNotificationManager.instance;
  }

  /** Реєструє WebSocket-з'єднання для конкретного користувача */
  public registerConnection(userId: string, connection: WebSocketConnection): void {
    if (this.activeConnections.has(userId)) {
      console.warn(`User ${userId} already has an active WS connection. Dropping the old one.`);
    }
    this.activeConnections.set(userId, connection);
  }

  /** Додає сповіщення у чергу та негайно відправляє, якщо є з'єднання */
  public queueHotNotification(userId: string, message: string): void {
    const alertKey = `${userId}:${message}`;

    if (!this.notificationQueue.has(alertKey)) {
      this.notificationQueue.add(alertKey);
      this.flushQueueForUser(userId);
    }
  }

  /** Відправляє всі накопичені сповіщення користувачу та очищує чергу */
  private flushQueueForUser(userId: string): void {
    const connection = this.activeConnections.get(userId);
    if (connection) {
      console.log(`[WebSocket Manager] Sent push notification to ${userId}`);

      const itemsToRemove = Array.from(this.notificationQueue).filter(item => item.startsWith(userId));
      itemsToRemove.forEach(item => this.notificationQueue.delete(item));
    }
  }
}
