// (C) 2019-2023 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import assign from "lodash/assign";

import { BucketNames } from "@gooddata/sdk-ui";
import { IExtendedReferencePoint } from "../../interfaces/Visualization";

import { disabledOpenAsReportConfig, UICONFIG } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";
import { getAttributeItems } from "../../utils/bucketHelper";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const pyramidMeasuresIcon = "local:pyramid/bucket-title-measures.svg";
const pyramidViewIcon = "local:pyramid/bucket-title-view.svg";

export function setPyramidChartUiConfig(referencePoint: IExtendedReferencePoint): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);

    assign(referencePointConfigured[UICONFIG], disabledOpenAsReportConfig);

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], pyramidMeasuresIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], pyramidViewIcon);

    const buckets = referencePointConfigured?.buckets ?? [];
    const attributes = getAttributeItems(buckets);
    if (attributes.length > 0) {
        set(
            referencePointConfigured,
            [UICONFIG, BUCKETS, BucketNames.MEASURES, "isShowInPercentEnabled"],
            true,
        );
    }

    return referencePointConfigured;
}
