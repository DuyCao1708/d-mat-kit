import { DToastOptions } from '.';

/** Extended toast options that include an ID for managing toast lifecycle */
export type DToastOptionsWithId = DToastOptions & {
  /** Unique identifier for the toast instance. */
  id: number;
};
