type IApiResponse<T> = {
  message: string;
  data: T;
  error?: any;
};

export const ApiResponse: <T>(params: IApiResponse<T>) => IApiResponse<T> = <T>(
  params: IApiResponse<T>,
) => {
  return params;
};
