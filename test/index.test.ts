/* eslint-disable @typescript-eslint/no-explicit-any */
// test/main.test.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { describe, expect, test, beforeEach, mock } from 'bun:test';
    import { HttpClient, http, configureHttp, useQuery, useMutation, retry, createAbortController } from '../src';
    import * as types from '../src/types';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TEST ════════════════════════════════════════╗

    describe('@minejs/http', () => {

        describe('HttpClient', () => {
            let client: HttpClient;

            beforeEach(() => {
                client = new HttpClient();
            });

            test('should create instance with default config', () => {
                expect(client).toBeDefined();
            });

            test('should create instance with initial config', () => {
                const config: Partial<types.RequestConfig> = { baseURL: 'https://api.example.com' };
                const customClient = new HttpClient(config);
                expect(customClient).toBeDefined();
            });

            test('should set config', () => {
                const config: Partial<types.RequestConfig> = { baseURL: 'https://api.example.com' };
                client.setConfig(config);
                expect(client).toBeDefined();
            });

            test('should add and remove request interceptor', () => {
                const interceptor: types.Interceptor<types.RequestConfig> = {
                    onFulfilled: (config) => config
                };
                const unsubscribe = client.interceptRequest(interceptor);
                expect(typeof unsubscribe).toBe('function');
                unsubscribe();
            });

            test('should add and remove response interceptor', () => {
                const interceptor: types.Interceptor<types.Response<any>> = {
                    onFulfilled: (response) => response
                };
                const unsubscribe = client.interceptResponse(interceptor);
                expect(typeof unsubscribe).toBe('function');
                unsubscribe();
            });

            test('should make GET request successfully', async () => {
                global.fetch = mock(async () => ({
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    headers: new Headers(),
                    json: async () => ({ id: 1 })
                } as any)) as any;

                const response = await client.get('https://api.example.com/apihttps://api.example.com/users');
                expect(response.status).toBe(200);
                expect(response.data).toEqual({ id: 1 });
            });

            test('should make POST request successfully', async () => {
                global.fetch = mock(async () => ({
                    ok: true,
                    status: 201,
                    statusText: 'Created',
                    headers: new Headers(),
                    json: async () => ({ id: 1, name: 'John' })
                } as any)) as any;

                const response = await client.post('https://api.example.com/apihttps://api.example.com/users', { name: 'John' });
                expect(response.status).toBe(201);
                expect(response.data).toEqual({ id: 1, name: 'John' });
            });

            test('should make PUT request successfully', async () => {
                global.fetch = mock(async () => ({
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    headers: new Headers(),
                    json: async () => ({ id: 1, name: 'Jane' })
                } as any)) as any;

                const response = await client.put('https://api.example.com/apihttps://api.example.com/users/1', { name: 'Jane' });
                expect(response.status).toBe(200);
                expect(response.data).toEqual({ id: 1, name: 'Jane' });
            });

            test('should make PATCH request successfully', async () => {
                global.fetch = mock(async () => ({
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    headers: new Headers(),
                    json: async () => ({ id: 1, name: 'Janet' })
                } as any)) as any;

                const response = await client.patch('https://api.example.com/apihttps://api.example.com/users/1', { name: 'Janet' });
                expect(response.status).toBe(200);
                expect(response.data).toEqual({ id: 1, name: 'Janet' });
            });

            test('should make DELETE request successfully', async () => {
                global.fetch = mock(async () => ({
                    ok: true,
                    status: 204,
                    statusText: 'No Content',
                    headers: new Headers(),
                    json: async () => ({})
                } as any)) as any;

                const response = await client.delete('https://api.example.com/apihttps://api.example.com/users/1');
                expect(response.status).toBe(204);
            });

            test('should build URL with base URL', async () => {
                const clientWithBase = new HttpClient({ baseURL: 'https://api.example.com' });

                global.fetch = mock(async () => ({
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    headers: new Headers(),
                    json: async () => ({})
                } as any)) as any;

                await clientWithBase.get('/users');
                const callArgs = (global.fetch as any).mock.calls[0];
                const request = callArgs[0];
                expect(request.url).toContain('https://api.example.com/users');
            });

            test('should build URL with query params', async () => {
                global.fetch = mock(async () => ({
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    headers: new Headers(),
                    json: async () => ({})
                } as any)) as any;

                await client.get('https://api.example.com/users', { params: { page: 1, limit: 10 } });
                const callArgs = (global.fetch as any).mock.calls[0];
                const request = callArgs[0];
                expect(request.url).toContain('page=1');
                expect(request.url).toContain('limit=10');
            });

            test('should handle response types', async () => {
                global.fetch = mock(async () => ({
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    headers: new Headers(),
                    text: async () => 'text content'
                } as any)) as any;

                const response = await client.request({ url: 'https://api.example.com/api/text', responseType: 'text' });
                expect(response.data).toBe('text content');
            });

            test('should handle error responses', async () => {
                global.fetch = mock(async () => ({
                    ok: false,
                    status: 404,
                    statusText: 'Not Found',
                    headers: new Headers(),
                    json: async () => ({ error: 'Not found' })
                } as any)) as any;

                let errorThrown = false;
                try {
                    await client.get('https://api.example.com/api/notfound');
                } catch (error: any) {
                    errorThrown = true;
                    expect(error.message).toContain('404');
                }
                expect(errorThrown).toBe(true);
            });

            test('should run request interceptors', async () => {
                let interceptorCalled = false;

                const interceptor: types.Interceptor<types.RequestConfig> = {
                    onFulfilled: (config) => {
                        interceptorCalled = true;
                        return config;
                    }
                };

                client.interceptRequest(interceptor);

                global.fetch = mock(async () => ({
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    headers: new Headers(),
                    json: async () => ({})
                } as any)) as any;

                await client.get('https://api.example.com/api/test');
                expect(interceptorCalled).toBe(true);
            });

            test('should run response interceptors', async () => {
                let interceptorCalled = false;

                const interceptor: types.Interceptor<types.Response<any>> = {
                    onFulfilled: (response) => {
                        interceptorCalled = true;
                        return response;
                    }
                };

                client.interceptResponse(interceptor);

                global.fetch = mock(async () => ({
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    headers: new Headers(),
                    json: async () => ({ test: 'data' })
                } as any)) as any;

                await client.get('https://api.example.com/api/test');
                expect(interceptorCalled).toBe(true);
            });

            test('should cache responses', async () => {
                global.fetch = mock(async () => ({
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    headers: new Headers(),
                    json: async () => ({ cached: true })
                } as any)) as any;

                const client2 = new HttpClient({ timeout: 5000 });
                await client2.get('https://api.example.com/api/cached');
                const callCount1 = (global.fetch as any).mock.calls.length;

                await client2.get('https://api.example.com/api/cached');
                const callCount2 = (global.fetch as any).mock.calls.length;

                expect(callCount2).toBe(callCount1);
            });

            test('should handle response error interceptors', async () => {
                global.fetch = mock(async () => ({
                    ok: false,
                    status: 500,
                    statusText: 'Internal Server Error',
                    headers: new Headers(),
                    json: async () => ({})
                } as any)) as any;

                const interceptor: types.Interceptor<types.Response<any>> = {
                    onRejected: (error) => {
                        return error;
                    }
                };

                client.interceptResponse(interceptor);

                let errorCaught = false;
                try {
                    await client.get('https://api.example.com/api/error');
                } catch {
                    errorCaught = true;
                }
                expect(errorCaught).toBe(true);
            });
        });

        describe('useQuery', () => {
            test('should create query result with signals', () => {
                const queryFn = async () => ({
                    data: { id: 1 },
                    status: 200,
                    statusText: 'OK',
                    headers: new Headers(),
                    config: {}
                } as any);

                const result = useQuery('users', queryFn);

                expect(result.data).toBeDefined();
                expect(result.error).toBeDefined();
                expect(result.isLoading).toBeDefined();
                expect(result.isError).toBeDefined();
                expect(result.isSuccess).toBeDefined();
                expect(typeof result.refetch).toBe('function');
            });

            test('should disable query when enabled is false', () => {
                const queryFn = async () => ({
                    data: { id: 1 },
                    status: 200,
                    statusText: 'OK',
                    headers: new Headers(),
                    config: {}
                } as any);

                const result = useQuery('users', queryFn, { enabled: false });
                expect(result.data()).toBeNull();
            });

            test('should have refetch method', () => {
                const queryFn = async () => ({
                    data: { id: 1 },
                    status: 200,
                    statusText: 'OK',
                    headers: new Headers(),
                    config: {}
                } as any);

                const result = useQuery('users', queryFn);
                expect(typeof result.refetch).toBe('function');
            });
        });

        describe('useMutation', () => {
            test('should create mutation result with signals', () => {
                const mutationFn = async (variables: any) => ({
                    data: variables,
                    status: 201,
                    statusText: 'Created',
                    headers: new Headers(),
                    config: {}
                } as any);

                const result = useMutation(mutationFn);

                expect(result.data).toBeDefined();
                expect(result.error).toBeDefined();
                expect(result.isLoading).toBeDefined();
                expect(typeof result.mutate).toBe('function');
                expect(typeof result.reset).toBe('function');
            });

            test('should mutate with variables', async () => {
                const mutationFn = async (variables: any) => ({
                    data: { ...variables, id: 1 },
                    status: 201,
                    statusText: 'Created',
                    headers: new Headers(),
                    config: {}
                } as any);

                const result = useMutation(mutationFn);
                const response = await result.mutate({ name: 'John' });

                expect(response).toEqual({ name: 'John', id: 1 });
            });

            test('should handle mutation errors', async () => {
                const mutationFn = async () => {
                    throw new Error('Mutation failed') as any;
                };

                const result = useMutation(mutationFn);

                let errorCaught = false;
                try {
                    await result.mutate({});
                } catch {
                    errorCaught = true;
                }
                expect(errorCaught).toBe(true);
            });

            test('should reset mutation state', async () => {
                const mutationFn = async (variables: any) => ({
                    data: variables,
                    status: 201,
                    statusText: 'Created',
                    headers: new Headers(),
                    config: {}
                } as any);

                const result = useMutation(mutationFn);
                await result.mutate({ test: 'data' });

                result.reset();
                expect(result.data()).toBeNull();
                expect(result.error()).toBeNull();
                expect(result.isLoading()).toBe(false);
            });

            test('should call onSuccess callback', async () => {
                let successCalled = false;
                const successCallback = (_data: any) => {
                    successCalled = true;
                };

                const mutationFn = async (variables: any) => ({
                    data: variables,
                    status: 201,
                    statusText: 'Created',
                    headers: new Headers(),
                    config: {}
                } as any);

                const result = useMutation(mutationFn, { onSuccess: successCallback });
                await result.mutate({});

                expect(successCalled).toBe(true);
            });

            test('should call onError callback', async () => {
                let errorCalled = false;
                const errorCallback = (_error: any) => {
                    errorCalled = true;
                };

                const mutationFn = async () => {
                    throw new Error('Failed') as any;
                };

                const result = useMutation(mutationFn, { onError: errorCallback });

                try {
                    await result.mutate({});
                } catch {
                    // Expected
                }

                expect(errorCalled).toBe(true);
            });

            test('should call onMutate callback', async () => {
                let mutateCalled = false;
                const mutateCallback = (_variables: any) => {
                    mutateCalled = true;
                };

                const mutationFn = async (variables: any) => ({
                    data: variables,
                    status: 201,
                    statusText: 'Created',
                    headers: new Headers(),
                    config: {}
                } as any);

                const result = useMutation(mutationFn, { onMutate: mutateCallback });
                await result.mutate({ test: 'data' });

                expect(mutateCalled).toBe(true);
            });
        });

        describe('retry', () => {
            test('should retry on failure', async () => {
                let attempts = 0;

                const fn = async () => {
                    attempts++;
                    if (attempts < 2) throw new Error('First attempt failed');
                    return 'success';
                };

                const result = await retry(fn, { retries: 3 });
                expect(result).toBe('success');
                expect(attempts).toBe(2);
            });

            test('should use default retry configuration', async () => {
                let attempts = 0;

                const fn = async () => {
                    attempts++;
                    if (attempts < 2) throw new Error('Retry');
                    return 'success';
                };

                const result = await retry(fn);
                expect(result).toBe('success');
            });

            test('should throw after max retries exceeded', async () => {
                let attempts = 0;

                const fn = async () => {
                    attempts++;
                    throw new Error('Always fails');
                };

                let errorThrown = false;
                try {
                    await retry(fn, { retries: 2 });
                } catch {
                    errorThrown = true;
                }

                expect(errorThrown).toBe(true);
                expect(attempts).toBe(3);
            });

            test('should use custom retry delay function', async () => {
                let attempts = 0;

                const fn = async () => {
                    attempts++;
                    if (attempts < 2) throw new Error('Retry');
                    return 'success';
                };

                const result = await retry(fn, {
                    retries: 3,
                    retryDelay: (attempt) => 10 * attempt
                });

                expect(result).toBe('success');
            });

            test('should use fixed retry delay', async () => {
                let attempts = 0;

                const fn = async () => {
                    attempts++;
                    if (attempts < 2) throw new Error('Retry');
                    return 'success';
                };

                const result = await retry(fn, {
                    retries: 3,
                    retryDelay: 50
                });

                expect(result).toBe('success');
            });

            test('should respect retry condition', async () => {
                let attempts = 0;

                const fn = async () => {
                    attempts++;
                    throw new Error('Always fails');
                };

                let errorThrown = false;
                try {
                    await retry(fn, {
                        retries: 3,
                        retryCondition: () => false
                    });
                } catch {
                    errorThrown = true;
                }

                expect(errorThrown).toBe(true);
                expect(attempts).toBe(1);
            });
        });

        describe('createAbortController', () => {
            test('should create abort controller without timeout', () => {
                const controller = createAbortController();
                expect(controller).toBeDefined();
                expect(controller.signal).toBeDefined();
            });

            test('should create abort controller with timeout', () => {
                const controller = createAbortController(100);
                expect(controller).toBeDefined();
                expect(controller.signal).toBeDefined();
            });
        });

        describe('configureHttp', () => {
            test('should configure global http client', () => {
                configureHttp({ baseURL: 'https://api.example.com' });
                expect(http).toBeDefined();
            });
        });

        describe('http singleton', () => {
            test('should be accessible as singleton', () => {
                expect(http).toBeDefined();
                expect(http.get).toBeDefined();
                expect(http.post).toBeDefined();
                expect(http.put).toBeDefined();
                expect(http.patch).toBeDefined();
                expect(http.delete).toBeDefined();
            });
        });

    });

// ╚══════════════════════════════════════════════════════════════════════════════════════╝


