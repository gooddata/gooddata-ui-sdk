// (C) 2019-2026 GoodData Corporation

import {
    type ITigerClientBase,
    type JsonApiOrganizationSettingInAttributesTypeEnum,
    type JsonApiOrganizationSettingOutWithLinksTypeEnum,
    type JsonApiWorkspaceSettingInAttributesTypeEnum,
} from "@gooddata/api-client-tiger";
import { type AuthenticatedCallGuard } from "@gooddata/sdk-backend-base";
import { type FilterContextItem, type IDashboardExportParameter } from "@gooddata/sdk-model";

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
export type TigerAfmType =
    | "label"
    | "metric"
    | "dataset"
    | "fact"
    | "attribute"
    | "computedAttribute"
    | "prompt";

/**
 * Tiger metadata types
 *
 * @public
 */
export type TigerMetadataType =
    | "analyticalDashboard"
    | "visualizationObject"
    | "filterContext"
    | "dashboardPlugin"
    | "parameter"
    | "attributeHierarchy";

/**
 * Tiger entity types
 *
 * @public
 */
export type TigerObjectType = TigerAfmType | TigerMetadataType;

export type FiltersByTab = {
    [tabId: string]: FilterContextItem[];
};

/**
 * Export metadata contents is under our control, accepts arbitrary json, currently described by IExportMetadata interface
 * - what we store there during exportDashboardToPdf stays there for us to read in the exporter when loading dashboard
 *   with ?exportId=... argument when calling getDashboard[WithReferences]
 * - see appropriate converters for type check and metadata contents
 */
export interface IExportMetadata {
    filters?: FilterContextItem[];
    filtersByTab?: FiltersByTab;
    parametersByTab?: Record<string, IDashboardExportParameter[]>;
    title?: string;
    hideWidgetTitles?: boolean;
    exportMetadata?: Record<string, string>;
    /**
     * Concrete IANA timezone ID stored for the export-mode dashboard render. Mirrors the
     * request's top-level timezoneId (which the exporter service consumes); the metadata copy is
     * what the dashboard loaded in the headless browser reads via exportId.
     */
    timezoneId?: string;
}

/**
 * Setting types the workspace and user settings endpoints accept.
 */
export type TigerSettingsType = JsonApiWorkspaceSettingInAttributesTypeEnum;
/**
 * Setting types the organization settings endpoint accepts: the workspace and user types plus
 * organization-only ones.
 */
export type TigerOrganizationSettingsType = JsonApiOrganizationSettingInAttributesTypeEnum;
export type TigerOrgSettingsType = JsonApiOrganizationSettingOutWithLinksTypeEnum;
