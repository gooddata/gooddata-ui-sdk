// (C) 2019-2024 GoodData Corporation
/**
 * This package provides a mock Analytical Backend implementation used mainly for testing.
 *
 * @remarks
 * For the GoodData Cloud and GoodData.CN version, see `@gooddata/sdk-backend-tiger`.
 *
 * @packageDocumentation
 */
import { dummyBackend, dummyBackendEmptyData, dummyDataView } from "@gooddata/sdk-backend-base";
export { dummyBackend, dummyBackendEmptyData, dummyDataView };

export { recordedBackend, defaultRecordedBackendCapabilities } from "./recordedBackend/index.js";

export type {
    RecordingIndex,
    ExecutionRecording,
    InsightRecording,
    DisplayFormRecording,
    ScenarioRecording,
    RecordedBackendConfig,
    CatalogRecording,
    VisClassesRecording,
    DashboardRecording,
    RecordedRefType,
    SecuritySettingsUrlValidator,
    SecuritySettingsOrganizationScope,
    SecuritySettingsPluginUrlValidator,
    IUserGroup,
    IUsers,
    IAccessControl,
    IUserManagement,
    AttributeElementsFiltering,
    AttributeElementsFilteringPredicate,
} from "./recordedBackend/types.js";

export type { NamedDataView } from "./recordedBackend/execution.js";
export {
    recordedDataView,
    recordedDataViews,
    recordedInsight,
    recordedInsights,
    DataViewAll,
    dataViewWindow,
    DataViewFirstPage,
} from "./recordedBackend/execution.js";

export {
    newAttributeFilterLimitingItem,
    newDateFilterLimitingItem,
    newMeasureLimitingItem,
} from "./recordedBackend/elementsUtils.js";

export type { CompositeBackendPart } from "./compositeBackend/index.js";
export { compositeBackend } from "./compositeBackend/index.js";

export type {
    LegacyExecutionRecording,
    LegacyRecordingIndex,
    LegacyWorkspaceRecordings,
} from "./legacyRecordedBackend/index.js";
export { legacyRecordedBackend, legacyRecordedDataView } from "./legacyRecordedBackend/index.js";

export { objRefsToStringKey } from "./recordedBackend/utils.js";
