// (C) 2019-2020 GoodData Corporation
import { ITigerClient } from "@gooddata/gd-tiger-client";
import { AuthenticatedCallGuard } from "@gooddata/sdk-backend-base";

/**
 * Tiger AFM types
 *
 * @public
 */
export type TigerAfmType = "label" | "metric" | "dataset" | "fact" | "attribute" | "variable";

/**
 * Tiger authenticated call guard
 *
 * @public
 */
export type TigerAuthenticatedCallGuard = AuthenticatedCallGuard<ITigerClient>;
