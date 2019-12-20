// (C) 2019 GoodData Corporation

export { dummyBackend, dummyBackendEmptyData, dummyDataView, dummyDataFacade } from "./dummyBackend";

export { recordedBackend } from "./recordedBackend";

export { RecordingIndex, ExecutionRecording } from "./recordedBackend/types";

export { withEventing, AnalyticalBackendCallbacks } from "./eventingBackend";

export {
    LegacyExecutionRecording,
    legacyRecordedBackend,
    legacyRecordedDataFacade,
} from "./legacyRecordedBackend";
