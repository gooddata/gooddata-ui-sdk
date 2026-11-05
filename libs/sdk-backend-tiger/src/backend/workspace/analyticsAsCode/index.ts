// (C) 2026 GoodData Corporation

import { LayoutApi_PutWorkspaceLayout } from "@gooddata/api-client-tiger/endpoints/layout";
import {
    type AnalyticsAsCodeDocument,
    type IAnalyticsAsCodeDeployOptions,
    type IWorkspaceAnalyticsAsCodeService,
} from "@gooddata/sdk-backend-spi";
import { yamlDocumentsToDeclarativeWorkspace } from "@gooddata/sdk-code-convertors";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

export class TigerWorkspaceAnalyticsAsCodeService implements IWorkspaceAnalyticsAsCodeService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspace: string,
    ) {}

    public async deploy(
        documents: AnalyticsAsCodeDocument[],
        options: IAnalyticsAsCodeDeployOptions = {},
    ): Promise<void> {
        const declarativeWorkspaceModel = yamlDocumentsToDeclarativeWorkspace(documents, options);
        await this.authCall((client) =>
            LayoutApi_PutWorkspaceLayout(client.axios, client.basePath, {
                workspaceId: this.workspace,
                declarativeWorkspaceModel,
            }),
        );
    }
}
