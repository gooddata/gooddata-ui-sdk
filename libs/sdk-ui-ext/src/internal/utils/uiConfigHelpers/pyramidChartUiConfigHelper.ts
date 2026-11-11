// (C) 2019-2026 GoodData Corporation

import { BucketNames } from "@gooddata/sdk-ui";
import { _cloneDeep, _set } from "@gooddata/util";

import { BUCKETS } from "../../constants/bucket.js";
import { UICONFIG, disabledOpenAsReportConfig } from "../../constants/uiConfig.js";
import { type IExtendedReferencePoint } from "../../interfaces/Visualization.js";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const pyramidMeasuresIcon = "local:pyramid/bucket-title-measures.svg";
const pyramidViewIcon = "local:pyramid/bucket-title-view.svg";

export function setPyramidChartUiConfig(referencePoint: IExtendedReferencePoint): IExtendedReferencePoint {
    const referencePointConfigured = _cloneDeep(referencePoint);

    Object.assign(referencePointConfigured[UICONFIG]!, disabledOpenAsReportConfig);

    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], pyramidMeasuresIcon);
    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], pyramidViewIcon);

    return referencePointConfigured;
}
