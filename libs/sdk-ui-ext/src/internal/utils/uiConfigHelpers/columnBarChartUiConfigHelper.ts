// (C) 2019-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import get from "lodash/get";
import { BucketNames, OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { getTranslation } from "../translations";

import { IExtendedReferencePoint } from "../../interfaces/Visualization";

import { UICONFIG, SUPPORTED_COMPARISON_TYPES } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";

import { getMeasureItems } from "../bucketHelper";
import { IntlShape } from "react-intl";

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

    const buckets = get(referencePointConfigured, BUCKETS, []);
    const measures = getMeasureItems(buckets);

    if (measures.length > 1) {
        const warningMessage = getTranslation("dashboard.bucket.measure_stack_by_warning", intl);

        set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.STACK, "canAddItems"], false);
        set(
            referencePointConfigured,
            [UICONFIG, BUCKETS, BucketNames.STACK, "warningMessage"],
            warningMessage,
        );
    }

    return referencePointConfigured;
}
