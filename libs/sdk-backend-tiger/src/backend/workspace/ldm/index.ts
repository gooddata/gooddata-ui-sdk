// (C) 2024-2026 GoodData Corporation

import { type DeclarativeAnalyticsLayer } from "@gooddata/api-client-tiger";
import {
    LayoutApi_GetLogicalModel,
    LayoutApi_PutWorkspaceLayout,
    LayoutApi_SetLogicalModel,
} from "@gooddata/api-client-tiger/endpoints/layout";
import {
    type IDateDataset,
    type IDeclarativeLogicalModelOptions,
    type IWorkspaceLogicalModelService,
} from "@gooddata/sdk-backend-spi";
import { type IDeclarativeLogicalModel, type IDeclarativeWorkspaceLayout } from "@gooddata/sdk-model";

import { convertDeclarativeLdm } from "../../../convertors/fromBackend/DeclarativeModelConverter.js";
import { convertDeclarativeLdmToBackend } from "../../../convertors/toBackend/DeclarativeModelConverter.js";
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

    getDeclarativeModel(options?: IDeclarativeLogicalModelOptions): Promise<IDeclarativeLogicalModel> {
        return this.authCall(async (client) => {
            const response = await LayoutApi_GetLogicalModel(client.axios, client.basePath, {
                workspaceId: this.workspace,
                includeParents: options?.includeParents ?? false,
            });
            return convertDeclarativeLdm(response.data.ldm);
        });
    }

    setDeclarativeModel(model: IDeclarativeLogicalModel): Promise<void> {
        return this.authCall(async (client) => {
            await LayoutApi_SetLogicalModel(client.axios, client.basePath, {
                workspaceId: this.workspace,
                declarativeModel: { ldm: convertDeclarativeLdmToBackend(model) },
            });
        });
    }

    setDeclarativeLayout(layout: IDeclarativeWorkspaceLayout): Promise<void> {
        return this.authCall(async (client) => {
            await LayoutApi_PutWorkspaceLayout(client.axios, client.basePath, {
                workspaceId: this.workspace,
                declarativeWorkspaceModel: {
                    ldm: convertDeclarativeLdmToBackend(layout.ldm),
                    // The model does not describe the analytics document. The caller provides a backend export.
                    analytics: layout.analytics as DeclarativeAnalyticsLayer,
                },
            });
        });
    }
}
