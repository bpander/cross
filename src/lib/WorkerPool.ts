
interface QueuedAction {
  (worker: Worker): Promise<Worker>;
}

export default class WorkerPool {

  path: string;
  limit: number;
  queue: QueuedAction[];
  workers: Worker[];

  constructor(path: string, limit: number) {
    this.path = path;
    this.limit = limit;
    this.queue = [];
    this.workers = [];
  }

  enqueue(fn: QueuedAction) {
    this.queue.push(fn);
    this.processQueue();
  }

  onWorkerDone = (worker: Worker) => {
    worker.terminate();
    const workerIndex = this.workers.indexOf(worker);
    if (workerIndex !== -1) {
      this.workers.splice(workerIndex, 1);
    }
    this.processQueue();
  };

  processQueue() {
    if (this.workers.length >= this.limit) {
      return;
    }
    const fn = this.queue.shift();
    if (!fn) {
      return;
    }
    const worker = new Worker(this.path);
    this.workers.push(worker);
    fn(worker).then(this.onWorkerDone);
  }

  killAll() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.queue = [];
  }
}
