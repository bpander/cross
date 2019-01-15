
interface Executor<T> {
  (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void): void;
}

const timeLimit = <T>(executor: Executor<T>, ms: number) => {
  return new Promise<T | undefined>((resolve, reject) => {
    const timeoutId = setTimeout(resolve, ms);
    const wrappedResolve = (value?: T | PromiseLike<T>) => {
      clearTimeout(timeoutId);
      resolve(value);
    };
    const wrappedReject = (reason?: any) => {
      clearTimeout(timeoutId);
      reject(reason);
    };
    executor(wrappedResolve, wrappedReject);
  });
};

export default timeLimit;
