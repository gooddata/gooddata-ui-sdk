// (C) 2007-2020 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    compositeBackend,
    CompositeBackendPart,
    recordedBackend,
    RecordedBackendConfig,
} from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { ExamplesRecordings } from "@gooddata/examples-workspace";
import { withNormalization } from "@gooddata/sdk-backend-base";

export const ReferenceWorkspaceId = "reference-workspace";
export const ExampleWorkspaceId = "example-workspace";

export function StorybookBackend(config: RecordedBackendConfig = {}): IAnalyticalBackend {
    const reference: CompositeBackendPart = {
        workspace: ReferenceWorkspaceId,
        backend: withNormalization(recordedBackend(ReferenceRecordings.Recordings, config)),
    };

    const examples: CompositeBackendPart = {
        workspace: ExampleWorkspaceId,
        backend: withNormalization(recordedBackend(ExamplesRecordings.Recordings, config)),
    };

    return compositeBackend(examples, reference);
}
