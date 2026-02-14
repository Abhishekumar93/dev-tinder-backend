interface IMessageInResponse {
  message: string;
}
export interface IApiResponse<T> extends IMessageInResponse {
  data?: T;
}

export interface IApiListResponse<T> extends IMessageInResponse {
  data?: {
    count: number;
    records: T;
  };
}
