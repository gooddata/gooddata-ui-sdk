// (C) 2021-2026 GoodData Corporation

import {
    type IInsightDefinition,
    insightBuckets,
    insightProperties,
    insightVisualizationUrl,
} from "@gooddata/sdk-model";

import { getProjectId } from "../../selectors/bootstrap_selector.js";
import { type IAppState } from "../../store/types.js";

const MEASURE_GROUP_DIMENSION_CONTROLS = "measureGroupDimension";
const COLUMN_HEADERS_POSITION_CONTROLS = "columnHeadersPosition";

export type InsightStats = {
    visType: string;
    bucketNames: string[];
    propertyNames: string[];
    measureGroupDimension?: string;
    columnHeadersPosition?: string;
};

function controlsToUpdate(key: string) {
    return key === MEASURE_GROUP_DIMENSION_CONTROLS || key === COLUMN_HEADERS_POSITION_CONTROLS;
}

function getInsightConfiguration(insight: IInsightDefinition): string[] {
    const controls = insightProperties(insight)?.["controls"] ?? {};
    const updatedControls: string[] = [];

    Object.entries(controls).forEach(([key, value]) => {
        if (controlsToUpdate(key)) {
            updatedControls.push(`${key}=${value}`);
        } else {
            updatedControls.push(key);
        }
    });

    return updatedControls;
}

export function getInsightStats(insight: IInsightDefinition): InsightStats {
    return {
        visType: insightVisualizationUrl(insight),
        bucketNames: insightBuckets(insight).map((bucket) => bucket.localIdentifier ?? "unknown_bucket"),
        propertyNames: getInsightConfiguration(insight),
    };
}

export const getWorkspaceId = (state: IAppState) => getProjectId(state);
