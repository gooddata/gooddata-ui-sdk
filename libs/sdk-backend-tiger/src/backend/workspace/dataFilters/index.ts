// (C) 2024-2025 GoodData Corporation

import { v4 as uuid } from "uuid";

import {
    ITigerClient,
    JsonApiAnalyticalDashboardOutMetaOriginOriginTypeEnum,
    JsonApiWorkspaceDataFilterSettingOutWithLinks,
} from "@gooddata/api-client-tiger";
import { IDataFiltersService } from "@gooddata/sdk-backend-spi";
import {
    IWorkspaceDataFilter,
    IWorkspaceDataFilterDefinition,
    IWorkspaceDataFilterSetting,
    ObjRef,
    idRef,
} from "@gooddata/sdk-model";

import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefToIdentifier } from "../../../utils/api.js";

export class TigerDataFiltersService implements IDataFiltersService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
    ) {}

    public async getDataFilters(): Promise<IWorkspaceDataFilter[]> {
        return this.authCall(async (client) => {
            const [entitiesResult, settingsResult] = await Promise.all([
                client.entities.getAllEntitiesWorkspaceDataFilters({
                    workspaceId: this.workspace,
                    // For now, we don't expect there will be many data filters.
                    // Possibly all pages must be fetched or API must return paged result that already
                    // combines the data filters with setting entities, so we do not need to combine them
                    // on client.
                    size: 1000,
                }),
                client.entities.getAllEntitiesWorkspaceDataFilterSettings({
                    workspaceId: this.workspace,
                    include: ["workspaceDataFilter"],
                    size: 1000, // see comment above
                }),
            ]);
            const settingsMap = this.buildSettingsMap(settingsResult.data?.data || []);
            return (
                entitiesResult?.data?.data?.map((filter) => {
                    return {
                        id: filter.id,
                        ref: idRef(filter.id, "workspaceDataFilter"),
                        title: filter.attributes?.title,
                        columnName: filter.attributes?.columnName,
                        settings: settingsMap[filter.id] || [],
                        isInherited:
                            filter.meta?.origin?.originType ===
                            JsonApiAnalyticalDashboardOutMetaOriginOriginTypeEnum.PARENT,
                    };
                }) || []
            );
        });
    }

    public async getWorkspaceDataFilters(): Promise<IWorkspaceDataFilter[]> {
        return this.getDataFilters();
    }

    private buildSettingsMap(items: JsonApiWorkspaceDataFilterSettingOutWithLinks[]) {
        return items.reduce<{
            [key: string]: IWorkspaceDataFilterSetting[];
        }>((result, setting) => {
            const filterId = setting.relationships?.workspaceDataFilter?.data?.id;
            if (filterId) {
                if (!result[filterId]) {
                    result[filterId] = [];
                }
                result[filterId].push({
                    id: setting.id,
                    ref: idRef(setting.id, "workspaceDataFilterSetting"),
                    title: setting.attributes?.title,
                    filterValues: setting.attributes?.filterValues || [],
                    isInherited:
                        setting.meta?.origin?.originType ===
                        JsonApiAnalyticalDashboardOutMetaOriginOriginTypeEnum.PARENT,
                });
            }
            return result;
        }, {});
    }

    public createDataFilter = async (
        newDataFilter: IWorkspaceDataFilterDefinition,
    ): Promise<IWorkspaceDataFilter> => {
        return this.authCall(async (client) => {
            const result = await client.entities.createEntityWorkspaceDataFilters({
                workspaceId: this.workspace,
                jsonApiWorkspaceDataFilterInDocument: {
                    data: {
                        id: newDataFilter.id ?? uuid(),
                        type: "workspaceDataFilter",
                        attributes: {
                            title: newDataFilter.title,
                            columnName: newDataFilter.columnName,
                        },
                    },
                },
            });
            return {
                id: result.data.data.id,
                ref: idRef(result.data.data.id, "workspaceDataFilter"),
                title: result.data.data.attributes?.title,
                columnName: result.data.data.attributes?.columnName,
                settings: [],
                isInherited: false,
            };
        });
    };

    public updateDataFilter = async (
        updatedDataFilter: IWorkspaceDataFilter,
    ): Promise<IWorkspaceDataFilter> => {
        return this.authCall(async (client) => {
            const objectId = await objRefToIdentifier(updatedDataFilter.ref, this.authCall);
            await client.entities.patchEntityWorkspaceDataFilters({
                workspaceId: this.workspace,
                objectId,
                jsonApiWorkspaceDataFilterPatchDocument: {
                    data: {
                        id: objectId,
                        type: "workspaceDataFilter",
                        attributes: {
                            title: updatedDataFilter.title,
                            columnName: updatedDataFilter.columnName,
                        },
                    },
                },
            });
            return updatedDataFilter; // no reason to create entity again from response
        });
    };

    public updateDataFilterValue = async (dataFilter: ObjRef, values: string[]): Promise<void> => {
        return this.authCall(async (client) => {
            const dataFilterId = await objRefToIdentifier(dataFilter, this.authCall);
            await this.deleteExistingSettings(client, dataFilterId);

            await client.entities.createEntityWorkspaceDataFilterSettings({
                workspaceId: this.workspace,
                jsonApiWorkspaceDataFilterSettingInDocument: {
                    data: {
                        id: uuid(),
                        type: "workspaceDataFilterSetting",
                        attributes: {
                            filterValues: values,
                        },
                        relationships: {
                            workspaceDataFilter: {
                                data: {
                                    id: dataFilterId,
                                    type: "workspaceDataFilter",
                                },
                            },
                        },
                    },
                },
            });
        });
    };

    private deleteExistingSettings = async (client: ITigerClient, dataFilterId: string) => {
        const existingSettings = await client.entities.getAllEntitiesWorkspaceDataFilterSettings({
            workspaceId: this.workspace,
            filter: `workspaceDataFilter.id==${dataFilterId}`,
            include: ["workspaceDataFilter"],
        });
        await Promise.all(
            existingSettings.data.data
                .filter(
                    (setting) =>
                        setting.meta?.origin?.originType ===
                        JsonApiAnalyticalDashboardOutMetaOriginOriginTypeEnum.NATIVE,
                )
                .map((setting) =>
                    client.entities.deleteEntityWorkspaceDataFilterSettings({
                        workspaceId: this.workspace,
                        objectId: setting.id,
                    }),
                ),
        );
    };

    public deleteDataFilter = async (ref: ObjRef): Promise<void> => {
        return this.authCall(async (client) => {
            const objectId = await objRefToIdentifier(ref, this.authCall);
            await client.entities.deleteEntityWorkspaceDataFilters({
                workspaceId: this.workspace,
                objectId,
            });
        });
    };
}
