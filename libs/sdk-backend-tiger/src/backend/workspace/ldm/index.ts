// (C) 2024-2025 GoodData Corporation

import { IDateDataset, IWorkspaceLogicalModelService } from "@gooddata/sdk-backend-spi";

import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

export class TigerWorkspaceLogicalModelService implements IWorkspaceLogicalModelService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
    ) {}

    getDatasets(includeParents: boolean): Promise<IDateDataset[]> {
        return this.authCall(async (client) => {
            return client.declarativeLayout
                .getLogicalModel({ workspaceId: this.workspace, includeParents })
                .then(
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
