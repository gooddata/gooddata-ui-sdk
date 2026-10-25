// (C) 2020-2026 GoodData Corporation

import { type IInsightDefinition } from "@gooddata/sdk-model";

export const emptyInsightDefinition: IInsightDefinition = {
    insight: {
        buckets: [],
        filters: [],
        properties: {},
        sorts: [],
        title: "",
        visualizationUrl: "",
    },
};
