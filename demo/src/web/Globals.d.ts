declare namespace ipc {
  function invoke(channel: string, ...args: any[]): Promise<any>;
  function on(channel: string, listener: (...args: any[]) => void): () => void;
}
