// (C) 2019-2020 GoodData Corporation
import { SDK } from "@gooddata/api-client-bear";
import { AuthenticatedCallGuard } from "@gooddata/sdk-backend-base";

/**
 * Bear authenticated call guard
 *
 * @public
 */
export type BearAuthenticatedCallGuard = AuthenticatedCallGuard<SDK>;
