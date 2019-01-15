const noop = () => {};
class TimedDeferred<T> {

  ms: number;
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
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
      this.reject = (reason?: any) => {
        clearTimeout(timeoutId);
        reject(reason);
      };
    });
  }
}

export interface Task<T> {
  datum: T;
  deferred: TimedDeferred<void>;
  worker: Worker;
}

interface WorkerPoolConfig<T> {
  limit: number;
  timeout: number;
  prepare: (worker: Worker) => void;
  process: (task: Task<T>) => void;
  onTimeout: (task: Task<T>) => void;
}

export default class WorkerPool<T> {

  path: string;
  config: WorkerPoolConfig<T>;
  queue: T[];
  tasks: Task<T>[];

  constructor(path: string, config: WorkerPoolConfig<T>) {
    this.path = path;
    this.config = config;
    this.queue = [];
    this.tasks = [];
  }

  enqueue(data: T[]) {
    this.queue = this.queue.concat(data);
    this.processQueue();
  }

  processQueue(completedTask?: Task<T>) {
    const datum = this.queue.shift();
    if (!datum) {
      return;
    }
    let worker: Worker;
    if (!completedTask) {
      if (this.tasks.length >= this.config.limit) {
        return;
      }
      worker = new Worker(this.path);
      this.config.prepare(worker);
    } else {
      worker = completedTask.worker;
    }
    const deferred = new TimedDeferred<void>(this.config.timeout);
    const task: Task<T> = { datum, worker, deferred };
    deferred.promise.then(() => {
      const taskIndex = this.tasks.indexOf(task);
      if (taskIndex > -1) {
        this.tasks.splice(taskIndex, 1);
      }
      this.processQueue(task);
    }).catch(() => this.handleFailedTask(task));
    deferred.onTimeout = () => this.config.onTimeout(task);
    this.tasks.push(task);
    this.config.process(task);
    this.processQueue();
  }

  handleFailedTask(task: Task<T>) {
    const taskIndex = this.tasks.indexOf(task);
    if (taskIndex > -1) {
      this.tasks.splice(taskIndex, 1);
    }
    task.worker.terminate();
    this.processQueue();
  }

  killAll() {
    this.queue = [];
    [ ...this.tasks ].forEach(task => task.deferred.reject());
  }
}
