// (C) 2019-2022 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import { BucketNames, OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { IExtendedReferencePoint } from "../../interfaces/Visualization";

import { UICONFIG, SUPPORTED_COMPARISON_TYPES } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";

import { getMeasureItems } from "../bucketHelper";
import { IntlShape } from "react-intl";
import { getTranslation } from "../translations";
import { messages } from "../../../locales";

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
