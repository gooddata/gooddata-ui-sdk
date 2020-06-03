// (C) 2007-2020 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { recordedBackend, RecordedBackendConfig } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { withNormalization } from "@gooddata/sdk-backend-base";

export const ReferenceWorkspaceId = "reference-workspace";
export const ExampleWorkspaceId = "example-workspace";

export function StorybookBackend(config: RecordedBackendConfig = {}): IAnalyticalBackend {
    return withNormalization(recordedBackend(ReferenceRecordings.Recordings, config));
}
