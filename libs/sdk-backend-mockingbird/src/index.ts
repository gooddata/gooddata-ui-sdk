// (C) 2019-2020 GoodData Corporation

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
    RecordedRefType,
    SecuritySettingsUrlValidator,
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
