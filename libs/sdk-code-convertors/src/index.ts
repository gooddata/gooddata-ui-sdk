// (C) 2024-2026 GoodData Corporation

/* oxlint-disable no-barrel-files/no-barrel-files */

// AAC schema types (curated public surface — isolates api-extractor from generated internals)
export type {
    AacAttributeHierarchy,
    AacDashboard,
    AacDashboardFilters,
    AacDataset,
    AacDateDataset,
    AacMetadata,
    AacMetric,
    AacPlugin,
    AacQuery,
    AacSection,
    AacVisualisation,
} from "./schemas/types.js";

// Core types
export {
    type ExportEntities,
    type FromEntities,
    type Profile,
    type ToExecutionResults,
    type DashboardTab,
    BucketsType,
} from "./types.js";

// Entity converters: YAML → Declarative API
export { yamlDatasetToDeclarative } from "./to/yamlDatasetToDeclarative.js";
export { yamlDateDatesetToDeclarative } from "./to/yamlDateDatasetToDeclarative.js";
export { yamlMetricToDeclarative } from "./to/yamlMetricToDeclarative.js";
export { yamlVisualisationToDeclarative } from "./to/yamlVisualisationToDeclarative.js";
export { yamlDashboardToDeclarative } from "./to/yamlDashboardToDeclarative.js";
export { yamlPluginToDeclarative } from "./to/yamlPluginToDeclarative.js";
export { yamlAttributeHierarchyToDeclarative } from "./to/yamlAttributeHierarchyToDeclarative.js";

// Entity converters: Declarative API → YAML
export { declarativeDatasetToYaml } from "./from/declarativeDatasetToYaml.js";
export { declarativeDateInstanceToYaml } from "./from/declarativeDateInstanceToYaml.js";
export { declarativeMetricToYaml } from "./from/declarativeMetricToYaml.js";
export { declarativeVisualisationToYaml } from "./from/declarativeVisualisationToYaml.js";
export { declarativeDashboardToYaml } from "./from/declarativeDashboardToYaml.js";
export { declarativePluginToYaml } from "./from/declarativePluginToYaml.js";
export { declarativeAttributeHierarchyToYaml } from "./from/declarativeAttributeHierarchyToYaml.js";

// Execution
export { buildAfmExecution } from "./execution/buildAfmExecution.js";
