// (C) 2026 GoodData Corporation

import {
    type AttributeExecutionResultHeader,
    type DimensionHeader,
    type ExecutionResult,
} from "@gooddata/api-client-tiger";
import { type IOutliersConfig, type IOutliersResult, type IOutliersView } from "@gooddata/sdk-backend-spi";
import {
    type IAttributeDescriptor,
    type IMeasureDescriptor,
    type IResultMeasureHeader,
} from "@gooddata/sdk-model";

export function transformOutliersResult(
    result: ExecutionResult,
    outliersResults: IOutliersResult | undefined,
    outliersConfig: IOutliersConfig | undefined,
    dateAttributes: (IAttributeDescriptor & AttributeExecutionResultHeader)[] | undefined,
    transformDimensionHeaders: (
        dimensionHeaders: DimensionHeader[],
    ) => (IResultMeasureHeader & IMeasureDescriptor)[],
): IOutliersView {
    // if no outliers results or no outliers config, return empty view
    if (!outliersResults || !outliersConfig || !dateAttributes) {
        return {
            headerItems: [],
            anomalies: [],
            loading: false,
        };
    }

    const headerItems: IOutliersView["headerItems"] = [];
    const anomalies: IOutliersView["anomalies"] = [];

    const headers = transformDimensionHeaders(result.dimensionHeaders);
    headers.forEach((header) => {
        const results = outliersResults.metrics.find(
            (f) => f.localIdentifier === header.measureHeaderItem.localIdentifier,
        );
        if (results) {
            const attrs = outliersResults.attributes.slice();
            const vals = results.values.slice();

            const metricHeaderItem = header;
            const metricAnomalies: (number | null)[] = [];
            dateAttributes.forEach((da) => {
                if (da.attributeHeader.primaryLabelValue === attrs[0]) {
                    metricAnomalies.push(vals[0]);
                    vals.shift();
                    attrs.shift();
                } else {
                    metricAnomalies.push(null);
                }
            });

            headerItems.push(metricHeaderItem);
            anomalies.push(metricAnomalies);
        }
    });

    return {
        headerItems,
        anomalies,
        loading: false,
    };
}
