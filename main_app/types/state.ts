export interface BaseState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface AsyncState<T> extends BaseState {
  data: T | null;
}
