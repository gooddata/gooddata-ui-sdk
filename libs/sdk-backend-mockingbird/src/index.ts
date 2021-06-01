// (C) 2019-2021 GoodData Corporation
/**
 * @packageDocumentation
 */
import { dummyBackend, dummyBackendEmptyData, dummyDataView } from "@gooddata/sdk-backend-base";
export { dummyBackend, dummyBackendEmptyData, dummyDataView };

export { recordedBackend } from "./recordedBackend";

export {
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
} from "./recordedBackend/types";

export {
    recordedDataView,
    recordedDataViews,
    recordedInsight,
    DataViewAll,
    dataViewWindow,
    DataViewFirstPage,
    NamedDataView,
} from "./recordedBackend/execution";

export { CompositeBackendPart, compositeBackend } from "./compositeBackend/index";

export {
    LegacyExecutionRecording,
    legacyRecordedBackend,
    legacyRecordedDataView,
    LegacyRecordingIndex,
    LegacyWorkspaceRecordings,
} from "./legacyRecordedBackend";
