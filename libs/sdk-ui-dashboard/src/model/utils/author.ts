// (C) 2022-2025 GoodData Corporation

import { IBackendCapabilities } from "@gooddata/sdk-backend-spi";
import { IUser, isUriRef } from "@gooddata/sdk-model";

/**
 * @internal
 * Gets author from capabilities and user
 *
 * @param capabilities - backend capabilities
 * @param user - user
 */
export function getAuthor(capabilities: IBackendCapabilities, user: IUser): string | undefined {
    const isObjectUrisSupported = capabilities.supportsObjectUris ?? false;
    const userUri = isUriRef(user.ref) ? user.ref.uri : undefined;

    return isObjectUrisSupported ? userUri : user.login;
}
