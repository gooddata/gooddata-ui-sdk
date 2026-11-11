// (C) 2019-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { BucketNames, type ChartType } from "@gooddata/sdk-ui";
import { _cloneDeep, _set } from "@gooddata/util";

import { BUCKETS } from "../../constants/bucket.js";
import { UICONFIG } from "../../constants/uiConfig.js";
import { type IExtendedReferencePoint } from "../../interfaces/Visualization.js";
import { setBucketTitles } from "../bucketHelper.js";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const comboSecondaryMeasuresIcon = "local:combo/bucket-title-secondary-measures.svg";
const columnMeasureIcon = "local:combo/bucket-title-measures-column.svg";
const columnLineIcon = "local:combo/bucket-title-view-column-line.svg";

export function setComboChartUiConfigDeprecated(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: ChartType,
): IExtendedReferencePoint {
    const referencePointConfigured = _cloneDeep(referencePoint);

    _set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));
    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "canAddItems"], true);
    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.SECONDARY_MEASURES, "canAddItems"], true);
    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "canAddItems"], true);

    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], columnMeasureIcon);
    _set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.SECONDARY_MEASURES, "icon"],
        comboSecondaryMeasuresIcon,
    );
    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], columnLineIcon);

    return referencePointConfigured;
}
