// (C) 2019-2025 GoodData Corporation

import {
    DeclarativeSettingTypeEnum,
    ITigerClientBase,
    JsonApiOrganizationSettingOutWithLinksTypeEnum,
} from "@gooddata/api-client-tiger";
import { AuthenticatedCallGuard } from "@gooddata/sdk-backend-base";
import { FilterContextItem } from "@gooddata/sdk-model";

/**
 * Tiger authenticated call guard
 *
 * @public
 */
export type TigerAuthenticatedCallGuard = AuthenticatedCallGuard<ITigerClientBase>;

/**
 * Tiger AFM types
 *
 * @public
 */
export type TigerAfmType = "label" | "metric" | "dataset" | "fact" | "attribute" | "prompt";

/**
 * Tiger metadata types
 *
 * @public
 */
export type TigerMetadataType =
    | "analyticalDashboard"
    | "visualizationObject"
    | "filterContext"
    | "dashboardPlugin";

/**
 * Tiger entity types
 *
 * @public
 */
export type TigerObjectType = TigerAfmType | TigerMetadataType;

/**
 * Export metadata contents is under our control, accepts arbitrary json, currently described by IExportMetadata interface
 * - what we store there during exportDashboardToPdf stays there for us to read in the exporter when loading dashboard
 *   with ?exportId=... argument when calling getDashboard[WithReferences]
 * - see appropriate converters for type check and metadata contents
 */
export interface IExportMetadata {
    filters: FilterContextItem[];
    title?: string;
    hideWidgetTitles?: boolean;
}

export type TigerSettingsType = DeclarativeSettingTypeEnum;
export type TigerOrgSettingsType = JsonApiOrganizationSettingOutWithLinksTypeEnum;
