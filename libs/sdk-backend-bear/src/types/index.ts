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
import { SDK as BearClient } from "@gooddata/gd-bear-client";

/**
 * Types specific for bear backend implementation
 */

/**
 * Bear analytical backend
 *
 * @public
 */
export type BearAnalyticalBackend = IAnalyticalBackend<BearClient, BearUserMeta>;

/**
 * Bear user meta
 *
 * @public
 */
export type BearUserMeta = any;

/**
 * Bear authentication provider
 *
 * @public
 */
export type BearAuthenticationProvider = IAuthenticationProvider<BearClient, BearUserMeta>;

/**
 * Bear authenticated principal
 *
 * @public
 */
export type BearAuthenticatedPrincipal = AuthenticatedPrincipal<BearUserMeta>;

/**
 * Bear authentication context
 *
 * @public
 */
export type BearAuthenticationContext = AuthenticationContext<BearClient>;

/**
 * Bear authenticated call guard
 *
 * @public
 */
export type BearAuthenticatedCallGuard = AuthenticatedCallGuard<BearClient, BearUserMeta>;

/**
 * Bear authentication provider call guard
 *
 * @public
 */
export type BearAuthProviderCallGuard = IAuthProviderCallGuard<BearClient, BearUserMeta>;

/**
 * Bear authenticated async call
 *
 * @public
 */
export type BearAuthenticatedAsyncCall<TReturn> = AuthenticatedAsyncCall<BearClient, BearUserMeta, TReturn>;

/**
 * Bear authenticated async call context
 *
 * @public
 */
export type BearAuthenticatedAsyncCallContext = IAuthenticatedAsyncCallContext<BearUserMeta>;
