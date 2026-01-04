/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types.d.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    interface RequestConfig {
        method?                 : 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
        url                     : string
        params?                 : Record<string, any>
        data?                   : any
        headers?                : Record<string, string>
        timeout?                : number
        baseURL?                : string
        withCredentials?        : boolean
        responseType?           : 'json' | 'text' | 'blob' | 'arraybuffer'
        signal?                 : AbortSignal
        onUploadProgress?       : (progress: ProgressEvent) => void
        onDownloadProgress?     : (progress: ProgressEvent) => void
    }

    interface Response<T = any> {
        data                    : T
        status                  : number
        statusText              : string
        headers                 : Headers
        config                  : RequestConfig
    }

    interface HttpError extends Error {
        config                  : RequestConfig
        response?               : Response
        status?                 : number
    }

    interface Interceptor<T> {
        onFulfilled?            : (value: T) => T | Promise<T>
        onRejected?             : (error: any) => any
    }

    interface RetryConfig {
        retries?                : number
        retryDelay?             : number | ((attempt: number) => number)
        retryCondition?         : (error: HttpError) => boolean
    }

    interface QueryOptions<T> extends RequestConfig {
        enabled?                : boolean | Signal<boolean>
        refetchOnWindowFocus?   : boolean
        refetchInterval?        : number
        staleTime?              : number
        cacheTime?              : number
        retry?                  : RetryConfig
        onSuccess?              : (data: T) => void
        onError?                : (error: HttpError) => void
    }

    interface QueryResult<T> {
        data                    : Signal<T | null>
        error                   : Signal<HttpError | null>
        isLoading               : Signal<boolean>
        isError                 : Signal<boolean>
        isSuccess               : Signal<boolean>
        refetch                 : () => Promise<void>
    }

    interface MutationOptions<T, V> {
        onSuccess?              : (data: T, variables: V) => void
        onError?                : (error: HttpError, variables: V) => void
        onMutate?               : (variables: V) => void
    }

    interface MutationResult<T, V> {
        data                    : Signal<T | null>
        error                   : Signal<HttpError | null>
        isLoading               : Signal<boolean>
        mutate                  : (variables: V) => Promise<T>
        reset                   : () => void
    }

declare class HttpClient {
    private config;
    private requestInterceptors;
    private responseInterceptors;
    private cache;
    constructor(config?: Partial<RequestConfig>);
    /**
     * Set default config
     */
    setConfig(config: Partial<RequestConfig>): void;
    /**
     * Add request interceptor
     */
    interceptRequest(interceptor: Interceptor<RequestConfig>): () => void;
    /**
     * Add response interceptor
     */
    interceptResponse(interceptor: Interceptor<Response<any>>): () => void;
    /**
     * Make HTTP request
     */
    request<T = any>(config: RequestConfig): Promise<Response<T>>;
    private buildURL;
    private getCacheKey;
    private createError;
    get<T = any>(url: string, config?: Partial<RequestConfig>): Promise<Response<T>>;
    post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>>;
    put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>>;
    patch<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>>;
    delete<T = any>(url: string, config?: Partial<RequestConfig>): Promise<Response<T>>;
}
declare const http: HttpClient;
/**
 * Configure global HTTP client
 */
declare function configureHttp(config: Partial<RequestConfig>): void;
declare function useQuery<T = any>(queryKey: string | string[], queryFn: () => Promise<Response<T>>, options?: Partial<QueryOptions<T>>): QueryResult<T>;
declare function useMutation<T = any, V = any>(mutationFn: (variables: V) => Promise<Response<T>>, options?: MutationOptions<T, V>): MutationResult<T, V>;
declare function retry<T>(fn: () => Promise<T>, config?: RetryConfig): Promise<T>;
declare function createAbortController(timeout?: number): AbortController;
declare const _default: {
    HttpClient: typeof HttpClient;
    http: HttpClient;
    configureHttp: typeof configureHttp;
    useQuery: typeof useQuery;
    useMutation: typeof useMutation;
    retry: typeof retry;
    createAbortController: typeof createAbortController;
};

export { HttpClient, configureHttp, createAbortController, _default as default, http, retry, useMutation, useQuery };
