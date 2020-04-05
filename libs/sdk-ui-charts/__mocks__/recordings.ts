// (C) 2020 GoodData Corporation

import { DataViewFacade } from "@gooddata/sdk-backend-spi";
import { ScenarioRecording, recordedDataView } from "@gooddata/sdk-backend-mockingbird";

export function recordedDataFacade(rec: ScenarioRecording): DataViewFacade {
    return new DataViewFacade(recordedDataView(rec));
}
