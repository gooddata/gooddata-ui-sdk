// (C) 2019-2022 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import { IntlShape } from "react-intl";

import { BucketNames, ChartType } from "@gooddata/sdk-ui";
import { IExtendedReferencePoint } from "../../interfaces/Visualization.js";
import { BUCKETS } from "../../constants/bucket.js";
import { setBucketTitles } from "../bucketHelper.js";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const comboSecondaryMeasuresIcon = "local:combo/bucket-title-secondary-measures.svg";
const columnMeasureIcon = "local:combo/bucket-title-measures-column.svg";
const columnLineIcon = "local:combo/bucket-title-view-column-line.svg";

import { UICONFIG } from "../../constants/uiConfig.js";

export function setComboChartUiConfigDeprecated(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: ChartType,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);

    set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "canAddItems"], true);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.SECONDARY_MEASURES, "canAddItems"], true);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "canAddItems"], true);

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], columnMeasureIcon);
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.SECONDARY_MEASURES, "icon"],
        comboSecondaryMeasuresIcon,
    );
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], columnLineIcon);

    return referencePointConfigured;
}
