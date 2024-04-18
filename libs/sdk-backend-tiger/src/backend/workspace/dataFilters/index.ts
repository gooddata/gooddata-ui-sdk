// (C) 2024 GoodData Corporation

import { IDataFiltersService } from "@gooddata/sdk-backend-spi";
import { IWorkspaceDataFilter, IWorkspaceDataFilterSetting } from "@gooddata/sdk-model";

import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { JsonApiWorkspaceDataFilterSettingOutWithLinks } from "@gooddata/api-client-tiger";

export class TigerDataFiltersService implements IDataFiltersService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public async getWorkspaceDataFilters(): Promise<IWorkspaceDataFilter[]> {
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
                        title: filter.attributes?.title,
                        settings: settingsMap[filter.id] || [],
                    };
                }) || []
            );
        });
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
                    title: setting.attributes?.title,
                    filterValues: setting.attributes?.filterValues || [],
                });
            }
            return result;
        }, {});
    }
}
