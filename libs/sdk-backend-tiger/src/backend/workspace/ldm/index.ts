// (C) 2024-2025 GoodData Corporation

import { LayoutApi_GetLogicalModel } from "@gooddata/api-client-tiger/layout";
import { type IDateDataset, type IWorkspaceLogicalModelService } from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

export class TigerWorkspaceLogicalModelService implements IWorkspaceLogicalModelService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
    ) {}

    getDatasets(includeParents: boolean): Promise<IDateDataset[]> {
        return this.authCall(async (client) => {
            return LayoutApi_GetLogicalModel(client.axios, client.basePath, {
                workspaceId: this.workspace,
                includeParents,
            }).then(
                (response) =>
                    response?.data?.ldm?.datasets?.map((dataset) => ({
                        id: dataset.id,
                        title: dataset.title,
                        description: dataset.description,
                    })) || [],
            );
        });
    }
}
