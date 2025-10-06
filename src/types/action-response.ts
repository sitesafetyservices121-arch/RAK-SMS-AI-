export type ActionResponse<T> =
  | { success: true; data: T; storagePath: string }
  | { success: false; error: string };
