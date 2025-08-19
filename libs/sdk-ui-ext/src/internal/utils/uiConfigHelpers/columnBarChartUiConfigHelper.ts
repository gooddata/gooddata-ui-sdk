// (C) 2019-2025 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import { IntlShape } from "react-intl";

import { BucketNames, OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { messages } from "../../../locales.js";
import { BUCKETS } from "../../constants/bucket.js";
import { SUPPORTED_COMPARISON_TYPES, UICONFIG } from "../../constants/uiConfig.js";
import { IExtendedReferencePoint } from "../../interfaces/Visualization.js";
import { getMeasureItems } from "../bucketHelper.js";
import { getTranslation } from "../translations.js";

export function setColumnBarChartUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);

    set(
        referencePointConfigured,
        [UICONFIG, SUPPORTED_COMPARISON_TYPES],
        [OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR, OverTimeComparisonTypes.PREVIOUS_PERIOD],
    );

    const buckets = referencePointConfigured?.buckets ?? [];
    const measures = getMeasureItems(buckets);

    if (measures.length > 1) {
        const warningMessage = getTranslation(messages.measureStack.id, intl);

        set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.STACK, "canAddItems"], false);
        set(
            referencePointConfigured,
            [UICONFIG, BUCKETS, BucketNames.STACK, "warningMessage"],
            warningMessage,
        );
    }

    return referencePointConfigured;
}
