// (C) 2019-2020 GoodData Corporation
import { AuthenticatedCallGuard } from "@gooddata/sdk-backend-spi";
import { SDK } from "@gooddata/gd-bear-client";

/**
 * Bear authenticated call guard
 *
 * @public
 */
export type BearAuthenticatedCallGuard = AuthenticatedCallGuard<SDK>;
