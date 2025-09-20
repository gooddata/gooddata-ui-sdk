// (C) 2019-2025 GoodData Corporation

import { ComponentType } from "react";

import { flowRight } from "lodash-es";

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { withBackend } from "./BackendContext.js";
import { withWorkspace } from "./WorkspaceContext.js";
import { wrapDisplayName } from "./wrapDisplayName.js";

/**
 * Injects backend and workspace provided by BackendProvider & WorkspaceProvider to a component
 * @internal
 */
export function withContexts<T extends { backend?: IAnalyticalBackend; workspace?: string }>(
    Chart: ComponentType<T>,
): ComponentType<T> {
    return flowRight(wrapDisplayName("withContexts"), withBackend, withWorkspace)(Chart);
}
