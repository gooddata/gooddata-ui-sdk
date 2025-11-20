// (C) 2019-2025 GoodData Corporation
/**
 * This package provides the Analytical Backend implementation for GoodData Cloud and GoodData.CN.
 *
 * @remarks
 * You can use this package to communicate with GoodData Cloud and GoodData.CN in a convenient way without concerning yourself
 * with low-level details. The functionality includes but is not limited to:
 * getting and creating metadata objects, running executions, getting settings, getting available workspaces, and more.
 *
 * @packageDocumentation
 */
import { withNormalization } from "@gooddata/sdk-backend-base";
import { IAnalyticalBackend, IAnalyticalBackendConfig } from "@gooddata/sdk-backend-spi";

import { TigerBackend } from "./backend/index.js";

/**
 * Returns function which creates instances of Analytical Backend implementation which works with the 'tiger' backend.
 *
 * @param config - analytical backend configuration, may be omitted and provided later
 * @param implConfig - tiger client specific configuration, may be omitted at this point but it cannot be provided later
 * @public
 */
function tigerFactory(config?: IAnalyticalBackendConfig, implConfig?: any): IAnalyticalBackend {
    /*
     * Execution normalization is applied by default for tiger. This is so that tiger does not have to support
     * questionable mechanics of measure name and format assignment and attribute name assignment; tiger does not
     * accept those parameters on input to AFM.
     *
     * Normalizing decorator takes care of this transparently - it will modify the execution definition under the
     * covers, remove the nonsense and then send the execution to the real tiger impl. Once tiger impl returns data,
     * the decorator will apply denormalization and reinstate the detail it stripped away.
     *
     * IMPORTANT: in order for the decorator to work without issues, it is important that the results provided by the
     * tiger backend match the contracts for result dimension and data view header items. To this end, there are
     * couple of alternations / enrichment of tiger's descriptors and header items. Those are done during
     * conversion. See `src/convertors/fromBackend/dimensions.ts` and `result.ts` in the same dir.
     *
     * NOTE: since tiger does not yet support true execute-by-reference, and instead always falls back to
     * freeform execution of the definition derived from the insight itself, it is all good to use fallback mode
     * in the normalizing backend. However, one day, if tiger supports execute-by-reference, then the normalizing
     * decorator needs to be removed. and instead the logic to restore titles, aliases and formats must be implemented
     * in the various convertors in this package.
     */

    return withNormalization(new TigerBackend(config, implConfig), { executeByRefMode: "fallback" });
}

export default tigerFactory;
export { AnonymousAuthProvider } from "@gooddata/sdk-backend-base";
export type {
    ApiEntitlementNameEnum,
    DeclarativeModel,
    GenerateLdmRequest,
    ApiEntitlement,
    AnalyzeCsvRequest,
    AnalyzeCsvResponse,
    ImportCsvRequest,
    ImportCsvResponse,
    GdStorageFile,
    UploadFileResponse,
    ReadCsvFileManifestsResponse,
    ActionsApiProcessInvitationRequest,
    Invitation,
} from "@gooddata/api-client-tiger";

export type {
    SetJwtCallback,
    JwtIsAboutToExpireHandler,
    IRedirectToTigerAuthenticationParams,
    RedirectToTigerAuthenticationHandler,
} from "./auth.js";
export {
    ContextDeferredAuthProvider,
    TigerTokenAuthProvider,
    TigerJwtAuthProvider,
    TigerAuthProviderBase,
    createTigerAuthenticationUrl,
    redirectToTigerAuthentication,
    createRedirectToTigerAuthenticationWithParams,
} from "./auth.js";

export type {
    TigerSpecificFunctions,
    IApiToken,
    IApiTokenExtended,
    Entitlement,
    IDataSourceApiResult,
    IDataSourceUpsertRequest,
    IDataSourceTestConnectionRequest,
    IDataSourceTestConnectionResponse,
    IDataSourceConnectionInfo,
    IDataSourceType,
    IDataSourcePermission,
    IDataSourcePatchRequest,
    OrganizationPermission,
    GenerateLogicalModelRequest,
    DeclarativeLogicalModel,
    DeclarativeAnalyticsModel,
    PutWorkspaceLayoutRequest,
    DataSourceDefinition,
    IDataSourceDeletedResponse,
    IInvitationUserResponse,
    WorkspaceDefinition,
    DependentEntitiesGraphRequest,
    DependentEntitiesGraphResponse,
    WorkspaceDataFiltersLayout,
    WorkspaceDataFilterResult,
    WorkspaceDataFilterSettingResult,
    WorkspaceDataFilter,
    WorkspaceDataFilterSetting,
    ICSPDirective,
    ICustomApplicationSetting,
    ScanSqlResult,
    WorkspaceEntitiesDatasets,
    ScanRequest,
    ScanResult,
    IDataSourceCacheStrategy,
    INotificationChannel,
} from "./backend/tigerSpecificFunctions.js";

export type { TigerAfmType, TigerMetadataType, TigerObjectType } from "./types/index.js";
export type { TigerCompatibleObjectType } from "./types/refTypeMapping.js";
export {
    isTigerType,
    isTigerCompatibleType,
    tigerIdTypeToObjectType,
    objectTypeToTigerIdType,
} from "./types/refTypeMapping.js";
export type { OriginInfoWithId } from "./convertors/fromBackend/ObjectInheritance.js";
export { getIdOrigin } from "./convertors/fromBackend/ObjectInheritance.js";
export { toAfmExecution } from "./convertors/toBackend/afm/toAfmResultSpec.js";
