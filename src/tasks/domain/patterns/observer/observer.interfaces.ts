// File: src/tasks/domain/patterns/observer/observer.interfaces.ts
export interface IObserver<T> {
  update(data: T): void;
}

export interface IObservable<T> {
  attach(observer: IObserver<T>): void;
  detach(observer: IObserver<T>): void;
  notify(data: T): void;
}
