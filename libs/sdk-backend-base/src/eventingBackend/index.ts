// (C) 2007-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { decoratedBackend } from "../decoratedBackend";
import { DecoratedExecutionFactory } from "../decoratedBackend/execution";
import { AnalyticalBackendCallbacks } from "./types";
import { WithExecutionEventing } from "./execution";
import { WithAttributesEventing } from "./attributes";
import { WithDashboardsEventing } from "./dashboards";

/**
 * This implementation of analytical backend decorates another implementation with support for eventing. Events
 * for significant actions are emitted to defined callback functions (event handlers).
 *
 * @param realBackend - backend supplying the actual implementation of SPI
 * @param callbacks - callbacks to event handlers
 * @beta
 */
export function withEventing(
    realBackend: IAnalyticalBackend,
    callbacks: AnalyticalBackendCallbacks,
): IAnalyticalBackend {
    if (isEmpty(callbacks)) {
        return realBackend;
    }

    return decoratedBackend(realBackend, {
        execution: (original) =>
            new DecoratedExecutionFactory(
                original,
                (execution) => new WithExecutionEventing(execution, callbacks),
            ),
        attributes: (original) => new WithAttributesEventing(original, callbacks),
        dashboards: (original, workspace) => new WithDashboardsEventing(original, workspace, callbacks),
    });
}
