// (C) 2019-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import assign from "lodash/assign";

import { BucketNames } from "@gooddata/sdk-ui";
import { IExtendedReferencePoint } from "../../interfaces/Visualization";

import { disabledOpenAsReportConfig, UICONFIG } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";

import funnelMeasuresIcon from "../../assets/funnel/bucket-title-measures.svg";
import funnelViewIcon from "../../assets/funnel/bucket-title-view.svg";

export function setFunnelChartUiConfig(referencePoint: IExtendedReferencePoint): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);

    assign(referencePointConfigured[UICONFIG], disabledOpenAsReportConfig);

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], funnelMeasuresIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], funnelViewIcon);

    return referencePointConfigured;
}
