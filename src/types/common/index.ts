export interface ServerResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}