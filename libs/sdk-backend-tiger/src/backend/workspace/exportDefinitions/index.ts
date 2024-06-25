// (C) 2019-2024 GoodData Corporation
import {
    EntitiesApiGetAllEntitiesExportDefinitionsRequest,
    jsonApiHeaders,
    MetadataUtilities,
    ValidateRelationsHeader,
} from "@gooddata/api-client-tiger";
import {
    IExportDefinitionsQuery,
    IExportDefinitionsQueryOptions,
    IExportDefinitionsQueryResult,
    IGetExportDefinitionOptions,
    IWorkspaceExportDefinitionsService,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import {
    IExportDefinitionMetadataObject,
    IExportDefinitionMetadataObjectDefinition,
    ObjRef,
    objRefToString,
} from "@gooddata/sdk-model";

import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefToIdentifier } from "../../../utils/api.js";

import { InMemoryPaging } from "@gooddata/sdk-backend-base";
import { convertExportDefinitionMdObject as convertExportDefinitionMdObjectFromBackend } from "../../../convertors/fromBackend/ExportDefinitionsConverter.js";
import {
    convertExportDefinitionMdObjectDefinition as convertExportDefinitionMdObjectDefinitionToBackend,
    convertExportDefinitionMdObject as convertExportDefinitionMdObjectToBackend,
} from "../../../convertors/toBackend/ExportDefinitionsConverter.js";
import { ExportDefinitionsQuery } from "./exportDefinitionsQuery.js";
import { exportDefinitionsListComparator } from "./comparator.js";

export class TigerWorkspaceExportDefinitions implements IWorkspaceExportDefinitionsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public getExportDefinitions = async (
        options?: IExportDefinitionsQueryOptions,
    ): Promise<IExportDefinitionsQueryResult> => {
        const requestParameters = this.getExportDefinitionsRequestParameters(options);
        const allExportDefinitions = await this.authCall((client) => {
            return MetadataUtilities.getAllPagesOf(
                client,
                client.entities.getAllEntitiesExportDefinitions,
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

        // Remove when API starts to support sort=modifiedBy,createdBy,insight.title
        // (first verify that modifiedBy,createdBy behave as the code below, i.e., use createdBy if modifiedBy is
        // not defined as it is missing for the insights that were just created and never updated, also title
        // should be compared in case-insensitive manner)

        const sanitizedOrder =
            requestParameters.sort === undefined && allExportDefinitions.length > 0
                ? [...allExportDefinitions].sort(exportDefinitionsListComparator)
                : allExportDefinitions;

        /*
         * The InMemory paging here is used similarly here as in the insights service getInsights method and is only a temporary solution.
         * TODO: replace InMemoryPaging with ServerPaging (https://gooddata.atlassian.net/browse/STL-397) once https://gooddata.atlassian.net/browse/STL-369 has been implemented for insights service.
         */
        return new InMemoryPaging(sanitizedOrder, options?.limit ?? 50, options?.offset ?? 0);
    };

    public getExportDefinitionsQuery = (): IExportDefinitionsQuery => {
        return new ExportDefinitionsQuery(this.authCall, { workspaceId: this.workspace });
    };

    private getExportDefinitionsRequestParameters = (
        options?: IExportDefinitionsQueryOptions,
    ): EntitiesApiGetAllEntitiesExportDefinitionsRequest => {
        const orderBy = options?.orderBy;
        const usesOrderingByUpdated = !orderBy || orderBy === "updated";
        const sortConfiguration = usesOrderingByUpdated ? {} : { sort: [orderBy!] }; // sort: ["modifiedAt", "createdAt"]
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
        const id = await objRefToIdentifier(ref, this.authCall);
        const includeUser = options?.loadUserData
            ? { include: ["createdBy" as const, "modifiedBy" as const] }
            : {};
        const response = await this.authCall((client) =>
            client.entities.getEntityExportDefinitions(
                {
                    objectId: id,
                    workspaceId: this.workspace,
                    ...includeUser,
                },
                {
                    headers: jsonApiHeaders,
                },
            ),
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
            return client.entities.createEntityExportDefinitions(
                {
                    workspaceId: this.workspace,
                    jsonApiExportDefinitionPostOptionalIdDocument:
                        convertExportDefinitionMdObjectDefinitionToBackend(exportDefinition),
                },
                {
                    headers: jsonApiHeaders,
                },
            );
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
        const id = await objRefToIdentifier(ref, this.authCall);

        const updateResponse = await this.authCall((client) => {
            return client.entities.updateEntityExportDefinitions(
                {
                    objectId: id,
                    workspaceId: this.workspace,
                    jsonApiExportDefinitionInDocument: convertExportDefinitionMdObjectToBackend(
                        exportDefinition,
                        id,
                    ),
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });

        return convertExportDefinitionMdObjectFromBackend(
            updateResponse.data.data,
            updateResponse.data.included,
        );
    };

    public deleteExportDefinition = async (ref: ObjRef): Promise<void> => {
        const id = await objRefToIdentifier(ref, this.authCall);

        await this.authCall((client) =>
            client.entities.deleteEntityExportDefinitions({
                objectId: id,
                workspaceId: this.workspace,
            }),
        );
    };
}
