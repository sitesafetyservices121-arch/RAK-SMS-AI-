export type ActionResponse<T> =
  | {
      success: true;
      data: T;
      storagePath: string;
      fileName: string;
      downloadUrl: string;
    }
  | { success: false; error: string };
