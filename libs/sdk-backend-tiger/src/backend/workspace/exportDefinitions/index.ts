// (C) 2019-2026 GoodData Corporation

import {
    type EntitiesApiGetAllEntitiesExportDefinitionsRequest,
    MetadataUtilities,
    ValidateRelationsHeader,
} from "@gooddata/api-client-tiger";
import {
    EntitiesApi_CreateEntityExportDefinitions,
    EntitiesApi_DeleteEntityExportDefinitions,
    EntitiesApi_GetAllEntitiesExportDefinitions,
    EntitiesApi_GetEntityExportDefinitions,
    EntitiesApi_UpdateEntityExportDefinitions,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { InMemoryPaging } from "@gooddata/sdk-backend-base";
import {
    type IExportDefinitionsQuery,
    type IExportDefinitionsQueryOptions,
    type IExportDefinitionsQueryResult,
    type IGetExportDefinitionOptions,
    type IWorkspaceExportDefinitionsService,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import {
    type IExportDefinitionMetadataObject,
    type IExportDefinitionMetadataObjectDefinition,
    type ObjRef,
    objRefToString,
} from "@gooddata/sdk-model";

import { convertExportDefinitionMdObject as convertExportDefinitionMdObjectFromBackend } from "../../../convertors/fromBackend/ExportDefinitionsConverter.js";
import {
    convertExportDefinitionMdObjectDefinition as convertExportDefinitionMdObjectDefinitionToBackend,
    convertExportDefinitionMdObject as convertExportDefinitionMdObjectToBackend,
} from "../../../convertors/toBackend/ExportDefinitionsConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefToIdentifier } from "../../../utils/api.js";

import { ExportDefinitionsQuery } from "./exportDefinitionsQuery.js";

export class TigerWorkspaceExportDefinitions implements IWorkspaceExportDefinitionsService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
    ) {}

    public getExportDefinitions = async (
        options?: IExportDefinitionsQueryOptions,
    ): Promise<IExportDefinitionsQueryResult> => {
        const requestParameters = this.getExportDefinitionsRequestParameters(options);

        const allExportDefinitions = await this.authCall((client) => {
            return MetadataUtilities.getAllPagesOf(
                client,
                EntitiesApi_GetAllEntitiesExportDefinitions,
                requestParameters,
                { headers: ValidateRelationsHeader },
            )
                .then(MetadataUtilities.mergeEntitiesResults)
                .then(MetadataUtilities.filterValidEntities)
                .then((res) => {
                    if (options?.title) {
                        const lowercaseSearch = options.title.toLocaleLowerCase();

                        return res.data
                            .filter((ed) => {
                                const title = ed.attributes?.title;

                                return title && title.toLowerCase().indexOf(lowercaseSearch) > -1;
                            })
                            .map((ed) => convertExportDefinitionMdObjectFromBackend(ed, res.included));
                    }
                    return res.data.map((ep) => convertExportDefinitionMdObjectFromBackend(ep, res.included));
                });
        });

        /*
         * The InMemory paging here is used similarly here as in the insights service getInsights method and is only a temporary solution.
         * TODO: replace InMemoryPaging with ServerPaging (https://gooddata.atlassian.net/browse/STL-397) once https://gooddata.atlassian.net/browse/STL-369 has been implemented for insights service.
         */
        return new InMemoryPaging(allExportDefinitions, options?.limit ?? 50, options?.offset ?? 0);
    };

    public getExportDefinitionsQuery = (): IExportDefinitionsQuery => {
        return new ExportDefinitionsQuery(this.authCall, { workspaceId: this.workspace });
    };

    private getExportDefinitionsRequestParameters = (
        options?: IExportDefinitionsQueryOptions,
    ): EntitiesApiGetAllEntitiesExportDefinitionsRequest => {
        const orderBy = options?.orderBy;
        const usesOrderingByUpdated = !orderBy || orderBy === "updated";
        const sortConfiguration = usesOrderingByUpdated
            ? { sort: ["modifiedAt,createdAt,title,desc"] }
            : { sort: [orderBy] };
        const includeUser =
            options?.loadUserData || options?.author
                ? { include: ["createdBy" as const, "modifiedBy" as const] }
                : {};
        const authorFilter = options?.author ? { filter: `createdBy.id=='${options?.author}'` } : {};

        return { workspaceId: this.workspace, ...sortConfiguration, ...includeUser, ...authorFilter };
    };

    public getExportDefinition = async (
        ref: ObjRef,
        options: IGetExportDefinitionOptions = {},
    ): Promise<IExportDefinitionMetadataObject> => {
        const id = objRefToIdentifier(ref, this.authCall);

        const includeUser = options?.loadUserData
            ? { include: ["createdBy" as const, "modifiedBy" as const] }
            : {};
        const response = await this.authCall((client) =>
            EntitiesApi_GetEntityExportDefinitions(client.axios, client.basePath, {
                objectId: id,
                workspaceId: this.workspace,
                ...includeUser,
            }),
        );

        if (!response.data) {
            throw new UnexpectedError(`Export definition for ${objRefToString(ref)} not found!`);
        }

        return convertExportDefinitionMdObjectFromBackend(response.data.data, response.data.included);
    };

    public createExportDefinition = async (
        exportDefinition: IExportDefinitionMetadataObjectDefinition,
    ): Promise<IExportDefinitionMetadataObject> => {
        const createResponse = await this.authCall((client) => {
            return EntitiesApi_CreateEntityExportDefinitions(client.axios, client.basePath, {
                workspaceId: this.workspace,
                jsonApiExportDefinitionPostOptionalIdDocument:
                    convertExportDefinitionMdObjectDefinitionToBackend(exportDefinition),
            });
        });

        return convertExportDefinitionMdObjectFromBackend(
            createResponse.data.data,
            createResponse.data.included,
        );
    };

    public updateExportDefinition = async (
        ref: ObjRef,
        exportDefinition: IExportDefinitionMetadataObjectDefinition,
    ): Promise<IExportDefinitionMetadataObject> => {
        const id = objRefToIdentifier(ref, this.authCall);

        const updateResponse = await this.authCall((client) => {
            return EntitiesApi_UpdateEntityExportDefinitions(client.axios, client.basePath, {
                objectId: id,
                workspaceId: this.workspace,
                jsonApiExportDefinitionInDocument: convertExportDefinitionMdObjectToBackend(
                    exportDefinition,
                    id,
                ),
            });
        });

        return convertExportDefinitionMdObjectFromBackend(
            updateResponse.data.data,
            updateResponse.data.included,
        );
    };

    public deleteExportDefinition = async (ref: ObjRef): Promise<void> => {
        const id = objRefToIdentifier(ref, this.authCall);

        await this.authCall((client) =>
            EntitiesApi_DeleteEntityExportDefinitions(client.axios, client.basePath, {
                objectId: id,
                workspaceId: this.workspace,
            }),
        );
    };
}
