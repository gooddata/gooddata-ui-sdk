// (C) 2019-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { BucketNames, OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { _cloneDeep, _set } from "@gooddata/util";

import { messages } from "../../../locales.js";
import { BUCKETS } from "../../constants/bucket.js";
import { SUPPORTED_COMPARISON_TYPES, UICONFIG } from "../../constants/uiConfig.js";
import { type IExtendedReferencePoint } from "../../interfaces/Visualization.js";
import { getMeasureItems } from "../bucketHelper.js";
import { getTranslation } from "../translations.js";

export function setColumnBarChartUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
): IExtendedReferencePoint {
    const referencePointConfigured = _cloneDeep(referencePoint);

    _set(
        referencePointConfigured,
        [UICONFIG, SUPPORTED_COMPARISON_TYPES],
        [OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR, OverTimeComparisonTypes.PREVIOUS_PERIOD],
    );

    const buckets = referencePointConfigured?.buckets ?? [];
    const measures = getMeasureItems(buckets);

    if (measures.length > 1) {
        const warningMessage = getTranslation(messages["measureStack"].id, intl);

        _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.STACK, "canAddItems"], false);
        _set(
            referencePointConfigured,
            [UICONFIG, BUCKETS, BucketNames.STACK, "warningMessage"],
            warningMessage,
        );
    }

    return referencePointConfigured;
}
