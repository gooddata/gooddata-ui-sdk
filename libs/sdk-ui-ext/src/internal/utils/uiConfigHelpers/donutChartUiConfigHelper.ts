// (C) 2019-2025 GoodData Corporation
import { assign, cloneDeep, set } from "lodash-es";

import { BucketNames } from "@gooddata/sdk-ui";

import { BUCKETS } from "../../constants/bucket.js";
import { UICONFIG, disabledOpenAsReportConfig } from "../../constants/uiConfig.js";
import { IExtendedReferencePoint } from "../../interfaces/Visualization.js";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const donutMeasuresIcon = "local:donut/bucket-title-measures.svg";
const donutViewIcon = "local:donut/bucket-title-view.svg";

export function setDonutChartUiConfig(referencePoint: IExtendedReferencePoint): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);

    assign(referencePointConfigured[UICONFIG], disabledOpenAsReportConfig);

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], donutMeasuresIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], donutViewIcon);

    return referencePointConfigured;
}
