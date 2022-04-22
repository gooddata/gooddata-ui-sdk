// (C) 2019-2022 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import { IntlShape } from "react-intl";

import { BucketNames } from "@gooddata/sdk-ui";
import { IExtendedReferencePoint } from "../../interfaces/Visualization";
import { UICONFIG } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";
import { setBucketTitles } from "./../bucketHelper";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const scatterMeasuresXIcon = "local:scatter/bucket-title-measures-x.svg";
const scatterMeasuresYIcon = "local:scatter/bucket-title-measures-y.svg";
const scatterAttributeIcon = "local:scatter/bucket-title-attribute.svg";

export function setScatterPlotUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);

    set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], scatterMeasuresXIcon);
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.SECONDARY_MEASURES, "icon"],
        scatterMeasuresYIcon,
    );
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.ATTRIBUTE, "icon"], scatterAttributeIcon);

    return referencePointConfigured;
}
