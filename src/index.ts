/* eslint-disable @typescript-eslint/no-explicit-any */
// src/main.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { signal, computed, effect } from '@minejs/signals';
    import * as types from './types';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class HttpClient {
        private config                  : Partial<types.RequestConfig>              = {};
        private requestInterceptors     : types.Interceptor<types.RequestConfig>[]  = [];
        private responseInterceptors    : types.Interceptor<types.Response<any>>[]  = [];
        private cache                   = new Map<string, { data: types.Response<any>; timestamp: number }>();

        constructor(config: Partial<types.RequestConfig> = {}) {
            this.config = config;
        }

        /**
         * Set default config
         */
        public setConfig(config: Partial<types.RequestConfig>): void {
            this.config = { ...this.config, ...config };
        }

        /**
         * Add request interceptor
         */
        public interceptRequest(interceptor: types.Interceptor<types.RequestConfig>): () => void {
            this.requestInterceptors.push(interceptor);
            return () => {
                const index = this.requestInterceptors.indexOf(interceptor);
                if (index > -1) this.requestInterceptors.splice(index, 1);
            };
        }

        /**
         * Add response interceptor
         */
        public interceptResponse(interceptor: types.Interceptor<types.Response<any>>): () => void {
            this.responseInterceptors.push(interceptor);
            return () => {
                const index = this.responseInterceptors.indexOf(interceptor);
                if (index > -1) this.responseInterceptors.splice(index, 1);
            };
        }

        /**
         * Make HTTP request
         */
        public async request<T = any>(config: types.RequestConfig): Promise<types.Response<T>> {
            // Merge with default config
            let mergedConfig = { ...this.config, ...config };

            // Run request interceptors
            for (const interceptor of this.requestInterceptors) {
                if (interceptor.onFulfilled) {
                    mergedConfig = await interceptor.onFulfilled(mergedConfig);
                }
            }

            try {
                // Check cache
                const cacheKey = this.getCacheKey(mergedConfig);
                const cached = this.cache.get(cacheKey);

                if (cached && Date.now() - cached.timestamp < (mergedConfig.timeout || 0)) {
                    return cached.data;
                }

                // Build URL
                const url = this.buildURL(mergedConfig);

                // Build request
                const request = new Request(url, {
                    method          : mergedConfig.method || 'GET',
                    headers         : new Headers(mergedConfig.headers || {}),
                    body            : mergedConfig.data ? JSON.stringify(mergedConfig.data) : undefined,
                    signal          : mergedConfig.signal,
                    credentials     : mergedConfig.withCredentials ? 'include' : 'same-origin'
                });

                // Make request
                const fetchResponse = await fetch(request);

                // Parse response
                let data: T;
                const responseType = mergedConfig.responseType || 'json';

                switch (responseType) {
                    case 'json':
                        data = await fetchResponse.json();
                        break;
                    case 'text':
                        data = await fetchResponse.text() as any;
                        break;
                    case 'blob':
                        data = await fetchResponse.blob() as any;
                        break;
                    case 'arraybuffer':
                        data = await fetchResponse.arrayBuffer() as any;
                        break;
                    default:
                        data = await fetchResponse.json();
                }

                // Build response
                let response: types.Response<T> = {
                    data,
                    status      : fetchResponse.status,
                    statusText  : fetchResponse.statusText,
                    headers     : fetchResponse.headers,
                    config      : mergedConfig
                };

                // Check status
                if (!fetchResponse.ok) {
                    throw this.createError(
                        `Request failed with status ${fetchResponse.status}`,
                        mergedConfig,
                        response
                    );
                }

                // Run response interceptors
                for (const interceptor of this.responseInterceptors) {
                    if (interceptor.onFulfilled) {
                        response = await interceptor.onFulfilled(response);
                    }
                }

                // Cache response
                this.cache.set(cacheKey, {
                    data        : response,
                    timestamp   : Date.now()
                });

                return response;

            } catch (error: any) {
                // Run error interceptors
                let finalError = error;

                for (const interceptor of this.responseInterceptors) {
                    if (interceptor.onRejected) {
                        finalError = await interceptor.onRejected(finalError);
                    }
                }

                throw finalError;
            }
        }

        private buildURL(config: types.RequestConfig): string {
            let url = config.url;

            // Add base URL
            if (config.baseURL) {
                url = config.baseURL + url;
            }

            // Add params
            if (config.params) {
                const params = new URLSearchParams();
                Object.entries(config.params).forEach(([key, value]) => {
                    if (value != null) {
                        params.append(key, String(value));
                    }
                });

                const query = params.toString();
                if (query) {
                    url += (url.includes('?') ? '&' : '?') + query;
                }
            }

            return url;
        }

        private getCacheKey(config: types.RequestConfig): string {
            return `${config.method || 'GET'}:${config.url}:${JSON.stringify(config.params || {})}`;
        }

        private createError(
            message: string,
            config: types.RequestConfig,
            response?: types.Response<any>
        ): types.HttpError {
            const error     = new Error(message) as types.HttpError;
            error.config    = config;
            error.response  = response;
            error.status    = response?.status;
            return error;
        }

        // ============================================================================
        // CONVENIENCE METHODS
        // ============================================================================

        public get<T = any>(url: string, config?: Partial<types.RequestConfig>): Promise<types.Response<T>> {
            return this.request<T>({ ...config, url, method: 'GET' });
        }

        public post<T = any>(url: string, data?: any, config?: Partial<types.RequestConfig>): Promise<types.Response<T>> {
            return this.request<T>({ ...config, url, data, method: 'POST' });
        }

        public put<T = any>(url: string, data?: any, config?: Partial<types.RequestConfig>): Promise<types.Response<T>> {
            return this.request<T>({ ...config, url, data, method: 'PUT' });
        }

        public patch<T = any>(url: string, data?: any, config?: Partial<types.RequestConfig>): Promise<types.Response<T>> {
            return this.request<T>({ ...config, url, data, method: 'PATCH' });
        }

        public delete<T = any>(url: string, config?: Partial<types.RequestConfig>): Promise<types.Response<T>> {
            return this.request<T>({ ...config, url, method: 'DELETE' });
        }
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ MAIN ════════════════════════════════════════╗

    export const http = new HttpClient();

    /**
     * Configure global HTTP client
     */
    export function configureHttp(config: Partial<types.RequestConfig>): void {
        http.setConfig(config);
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ HELP ════════════════════════════════════════╗

    // QUERY HOOK (like React Query / SWR)
    export function useQuery<T = any>(
        queryKey: string | string[],
        queryFn: () => Promise<types.Response<T>>,
        options: Partial<types.QueryOptions<T>> = {}
    ): types.QueryResult<T> {
        const data = signal<T | null>(null);
        const error = signal<types.HttpError | null>(null);
        const isLoading = signal(false);
        const isError = computed(() => error() !== null);
        const isSuccess = computed(() => data() !== null && error() === null);

        const enabled = typeof options.enabled === 'function'
            ? options.enabled
            : signal(options.enabled !== false);

        const fetchData = async () => {
            if (!enabled()) return;

            isLoading.set(true);
            error.set(null);

            try {
                const response = await queryFn();
                data.set(response.data);
                options.onSuccess?.(response.data);
            } catch (err) {
                const httpError = err as types.HttpError;
                error.set(httpError);
                options.onError?.(httpError);
            } finally {
                isLoading.set(false);
            }
        };

        // Initial fetch
        effect(() => {
            if (enabled()) {
                fetchData();
            }
        });

        // Refetch on window focus
        if (options.refetchOnWindowFocus) {
            window.addEventListener('focus', fetchData);
        }

        // Refetch interval
        if (options.refetchInterval) {
            setInterval(fetchData, options.refetchInterval);
        }

        return {
            data,
            error,
            isLoading,
            isError,
            isSuccess,
            refetch: fetchData
        };
    }

    // MUTATION HOOK
    export function useMutation<T = any, V = any>(
        mutationFn: (variables: V) => Promise<types.Response<T>>,
        options: types.MutationOptions<T, V> = {}
    ): types.MutationResult<T, V> {
        const data = signal<T | null>(null);
        const error = signal<types.HttpError | null>(null);
        const isLoading = signal(false);

        const mutate = async (variables: V): Promise<T> => {
            isLoading.set(true);
            error.set(null);

            options.onMutate?.(variables);

            try {
                const response = await mutationFn(variables);
                data.set(response.data);
                options.onSuccess?.(response.data, variables);
                return response.data;
            } catch (err) {
                const httpError = err as types.HttpError;
                error.set(httpError);
                options.onError?.(httpError, variables);
                throw httpError;
            } finally {
                isLoading.set(false);
            }
        };

        const reset = () => {
            data.set(null);
            error.set(null);
            isLoading.set(false);
        };

        return {
            data,
            error,
            isLoading,
            mutate,
            reset
        };
    }

    // RETRY UTILITY
    export async function retry<T>(
        fn: () => Promise<T>,
        config: types.RetryConfig = {}
    ): Promise<T> {
        const {
            retries = 3,
            retryDelay = (attempt) => Math.min(1000 * 2 ** attempt, 30000),
            retryCondition = () => true
        } = config;

        let lastError: any;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;

                if (attempt < retries && retryCondition(error as types.HttpError)) {
                    const delay = typeof retryDelay === 'function'
                        ? retryDelay(attempt)
                        : retryDelay;

                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    throw error;
                }
            }
        }

        throw lastError;
    }

    // ABORT CONTROLLER UTILITY
    export function createAbortController(timeout?: number): AbortController {
        const controller = new AbortController();

        if (timeout) {
            setTimeout(() => controller.abort(), timeout);
        }

        return controller;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export default {
        HttpClient,
        http,
        configureHttp,
        useQuery,
        useMutation,
        retry,
        createAbortController
    };

// ╚══════════════════════════════════════════════════════════════════════════════════════╝