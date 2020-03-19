// (C) 2019-2020 GoodData Corporation
// (C) 2019-2020 GoodData Corporation
import {
    AuthenticatedCallGuard,
    IAuthenticationProvider,
    AuthenticatedPrincipal,
    AuthenticationContext,
    IAnalyticalBackend,
    IAuthProviderCallGuard,
    AuthenticatedAsyncCall,
    IAuthenticatedAsyncCallContext,
} from "@gooddata/sdk-backend-spi";
import { ITigerClient as TigerClient } from "@gooddata/gd-tiger-client";

/**
 * Types specific for tiger backend implementation
 */

/**
 * Tiger object types
 *
 * @public
 */
export type TigerObjectType = "attributes" | "metrics" | "facts" | "labels" | "datasets" | "tags";

/**
 * Tiger execution types
 *
 * @public
 */
export type TigerExecutionType = "label" | "metric" | "dataSet" | "fact" | "attribute";

/**
 * Tiger analytical backend
 *
 * @public
 */
export type TigerAnalyticalBackend = IAnalyticalBackend<TigerClient, TigerUserMeta>;

/**
 * Tiger user meta
 *
 * @public
 */
export type TigerUserMeta = any;

/**
 * Tiger authentication provider
 *
 * @public
 */
export type TigerAuthenticationProvider = IAuthenticationProvider<TigerClient, TigerUserMeta>;

/**
 * Tiger authenticated principal
 *
 * @public
 */
export type TigerAuthenticatedPrincipal = AuthenticatedPrincipal<TigerUserMeta>;

/**
 * Tiger authentication context
 *
 * @public
 */
export type TigerAuthenticationContext = AuthenticationContext<TigerClient>;

/**
 * Tiger authenticated call guard
 *
 * @public
 */
export type TigerAuthenticatedCallGuard = AuthenticatedCallGuard<TigerClient, TigerUserMeta>;

/**
 * Tiger authentication provider call guard
 *
 * @public
 */
export type TigerAuthProviderCallGuard = IAuthProviderCallGuard<TigerClient, TigerUserMeta>;

/**
 * Tiger authenticated async call
 *
 * @public
 */
export type TigerAuthenticatedAsyncCall<TReturn> = AuthenticatedAsyncCall<
    TigerClient,
    TigerUserMeta,
    TReturn
>;

/**
 * Tiger authenticated async call context
 *
 * @public
 */
export type TigerAuthenticatedAsyncCallContext = IAuthenticatedAsyncCallContext<TigerUserMeta>;
