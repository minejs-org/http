<!-- ╔══════════════════════════════ BEG ══════════════════════════════╗ -->

<br>
<div align="center">
    <p>
        <img src="./assets/img/logo.png" alt="logo" style="" height="60" />
    </p>
</div>

<div align="center">
    <img src="https://img.shields.io/badge/v-0.0.2-black"/>
    <img src="https://img.shields.io/badge/🔥-@minejs-black"/>
    <br>
    <img src="https://img.shields.io/badge/coverage-99.14%25-brightgreen" alt="Test Coverage" />
    <img src="https://img.shields.io/github/issues/minejs-org/http?style=flat" alt="Github Repo Issues" />
    <img src="https://img.shields.io/github/stars/minejs-org/http?style=social" alt="GitHub Repo stars" />
</div>
<br>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ DOC ══════════════════════════════╗ -->

- ## Quick Start 🔥

    > **_Lightweight HTTP client with interceptors, caching, and reactive data fetching._**

    - ### Setup

        > install [`space`](https://github.com/solution-lib/space) first.

        ```bash
        space i @minejs/http
        ```

    <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

    - ### Usage

        ```ts
        import { HttpClient, http, configureHttp, useQuery, useMutation, retry, createAbortController } from '@minejs/http'
        ```

        - ### 1. Basic HTTP Requests

            ```typescript
            import { http } from '@minejs/http'

            // GET request
            const response = await http.get('/api/users')
            console.log(response.data)

            // POST request
            const created = await http.post('/api/users', { name: 'John' })
            console.log(created.data)

            // PUT, PATCH, DELETE
            await http.put('/api/users/1',   { name: 'Jane' })
            await http.patch('/api/users/1', { age: 30 })
            await http.delete('/api/users/1')
            ```

        - ### 2. Configuration & Base URL

            ```typescript
            import { configureHttp, http } from '@minejs/http'

            // Configure global HTTP client
            configureHttp({
                baseURL: 'https://api.example.com',
                headers: { 'Authorization': 'Bearer token' },
                timeout: 5000
            })

            // Or create custom instance
            const client = new HttpClient({
                baseURL: 'https://api.example.com'
            })

            const response = await client.get('/users')
            ```

        - ### 3. Request & Response Interceptors

            ```typescript
            import { http } from '@minejs/http'

            // Add request interceptor
            http.interceptRequest({
                onFulfilled: (config) => {
                    config.headers = {
                        ...config.headers,
                        'X-Request-ID': crypto.randomUUID()
                    }
                    return config
                }
            })

            // Add response interceptor
            http.interceptResponse({
                onFulfilled: (response) => {
                    console.log('Response received:', response.status)
                    return response
                },
                onRejected: (error) => {
                    console.error('Request failed:', error.message)
                    throw error
                }
            })
            ```

        - ### 4. useQuery Hook (React Query-like)

            ```typescript
            import { useQuery } from '@minejs/http'

            const { data, error, isLoading, refetch } = useQuery(
                'users',
                () => http.get('/api/users'),
                {
                    enabled: true,
                    refetchOnWindowFocus: true,
                    refetchInterval: 30000 // Refetch every 30s
                }
            )

            console.log(data())        // Signal<User[] | null>
            console.log(isLoading())   // Signal<boolean>
            console.log(error())       // Signal<HttpError | null>
            ```

        - ### 5. useMutation Hook

            ```typescript
            import { useMutation } from '@minejs/http'

            const { mutate, data, error, isLoading, reset } = useMutation(
                (user) => http.post('/api/users', user),
                {
                    onSuccess: (data) => {
                        console.log('User created:', data)
                    },
                    onError: (error) => {
                        console.error('Failed to create user:', error)
                    }
                }
            )

            // Create user
            await mutate({ name: 'John', email: 'john@example.com' })

            // Reset mutation state
            reset()
            ```

        - ### 6. Retry Utility

            ```typescript
            import { retry } from '@minejs/http'

            const response = await retry(
                () => http.get('/api/data'),
                {
                    retries         : 3,
                    retryDelay      : (attempt) => Math.min(1000 * 2 ** attempt, 30000),
                    retryCondition  : (error) => error.status >= 500
                }
            )
            ```

        - ### 7. Abort Controller & Cancellation

            ```typescript
            import { createAbortController } from '@minejs/http'

            // Create abort controller with timeout
            const controller = createAbortController(5000)

            try {
                const response = await http.get('/api/long-running', {
                    signal: controller.signal
                })
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Request was cancelled')
                }
            }
            ```

    <br>

- ## API Reference 🔥

    - #### `HttpClient`
        > Core HTTP client class for making requests.

        ```typescript
        class HttpClient {
            constructor(config?: Partial<RequestConfig>)

            // Configuration
            setConfig(config: Partial<RequestConfig>): void

            // Interceptors
            interceptRequest(interceptor: Interceptor<RequestConfig>): () => void
            interceptResponse(interceptor: Interceptor<Response>): () => void

            // Request methods
            request<T>(config: RequestConfig): Promise<Response<T>>
            get<T>(url: string, config?: Partial<RequestConfig>): Promise<Response<T>>
            post<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>>
            put<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>>
            patch<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>>
            delete<T>(url: string, config?: Partial<RequestConfig>): Promise<Response<T>>
        }
        ```

    - #### `http` (Singleton)

        > Pre-configured global HTTP client instance.

        ```typescript
        import { http } from '@minejs/http'

        // Use directly
        await http.get('/api/users')
        await http.post('/api/users', { name: 'John' })
        ```

    - #### `configureHttp<T>(config: Partial<RequestConfig>): void`

        > Configure global HTTP client with default settings.

        ```typescript
        configureHttp({
            baseURL: 'https://api.example.com',
            headers: { 'Authorization': 'Bearer token' },
            timeout: 5000,
            withCredentials: true
        })
        ```

    - #### `useQuery<T>(queryKey: string | string[], queryFn: () => Promise<Response<T>>, options?: Partial<QueryOptions<T>>): QueryResult<T>`

        > Create a reactive query with automatic caching and refetching.

        ```typescript
        interface QueryResult<T> {
            data: Signal<T | null>
            error: Signal<HttpError | null>
            isLoading: Signal<boolean>
            isError: Signal<boolean>
            isSuccess: Signal<boolean>
            refetch: () => Promise<void>
        }

        interface QueryOptions<T> {
            enabled?: boolean | Signal<boolean>
            refetchOnWindowFocus?: boolean
            refetchInterval?: number
            staleTime?: number
            cacheTime?: number
            retry?: RetryConfig
            onSuccess?: (data: T) => void
            onError?: (error: HttpError) => void
        }

        const { data, isLoading, error, refetch } = useQuery(
            'users',
            () => http.get<User[]>('/api/users'),
            { refetchInterval: 30000 }
        )
        ```

    - #### `useMutation<T, V>(mutationFn: (variables: V) => Promise<Response<T>>, options?: MutationOptions<T, V>): MutationResult<T, V>`

        > Create a reactive mutation for create/update/delete operations.

        ```typescript
        interface MutationResult<T, V> {
            data: Signal<T | null>
            error: Signal<HttpError | null>
            isLoading: Signal<boolean>
            mutate: (variables: V) => Promise<T>
            reset: () => void
        }

        interface MutationOptions<T, V> {
            onSuccess?: (data: T, variables: V) => void
            onError?: (error: HttpError, variables: V) => void
            onMutate?: (variables: V) => void
        }

        const { mutate, data, isLoading } = useMutation(
            (user) => http.post<User>('/api/users', user),
            { onSuccess: (user) => console.log('Created:', user) }
        )

        await mutate({ name: 'John', email: 'john@example.com' })
        ```

    - #### `retry<T>(fn: () => Promise<T>, config?: RetryConfig): Promise<T>`

        > Retry a promise-returning function with exponential backoff.

        ```typescript
        interface RetryConfig {
            retries?: number                           // Default: 3
            retryDelay?: number | ((attempt: number) => number)
            retryCondition?: (error: HttpError) => boolean
        }

        const data = await retry(
            () => http.get('/api/data'),
            {
                retries: 5,
                retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
                retryCondition: (error) => error.status >= 500
            }
        )
        ```

    - #### `createAbortController(timeout?: number): AbortController`

        > Create an AbortController with optional timeout.

        ```typescript
        // Without timeout
        const controller = createAbortController()

        // With 5 second timeout
        const controller = createAbortController(5000)

        // Use with request
        await http.get('/api/data', {
            signal: controller.signal
        })

        // Manually abort
        controller.abort()
        ```

    - #### `RequestConfig`

        > Configuration object for HTTP requests.

        ```typescript
        interface RequestConfig {
            method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
            url: string
            params?: Record<string, any>           // Query parameters
            data?: any                             // Request body
            headers?: Record<string, string>       // HTTP headers
            timeout?: number                       // Request timeout in ms
            baseURL?: string                       // Base URL prepended to url
            withCredentials?: boolean              // Include credentials in request
            responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
            signal?: AbortSignal                   // Abort signal for cancellation
            onUploadProgress?: (progress: ProgressEvent) => void
            onDownloadProgress?: (progress: ProgressEvent) => void
        }
        ```

    - #### `Response<T>`

        > HTTP response object.

        ```typescript
        interface Response<T = any> {
            data: T                          // Response body
            status: number                   // HTTP status code
            statusText: string               // HTTP status text
            headers: Headers                 // Response headers
            config: RequestConfig            // Original request config
        }
        ```

    - #### `HttpError`

        > HTTP error object.

        ```typescript
        interface HttpError extends Error {
            config: RequestConfig            // Request config that caused the error
            response?: Response               // Response from server
            status?: number                  // HTTP status code
        }
        ```

    - #### `Interceptor<T>`

        > Request/response interceptor configuration.

        ```typescript
        interface Interceptor<T> {
            onFulfilled?: (value: T) => T | Promise<T>
            onRejected?: (error: any) => any
        }

        // Request interceptor
        http.interceptRequest({
            onFulfilled: (config) => {
                config.headers = { ...config.headers, 'X-Custom': 'value' }
                return config
            },
            onRejected: (error) => {
                console.error('Request error:', error)
                throw error
            }
        })

        // Response interceptor
        http.interceptResponse({
            onFulfilled: (response) => {
                console.log('Success:', response.status)
                return response
            },
            onRejected: (error) => {
                if (error.status === 401) {
                    // Handle auth error
                }
                throw error
            }
        })
        ```

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ END ══════════════════════════════╗ -->

- ## Real-World Examples

  - #### Fetching User Data with Query

    ```typescript
    import { useQuery } from '@minejs/http'
    import { computed } from '@minejs/signals'

    // Fetch users
    const { data: users, isLoading, error } = useQuery(
        'users',
        () => http.get<User[]>('/api/users'),
        { refetchInterval: 30000 }
    )

    // Transform data
    const userCount = computed(() => users()?.length ?? 0)
    const adminUsers = computed(() =>
        users()?.filter(u => u.role === 'admin') ?? []
    )
    ```

  - #### Creating a Resource with Mutation

    ```typescript
    import { useMutation } from '@minejs/http'

    interface CreateUserInput {
        name: string
        email: string
        password: string
    }

    const { mutate: createUser, isLoading, error } = useMutation(
        (input: CreateUserInput) =>
            http.post<User>('/api/users', input),
        {
            onSuccess: (user) => {
                console.log('User created:', user)
                // Refetch user list
                users.refetch()
            },
            onError: (error) => {
                console.error('Failed to create user:', error.message)
            }
        }
    )

    // Create user
    const handleCreate = async (formData: CreateUserInput) => {
        await createUser(formData)
    }
    ```

  - #### Multiple Requests with Interceptors

    ```typescript
    import { http, configureHttp } from '@minejs/http'

    // Setup global config
    configureHttp({
        baseURL: 'https://api.example.com',
        headers: { 'Content-Type': 'application/json' }
    })

    // Add auth header to all requests
    http.interceptRequest({
        onFulfilled: (config) => {
            const token = localStorage.getItem('auth_token')
            if (token) {
                config.headers = {
                    ...config.headers,
                    'Authorization': `Bearer ${token}`
                }
            }
            return config
        }
    })

    // Handle auth errors
    http.interceptResponse({
        onRejected: (error) => {
            if (error.status === 401) {
                localStorage.removeItem('auth_token')
                window.location.href = '/login'
            }
            throw error
        }
    })

    // Now all requests have auth header automatically
    const users = await http.get('/users')
    const posts = await http.get('/posts')
    ```

  - #### Retry Failed Requests

    ```typescript
    import { retry, http } from '@minejs/http'

    // Retry with exponential backoff
    const data = await retry(
        () => http.get('/api/data'),
        {
            retries: 5,
            retryDelay: (attempt) => {
                // 1s, 2s, 4s, 8s, 16s
                return Math.min(1000 * Math.pow(2, attempt), 30000)
            },
            retryCondition: (error) => {
                // Only retry on server errors or timeout
                return error.status >= 500 || !error.status
            }
        }
    )
    ```

  - #### Timeout & Cancellation

    ```typescript
    import { http, createAbortController } from '@minejs/http'

    // Auto timeout after 5 seconds
    try {
        const response = await http.get('/api/long-running', {
            signal: createAbortController(5000).signal
        })
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.log('Request timed out')
        }
    }

    // Manual cancellation
    const controller = createAbortController()

    const promise = http.get('/api/stream', {
        signal: controller.signal
    })

    // Cancel after 10 seconds
    setTimeout(() => controller.abort(), 10000)

    try {
        const response = await promise
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.log('Request was cancelled')
        }
    }
    ```

  - #### Form Submission with Error Handling

    ```typescript
    import { useMutation } from '@minejs/http'
    import { signal } from '@minejs/signals'

    interface FormData {
        email: string
        password: string
    }

    const formData = signal<FormData>({ email: '', password: '' })
    const { mutate: login, isLoading, error } = useMutation(
        (data: FormData) => http.post<{ token: string }>('/api/login', data),
        {
            onSuccess: (response) => {
                localStorage.setItem('auth_token', response.token)
                window.location.href = '/dashboard'
            },
            onError: (error) => {
                console.error('Login failed:', error.message)
            }
        }
    )

    const handleSubmit = async (e: Event) => {
        e.preventDefault()
        await login(formData())
    }
    ```

  - #### Polling Data with Interval

    ```typescript
    import { useQuery } from '@minejs/http'

    // Refetch data every 5 seconds
    const { data: stats, isLoading } = useQuery(
        'stats',
        () => http.get('/api/stats'),
        {
            refetchInterval: 5000,
            refetchOnWindowFocus: false
        }
    )

    // Display updating stats
    console.log('Current stats:', stats())
    console.log('Loading:', isLoading())
    ```

<br>

---

<div align="center">
    <a href="https://github.com/maysara-elshewehy"><img src="https://img.shields.io/badge/by-Maysara-black"/></a>
</div>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->
