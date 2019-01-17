const noop = () => {}; // tslint:disable-line no-empty

export default class TimedDeferred<T> {

  ms: number;
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void; // tslint:disable-line no-any
  onTimeout: () => void;

  constructor(ms: number) {
    this.ms = ms;
    this.resolve = noop;
    this.reject = noop;
    this.onTimeout = noop;
    this.promise = new Promise((resolve, reject) => {
      const timeoutId = setTimeout(
        () => {
          this.onTimeout();
          reject();
        },
        ms,
      );
      this.resolve = (value: T | PromiseLike<T>) => {
        clearTimeout(timeoutId);
        resolve(value);
      };
      this.reject = (reason?: any) => { // tslint:disable-line no-any
        clearTimeout(timeoutId);
        reject(reason);
      };
    });
  }
}
