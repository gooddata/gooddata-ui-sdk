// (C) 2007-2026 GoodData Corporation

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type IInsight } from "@gooddata/sdk-model";
import { FullVisualizationCatalog } from "@gooddata/sdk-ui-ext/internal";

export const isCodeGenerationSupported = (insight: IInsight, settings?: IUserWorkspaceSettings): boolean => {
    return !!FullVisualizationCatalog.forInsight(
        insight,
        settings?.enableNewPivotTable ?? true,
        settings?.enableNewGeoPushpin ?? false,
    ).getEmbeddingCode;
};
