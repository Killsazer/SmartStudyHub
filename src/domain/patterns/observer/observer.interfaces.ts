export interface IObserver<T> {
  update(data: T): void;
}

export interface IObservable<T> {
  attach(observer: IObserver<T>): void;
  detach(observer: IObserver<T>): void;
  notify(data: T): void;
}
