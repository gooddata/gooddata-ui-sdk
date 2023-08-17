// (C) 2019-2022 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import { IntlShape } from "react-intl";

import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import {
    bucketMeasure,
    bucketMeasures,
    IInsightDefinition,
    IMeasure,
    insightBucket,
    ISettings,
    isPoPMeasure,
    isPreviousPeriodMeasure,
} from "@gooddata/sdk-model";
import {
    CalculationType,
    IChartConfig,
    IComparison,
    updateConfigWithSettings,
} from "@gooddata/sdk-ui-charts";

import {
    IUiConfig,
    IReferencePoint,
    IVisProps,
    IVisualizationProperties,
} from "../../interfaces/Visualization.js";
import { DEFAULT_HEADLINE_UICONFIG } from "../../constants/uiConfig.js";
import { BUCKETS } from "../../constants/bucket.js";

import { hasNoMeasures, hasNoSecondaryMeasures } from "../bucketRules.js";

import { setBucketTitles, getItemsCount } from "../bucketHelper.js";
import { getTranslation } from "../translations.js";
import { messages } from "../../../locales.js";
import { HeadlineControlProperties } from "../../interfaces/ControlProperties.js";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const headlineMeasuresIcon = "local:headline/bucket-title-measures.svg";
const headlineSecondaryMeasuresIcon = "local:headline/bucket-title-secondary-measures.svg";

export function getDefaultHeadlineUiConfig(settings?: ISettings): IUiConfig {
    const uiConfig = cloneDeep(DEFAULT_HEADLINE_UICONFIG);
    if (settings?.enableNewHeadline) {
        set(uiConfig, [BUCKETS, BucketNames.SECONDARY_MEASURES, "itemsLimit"], 2);
    }
    return uiConfig;
}

export function getHeadlineUiConfig(
    referencePoint: IReferencePoint,
    intl: IntlShape,
    settings?: ISettings,
): IUiConfig {
    let uiConfig = getDefaultHeadlineUiConfig(settings);

    const buckets = referencePoint?.buckets ?? [];
    const viewCanAddPrimaryItems = hasNoMeasures(buckets);
    const viewCanAddSecondaryItems = hasNoSecondaryMeasures(buckets);

    uiConfig = setBucketTitles(
        {
            ...referencePoint,
            uiConfig,
        },
        VisualizationTypes.HEADLINE,
        intl,
    );

    set(uiConfig, [BUCKETS, BucketNames.MEASURES, "canAddItems"], viewCanAddPrimaryItems);
    set(uiConfig, [BUCKETS, BucketNames.SECONDARY_MEASURES, "canAddItems"], viewCanAddSecondaryItems);

    set(uiConfig, [BUCKETS, BucketNames.MEASURES, "icon"], headlineMeasuresIcon);
    set(uiConfig, [BUCKETS, BucketNames.SECONDARY_MEASURES, "icon"], headlineSecondaryMeasuresIcon);

    const primaryMeasuresCount = getItemsCount(buckets, BucketNames.MEASURES);
    const secondaryMeasuresCount = getItemsCount(buckets, BucketNames.SECONDARY_MEASURES);

    if (primaryMeasuresCount === 0 && secondaryMeasuresCount !== 0) {
        uiConfig.customError = {
            heading: getTranslation(messages.heading.id, intl),
            text: getTranslation(messages.text.id, intl),
        };
    }

    if (settings?.enableNewHeadline) {
        set(uiConfig, [BUCKETS, BucketNames.SECONDARY_MEASURES, "canAddItems"], true);
        set(uiConfig, [BUCKETS, BucketNames.SECONDARY_MEASURES, "itemsLimit"], 2);
        set(uiConfig, [BUCKETS, BucketNames.SECONDARY_MEASURES, "allowsReordering"], true);
    }

    return uiConfig;
}

export function buildHeadlineVisualizationConfig(
    insight: IInsightDefinition,
    visualizationProperties: IVisualizationProperties,
    settings: ISettings,
    options: IVisProps,
): IChartConfig {
    const { config, customVisualizationConfig } = options;

    const supportedProperties = getHeadlineSupportedProperties(insight, visualizationProperties);
    const fullConfig = {
        ...config,
        ...supportedProperties.controls,
    };

    return updateConfigWithSettings({ ...fullConfig, ...customVisualizationConfig }, settings);
}

export function getHeadlineSupportedProperties(
    insight: IInsightDefinition,
    visualizationProperties: IVisualizationProperties,
): IVisualizationProperties<HeadlineControlProperties> {
    const comparison: IComparison = {
        ...getDefaultComparisonProperties(insight),
        ...(visualizationProperties?.controls?.comparison || {}),
    };

    return {
        ...visualizationProperties,
        controls: {
            ...visualizationProperties.controls,
            comparison,
        },
    };
}

export function isComparisonEnabled(insight: IInsightDefinition) {
    const primaryMeasure = insightPrimaryMeasure(insight);
    const secondaryMeasures = insightSecondaryMeasures(insight);

    return primaryMeasure && secondaryMeasures?.length === 1;
}

export function getDefaultComparisonProperties(insight?: IInsightDefinition): IComparison {
    if (insight) {
        const [secondaryMeasure] = insightSecondaryMeasures(insight);
        const secondaryIsDerivedMeasure =
            isPoPMeasure(secondaryMeasure) || isPreviousPeriodMeasure(secondaryMeasure);

        return {
            enabled: true,
            calculationType: secondaryIsDerivedMeasure ? CalculationType.CHANGE : CalculationType.RATIO,
        };
    }

    return { enabled: true };
}

function insightPrimaryMeasure(insight: IInsightDefinition): IMeasure {
    const primaryBucket = insightBucket(insight, BucketNames.MEASURES);
    return primaryBucket && bucketMeasure(primaryBucket);
}

function insightSecondaryMeasures(insight: IInsightDefinition): IMeasure[] {
    const secondaryBucket = insightBucket(insight, BucketNames.SECONDARY_MEASURES);
    return (secondaryBucket && bucketMeasures(secondaryBucket)) || [];
}
