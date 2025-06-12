// (C) 2022-2024 GoodData Corporation

import { isUriRef, IUser } from "@gooddata/sdk-model";
import { IBackendCapabilities } from "@gooddata/sdk-backend-spi";

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
