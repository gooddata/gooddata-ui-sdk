// (C) 2020 GoodData Corporation

import { type ScenarioRecording, recordedDataView } from "@gooddata/sdk-backend-mockingbird";
import { DataViewFacade } from "@gooddata/sdk-ui";

export function recordedDataFacade(rec: ScenarioRecording): DataViewFacade {
    return DataViewFacade.for(recordedDataView(rec));
}
