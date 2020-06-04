// (C) 2020 GoodData Corporation

import { DataViewFacade } from "@gooddata/sdk-ui";
import { ScenarioRecording, recordedDataView } from "@gooddata/sdk-backend-mockingbird";

export function recordedDataFacade(rec: ScenarioRecording): DataViewFacade {
    return DataViewFacade.for(recordedDataView(rec));
}
