// (C) 2020 GoodData Corporation

import { DataViewFacade } from "@gooddata/sdk-ui";
import { ScenarioRecording, recordedDataView, DataViewAll } from "@gooddata/sdk-backend-mockingbird";

export function recordedDataFacade(rec: ScenarioRecording, dataViewId: string = DataViewAll): DataViewFacade {
    return DataViewFacade.for(recordedDataView(rec, dataViewId));
}
