/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types.d.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface RequestConfig {
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

    export interface Response<T = any> {
        data                    : T
        status                  : number
        statusText              : string
        headers                 : Headers
        config                  : RequestConfig
    }

    export interface HttpError extends Error {
        config                  : RequestConfig
        response?               : Response
        status?                 : number
    }

    export interface Interceptor<T> {
        onFulfilled?            : (value: T) => T | Promise<T>
        onRejected?             : (error: any) => any
    }

    export interface RetryConfig {
        retries?                : number
        retryDelay?             : number | ((attempt: number) => number)
        retryCondition?         : (error: HttpError) => boolean
    }

    export interface CacheConfig {
        enabled?                : boolean
        ttl?                    : number // Time to live in milliseconds
        key?                    : (config: RequestConfig) => string
    }

    export interface QueryOptions<T> extends RequestConfig {
        enabled?                : boolean | Signal<boolean>
        refetchOnWindowFocus?   : boolean
        refetchInterval?        : number
        staleTime?              : number
        cacheTime?              : number
        retry?                  : RetryConfig
        onSuccess?              : (data: T) => void
        onError?                : (error: HttpError) => void
    }

    export interface QueryResult<T> {
        data                    : Signal<T | null>
        error                   : Signal<HttpError | null>
        isLoading               : Signal<boolean>
        isError                 : Signal<boolean>
        isSuccess               : Signal<boolean>
        refetch                 : () => Promise<void>
    }

    export interface MutationOptions<T, V> {
        onSuccess?              : (data: T, variables: V) => void
        onError?                : (error: HttpError, variables: V) => void
        onMutate?               : (variables: V) => void
    }

    export interface MutationResult<T, V> {
        data                    : Signal<T | null>
        error                   : Signal<HttpError | null>
        isLoading               : Signal<boolean>
        mutate                  : (variables: V) => Promise<T>
        reset                   : () => void
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝