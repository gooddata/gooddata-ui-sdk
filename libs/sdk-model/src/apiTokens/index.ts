// (C) 2026 GoodData Corporation

/**
 * API token of a user.
 *
 * @alpha
 */
export interface IApiToken {
    id: string;
}

/**
 * API token returned right after it is created.
 *
 * @remarks
 * The backend returns the secret only once, at creation time.
 *
 * @alpha
 */
export interface IApiTokenWithSecret extends IApiToken {
    bearerToken: string;
}
