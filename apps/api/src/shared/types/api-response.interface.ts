export interface ApiResponse<T = void> {
  status: 'success';
  data?: T;
  message?: string;
}
