// (C) 2019-2021 GoodData Corporation

/**
 * Defines authentication provider to use when instance of IAnalyticalBackend discovers that
 * the current session is not authentication.
 *
 * @public
 */
export interface IAuthenticationProvider {
    /**
     * Optionally perform custom initialization of the client that the Analytical Backend uses to communicate
     * with the server.
     *
     * If implemented, this function WILL BE called by the backend every time a new instance of API client
     * is created.
     *
     * Note: the configuration and construction of Analytical Backend instance is cumulative. Backend implementations
     * MAY create multiple instances of clients during construction.
     *
     * @param client - an instance of client
     */
    initializeClient?(client: any): void;

    /**
     * Perform authentication.
     *
     * @param context - context in which the authentication is done
     */
    authenticate(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal>;

    /**
     * Returns the currently authenticated principal, or undefined if not authenticated.
     * Does not trigger authentication if no principal is available.
     */
    getCurrentPrincipal(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal | null>;

    /**
     * Clear existing authentication.
     *
     * @param context - context in which the authentication is done
     */
    deauthenticate(context: IAuthenticationContext): Promise<void>;
}

/**
 * Describes context in which the authentication is done. To cater for custom authentication schemes.
 * the API client of the underlying backend IS exposed anonymously to the provider - the provider SHOULD use
 * the provided API client to exercise any backend-specific authentication mechanisms.
 *
 * @public
 */
export interface IAuthenticationContext {
    /**
     * API client used to communicate with the backend - this can be used to perform any backend-specific,
     * non-standard authentication.
     */
    client: any;
}

/**
 * Describes user, which is currently authenticated to the backend.
 *
 * @public
 */
export interface IAuthenticatedPrincipal {
    /**
     * Unique identifier of the authenticated user. The identifier semantics MAY differ between backend
     * implementations. The client code SHOULD NOT make assumptions on the content (such as userId being
     * valid email and so on).
     */
    userId: string;

    /**
     * Backend-specific user metadata.
     */
    userMeta?: any;
}
