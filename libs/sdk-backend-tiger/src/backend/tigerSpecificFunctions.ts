// (C) 2022-2026 GoodData Corporation

import { type AxiosRequestConfig } from "axios";
import { backOff } from "exponential-backoff";
import { isEmpty, uniq } from "lodash-es";

import {
    type ActionsApiProcessInvitationRequest,
    type AnalyzeCsvRequest,
    type AnalyzeCsvResponse,
    type ApiEntitlement,
    type DataSourceParameter,
    type DeclarativeAnalytics,
    type DeclarativeModel,
    type DeclarativeWorkspaceDataFilters,
    type DependentEntitiesRequest,
    type DependentEntitiesResponse,
    type GdStorageFile,
    type GenerateLdmRequest,
    type HierarchyObjectIdentification,
    type ITigerClientBase,
    type IdentifierDuplications,
    type ImportCsvRequest,
    type ImportCsvResponse,
    type JsonApiApiTokenInDocument,
    type JsonApiApiTokenOutList,
    type JsonApiCspDirectiveInDocument,
    type JsonApiCustomApplicationSettingOut,
    type JsonApiDataSourceIdentifierOutDocument,
    type JsonApiDataSourceIdentifierOutWithLinks,
    type JsonApiDataSourceInAttributesCacheStrategyEnum,
    type JsonApiDataSourceInAttributesTypeEnum,
    type JsonApiDataSourceInDocument,
    type JsonApiDataSourceOutAttributesAuthenticationTypeEnum,
    type JsonApiDataSourceOutDocument,
    type JsonApiDatasetOutList,
    type JsonApiNotificationChannelOut,
    type JsonApiOrganizationOutMetaPermissionsEnum,
    type JsonApiWorkspaceDataFilterInDocument,
    type JsonApiWorkspaceDataFilterOutDocument,
    type JsonApiWorkspaceDataFilterSettingInDocument,
    type JsonApiWorkspaceDataFilterSettingOutDocument,
    type JsonApiWorkspaceInDocument,
    type LayoutApiPutWorkspaceLayoutRequest,
    MetadataUtilities,
    OrganizationUtilities,
    type PlatformUsage,
    type ReadCsvFileManifestsResponse,
    type ScanResultPdm,
    type ScanSqlResponse,
    type TestDefinitionRequestTypeEnum,
    type UploadFileResponse,
    jsonApiHeaders,
} from "@gooddata/api-client-tiger";
import {
    type AacAnalyticsModel,
    AacApi_GetAnalyticsModelAac,
    AacApi_GetLogicalModelAac,
    AacApi_SetAnalyticsModelAac,
    AacApi_SetLogicalModelAac,
    type AacLogicalModel,
} from "@gooddata/api-client-tiger/aac";
import {
    ActionsApi_AllPlatformUsage,
    ActionsApi_CheckEntityOverrides,
    ActionsApi_GenerateLogicalModel,
    ActionsApi_GetDependentEntitiesGraph,
    ActionsApi_GetDependentEntitiesGraphFromEntryPoints,
    ActionsApi_RegisterUploadNotification,
    ActionsApi_ResolveAllEntitlements,
} from "@gooddata/api-client-tiger/actions";
import { AuthApi_ProcessInvitation } from "@gooddata/api-client-tiger/authActions";
import {
    EntitiesApi_CreateEntityApiTokens,
    EntitiesApi_CreateEntityCspDirectives,
    EntitiesApi_CreateEntityCustomApplicationSettings,
    EntitiesApi_CreateEntityDataSources,
    EntitiesApi_CreateEntityWorkspaceDataFilterSettings,
    EntitiesApi_CreateEntityWorkspaceDataFilters,
    EntitiesApi_CreateEntityWorkspaces,
    EntitiesApi_DeleteEntityApiTokens,
    EntitiesApi_DeleteEntityCspDirectives,
    EntitiesApi_DeleteEntityCustomApplicationSettings,
    EntitiesApi_DeleteEntityDataSources,
    EntitiesApi_DeleteEntityWorkspaces,
    EntitiesApi_GetAllEntitiesApiTokens,
    EntitiesApi_GetAllEntitiesCspDirectives,
    EntitiesApi_GetAllEntitiesCustomApplicationSettings,
    EntitiesApi_GetAllEntitiesDataSourceIdentifiers,
    EntitiesApi_GetAllEntitiesDataSources,
    EntitiesApi_GetAllEntitiesDatasets,
    EntitiesApi_GetAllEntitiesEntitlements,
    EntitiesApi_GetAllEntitiesWorkspaces,
    EntitiesApi_GetEntityCspDirectives,
    EntitiesApi_GetEntityCustomApplicationSettings,
    EntitiesApi_GetEntityDataSourceIdentifiers,
    EntitiesApi_GetEntityDataSources,
    EntitiesApi_GetEntityOrganizations,
    EntitiesApi_GetEntityUsers,
    EntitiesApi_GetEntityWorkspaceDataFilterSettings,
    EntitiesApi_GetEntityWorkspaceDataFilters,
    EntitiesApi_PatchEntityDataSources,
    EntitiesApi_PatchEntityOrganizations,
    EntitiesApi_PatchEntityWorkspaces,
    EntitiesApi_UpdateEntityCspDirectives,
    EntitiesApi_UpdateEntityDataSources,
} from "@gooddata/api-client-tiger/entitiesObjects";
import {
    LayoutApi_GetLogicalModel,
    LayoutApi_GetWorkspaceDataFiltersLayout,
    LayoutApi_PutWorkspaceLayout,
    LayoutApi_SetLogicalModel,
    LayoutApi_SetWorkspaceDataFiltersLayout,
} from "@gooddata/api-client-tiger/layout";
import {
    type ResultApiReadCsvFileManifestsRequest,
    ResultApi_AnalyzeCsv,
    ResultApi_DeleteFiles,
    ResultApi_ImportCsv,
    ResultApi_ListFiles,
    ResultApi_ReadCsvFileManifests,
    ResultApi_StagingUpload,
} from "@gooddata/api-client-tiger/result";
import {
    ScanModelApi_GetDataSourceSchemata,
    ScanModelApi_ScanDataSource,
    ScanModelApi_ScanSql,
    ScanModelApi_TestDataSource,
    ScanModelApi_TestDataSourceDefinition,
} from "@gooddata/api-client-tiger/scanModel";
import { type AuthenticatedAsyncCall } from "@gooddata/sdk-backend-base";
import {
    type ErrorConverter,
    type IAnalyticalBackend,
    UnexpectedError,
    isUnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import { type IUser } from "@gooddata/sdk-model";

import { convertApiError } from "../utils/errorHandling.js";

/**
 * @internal
 */
export interface IApiToken {
    id: string;
}

/**
 * @internal
 */
export interface IApiTokenExtended extends IApiToken {
    bearerToken: string | undefined;
}

/**
 * @internal
 */
export interface ScanRequest {
    scanTables: boolean;
    scanViews: boolean;
    separator: string;
    tablePrefix: string;
    viewPrefix: string;
    schemata: string[];
}

/**
 * @internal
 */
export type ScanResult = ScanResultPdm;

/**
 * @internal
 */
export interface Entitlement {
    id: string;
    value?: string;
    expiry?: string;
}

/**
 * @internal
 */
export type IDataSourceType = JsonApiDataSourceInAttributesTypeEnum;

/**
 * @internal
 */
export type IDataSourceCacheStrategy = JsonApiDataSourceInAttributesCacheStrategyEnum;

/**
 * @internal
 */
export type IDataSourcePermission = "MANAGE" | "USE";

/**
 * @internal
 */
export interface IDataSourceConnectionInfo {
    id: string;
    type: IDataSourceType;
    name: string;
    schema: string;
    username?: string;
    clientId?: string;
    url?: string | null;
    permissions?: IDataSourcePermission[];
    parameters?: Array<DataSourceParameter> | null;
    decodedParameters?: Array<DataSourceParameter> | null;
    cacheStrategy?: IDataSourceCacheStrategy | null;
    authenticationType?: JsonApiDataSourceOutAttributesAuthenticationTypeEnum | null;
}

/**
 *@internal
 */
export interface IDataSourceApiResult {
    data?: IDataSourceConnectionInfo;
    errorMessage?: string;
}

/**
 * @internal
 */
export interface IDataSourceUpsertRequest {
    id: string;
    name: string;
    password?: string;
    schema: string;
    token?: string;
    type: IDataSourceType;
    url?: string;
    username?: string;
    parameters?: Array<DataSourceParameter>;
    cacheStrategy?: IDataSourceCacheStrategy;
    privateKey?: string;
    privateKeyPassphrase?: string;
    clientId?: string;
    clientSecret?: string;
}

/**
 * @internal
 */
export interface IDataSourcePatchRequest {
    id: string;
    name?: string;
    password?: string | null;
    schema?: string;
    token?: string | null;
    type?: IDataSourceType;
    url?: string;
    username?: string;
    parameters?: Array<DataSourceParameter>;
    cacheStrategy?: IDataSourceCacheStrategy;
    privateKey?: string | null;
    privateKeyPassphrase?: string | null;
    clientId?: string | null;
    clientSecret?: string | null;
}

/**
 * @internal
 */
export interface IDataSourceTestConnectionRequest {
    password?: string;
    schema: string;
    token?: string;
    type: TestDefinitionRequestTypeEnum;
    url: string;
    username?: string;
    parameters?: Array<DataSourceParameter>;
    privateKey?: string;
    privateKeyPassphrase?: string;
    clientId?: string;
    clientSecret?: string;
}

/**
 * @internal
 */
export interface IDataSourceTestConnectionResponse {
    successful: boolean;
    error?: string;
}

/**
 * @internal
 */
export interface IDataSourceDeletedResponse {
    successful?: boolean;
    errorMessage?: string;
}

/**
 * @internal
 */
export interface IInvitationUserResponse {
    successful?: boolean;
    errorMessage?: string;
}

/**
 * @internal
 */
export interface ICSPDirective {
    id: string;
    attributes: {
        /**
         * Representation values of the CSP directive entity.
         * Ex: http://a.com, *.abc.com, 'self', ..
         */
        sources: Array<string>;
    };
}

/**
 * @internal
 */
export type INotificationChannel = Omit<JsonApiNotificationChannelOut, "type">;

/**
 * @internal
 */
export interface ICustomApplicationSetting {
    id: string;
    /**
     * Name of the application the setting is applied.
     * Ex: ldmModeler
     */
    applicationName: string;
    /**
     * Representation values of the setting.
     * Ex: Layout setting of ldmModeler:  \{ "layout" : []\}
     */
    content: { [key: string]: any };
}

/**
 * @internal
 */
export type OrganizationPermission = JsonApiOrganizationOutMetaPermissionsEnum;

/**
 * @internal
 */
export type GenerateLogicalModelRequest = GenerateLdmRequest;

/**
 * @internal
 */
export type DeclarativeLogicalModel = DeclarativeModel;

/**
 * @internal
 */
export type DeclarativeAnalyticsModel = DeclarativeAnalytics;

/**
 * @internal
 */
export type PutWorkspaceLayoutRequest = LayoutApiPutWorkspaceLayoutRequest;

/**
 * @internal
 */
export type DataSourceDefinition = JsonApiDataSourceInDocument;

/**
 * @internal
 */
export type WorkspaceDefinition = JsonApiWorkspaceInDocument;

/**
 * @internal
 */
export type DependentEntitiesGraphRequest = DependentEntitiesRequest;

/**
 * @internal
 */
export type DependentEntitiesGraphResponse = DependentEntitiesResponse;

/**
 * @internal
 */
export type WorkspaceDataFiltersLayout = DeclarativeWorkspaceDataFilters;

/**
 * @internal
 */
export type WorkspaceDataFilterResult = JsonApiWorkspaceDataFilterOutDocument;

/**
 * @internal
 */
export type WorkspaceDataFilterSettingResult = JsonApiWorkspaceDataFilterSettingOutDocument;

/**
 * @internal
 */
export type WorkspaceDataFilter = JsonApiWorkspaceDataFilterInDocument;

/**
 * @internal
 */
export type WorkspaceDataFilterSetting = JsonApiWorkspaceDataFilterSettingInDocument;

/**
 * @internal
 */
export type ScanSqlResult = ScanSqlResponse;

/**
 * @internal
 */
export type WorkspaceEntitiesDatasets = JsonApiDatasetOutList;

/**
 * TigerBackend-specific functions.
 * If possible, avoid these functions, they are here for specific use cases.
 *
 * Do not use parameters or return values from \@gooddata/api-client-tiger.
 *
 * @internal
 */
export type TigerSpecificFunctions = {
    isCommunityEdition?: () => Promise<boolean>;
    isOrganizationAdmin?: () => Promise<boolean>;
    organizationExpiredDate?: () => Promise<string>;
    getOrganizationAllowedOrigins?: (organizationId: string) => Promise<string[]>;
    getOrganizationPermissions?: (organizationId: string) => Promise<Array<OrganizationPermission>>;
    updateOrganizationAllowedOrigins?: (
        organizationId: string,
        updatedOrigins: string[],
    ) => Promise<string[]>;
    getDeploymentVersion?: () => Promise<string>;
    getAllApiTokens?: (userId: string) => Promise<IApiToken[]>;
    generateApiToken?: (userId: string, tokenId: string) => Promise<IApiTokenExtended | undefined>;
    deleteApiToken?: (userId: string, tokenId: string) => Promise<void>;
    someDataSourcesExists?: (filter?: string) => Promise<boolean>;
    generateLogicalModel?: (
        dataSourceId: string,
        generateLogicalModelRequest: GenerateLogicalModelRequest,
    ) => Promise<DeclarativeLogicalModel>;
    scanDataSource?: (dataSourceId: string, scanRequest: ScanRequest) => Promise<ScanResult>;
    createDemoWorkspace?: (sampleWorkspace: WorkspaceDefinition) => Promise<string>;
    createDemoDataSource?: (sampleDataSource: DataSourceDefinition) => Promise<string>;
    createWorkspace?: (id: string, name: string, parentId?: string) => Promise<string>;
    /**
     * @deprecated use IAnalyticalBackend.workspace(id).updateDescriptor(\{ title: name \})
     */
    updateWorkspaceTitle?: (id: string, name: string) => Promise<void>;
    deleteWorkspace?: (id: string) => Promise<void>;
    canDeleteWorkspace?: (id: string) => Promise<boolean>;
    getWorkspaceLogicalModel?: (id: string, includeParents?: boolean) => Promise<DeclarativeLogicalModel>;
    getWorkspaceEntitiesDatasets?: (id: string) => Promise<WorkspaceEntitiesDatasets>;
    getEntitlements?: () => Promise<Array<Entitlement>>;
    putWorkspaceLayout?: (requestParameters: PutWorkspaceLayoutRequest) => Promise<void>;
    getWorkspaceAnalyticsModelAac?: (
        workspaceId: string,
        exclude?: Array<"ACTIVITY_INFO">,
    ) => Promise<AacAnalyticsModel>;
    setWorkspaceAnalyticsModelAac?: (workspaceId: string, analyticsModel: AacAnalyticsModel) => Promise<void>;
    getWorkspaceLogicalModelAac?: (workspaceId: string, includeParents?: boolean) => Promise<AacLogicalModel>;
    setWorkspaceLogicalModelAac?: (workspaceId: string, logicalModel: AacLogicalModel) => Promise<void>;
    getAllDataSources?: () => Promise<IDataSourceConnectionInfo[]>;
    getDataSourceById?: (id: string) => Promise<IDataSourceApiResult>;
    getDataSourceIdentifierById?: (id: string) => Promise<IDataSourceApiResult>;
    createDataSource?: (requestData: IDataSourceUpsertRequest) => Promise<IDataSourceApiResult>;
    updateDataSource?: (id: string, requestData: IDataSourceUpsertRequest) => Promise<IDataSourceApiResult>;
    patchDataSource?: (id: string, requestData: IDataSourcePatchRequest) => Promise<IDataSourceApiResult>;
    deleteDataSource?: (id: string) => Promise<IDataSourceDeletedResponse>;
    testDataSourceConnection?: (
        connectionData: IDataSourceTestConnectionRequest,
        id?: string,
    ) => Promise<IDataSourceTestConnectionResponse>;
    publishLogicalModel?: (workspaceId: string, declarativeModel: DeclarativeLogicalModel) => Promise<void>;
    getDataSourceSchemata?: (dataSourceId: string) => Promise<string[]>;
    getDependentEntitiesGraph?: (workspaceId: string) => Promise<DependentEntitiesGraphResponse>;
    getDependentEntitiesGraphFromEntryPoints?: (
        workspaceId: string,
        dependentEntitiesGraphRequest: DependentEntitiesGraphRequest,
    ) => Promise<DependentEntitiesGraphResponse>;
    resolveAllEntitlements?: () => Promise<ApiEntitlement[]>;
    getAllPlatformUsage?: () => Promise<PlatformUsage[]>;
    inviteUser?: (
        requestParameters: ActionsApiProcessInvitationRequest,
        options?: AxiosRequestConfig,
    ) => Promise<IInvitationUserResponse>;
    getWorkspaceDataFiltersLayout?: () => Promise<WorkspaceDataFiltersLayout>;
    setWorkspaceDataFiltersLayout?: (workspaceDataFiltersLayout: WorkspaceDataFiltersLayout) => Promise<void>;
    getWorkspaceDataFilter?: (workspaceId: string, objectId: string) => Promise<WorkspaceDataFilterResult>;
    setWorkspaceDataFilter?: (workspaceId: string, workspaceDataFilter: WorkspaceDataFilter) => Promise<void>;
    getWorkspaceDataFilterSetting?: (
        workspaceId: string,
        objectId: string,
    ) => Promise<WorkspaceDataFilterSettingResult>;
    setWorkspaceDataFilterSetting?: (
        workspaceId: string,
        workspaceDataFilterSetting: WorkspaceDataFilterSetting,
    ) => Promise<void>;
    getAllCSPDirectives?: () => Promise<Array<ICSPDirective>>;
    getCSPDirective?: (directiveId: string) => Promise<ICSPDirective>;
    createCSPDirective?: (requestData: ICSPDirective) => Promise<ICSPDirective>;
    updateCSPDirective?: (directiveId: string, requestData: ICSPDirective) => Promise<ICSPDirective>;
    deleteCSPDirective?: (directiveId: string) => Promise<void>;
    registerUploadNotification?: (dataSourceId: string) => Promise<void>;

    /**
     * Return all custom setting of a workspace.
     *
     * @param workspaceId - id of the workspace
     * @param applicationName - name of the appliation the setting was set for - ex: ldmModeler
     * @returns ICustomApplicationSetting[]
     *
     */
    getWorkspaceCustomAppSettings?: (
        workspaceId: string,
        applicationName?: string,
    ) => Promise<ICustomApplicationSetting[]>;

    /**
     * Return all custom setting of a workspace.
     *
     * @param workspaceId - id of the workspace
     * @param settingId - id of the custom setting
     * @returns ICustomApplicationSetting
     *
     */
    getWorkspaceCustomAppSetting?: (
        workspaceId: string,
        settingId: string,
    ) => Promise<ICustomApplicationSetting>;

    /**
     * Create a custom setting of a for a workspace.
     *
     * @param workspaceId - id of the workspace
     * @param applicationName - name of the appliation the setting was set for - ex: ldmModeler
     * @param content - setting data - json object
     * @example : \{"layout" : []\}
     * @param settingId - id of the custom setting, generated if not provided
     * @returns ICustomApplicationSetting
     *
     */
    createWorkspaceCustomAppSetting?: (
        workspaceId: string,
        applicationName: string,
        content: object,
        settingId?: string,
    ) => Promise<ICustomApplicationSetting>;

    /**
     * Delete a custom setting by workspace id and setting id.
     *
     * @param workspaceId - id of the workspace
     * @param settingId - id of the custom setting that should be deleted
     */
    deleteWorkspaceCustomAppSetting?: (workspaceId: string, settingId: string) => Promise<void>;

    /**
     * Get the User Entity data
     *
     * @param id - id of the current userId
     * @returns IUser
     *
     */
    getEntityUser?: (id: string) => Promise<IUser>;

    /**
     * Get metadata about SQL query
     *
     * @param dataSourceId - id of the datasource
     * @param sql - SQL query to be analyzed
     * @returns ScanSqlResult -
     *
     */
    scanSql?: (dataSourceId: string, sql: string) => Promise<ScanSqlResult>;

    /**
     * Check if entities are not overrides by entities from parents workspaces
     * @param entities - All i and types for check
     * @returns IdentifierDuplications[]
     */
    checkEntityOverrides?: (
        workspaceId: string,
        entities: Array<HierarchyObjectIdentification>,
    ) => Promise<Array<IdentifierDuplications>>;

    /**
     * Upload a CSV file to the GDSTORAGE data source staging location
     * @param dataSourceId - id of the data source
     * @param file - the file to upload
     */
    stagingUpload?: (file: File) => Promise<UploadFileResponse>;

    /**
     * Analyze CSV files in GDSTORAGE data source staging location
     * @param analyzeRequest - the request to analyze CSV files
     */
    analyzeCsv?: (analyzeCsvRequest: AnalyzeCsvRequest) => Promise<Array<AnalyzeCsvResponse>>;

    /**
     * Import CSV files from GDSTORAGE data source staging location
     * @param dataSourceId - id of the data source
     * @param importRequest - the request to import CSV files
     */
    importCsv?: (
        dataSourceId: string,
        importCsvRequest: ImportCsvRequest,
    ) => Promise<Array<ImportCsvResponse>>;

    /**
     * List CSV files from GDSTORAGE data source staging location
     * @param dataSourceId - id of the data source
     */
    listFiles?: (dataSourceId: string) => Promise<Array<GdStorageFile>>;

    /**
     * Delete CSV files from GDSTORAGE data source
     * @param dataSourceId - id of the data source
     * @param fileNames - names of CSV files to delete
     */
    deleteFiles?: (dataSourceId: string, fileNames: string[]) => Promise<void>;

    /**
     * Delete CSV files from GDSTORAGE data source
     * @param dataSourceId - id of the data source
     * @param fileNames - names of CSV files to delete
     */
    readFileManifests?: (
        dataSourceId: string,
        fileNames: string[],
    ) => Promise<ReadCsvFileManifestsResponse[]>;
};

const getDataSourceErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
};

const dataSourceResponseAsDataSourceConnectionInfo = (
    response: JsonApiDataSourceOutDocument,
): IDataSourceConnectionInfo => {
    const { id, meta, attributes } = response.data;
    const {
        name,
        url,
        type,
        schema,
        username,
        parameters,
        decodedParameters,
        cacheStrategy,
        authenticationType,
        clientId,
    } = attributes;
    return {
        id,
        type,
        name,
        schema,
        username: username ?? undefined,
        url,
        clientId: clientId ?? undefined,
        permissions: meta?.permissions ?? [],
        parameters,
        decodedParameters,
        cacheStrategy,
        authenticationType,
    };
};

const dataSourceIdentifierOutWithLinksAsDataSourceConnectionInfo = (
    response: JsonApiDataSourceIdentifierOutWithLinks,
): IDataSourceConnectionInfo => {
    const { id, meta, attributes } = response;
    const { name, type, schema } = attributes;
    return {
        id,
        type,
        name,
        schema,
        username: undefined,
        url: undefined,
        permissions: meta?.permissions ?? [],
    };
};

const dataSourceIdentifierOutDocumentAsDataSourceConnectionInfo = (
    response: JsonApiDataSourceIdentifierOutDocument,
): IDataSourceConnectionInfo => {
    const {
        data: { attributes, id, meta },
    } = response;
    const { name, type, schema } = attributes;
    return {
        id,
        type,
        name,
        schema,
        username: undefined,
        url: undefined,
        permissions: meta?.permissions ?? [],
    };
};

const customAppSettingResponseAsICustomApplicationSetting = (
    response: JsonApiCustomApplicationSettingOut,
): ICustomApplicationSetting => {
    const { id, attributes } = response;
    const { applicationName, content } = attributes;
    return {
        id,
        applicationName,
        content,
    };
};

export const buildTigerSpecificFunctions = (
    backend: IAnalyticalBackend,
    authApiCall: <T>(
        call: AuthenticatedAsyncCall<ITigerClientBase, T>,
        errorConverter?: ErrorConverter,
    ) => Promise<T>,
): TigerSpecificFunctions => ({
    isCommunityEdition: async () => {
        try {
            return await authApiCall(async (sdk) => {
                const response = await EntitiesApi_GetAllEntitiesWorkspaces(
                    sdk.axios,
                    "",
                    { page: 0, size: 1 },
                    { headers: jsonApiHeaders },
                );

                // the header name are all lowercase in this object
                return response.headers["gooddata-deployment"] === "aio";
            });
        } catch {
            return false;
        }
    },
    isOrganizationAdmin: async () => {
        try {
            const orgPermissions = await authApiCall(async (sdk) => {
                const { organizationId } = await backend.organizations().getCurrentOrganization();
                const response = await EntitiesApi_GetEntityOrganizations(sdk.axios, sdk.basePath, {
                    id: organizationId,
                    metaInclude: ["permissions"],
                });
                return response.data.data.meta?.permissions || [];
            });
            const isOrganizationManage = (permissions: string[]): boolean => permissions.includes("MANAGE");
            return isOrganizationManage(orgPermissions);
        } catch {
            return false;
        }
    },
    organizationExpiredDate: async () => {
        try {
            return await authApiCall(async (sdk) => {
                const response = await EntitiesApi_GetAllEntitiesEntitlements(sdk.axios, sdk.basePath, {});
                const contractEntitlement = response.data.data.find((item) => item.id === "Contract");
                return contractEntitlement?.attributes?.expiry || "";
            });
        } catch {
            return "";
        }
    },
    getOrganizationAllowedOrigins: async (organizationId: string) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await EntitiesApi_GetEntityOrganizations(sdk.axios, sdk.basePath, {
                    id: organizationId,
                });
                return result.data?.data?.attributes?.allowedOrigins || [];
            });
        } catch {
            return [];
        }
    },
    getOrganizationPermissions: async (organizationId: string) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await EntitiesApi_GetEntityOrganizations(sdk.axios, sdk.basePath, {
                    id: organizationId,
                    metaInclude: ["permissions"],
                });
                return result.data.data?.meta?.permissions || [];
            });
        } catch (error: any) {
            const toleratedCodes = [404, 403];
            if (
                toleratedCodes.includes(error?.response?.status) ||
                toleratedCodes.includes(error?.cause?.response?.status) // the error might be wrapped by an UnexpectedResponseError so check for it too
            ) {
                // temporary - 404 gets returned if you are not org admin
                return [];
            }
            throw convertApiError(error);
        }
    },
    updateOrganizationAllowedOrigins: async (organizationId: string, updatedOrigins: string[]) => {
        const sanitizeOrigins = (origins: Array<string>) => {
            const arr = origins || [];
            return uniq(arr.map((s) => s.toLowerCase())).sort();
        };
        try {
            return await authApiCall(async (sdk) => {
                const result = await EntitiesApi_PatchEntityOrganizations(sdk.axios, sdk.basePath, {
                    id: organizationId,
                    jsonApiOrganizationPatchDocument: {
                        data: {
                            id: organizationId,
                            type: "organization",
                            attributes: {
                                allowedOrigins: updatedOrigins,
                            },
                        },
                    },
                });
                return sanitizeOrigins(result.data?.data?.attributes?.allowedOrigins || []);
            });
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error?.response?.data?.detail
                    ? error?.response?.data?.detail
                    : "Server error";
                throw new UnexpectedError(message, error);
            }
            throw convertApiError(error);
        }
    },
    getDeploymentVersion: async () => {
        try {
            return await authApiCall(async (sdk) => {
                // TODO use a client call when available via some endpoint described in OpenAPI
                const profile = await sdk.axios.get("/api/v1/profile");
                return profile?.headers?.["gooddata-deployment"];
            });
        } catch {
            return undefined;
        }
    },
    getAllApiTokens: async (userId: string) => {
        const mapTokens = (tokens: JsonApiApiTokenOutList): IApiToken[] => {
            return tokens.data.map((item) => {
                const result: IApiToken = {
                    id: item.id,
                };
                return result;
            });
        };
        try {
            return await authApiCall(async (sdk) => {
                return await MetadataUtilities.getAllPagesOf(sdk, EntitiesApi_GetAllEntitiesApiTokens, {
                    userId,
                })
                    .then(MetadataUtilities.mergeEntitiesResults)
                    .then(mapTokens);
            });
        } catch {
            return [];
        }
    },
    generateApiToken: async (userId: string, tokenId: string) => {
        try {
            return await authApiCall(async (sdk) => {
                const apiTokenDocument: JsonApiApiTokenInDocument = {
                    data: {
                        id: tokenId,
                        type: "apiToken",
                    },
                };
                const result = await EntitiesApi_CreateEntityApiTokens(sdk.axios, sdk.basePath, {
                    userId: userId,
                    jsonApiApiTokenInDocument: apiTokenDocument,
                });
                return {
                    id: result.data.data?.id,
                    bearerToken: result.data.data?.attributes?.bearerToken,
                };
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    deleteApiToken: async (userId: string, tokenId: string) => {
        try {
            await authApiCall(async (sdk) => {
                await EntitiesApi_DeleteEntityApiTokens(sdk.axios, sdk.basePath, {
                    userId: userId,
                    id: tokenId,
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    someDataSourcesExists: async (filter?: string) => {
        return await authApiCall(async (sdk) => {
            const requestParams = filter ? { filter } : {};
            return EntitiesApi_GetAllEntitiesDataSources(sdk.axios, sdk.basePath, requestParams)
                .then((axiosResponse: any) => axiosResponse.data.data?.length > 0)
                .catch(() => {
                    return false;
                });
        });
    },
    generateLogicalModel: async (dataSourceId: string, generateLdmRequest: GenerateLdmRequest) => {
        try {
            return await authApiCall(async (sdk) => {
                return ActionsApi_GenerateLogicalModel(sdk.axios, sdk.basePath, {
                    dataSourceId,
                    generateLdmRequest,
                }).then((axiosResponse) => axiosResponse.data);
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    scanDataSource: async (dataSourceId: string, scanRequest: ScanRequest) => {
        try {
            return await authApiCall(async (sdk) => {
                return await ScanModelApi_ScanDataSource(sdk.axios, sdk.basePath, {
                    dataSourceId,
                    scanRequest,
                }).then((res) => {
                    return res?.data;
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    createDemoWorkspace: async (sampleWorkspace: WorkspaceDefinition) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await EntitiesApi_CreateEntityWorkspaces(sdk.axios, sdk.basePath, {
                    jsonApiWorkspaceInDocument: sampleWorkspace,
                });
                return result.data.data.id;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    createDemoDataSource: async (sampleDataSource: JsonApiDataSourceInDocument) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await EntitiesApi_CreateEntityDataSources(sdk.axios, sdk.basePath, {
                    jsonApiDataSourceInDocument: sampleDataSource,
                });
                return result.data.data.id;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    createWorkspace: async (id: string, name: string, parentId?: string) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await EntitiesApi_CreateEntityWorkspaces(sdk.axios, sdk.basePath, {
                    jsonApiWorkspaceInDocument: {
                        data: {
                            attributes: {
                                name,
                            },
                            id,
                            type: "workspace",
                            relationships: parentId
                                ? {
                                      parent: {
                                          data: {
                                              id: parentId,
                                              type: "workspace",
                                          },
                                      },
                                  }
                                : undefined,
                        },
                    },
                });
                return result.data.data.id;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    updateWorkspaceTitle: async (id: string, name: string) => {
        try {
            return await authApiCall(async (sdk) => {
                await EntitiesApi_PatchEntityWorkspaces(sdk.axios, sdk.basePath, {
                    id,
                    jsonApiWorkspacePatchDocument: {
                        data: {
                            attributes: {
                                name,
                            },
                            id,
                            type: "workspace",
                        },
                    },
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    deleteWorkspace: async (id: string) => {
        try {
            return await authApiCall(async (sdk) => {
                await EntitiesApi_DeleteEntityWorkspaces(sdk.axios, sdk.basePath, { id });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    canDeleteWorkspace: async (id: string) => {
        try {
            return await authApiCall(async (sdk) => {
                const childWorkspaces = (
                    await EntitiesApi_GetAllEntitiesWorkspaces(sdk.axios, sdk.basePath, {
                        include: ["workspaces"],
                        filter: `parent.id==${id}`,
                    })
                ).data.data;
                return isEmpty(childWorkspaces);
            });
        } catch {
            return true;
        }
    },
    getWorkspaceLogicalModel: async (workspaceId: string, includeParents: boolean = false) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await LayoutApi_GetLogicalModel(sdk.axios, sdk.basePath, {
                    workspaceId,
                    includeParents,
                });
                return result.data;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    getWorkspaceEntitiesDatasets: async (workspaceId: string) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await EntitiesApi_GetAllEntitiesDatasets(sdk.axios, sdk.basePath, {
                    workspaceId,
                });
                return result.data;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    putWorkspaceLayout: async (requestParameters: LayoutApiPutWorkspaceLayoutRequest) => {
        try {
            return await authApiCall(async (sdk) => {
                await LayoutApi_PutWorkspaceLayout(sdk.axios, sdk.basePath, requestParameters);
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    getWorkspaceAnalyticsModelAac: async (workspaceId: string, exclude?: Array<"ACTIVITY_INFO">) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await AacApi_GetAnalyticsModelAac(sdk.axios, sdk.basePath, {
                    workspaceId,
                    exclude,
                });
                return result.data;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    setWorkspaceAnalyticsModelAac: async (workspaceId: string, analyticsModel: AacAnalyticsModel) => {
        try {
            return await authApiCall(async (sdk) => {
                await AacApi_SetAnalyticsModelAac(sdk.axios, sdk.basePath, {
                    workspaceId,
                    aacAnalyticsModel: analyticsModel,
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    getWorkspaceLogicalModelAac: async (workspaceId: string, includeParents?: boolean) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await AacApi_GetLogicalModelAac(sdk.axios, sdk.basePath, {
                    workspaceId,
                    includeParents,
                });
                return result.data;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    setWorkspaceLogicalModelAac: async (workspaceId: string, logicalModel: AacLogicalModel) => {
        try {
            return await authApiCall(async (sdk) => {
                await AacApi_SetLogicalModelAac(sdk.axios, sdk.basePath, {
                    workspaceId,
                    aacLogicalModel: logicalModel,
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    getEntitlements: async () => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await EntitiesApi_GetAllEntitiesEntitlements(sdk.axios, sdk.basePath, {});
                return result.data.data.map((entitlement) => ({
                    id: entitlement.id,
                    value: entitlement.attributes?.value,
                    expiry: entitlement.attributes?.expiry,
                }));
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    getDataSourceById: async (id: string) => {
        try {
            return await authApiCall(async (sdk) => {
                return EntitiesApi_GetEntityDataSources(sdk.axios, sdk.basePath, {
                    id,
                }).then((axiosResponse: any) => ({
                    data: dataSourceResponseAsDataSourceConnectionInfo(axiosResponse.data),
                }));
            });
        } catch (error: any) {
            return { errorMessage: getDataSourceErrorMessage(error) };
        }
    },
    getDataSourceIdentifierById: async (id: string) => {
        try {
            return await authApiCall(async (sdk) => {
                return EntitiesApi_GetEntityDataSourceIdentifiers(sdk.axios, sdk.basePath, {
                    id,
                }).then((axiosResponse: any) => ({
                    data: dataSourceIdentifierOutDocumentAsDataSourceConnectionInfo(axiosResponse.data),
                }));
            });
        } catch (error: any) {
            return { errorMessage: getDataSourceErrorMessage(error) };
        }
    },
    createDataSource: async (requestData: IDataSourceUpsertRequest) => {
        const {
            id,
            name,
            password,
            schema,
            token,
            type,
            url,
            username,
            parameters,
            cacheStrategy,
            privateKey,
            privateKeyPassphrase,
            clientId,
            clientSecret,
        } = requestData;
        try {
            return await authApiCall(async (sdk) => {
                return EntitiesApi_CreateEntityDataSources(sdk.axios, sdk.basePath, {
                    jsonApiDataSourceInDocument: {
                        data: {
                            attributes: {
                                name,
                                password,
                                schema,
                                token,
                                type,
                                url,
                                username,
                                parameters,
                                cacheStrategy,
                                privateKey,
                                privateKeyPassphrase,
                                clientId,
                                clientSecret,
                            },
                            id,
                            type: "dataSource",
                        },
                    },
                }).then((axiosResponse: any) => ({
                    data: dataSourceResponseAsDataSourceConnectionInfo(axiosResponse.data),
                }));
            });
        } catch (error: any) {
            return { errorMessage: getDataSourceErrorMessage(error) };
        }
    },
    updateDataSource: async (id: string, requestData: IDataSourceUpsertRequest) => {
        const {
            id: requestDataId,
            name,
            password,
            schema,
            token,
            type,
            url,
            username,
            parameters,
            cacheStrategy,
            privateKey,
            privateKeyPassphrase,
            clientId,
            clientSecret,
        } = requestData;
        try {
            return await authApiCall(async (sdk) => {
                return EntitiesApi_UpdateEntityDataSources(sdk.axios, sdk.basePath, {
                    id,
                    jsonApiDataSourceInDocument: {
                        data: {
                            attributes: {
                                name,
                                password,
                                schema,
                                token,
                                type,
                                url,
                                username,
                                parameters,
                                cacheStrategy,
                                privateKey,
                                privateKeyPassphrase,
                                clientId,
                                clientSecret,
                            },
                            id: requestDataId,
                            type: "dataSource",
                        },
                    },
                }).then((axiosResponse: any) => ({
                    data: dataSourceResponseAsDataSourceConnectionInfo(axiosResponse.data),
                }));
            });
        } catch (error: any) {
            return { errorMessage: getDataSourceErrorMessage(error) };
        }
    },
    patchDataSource: async (id: string, requestData: IDataSourcePatchRequest) => {
        const {
            id: requestDataId,
            name,
            password,
            schema,
            token,
            type,
            url,
            username,
            parameters,
            cacheStrategy,
            privateKey,
            privateKeyPassphrase,
            clientId,
            clientSecret,
        } = requestData;
        try {
            return await authApiCall(async (sdk) => {
                return EntitiesApi_PatchEntityDataSources(sdk.axios, sdk.basePath, {
                    id,
                    jsonApiDataSourcePatchDocument: {
                        data: {
                            attributes: {
                                name,
                                password,
                                schema,
                                token,
                                type,
                                url,
                                username,
                                parameters,
                                cacheStrategy,
                                privateKey,
                                privateKeyPassphrase,
                                clientId,
                                clientSecret,
                            },
                            id: requestDataId,
                            type: "dataSource",
                        },
                    },
                }).then((axiosResponse: any) => ({
                    data: dataSourceResponseAsDataSourceConnectionInfo(axiosResponse.data),
                }));
            });
        } catch (error: any) {
            return { errorMessage: getDataSourceErrorMessage(error) };
        }
    },
    deleteDataSource: async (id: string) => {
        try {
            return await authApiCall(async (sdk) => {
                await EntitiesApi_DeleteEntityDataSources(sdk.axios, sdk.basePath, {
                    id,
                });
                return { successful: true };
            });
        } catch (error: any) {
            return { errorMessage: getDataSourceErrorMessage(error) };
        }
    },
    testDataSourceConnection: async (connectionData: IDataSourceTestConnectionRequest, id?: string) => {
        try {
            return await authApiCall(async (sdk) => {
                const promise = id
                    ? ScanModelApi_TestDataSource(sdk.axios, sdk.basePath, {
                          dataSourceId: id,
                          testRequest: connectionData,
                      })
                    : ScanModelApi_TestDataSourceDefinition(sdk.axios, sdk.basePath, {
                          testDefinitionRequest: connectionData,
                      });
                return await promise.then((axiosResponse) => axiosResponse.data);
            });
        } catch (error: any) {
            return {
                successful: false,
                error: getDataSourceErrorMessage(error),
            };
        }
    },
    getDataSourceSchemata: async (dataSourceId: string) => {
        return await authApiCall(async (sdk) => {
            return await ScanModelApi_GetDataSourceSchemata(sdk.axios, sdk.basePath, {
                dataSourceId,
            }).then((res) => {
                return res?.data.schemaNames;
            });
        });
    },
    getAllDataSources: async () => {
        return await authApiCall(async (sdk) => {
            return OrganizationUtilities.getAllPagesOf(sdk, EntitiesApi_GetAllEntitiesDataSourceIdentifiers, {
                sort: ["name"],
                metaInclude: ["permissions"],
            })
                .then(OrganizationUtilities.mergeEntitiesResults)
                .then((res: any) => {
                    return res.data.map(dataSourceIdentifierOutWithLinksAsDataSourceConnectionInfo);
                });
        });
    },
    publishLogicalModel: async (workspaceId: string, declarativeModel: DeclarativeModel) => {
        return await authApiCall(async (sdk) => {
            await LayoutApi_SetLogicalModel(sdk.axios, sdk.basePath, {
                workspaceId,
                declarativeModel,
            });
        });
    },
    getDependentEntitiesGraph: async (workspaceId: string) => {
        try {
            return await authApiCall(async (sdk) => {
                return await ActionsApi_GetDependentEntitiesGraph(sdk.axios, sdk.basePath, {
                    workspaceId,
                }).then((res) => {
                    return res?.data;
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    getDependentEntitiesGraphFromEntryPoints: async (
        workspaceId: string,
        dependentEntitiesGraphRequest: DependentEntitiesGraphRequest,
    ) => {
        try {
            return await authApiCall(async (sdk) => {
                return await ActionsApi_GetDependentEntitiesGraphFromEntryPoints(sdk.axios, sdk.basePath, {
                    workspaceId,
                    dependentEntitiesRequest: dependentEntitiesGraphRequest,
                }).then((res) => {
                    return res?.data;
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    resolveAllEntitlements: async () => {
        return authApiCall(async (sdk) =>
            ActionsApi_ResolveAllEntitlements(sdk.axios, sdk.basePath).then((res) => res.data),
        );
    },
    getAllPlatformUsage: async () => {
        return authApiCall(async (sdk) =>
            ActionsApi_AllPlatformUsage(sdk.axios, sdk.basePath).then((res) => res.data),
        );
    },
    inviteUser: async (
        requestParameters: ActionsApiProcessInvitationRequest,
        options?: AxiosRequestConfig,
    ) => {
        return authApiCall(async (sdk) => {
            return AuthApi_ProcessInvitation(sdk.axios, sdk.basePath, requestParameters, options).then(
                (res) => {
                    if (res.status == 204) {
                        return {
                            successful: true,
                        } as IInvitationUserResponse;
                    } else {
                        return {
                            successful: false,
                            errorMessage: res?.data,
                        } as IInvitationUserResponse;
                    }
                },
            );
        });
    },

    getWorkspaceDataFiltersLayout: async () => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await LayoutApi_GetWorkspaceDataFiltersLayout(sdk.axios, sdk.basePath);
                return result.data;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    setWorkspaceDataFiltersLayout: async (workspaceDataFiltersLayout: WorkspaceDataFiltersLayout) => {
        return await authApiCall(async (sdk) => {
            await LayoutApi_SetWorkspaceDataFiltersLayout(sdk.axios, sdk.basePath, {
                declarativeWorkspaceDataFilters: workspaceDataFiltersLayout,
            });
        });
    },

    getWorkspaceDataFilter: async (
        workspaceId: string,
        objectId: string,
    ): Promise<WorkspaceDataFilterResult> => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await EntitiesApi_GetEntityWorkspaceDataFilters(sdk.axios, sdk.basePath, {
                    workspaceId,
                    objectId,
                });
                return result.data;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    setWorkspaceDataFilter: async (
        workspaceId: string,
        workspaceDataFilter: WorkspaceDataFilter,
    ): Promise<void> => {
        return authApiCall(async (sdk) => {
            await EntitiesApi_CreateEntityWorkspaceDataFilters(sdk.axios, sdk.basePath, {
                workspaceId,
                jsonApiWorkspaceDataFilterInDocument: workspaceDataFilter,
            });
        });
    },

    getWorkspaceDataFilterSetting: async (
        workspaceId: string,
        objectId: string,
    ): Promise<WorkspaceDataFilterSettingResult> => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await EntitiesApi_GetEntityWorkspaceDataFilterSettings(
                    sdk.axios,
                    sdk.basePath,
                    {
                        workspaceId,
                        objectId,
                    },
                );
                return result.data;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    setWorkspaceDataFilterSetting: async (
        workspaceId: string,
        workspaceDataFilterSetting: WorkspaceDataFilterSetting,
    ): Promise<void> => {
        return await authApiCall(async (sdk) => {
            await EntitiesApi_CreateEntityWorkspaceDataFilterSettings(sdk.axios, sdk.basePath, {
                workspaceId,
                jsonApiWorkspaceDataFilterSettingInDocument: workspaceDataFilterSetting,
            });
        });
    },

    getAllCSPDirectives: async (): Promise<Array<ICSPDirective>> => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await EntitiesApi_GetAllEntitiesCspDirectives(sdk.axios, sdk.basePath, {});
                return result.data?.data || [];
            });
        } catch {
            return [];
        }
    },
    getCSPDirective: async (directiveId: string): Promise<ICSPDirective> => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await EntitiesApi_GetEntityCspDirectives(sdk.axios, sdk.basePath, {
                    id: directiveId,
                });
                return result.data?.data;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    createCSPDirective: async (requestData: ICSPDirective): Promise<ICSPDirective> => {
        try {
            return await authApiCall(async (sdk) => {
                const jsonApiCspDirectiveInDocument: JsonApiCspDirectiveInDocument = {
                    data: {
                        id: requestData.id,
                        type: "cspDirective",
                        attributes: requestData.attributes,
                    },
                };
                const result = await EntitiesApi_CreateEntityCspDirectives(sdk.axios, sdk.basePath, {
                    jsonApiCspDirectiveInDocument,
                });

                return result.data?.data;
            });
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error?.response?.data?.detail
                    ? error?.response?.data?.detail
                    : "Server error";
                throw new UnexpectedError(message, error);
            }
            throw convertApiError(error);
        }
    },
    updateCSPDirective: async (directiveId: string, requestData: ICSPDirective): Promise<ICSPDirective> => {
        try {
            return await authApiCall(async (sdk) => {
                const jsonApiCspDirectiveInDocument: JsonApiCspDirectiveInDocument = {
                    data: {
                        id: requestData.id,
                        type: "cspDirective",
                        attributes: requestData.attributes,
                    },
                };
                const result = await EntitiesApi_UpdateEntityCspDirectives(sdk.axios, sdk.basePath, {
                    id: directiveId,
                    jsonApiCspDirectiveInDocument,
                });

                return result.data?.data;
            });
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error?.response?.data?.detail
                    ? error?.response?.data?.detail
                    : "Server error";
                throw new UnexpectedError(message, error);
            }
            throw convertApiError(error);
        }
    },
    deleteCSPDirective: async (directiveId: string) => {
        try {
            await authApiCall(async (sdk) => {
                await EntitiesApi_DeleteEntityCspDirectives(sdk.axios, sdk.basePath, {
                    id: directiveId,
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    getWorkspaceCustomAppSettings: async (workspaceId: string, applicationName?: string) => {
        return await authApiCall(async (sdk) => {
            const result = await EntitiesApi_GetAllEntitiesCustomApplicationSettings(
                sdk.axios,
                sdk.basePath,
                {
                    workspaceId,
                },
            );
            const responseData = result.data;
            if (applicationName) {
                responseData.data = responseData.data.filter(
                    (setting) => setting.attributes.applicationName === applicationName,
                );
            }
            return responseData.data.map((setting) =>
                customAppSettingResponseAsICustomApplicationSetting(setting),
            );
        });
    },
    getWorkspaceCustomAppSetting: async (workspaceId: string, settingId: string) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await EntitiesApi_GetEntityCustomApplicationSettings(sdk.axios, sdk.basePath, {
                    objectId: settingId,
                    workspaceId,
                });
                return customAppSettingResponseAsICustomApplicationSetting(result.data.data);
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    createWorkspaceCustomAppSetting: async (
        workspaceId: string,
        applicationName: string,
        content: object,
        settingId?: string,
    ) => {
        return await authApiCall(async (sdk) => {
            const result = await EntitiesApi_CreateEntityCustomApplicationSettings(sdk.axios, sdk.basePath, {
                workspaceId,
                jsonApiCustomApplicationSettingPostOptionalIdDocument: {
                    data: {
                        type: "customApplicationSetting",
                        id: settingId,
                        attributes: {
                            applicationName,
                            content,
                        },
                    },
                },
            });
            return customAppSettingResponseAsICustomApplicationSetting(result.data.data);
        });
    },

    deleteWorkspaceCustomAppSetting: async (workspaceId: string, settingId: string) => {
        try {
            return await authApiCall(async (sdk) => {
                await EntitiesApi_DeleteEntityCustomApplicationSettings(sdk.axios, sdk.basePath, {
                    objectId: settingId,
                    workspaceId,
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    getEntityUser: async (id: string) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await EntitiesApi_GetEntityUsers(sdk.axios, sdk.basePath, {
                    id,
                });
                const { firstname, lastname, ...userInfo } = result.data?.data.attributes || {};
                return {
                    ...userInfo,
                    firstName: firstname,
                    lastName: lastname,
                } as IUser;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    registerUploadNotification: async (dataSourceId: string) => {
        return await authApiCall(async (sdk) => {
            await ActionsApi_RegisterUploadNotification(sdk.axios, sdk.basePath, {
                dataSourceId,
            });
        });
    },

    scanSql: async (dataSourceId: string, sql: string) => {
        try {
            return await authApiCall(async (sdk) => {
                return ScanModelApi_ScanSql(sdk.axios, sdk.basePath, {
                    dataSourceId,
                    scanSqlRequest: { sql },
                }).then((response) => {
                    return response.data as ScanSqlResult;
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    checkEntityOverrides: async (
        workspaceId: string,
        hierarchyObjectIdentification: Array<HierarchyObjectIdentification>,
    ) => {
        try {
            return await authApiCall(async (sdk) => {
                return ActionsApi_CheckEntityOverrides(sdk.axios, sdk.basePath, {
                    workspaceId,
                    hierarchyObjectIdentification,
                }).then((response) => {
                    return response.data as Array<IdentifierDuplications>;
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    stagingUpload: async (file: File): Promise<UploadFileResponse> => {
        /*
         * Since the upload API has some rate limiting in place, we need to retry the upload in case of 503 errors.
         * To make the retries more efficient, we use exponential backoff with jitter so as not to overload the API.
         * On any other error, we throw the error right away: no retries there.
         */

        const body = async () =>
            await authApiCall(async (sdk) => {
                return await ResultApi_StagingUpload(sdk.axios, sdk.basePath, {
                    file,
                }).then((res: any) => {
                    return res?.data;
                });
            });

        try {
            return backOff(body, {
                // add some randomness to the delay to avoid all clients retrying at the same time
                jitter: "full",
                // retry at most 3 times
                numOfAttempts: 3,
                // wait 1s before the first retry
                startingDelay: 1000,
                // but never wait more than 4s
                maxDelay: 4000,
                // retry only on 503 errors, on this API this means that the API is overloaded
                retry: (e, _attempt) => {
                    const converted = convertApiError(e);
                    if (isUnexpectedResponseError(converted)) {
                        return converted.httpStatus === 503;
                    }
                    return false;
                },
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    analyzeCsv: async (analyzeCsvRequest: AnalyzeCsvRequest) => {
        try {
            return await authApiCall(async (sdk) => {
                return await ResultApi_AnalyzeCsv(sdk.axios, sdk.basePath, {
                    analyzeCsvRequest: analyzeCsvRequest,
                }).then((res: any) => {
                    return res?.data;
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    importCsv: async (dataSourceId: string, importCsvRequest: ImportCsvRequest) => {
        try {
            return await authApiCall(async (sdk) => {
                return await ResultApi_ImportCsv(sdk.axios, sdk.basePath, {
                    dataSourceId: dataSourceId,
                    importCsvRequest: importCsvRequest,
                }).then((res: any) => {
                    return res?.data;
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    listFiles: async (dataSourceId: string) => {
        try {
            return await authApiCall(async (sdk) => {
                return await ResultApi_ListFiles(sdk.axios, sdk.basePath, {
                    dataSourceId: dataSourceId,
                }).then((res: any) => {
                    return res?.data;
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    deleteFiles: async (dataSourceId: string, fileNames: string[]) => {
        try {
            return await authApiCall(async (sdk) => {
                await ResultApi_DeleteFiles(sdk.axios, sdk.basePath, {
                    dataSourceId: dataSourceId,
                    deleteFilesRequest: {
                        fileNames: fileNames,
                    },
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    readFileManifests: async (dataSourceId, fileNames) => {
        try {
            return await authApiCall(async (sdk) => {
                const request: ResultApiReadCsvFileManifestsRequest = {
                    dataSourceId: dataSourceId,
                    readCsvFileManifestsRequest: {
                        manifestRequests: fileNames.map((fileName) => ({
                            fileName,
                        })),
                    },
                };
                return await ResultApi_ReadCsvFileManifests(sdk.axios, sdk.basePath, request).then((res) => {
                    return res?.data;
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
});
