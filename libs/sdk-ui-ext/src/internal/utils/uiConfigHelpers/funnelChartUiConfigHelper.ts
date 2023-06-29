// (C) 2019-2023 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import assign from "lodash/assign.js";

import { BucketNames } from "@gooddata/sdk-ui";
import { IExtendedReferencePoint } from "../../interfaces/Visualization.js";

import { disabledOpenAsReportConfig, UICONFIG } from "../../constants/uiConfig.js";
import { BUCKETS } from "../../constants/bucket.js";
import { configurePercent } from "../bucketConfig.js";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const funnelMeasuresIcon = "local:funnel/bucket-title-measures.svg";
const funnelViewIcon = "local:funnel/bucket-title-view.svg";

export function setFunnelChartUiConfig(referencePoint: IExtendedReferencePoint): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);

    assign(referencePointConfigured[UICONFIG], disabledOpenAsReportConfig);

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], funnelMeasuresIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], funnelViewIcon);

    // always disabled for funnel
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "isShowInPercentVisible"], false);
    configurePercent(referencePointConfigured, true);

    return referencePointConfigured;
}
