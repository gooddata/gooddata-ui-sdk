// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import set = require("lodash/set");
import get = require("lodash/get");
import * as BucketNames from "../../../constants/bucketNames";
import { getTranslation } from "../translations";

import { IExtendedReferencePoint } from "../../interfaces/Visualization";

import { UICONFIG, SUPPORTED_COMPARISON_TYPES } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";

import { getMeasureItems } from "../bucketHelper";
import { InjectedIntl } from "react-intl";
import { OverTimeComparisonTypes } from "../../../interfaces/OverTimeComparison";

export function setColumnBarChartUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: InjectedIntl,
    isEnableOptionalStacking: boolean = false,
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
        const warningMessageId = isEnableOptionalStacking
            ? "dashboard.bucket.measure_stack_by_warning"
            : "dashboard.bucket.category_stack_by_warning";
        const warningMessage = getTranslation(warningMessageId, intl);

        set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.STACK, "canAddItems"], false);
        set(
            referencePointConfigured,
            [UICONFIG, BUCKETS, BucketNames.STACK, "warningMessage"],
            warningMessage,
        );
    }

    return referencePointConfigured;
}
