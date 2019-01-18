import TimedDeferred from 'lib/TimedDeferred';

export interface Thread<T> {
  datum: T;
  deferred: TimedDeferred<void>;
  worker: Worker;
}

interface ThreadPoolConfig<T> {
  limit: number;
  timeout: number;
  onThreadCreated: (thread: Thread<T>) => void;
  onThreadReady: (thread: Thread<T>) => void;
  onThreadTimeout: (thread: Thread<T>) => void;
  onQueueEmpty: () => void;
}

export default class ThreadPool<T> {

  path: string;
  config: ThreadPoolConfig<T>;
  queue: T[];
  threads: Thread<T>[];

  constructor(path: string, config: ThreadPoolConfig<T>) {
    this.path = path;
    this.config = config;
    this.queue = [];
    this.threads = [];
  }

  enqueue(data: T[]) {
    this.queue = this.queue.concat(data);
    this.processQueue();
  }

  createThread(datum: T) {
    const deferred = new TimedDeferred<void>(this.config.timeout);
    const worker = new Worker(this.path);
    const thread: Thread<T> = { datum, worker, deferred };
    this.config.onThreadCreated(thread);
    return thread;
  }

  repurposeThread(freeThread: Thread<T>, datum: T) {
    const deferred = new TimedDeferred<void>(this.config.timeout);
    const thread: Thread<T> = { datum, worker: freeThread.worker, deferred };
    return thread;
  }

  processQueue(freeThread?: Thread<T>) {
    if (!this.queue.length) {
      if (!this.threads.length) {
        this.config.onQueueEmpty();
      }
      return;
    }
    let thread: Thread<T>;
    if (!freeThread) {
      if (this.threads.length >= this.config.limit) {
        return;
      }
      const datum = this.queue.shift()!;
      thread = this.createThread(datum);
    } else {
      const datum = this.queue.shift()!;
      thread = this.repurposeThread(freeThread, datum);
    }
    thread.deferred.promise.then(() => {
      const threadIndex = this.threads.indexOf(thread);
      if (threadIndex > -1) {
        this.threads.splice(threadIndex, 1);
      }
      this.processQueue(thread);
    }).catch(() => this.handleFailedThread(thread));
    thread.deferred.onTimeout = () => this.config.onThreadTimeout(thread);
    this.threads.push(thread);
    this.config.onThreadReady(thread);
    this.processQueue();
  }

  handleFailedThread(thread: Thread<T>) {
    const threadIndex = this.threads.indexOf(thread);
    if (threadIndex > -1) {
      this.threads.splice(threadIndex, 1);
    }
    thread.worker.terminate();
    this.processQueue();
  }

  killAll() {
    this.queue = [];
    [ ...this.threads ].forEach(thread => thread.deferred.reject());
  }
}
