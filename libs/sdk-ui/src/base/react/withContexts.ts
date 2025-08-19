// (C) 2019-2025 GoodData Corporation
import compose from "lodash/flowRight.js";

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { withBackend } from "./BackendContext.js";
import { withWorkspace } from "./WorkspaceContext.js";
import { wrapDisplayName } from "./wrapDisplayName.js";

/**
 * Injects backend and workspace provided by BackendProvider & WorkspaceProvider to a component
 * @internal
 */
export function withContexts<T extends { backend?: IAnalyticalBackend; workspace?: string }>(
    Chart: React.ComponentType<T>,
): React.ComponentType<T> {
    return compose(wrapDisplayName("withContexts"), withBackend, withWorkspace)(Chart);
}
