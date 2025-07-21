// (C) 2025 GoodData Corporation
import set from "lodash/set.js";
import cloneDeep from "lodash/cloneDeep.js";
import forEach from "lodash/forEach.js";
import { IntlShape } from "react-intl";

import { ISettings } from "@gooddata/sdk-model";
import { BucketNames, OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { IExtendedReferencePoint, IUiConfig, IBucketOfFun } from "../../interfaces/Visualization.js";

import {
    UICONFIG,
    MAX_TABLE_CATEGORIES_COUNT,
    MAX_METRICS_COUNT,
    measuresBase,
    viewBase,
    defaultFilters,
    defaultRootUiConfigProperties,
    disabledOpenAsReportConfig,
    INCREASE_MAX_TABLE_MEASURE_ITEMS_LIMIT,
    INCREASE_MAX_TABLE_ATTRIBUTES_ITEMS_LIMIT,
} from "../../constants/uiConfig.js";
import { BUCKETS } from "../../constants/bucket.js";

import {
    hasNoColumns,
    hasMeasuresOrRowsUnderLowerLimit,
    canIncreasedTableMeasuresAddMoreItems,
    canIncreasedTableAttributesAddMoreItems,
} from "../bucketRules.js";
import { setBucketTitles } from "../bucketHelper.js";
import { getTranslation } from "../translations.js";
import { messages } from "../../../locales.js";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const tableMeasuresIcon = "local:table/bucket-title-measures.svg";
const tableRowsIcon = "local:table/bucket-title-rows.svg";
const tableColumnsIcon = "local:table/bucket-title-columns.svg";

function setPivotTableNextBucketWarningMessages(referencePoint: IExtendedReferencePoint, intl?: IntlShape) {
    const buckets = referencePoint?.buckets;
    const updatedUiConfig = cloneDeep(referencePoint?.uiConfig);

    const hasColumns = !hasNoColumns(buckets);
    forEach(buckets, (bucket) => {
        const localIdentifier = bucket?.localIdentifier ?? "";
        const bucketUiConfig = updatedUiConfig?.buckets?.[localIdentifier];

        if (!bucketUiConfig?.canAddItems) {
            let warningMessageId;
            let warningMessageValues = {};

            if (bucket.localIdentifier === BucketNames.COLUMNS) {
                warningMessageId = messages.columns.id;
                warningMessageValues = {
                    oldLimit: MAX_METRICS_COUNT,
                    oldRowsLimit: MAX_TABLE_CATEGORIES_COUNT,
                };
            } else if (hasColumns) {
                warningMessageId = messages.measuresAttributes.id;

                if (bucket.localIdentifier === BucketNames.MEASURES) {
                    warningMessageValues = {
                        limit: INCREASE_MAX_TABLE_MEASURE_ITEMS_LIMIT - MAX_METRICS_COUNT,
                    };
                } else {
                    warningMessageValues = {
                        limit: INCREASE_MAX_TABLE_ATTRIBUTES_ITEMS_LIMIT - MAX_TABLE_CATEGORIES_COUNT,
                    };
                }
            }

            if (warningMessageId) {
                const warningMessage = getTranslation(warningMessageId, intl, warningMessageValues);
                set(updatedUiConfig, [BUCKETS, localIdentifier, "warningMessage"], warningMessage);
            }
        }
    });

    return updatedUiConfig;
}

export function getPivotTableNextMeasuresLimit(settings: ISettings, buckets: IBucketOfFun[]) {
    const isLimitIncreased = settings?.enablePivotTableIncreaseBucketSize;
    if (hasNoColumns(buckets)) {
        return isLimitIncreased ? INCREASE_MAX_TABLE_MEASURE_ITEMS_LIMIT : MAX_METRICS_COUNT;
    }

    return MAX_METRICS_COUNT;
}

export function setPivotTableNextUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
    settings: ISettings,
): void {
    const buckets = referencePoint?.buckets ?? [];

    set(referencePoint, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));

    if (settings?.enablePivotTableTransposition) {
        const messageId =
            referencePoint.properties?.controls?.measureGroupDimension === "rows"
                ? messages["inRows"].id
                : messages["inColumns"].id;
        const subtitle = getTranslation(messageId, intl);
        set(referencePoint, [UICONFIG, BUCKETS, BucketNames.MEASURES, "subtitle"], subtitle);
    }

    if (settings?.enablePivotTableIncreaseBucketSize) {
        const canMeasuresAddItems = canIncreasedTableMeasuresAddMoreItems(buckets);
        const canAttributesAddItems = canIncreasedTableAttributesAddMoreItems(buckets);
        const columnsCanAddItems = hasMeasuresOrRowsUnderLowerLimit(buckets);

        const columnsEmpty = hasNoColumns(buckets);

        set(referencePoint, [UICONFIG, BUCKETS, BucketNames.MEASURES, "canAddItems"], canMeasuresAddItems);
        set(referencePoint, [UICONFIG, BUCKETS, BucketNames.ATTRIBUTE, "canAddItems"], canAttributesAddItems);
        set(referencePoint, [UICONFIG, BUCKETS, BucketNames.COLUMNS, "canAddItems"], columnsCanAddItems);

        set(
            referencePoint,
            [UICONFIG, BUCKETS, BucketNames.MEASURES, "itemsLimit"],
            columnsEmpty ? INCREASE_MAX_TABLE_MEASURE_ITEMS_LIMIT : MAX_METRICS_COUNT,
        );
        set(
            referencePoint,
            [UICONFIG, BUCKETS, BucketNames.ATTRIBUTE, "itemsLimit"],
            columnsEmpty ? INCREASE_MAX_TABLE_ATTRIBUTES_ITEMS_LIMIT : MAX_TABLE_CATEGORIES_COUNT,
        );

        set(referencePoint, UICONFIG, setPivotTableNextBucketWarningMessages(referencePoint, intl));
    } else {
        set(referencePoint, [UICONFIG, BUCKETS, BucketNames.MEASURES, "canAddItems"], true);
        set(referencePoint, [UICONFIG, BUCKETS, BucketNames.ATTRIBUTE, "canAddItems"], true);
        set(referencePoint, [UICONFIG, BUCKETS, BucketNames.COLUMNS, "canAddItems"], true);
    }

    set(referencePoint, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], tableMeasuresIcon);
    set(referencePoint, [UICONFIG, BUCKETS, BucketNames.ATTRIBUTE, "icon"], tableRowsIcon);
    set(referencePoint, [UICONFIG, BUCKETS, BucketNames.COLUMNS, "icon"], tableColumnsIcon);
}

export function getPivotTableNextDefaultUiConfig(): IUiConfig {
    return {
        buckets: {
            measures: {
                ...measuresBase,
            },
            attribute: {
                ...viewBase,
                allowsSwapping: true,
                allowsReordering: true,
                itemsLimit: MAX_TABLE_CATEGORIES_COUNT,
                allowsDuplicateDates: true,
                itemsLimitByType: {
                    date: MAX_TABLE_CATEGORIES_COUNT,
                },
            },
            columns: {
                ...viewBase,
                allowsSwapping: true,
                allowsReordering: true,
                itemsLimit: MAX_TABLE_CATEGORIES_COUNT,
                allowsDuplicateDates: true,
                itemsLimitByType: {
                    date: MAX_TABLE_CATEGORIES_COUNT,
                },
            },
            ...defaultFilters,
        },
        ...defaultRootUiConfigProperties,
        ...disabledOpenAsReportConfig,
        supportedOverTimeComparisonTypes: [
            OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            OverTimeComparisonTypes.PREVIOUS_PERIOD,
        ],
        recommendations: {
            supportsFilteringRecommendation: false,
        },
    };
}
