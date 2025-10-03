type EventMap = {
  'permission-error': (error: any) => void; // Using 'any' for now, will define FirestorePermissionError later
};

class TypedEventEmitter {
  private listeners: { [K in keyof EventMap]?: EventMap[K][] } = {};

  on<K extends keyof EventMap>(eventName: K, listener: EventMap[K]) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName]?.push(listener);
  }

  off<K extends keyof EventMap>(eventName: K, listener: EventMap[K]) {
    if (!this.listeners[eventName]) {
      return;
    }
    this.listeners[eventName] = this.listeners[eventName]?.filter(
      (l) => l !== listener
    ) as EventMap[K][];
  }

  emit<K extends keyof EventMap>(eventName: K, ...args: Parameters<EventMap[K]>) {
    this.listeners[eventName]?.forEach((listener) => {
      // @ts-ignore - This is safe because args match Parameters<EventMap[K]>
      listener(...args);
    });
  }
}

export const errorEmitter = new TypedEventEmitter();