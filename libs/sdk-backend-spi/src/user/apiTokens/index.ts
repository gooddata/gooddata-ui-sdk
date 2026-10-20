// (C) 2026 GoodData Corporation

import { type IApiToken, type IApiTokenWithSecret } from "@gooddata/sdk-model";

/**
 * Service for managing API tokens of the current user.
 *
 * @alpha
 */
export interface IUserApiTokensService {
    /**
     * Get all API tokens of the user. The result does not contain the token secrets.
     */
    getAll(): Promise<IApiToken[]>;

    /**
     * Create an API token.
     *
     * @param id - identifier of the new token
     * @returns the token with its secret; the secret cannot be read again later
     */
    create(id: string): Promise<IApiTokenWithSecret>;

    /**
     * Delete an API token.
     *
     * @param id - identifier of the token
     */
    delete(id: string): Promise<void>;
}
