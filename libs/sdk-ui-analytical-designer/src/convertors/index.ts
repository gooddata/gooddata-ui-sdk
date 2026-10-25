// (C) 2019-2026 GoodData Corporation

import { deserializeProperties, serializeProperties } from "./fromBackend/PropertiesConverter.js";
import { convertBucket, convertVisualization } from "./fromBackend/VisualizationConverter.js";
import { toAfmExecution } from "./toBackend/afm/ExecutionConverter.js";
import { convertInsight, convertInsightDefinition } from "./toBackend/InsightConverter.js";

export const BearToBackendConvertors: {
    convertInsightDefinition: typeof convertInsightDefinition;
    toAfmExecution: typeof toAfmExecution;
} = {
    convertInsightDefinition,
    toAfmExecution,
};

export const BackendToBearConvertors: {
    convertBucket: typeof convertBucket;
    convertVisualization: typeof convertVisualization;
    convertInsight: typeof convertInsight;
    deserializeProperties: typeof deserializeProperties;
    serializeProperties: typeof serializeProperties;
} = {
    convertBucket,
    convertVisualization,
    convertInsight,
    deserializeProperties,
    serializeProperties,
};
