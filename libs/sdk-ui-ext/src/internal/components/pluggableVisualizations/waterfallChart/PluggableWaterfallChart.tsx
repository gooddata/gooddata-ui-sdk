// (C) 2023-2025 GoodData Corporation

import { cloneDeep, isEmpty, isEqual, set } from "lodash-es";

import { IInsightDefinition, newMeasureSort } from "@gooddata/sdk-model";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";

import { BUCKETS } from "../../../constants/bucket.js";
import { WATERFALL_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import {
    DEFAULT_WATERFALL_UICONFIG,
    MAX_METRICS_COUNT,
    UICONFIG,
    WATERFALL_UICONFIG_WITH_MULTIPLE_METRICS,
    WATERFALL_UICONFIG_WITH_ONE_METRIC,
} from "../../../constants/uiConfig.js";
import { ISortConfig, newAvailableSortsGroup } from "../../../interfaces/SortConfig.js";
import {
    IBucketItem,
    IExtendedReferencePoint,
    IReferencePoint,
    IUiConfig,
    IVisConstruct,
    IVisProps,
    IVisualizationProperties,
} from "../../../interfaces/Visualization.js";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig.js";
import {
    getAttributeItems,
    getBucketItems,
    getMeasureItems,
    getViewItems,
    limitNumberOfMeasuresInBuckets,
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    sanitizeFilters,
} from "../../../utils/bucketHelper.js";
import {
    getReferencePointWithSupportedProperties,
    getSupportedPropertiesControls,
} from "../../../utils/propertiesHelper.js";
import { getCustomSortDisabledExplanation, removeSort } from "../../../utils/sort.js";
import {
    getWaterfallTotalColumnName,
    setWaterfallChartUiConfig,
} from "../../../utils/uiConfigHelpers/waterfallChartUiConfigHelper.js";
import WaterfallChartConfigurationPanel from "../../configurationPanels/WaterfallChartConfigurationPanel.js";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";

/**
 * PluggableWaterfallChart
 *
 * ## Buckets
 *
 * | Name     | Id       | Accepts             |
 * |----------|----------|---------------------|
 * | Measures | measures | measures only       |
 * | ViewBy   | view     | attribute or date   |
 *
 * ### Bucket axioms
 *
 * - |ViewBy| ≤ 1
 * - |Measures| ≥ 1 ∧ ≤ 20
 * - |ViewBy| = 1 ⇒ |Measures| = 1
 * - |ViewBy| = 0 ⇒ |Measures| ≥ 1
 *
 * ## Dimensions
 *
 * The PluggableWaterfallChart always creates two dimensional execution.
 *
 * With measures only:
 * - [[], [MeasureGroupIdentifier]]
 * With viewBy:
 * - [[MeasureGroupIdentifier], [ViewBy]]
 *
 * ## Default sorts
 *
 * When Waterfall Chart is used with measures only, it's sorted by their order by default.
 * When Waterfall Chart chart is used with viewBy attribute or date, it's sorted by the values of the measure by default.
 *
 * Default sort behavior can be overriden by sortBy option.
 *
 */
export class PluggableWaterfallChart extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.WATERFALL;
        this.initializeProperties(props.visualizationProperties);
    }

    protected override getSupportedPropertiesList(): string[] {
        return WATERFALL_CHART_SUPPORTED_PROPERTIES;
    }

    protected override initializeProperties(visualizationProperties: IVisualizationProperties): void {
        const controls = visualizationProperties?.controls;

        const supportedProperties = getSupportedPropertiesControls(controls, this.supportedPropertiesList);
        const initialProperties = {
            supportedProperties: {
                controls: {
                    ...supportedProperties,
                    total: {
                        enabled: controls?.["total"]?.enabled ?? true,
                        name: getWaterfallTotalColumnName(controls?.["total"]?.name, this.intl),
                    },
                },
            },
        };

        this.pushData({
            initialProperties,
        });
    }

    public override getUiConfig(): IUiConfig {
        return cloneDeep(DEFAULT_WATERFALL_UICONFIG);
    }

    public override getExtendedReferencePoint(
        referencePoint: IReferencePoint,
    ): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: this.getUiConfig(),
        };
        newReferencePoint = removeAllArithmeticMeasuresFromDerived(newReferencePoint);
        newReferencePoint = removeAllDerivedMeasures(newReferencePoint);

        const buckets = clonedReferencePoint?.buckets ?? [];
        const attributes = getAttributeItems(buckets);

        if (attributes.length) {
            const limitedBuckets = limitNumberOfMeasuresInBuckets(buckets, 1);
            const limitedMeasures = getMeasureItems(limitedBuckets);
            set(newReferencePoint, BUCKETS, [
                {
                    localIdentifier: BucketNames.MEASURES,
                    items: limitedMeasures,
                },
                {
                    localIdentifier: BucketNames.VIEW,
                    items: attributes.slice(0, 1),
                },
            ]);
        } else {
            const limitedBuckets = limitNumberOfMeasuresInBuckets(buckets, MAX_METRICS_COUNT, true);
            const limitedMeasures = getMeasureItems(limitedBuckets);
            if (limitedMeasures.length > 1) {
                set(newReferencePoint, UICONFIG, cloneDeep(WATERFALL_UICONFIG_WITH_MULTIPLE_METRICS));
            } else {
                set(newReferencePoint, UICONFIG, cloneDeep(WATERFALL_UICONFIG_WITH_ONE_METRIC));
            }

            set(newReferencePoint, BUCKETS, [
                {
                    localIdentifier: BucketNames.MEASURES,
                    items: limitedMeasures,
                },
                {
                    localIdentifier: BucketNames.VIEW,
                    items: [],
                },
            ]);
        }

        newReferencePoint = configurePercent(newReferencePoint, false);
        newReferencePoint = configureOverTimeComparison(
            newReferencePoint,
            !!this.featureFlags["enableWeekFilters"],
        );
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = this.setPropertiesTotalMeasures(newReferencePoint);
        if (!this.featureFlags.enableChartsSorting) {
            newReferencePoint = removeSort(newReferencePoint);
        }
        newReferencePoint = setWaterfallChartUiConfig(newReferencePoint, this.intl, this.type);

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    protected getDefaultAndAvailableSort(
        measures: IBucketItem[],
        viewBy: IBucketItem[],
    ): {
        defaultSort: ISortConfig["defaultSort"];
        availableSorts: ISortConfig["availableSorts"];
    } {
        if (isEmpty(measures) || isEmpty(viewBy)) {
            return {
                defaultSort: [],
                availableSorts: [],
            };
        }
        return {
            defaultSort: [newMeasureSort(measures[0].localIdentifier, "desc")],
            availableSorts: [
                newAvailableSortsGroup(viewBy[0].localIdentifier, [measures[0].localIdentifier], true, false),
            ],
        };
    }

    private isSortDisabled(referencePoint: IReferencePoint, availableSorts: ISortConfig["availableSorts"]) {
        const { buckets } = referencePoint;
        const measures = getMeasureItems(buckets);
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const disabled = viewBy.length < 1 || measures.length < 1 || availableSorts.length === 0;
        const disabledExplanation = getCustomSortDisabledExplanation(measures, viewBy, this.intl);
        return {
            disabled,
            disabledExplanation,
        };
    }

    public override getSortConfig(referencePoint: IReferencePoint): Promise<ISortConfig> {
        const { buckets, properties, availableSorts: previousAvailableSorts } = referencePoint;
        const measures = getMeasureItems(buckets);
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const { defaultSort, availableSorts } = this.getDefaultAndAvailableSort(measures, viewBy);

        const { disabled, disabledExplanation } = this.isSortDisabled(referencePoint, availableSorts);

        return Promise.resolve({
            supported: true,
            disabled,
            appliedSort: super.reuseCurrentSort(
                previousAvailableSorts,
                properties,
                availableSorts,
                defaultSort,
            ),
            defaultSort,
            availableSorts,
            ...(disabledExplanation && { disabledExplanation }),
        });
    }

    protected override renderConfigurationPanel(insight: IInsightDefinition, options: IVisProps): void {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
            const panelConfig = {
                supportsAttributeHierarchies: this.backendCapabilities.supportsAttributeHierarchies,
                supportsChartFill: options.supportsChartFill,
            };

            this.renderFun(
                <WaterfallChartConfigurationPanel
                    locale={this.locale}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
                    pushData={this.handlePushData}
                    colors={this.colors}
                    type={this.type}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                    references={this.references}
                    dataLabelDefaultValue="auto"
                    panelConfig={panelConfig}
                    configurationPanelRenderers={options.custom?.configurationPanelRenderers}
                />,
                configPanelElement,
            );
        }
    }

    private setPropertiesTotalMeasures(referencePoint: IExtendedReferencePoint) {
        const { buckets, properties } = referencePoint;
        const viewItems = getViewItems(buckets);
        const measureItems = getMeasureItems(buckets);
        const listTotalMeasures = measureItems
            .filter((item) => item.isTotalMeasure)
            .map((item) => item.localIdentifier);
        const existingTotalMeasures = properties?.controls?.["total"]?.measures || [];

        if (measureItems.length <= 1 && existingTotalMeasures.length > 0) {
            // In case one view item, we need to reset the total measures is empty
            set(referencePoint, "properties.controls.total.measures", []);
        }

        if (viewItems.length > 0 || isEqual(listTotalMeasures, existingTotalMeasures)) {
            return referencePoint;
        }

        set(referencePoint, "properties.controls.total.measures", listTotalMeasures);
        return referencePoint;
    }
}
