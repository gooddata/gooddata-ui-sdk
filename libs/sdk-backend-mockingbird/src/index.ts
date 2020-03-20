// (C) 2019-2020 GoodData Corporation

import {
    dummyBackend,
    dummyBackendEmptyData,
    dummyDataView,
    dummyDataFacade,
} from "@gooddata/sdk-backend-base";
export { dummyBackend, dummyBackendEmptyData, dummyDataView, dummyDataFacade };

export { recordedBackend } from "./recordedBackend";

export {
    RecordingIndex,
    ExecutionRecording,
    InsightRecording,
    DisplayFormRecording,
    ScenarioRecording,
    RecordedBackendConfig,
} from "./recordedBackend/types";

export {
    recordedDataView,
    DataViewAll,
    dataViewWindow,
    DataViewFirstPage,
} from "./recordedBackend/execution";

export {
    LegacyExecutionRecording,
    legacyRecordedBackend,
    legacyRecordedDataFacade,
} from "./legacyRecordedBackend";
