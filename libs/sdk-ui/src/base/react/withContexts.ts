// (C) 2019-2020 GoodData Corporation
import compose from "lodash/flowRight";
import { withBackend } from "./BackendContext";
import { withWorkspace } from "./WorkspaceContext";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { wrapDisplayName } from "./wrapDisplayName";

/**
 * Injects backend and workspace provided by BackendProvider & WorkspaceProvider to a component
 * @internal
 */
export function withContexts<T extends { backend?: IAnalyticalBackend; workspace?: string }>(
    Chart: React.ComponentType<T>,
): React.ComponentType<T> {
    return compose(wrapDisplayName("withContexts"), withBackend, withWorkspace)(Chart);
}
