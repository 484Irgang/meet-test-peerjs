export type PromiseFeedback<T extends object> = {
  success: boolean;
  error?: Error;
  data?: T;
};
