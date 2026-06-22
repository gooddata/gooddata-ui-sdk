// (C) 2026 GoodData Corporation

import { type IChatConversationVisualisationContent } from "@gooddata/sdk-backend-spi";
import { type IAttributeOrMeasure, isMeasure, isMeasureDescriptor } from "@gooddata/sdk-model";
import { type IHeaderPredicate } from "@gooddata/sdk-ui";

export function changeAnalysisDrills(
    visualization: IChatConversationVisualisationContent["visualization"] | undefined,
    enableDrilling: boolean,
    enableChangeAnalysis: boolean,
) {
    if (visualization?.insight && enableChangeAnalysis && enableDrilling) {
        const disableKeyDriveAnalysisOn = (visualization.insight.properties?.["controls"]
            ?.disableKeyDriveAnalysisOn ?? {}) as Record<string, boolean>;

        return visualization.insight.buckets
            .flatMap((bucket) => {
                return bucket.items.map((item) => {
                    if (isMeasure(item)) {
                        //NOTE: If KDA is disabled for this measure
                        // do not return a drill predicate to disable drilling
                        if (disableKeyDriveAnalysisOn[item.measure.localIdentifier]) {
                            return undefined;
                        }
                        return headerPredicate(item);
                    }
                    return undefined;
                });
            })
            .filter((p): p is IHeaderPredicate => !!p);
    }
    return [];
}

function headerPredicate(m: IAttributeOrMeasure): IHeaderPredicate {
    return (header) => {
        if (isMeasureDescriptor(header) && isMeasure(m)) {
            return header.measureHeaderItem.localIdentifier === m.measure.localIdentifier;
        }
        return false;
    };
}
