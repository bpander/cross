
export default class WorkerPool<T> {

  path: string;
  limit: number;
  queue: T[];
  workers: Worker[];
  prepare: (worker: Worker) => void;
  process: (worker: Worker, datum: T) => Promise<void>;

  constructor(path: string, limit: number) {
    this.path = path;
    this.limit = limit;
    this.queue = [];
    this.workers = [];
    this.prepare = () => {};
    this.process = () => Promise.resolve();
  }

  enqueue(data: T[]) {
    this.queue = this.queue.concat(data);
    this.processQueue();
  }

  processQueue(freeWorker?: Worker) {
    if (!freeWorker && this.workers.length >= this.limit) {
      return;
    }
    const datum = this.queue.shift();
    if (!datum) {
      return;
    }
    let worker: Worker;
    if (freeWorker) {
      worker = freeWorker;
    } else {
      worker = new Worker(this.path);
      this.workers.push(worker);
      this.prepare(worker);
    }
    this.process(worker, datum).then(() => this.processQueue(worker));
    this.processQueue();
  }

  kill(worker: Worker) {
    const workerIndex = this.workers.indexOf(worker);
    if (workerIndex > -1) {
      this.workers.splice(workerIndex, 1);
    }
    worker.terminate();
    this.processQueue();
  }

  killAll() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.queue = [];
  }
}
