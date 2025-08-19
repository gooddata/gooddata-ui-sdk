// (C) 2025 GoodData Corporation
import { IRequestCorrelationMetadata } from "@gooddata/sdk-backend-spi";
import { isIdentifierRef } from "@gooddata/sdk-model";
import { useBackendWithCorrelation } from "@gooddata/sdk-ui";

import { IDashboardInsightProps } from "./types.js";

/**
 * @internal
 */
export function useBackendWithInsightWidgetCorrelation(props: IDashboardInsightProps) {
    const { insight, widget, backend } = props;

    // Create correlation headers for telemetry
    let correlationData: IRequestCorrelationMetadata = {};

    // Add insight ID if available
    if (isIdentifierRef(insight.insight?.ref)) {
        correlationData = {
            visualizationId: insight.insight.ref.identifier,
        };
    }

    // Add widget ID if available
    if (isIdentifierRef(widget.ref)) {
        correlationData = {
            ...correlationData,
            widgetId: widget.ref.identifier,
        };
    }

    return useBackendWithCorrelation(backend, correlationData);
}
