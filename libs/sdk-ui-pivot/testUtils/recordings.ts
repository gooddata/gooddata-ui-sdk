// (C) 2020 GoodData Corporation

import { DataViewAll, type ScenarioRecording, recordedDataView } from "@gooddata/sdk-backend-mockingbird";
import { DataViewFacade } from "@gooddata/sdk-ui";

export function recordedDataFacade(rec: ScenarioRecording, dataViewId: string = DataViewAll): DataViewFacade {
    return DataViewFacade.for(recordedDataView(rec, dataViewId));
}
