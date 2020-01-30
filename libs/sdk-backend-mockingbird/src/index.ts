// (C) 2019-2020 GoodData Corporation

export { dummyBackend, dummyBackendEmptyData, dummyDataView, dummyDataFacade } from "./dummyBackend";

export { recordedBackend } from "./recordedBackend";

export {
    RecordingIndex,
    ExecutionRecording,
    InsightRecording,
    DisplayFormRecording,
    RecordedBackendConfig,
} from "./recordedBackend/types";

export {
    recordedDataView,
    DataViewAll,
    dataViewWindow,
    DataViewFirstPage,
} from "./recordedBackend/execution";

export { withEventing, AnalyticalBackendCallbacks } from "./eventingBackend";

export {
    LegacyExecutionRecording,
    legacyRecordedBackend,
    legacyRecordedDataFacade,
} from "./legacyRecordedBackend";
