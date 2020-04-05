// (C) 2020 GoodData Corporation

import { DataViewFacade } from "@gooddata/sdk-backend-spi";
import { ScenarioRecording, recordedDataView, DataViewAll } from "@gooddata/sdk-backend-mockingbird";

export function recordedDataFacade(rec: ScenarioRecording, dataViewId: string = DataViewAll): DataViewFacade {
    return new DataViewFacade(recordedDataView(rec, dataViewId));
}
