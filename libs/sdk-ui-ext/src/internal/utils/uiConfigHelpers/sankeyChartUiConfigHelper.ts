// (C) 2019-2023 GoodData Corporation
import set from "lodash/set.js";
import cloneDeep from "lodash/cloneDeep.js";
import { IntlShape } from "react-intl";

import { BucketNames } from "@gooddata/sdk-ui";
import { IExtendedReferencePoint, IReferencePoint } from "../../interfaces/Visualization.js";

import { UICONFIG } from "../../constants/uiConfig.js";
import { BUCKETS } from "../../constants/bucket.js";

import {
    getAllAttributeItems,
    getAttributeFromItems,
    getAttributeToItems,
    getMeasureItems,
    limitNumberOfMeasuresInBuckets,
    setBucketTitles,
} from "../bucketHelper.js";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const measureIcon = "local:sankey/bucket-title-measures.svg";
const fromIcon = "local:sankey/bucket-title-from.svg";
const toIcon = "local:sankey/bucket-title-to.svg";

const getBucketItems = (extendedReferencePoint: IReferencePoint) => {
    const config = cloneDeep(extendedReferencePoint);

    const buckets = config?.buckets ?? [];
    const limitedBuckets = limitNumberOfMeasuresInBuckets(buckets, 1);
    const measures = getMeasureItems(limitedBuckets);
    const attributes = getAllAttributeItems(limitedBuckets);
    const attributeFromItems = getAttributeFromItems(limitedBuckets);
    const attributeToItems = getAttributeToItems(limitedBuckets);

    let attributeFrom = attributeFromItems[0];
    let attributeTo = attributeToItems[0];
    const attributesWithoutAttributeFromTo = attributes.filter(
        (it) =>
            it.localIdentifier !== attributeFrom?.localIdentifier &&
            it.localIdentifier !== attributeTo?.localIdentifier,
    );

    if (!attributeFrom) {
        attributeFrom = attributesWithoutAttributeFromTo.shift();
    }

    if (!attributeTo) {
        attributeTo = attributesWithoutAttributeFromTo.shift();
    }

    return {
        measures: measures.length ? [measures[0]] : [],
        attributeFroms: attributeFrom ? [attributeFrom] : [],
        attributeTos: attributeTo ? [attributeTo] : [],
    };
};

export const configBuckets = (extendedReferencePoint: IExtendedReferencePoint): IExtendedReferencePoint => {
    const config = cloneDeep(extendedReferencePoint);
    const { measures, attributeFroms, attributeTos } = getBucketItems(config);

    set(config, BUCKETS, [
        {
            localIdentifier: BucketNames.MEASURES,
            items: measures,
        },
        {
            localIdentifier: BucketNames.ATTRIBUTE_FROM,
            items: attributeFroms,
        },
        {
            localIdentifier: BucketNames.ATTRIBUTE_TO,
            items: attributeTos,
        },
    ]);

    return config;
};

export const configSankeyUiConfig = (
    extendedReferencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
): IExtendedReferencePoint => {
    const referencePointConfigured = cloneDeep(extendedReferencePoint);

    set(
        referencePointConfigured,
        [UICONFIG],
        setBucketTitles(referencePointConfigured, visualizationType, intl),
    );

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], measureIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.ATTRIBUTE_FROM, "icon"], fromIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.ATTRIBUTE_TO, "icon"], toIcon);

    return referencePointConfigured;
};
