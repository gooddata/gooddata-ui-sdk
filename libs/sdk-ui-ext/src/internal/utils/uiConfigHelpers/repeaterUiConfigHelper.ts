// (C) 2024 GoodData Corporation

import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import { IntlShape } from "react-intl";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import { IExtendedReferencePoint, IReferencePoint, IUiConfig } from "../../interfaces/Visualization.js";
import { DEFAULT_REPEATER_UI_CONFIG, UICONFIG } from "../../constants/uiConfig.js";
import { ATTRIBUTE, BUCKETS, DATE } from "../../constants/bucket.js";
import { hasNoAttribute, hasNoColumns } from "../bucketRules.js";
import { getBucketItems, getMainRowAttribute, setBucketTitles } from "../bucketHelper.js";
import { areObjRefsEqual } from "@gooddata/sdk-model";

export const getDefaultRepeaterUiConfig = (): IUiConfig => cloneDeep(DEFAULT_REPEATER_UI_CONFIG);

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const repeaterRowsIcon = "local:repeater/bucket-title-rows.svg";
const repeaterColumnsIcon = "local:repeater/bucket-title-columns.svg";

export function setRepeaterUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);
    const buckets = referencePointConfigured?.buckets ?? [];

    const attributeCanAddItems = hasNoAttribute(buckets);
    const emptyColumns = hasNoColumns(buckets);
    const columnsCanAddItems = !attributeCanAddItems || !emptyColumns;

    set(
        referencePointConfigured,
        UICONFIG,
        setBucketTitles(referencePoint, VisualizationTypes.REPEATER, intl),
    );
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.ATTRIBUTE, "canAddItems"],
        attributeCanAddItems,
    );
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.COLUMNS, "canAddItems"],
        columnsCanAddItems,
    );

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.ATTRIBUTE, "icon"], repeaterRowsIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.COLUMNS, "icon"], repeaterColumnsIcon);

    return referencePointConfigured;
}

export const configRepeaterBuckets = (
    extendedReferencePoint: IExtendedReferencePoint,
): IExtendedReferencePoint => {
    const newExtendedReferencePoint = cloneDeep(extendedReferencePoint);
    const { attribute, columns } = getRepeaterBucketItems(newExtendedReferencePoint);

    set(newExtendedReferencePoint, BUCKETS, [
        {
            localIdentifier: BucketNames.ATTRIBUTE,
            items: attribute,
        },
        {
            localIdentifier: BucketNames.COLUMNS,
            items: columns,
        },
    ]);

    return newExtendedReferencePoint;
};

const getRepeaterBucketItems = (extendedReferencePoint: IReferencePoint) => {
    const newExtendedReferencePoint = cloneDeep(extendedReferencePoint);
    const buckets = newExtendedReferencePoint?.buckets ?? [];
    const rowAttribute = getMainRowAttribute(buckets);
    const columns = getBucketItems(buckets, BucketNames.COLUMNS);

    const validColumns = columns
        .filter((column) => column.type !== DATE)
        .filter((column) => {
            if (rowAttribute && column.type === ATTRIBUTE) {
                const isSameLabel = areObjRefsEqual(column.dfRef, rowAttribute.dfRef);
                const isSameAttributeButDifferentLabel = column.displayForms?.some((df) =>
                    areObjRefsEqual(df.ref, rowAttribute.dfRef),
                );
                return isSameLabel || isSameAttributeButDifferentLabel;
            }

            return true;
        });

    return {
        attribute: rowAttribute ? [rowAttribute] : [],
        columns: validColumns.length ? validColumns : [],
    };
};
