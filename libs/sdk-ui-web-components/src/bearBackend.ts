// (C) 2022 GoodData Corporation
import {
    IAnalyticalBackendConfig,
    IAnalyticalBackend,
    IAuthenticationContext,
} from "@gooddata/sdk-backend-spi";
import bearFactory, { ContextDeferredAuthProvider } from "@gooddata/sdk-backend-bear";
import { factory as sdkFactory } from "@gooddata/api-client-bear";

/**
 * A factory to create a new instance of the Bear backend.
 *
 * @public
 */
export default (config?: IAnalyticalBackendConfig, implConfig?: any): IAnalyticalBackend =>
    bearFactory(config, {
        ...implConfig,
        packageName: NPM_PACKAGE_NAME,
        packageVersion: NPM_PACKAGE_VERSION,
    });

export const redirectToBearAuthentication = (context: IAuthenticationContext): void => {
    window.location.href = `${context.backend.config.hostname}/account.html?lastUrl=${encodeURIComponent(
        window.location.href,
    )}`;
};

export const redirectToBearSsoAuthentication = (context: IAuthenticationContext): void => {
    sdkFactory({ domain: context.backend.config.hostname })
        .user.initiateSamlSso(window.location.href)
        .catch((error) => {
            // eslint-disable-next-line no-console
            console.error("Failed to initialize Bear SAML SSO authentication.", error);
        });
};

export { ContextDeferredAuthProvider };
