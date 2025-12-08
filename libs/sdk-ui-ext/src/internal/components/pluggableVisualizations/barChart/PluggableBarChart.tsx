// (C) 2019-2025 GoodData Corporation

import { isEmpty } from "lodash-es";

import { IInsightDefinition, newAttributeAreaSort, newMeasureSort } from "@gooddata/sdk-model";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";

import { canSortStackTotalValue } from "./sortHelpers.js";
import { AXIS, AXIS_NAME } from "../../../constants/axis.js";
import { BAR_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import { ISortConfig, newAvailableSortsGroup } from "../../../interfaces/SortConfig.js";
import { IReferencePoint, IVisConstruct, IVisProps } from "../../../interfaces/Visualization.js";
import { getBucketItems } from "../../../utils/bucketHelper.js";
import { getCustomSortDisabledExplanation } from "../../../utils/sort.js";
import { BarChartConfigurationPanel } from "../../configurationPanels/BarChartConfigurationPanel.js";
import { PluggableColumnBarCharts } from "../PluggableColumnBarCharts.js";

/**
 * PluggableBarChart
 *
 * ## Buckets
 *
 * | Name     | Id       | Accepts             |
 * |----------|----------|---------------------|
 * | Measures | measures | measures only       |
 * | ViewBy   | view     | attributes or dates |
 * | StackBy  | stack    | attributes or dates |
 *
 * ### Bucket axioms
 *
 * - |Measures| ≥ 1
 * - |ViewBy| ≤ 2
 * - |StackBy| ≤ 1
 * - |StackBy| = 1 ⇒ |Measures| ≤ 1
 * - |StackBy| = 0 ⇒ |Measures| ≤ 20
 * - |Measures| ≥ 2 ⇒ |StackBy| = 0
 * - ∀ a, b ∈ ViewBy (isDate(a) ∧ isDate(b) ⇒ dateDataset(a) = dateDataset(b))
 *
 * ## Dimensions
 *
 * The PluggableBarChart always creates two dimensional execution.
 *
 * - |StackBy| != 0 ⇒ [[StackBy[0]], [...ViewBy, MeasureGroupIdentifier]]
 * - |StackBy| = 0 ⇒ [[MeasureGroupIdentifier], [...ViewBy]]
 *
 * ## Sorts
 *
 * Unless the user specifies otherwise, the sorts used by default are:
 *
 * - |ViewBy| = 2 ∧ |Measures| ≥ 2 ∧ ¬stackMeasures ⇒ [attributeAreaSort(ViewBy[0]), measureSort(Measures[0])]
 * - |ViewBy| = 2 ∧ ¬(|Measures| ≥ 2 ∧ ¬stackMeasures) ⇒ [attributeAreaSort(ViewBy[0]), attributeAreaSort(ViewBy[1])]
 * - |ViewBy| = 1 ∧ (|StackBy| = 1 ∨ stackMeasures) ⇒ [attributeAreaSort(ViewBy[0])]
 * - |ViewBy| = 1 ∧ ¬(|StackBy| = 1 ∨ stackMeasures) ∧ |Measures| ≥ 1 ⇒ [measureSort(Measures[0])]
 *
 * In any other case the sorts are not used.
 *
 * The sorts can be changed by the user.
 */
export class PluggableBarChart extends PluggableColumnBarCharts {
    constructor(props: IVisConstruct) {
        super(props);
        this.secondaryAxis = AXIS_NAME.SECONDARY_X;
        this.type = VisualizationTypes.BAR;
        this.defaultControlsProperties = {
            stackMeasures: false,
        };
        this.initializeProperties(props.visualizationProperties);
    }

    public override getSupportedPropertiesList(): string[] {
        return BAR_CHART_SUPPORTED_PROPERTIES[this.axis || AXIS.DUAL] || [];
    }

    protected override renderConfigurationPanel(insight: IInsightDefinition, options: IVisProps): void {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
            const panelConfig = {
                supportsAttributeHierarchies: this.backendCapabilities.supportsAttributeHierarchies,
                supportsChartFill: options.supportsChartFill,
            };

            this.renderFun(
                <BarChartConfigurationPanel
                    locale={this.locale}
                    colors={this.colors}
                    references={this.references}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
                    pushData={this.handlePushData}
                    type={this.type}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                    axis={this.axis}
                    panelConfig={panelConfig}
                    configurationPanelRenderers={options.custom?.configurationPanelRenderers}
                />,
                configPanelElement,
            );
        }
    }

    protected getDefaultAndAvailableSort(
        referencePoint: IReferencePoint,
        canSortStackTotalValue: boolean,
    ): {
        defaultSort: ISortConfig["defaultSort"];
        availableSorts: ISortConfig["availableSorts"];
    } {
        if (this.isSortDisabled(referencePoint).disabled) {
            return {
                defaultSort: [],
                availableSorts: [],
            };
        }

        const { buckets } = referencePoint;
        const measures = getBucketItems(buckets, BucketNames.MEASURES);
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const stackBy = getBucketItems(buckets, BucketNames.STACK);
        const isStacked = !isEmpty(stackBy) || canSortStackTotalValue;

        if (viewBy.length === 2 && !isEmpty(measures)) {
            return this.getSortForTwoViewBy(measures, viewBy, stackBy, isStacked, canSortStackTotalValue);
        }

        if (!isEmpty(viewBy) && isStacked) {
            return this.getSortForStackedSingleViewBy(measures, viewBy, stackBy);
        }

        if (!isEmpty(viewBy) && !isEmpty(measures)) {
            return this.getSortForUnstackedSingleViewBy(measures, viewBy);
        }

        return {
            defaultSort: [],
            availableSorts: [],
        };
    }

    private getSortForTwoViewBy(
        measures: ReturnType<typeof getBucketItems>,
        viewBy: ReturnType<typeof getBucketItems>,
        stackBy: ReturnType<typeof getBucketItems>,
        isStacked: boolean,
        canSortStackTotalValue: boolean,
    ): {
        defaultSort: ISortConfig["defaultSort"];
        availableSorts: ISortConfig["availableSorts"];
    } {
        const hasMultipleMeasuresWithoutStackTotal = measures.length >= 2 && !canSortStackTotalValue;

        if (hasMultipleMeasuresWithoutStackTotal) {
            return {
                defaultSort: [
                    newAttributeAreaSort(viewBy[0].localIdentifier, "desc"),
                    newMeasureSort(measures[0].localIdentifier, "desc"),
                ],
                availableSorts: [
                    newAvailableSortsGroup(viewBy[0].localIdentifier),
                    newAvailableSortsGroup(
                        viewBy[1].localIdentifier,
                        measures.map((m) => m.localIdentifier),
                    ),
                ],
            };
        }

        const secondViewBySort = isStacked
            ? newAttributeAreaSort(viewBy[1].localIdentifier, "desc")
            : newMeasureSort(measures[0].localIdentifier, "desc");
        const measureIds = isEmpty(stackBy) ? measures.map((m) => m.localIdentifier) : [];

        return {
            defaultSort: [newAttributeAreaSort(viewBy[0].localIdentifier, "desc"), secondViewBySort],
            availableSorts: [
                newAvailableSortsGroup(viewBy[0].localIdentifier),
                newAvailableSortsGroup(
                    viewBy[1].localIdentifier,
                    measureIds,
                    true,
                    isStacked || measures.length > 1,
                ),
            ],
        };
    }

    private getSortForStackedSingleViewBy(
        measures: ReturnType<typeof getBucketItems>,
        viewBy: ReturnType<typeof getBucketItems>,
        stackBy: ReturnType<typeof getBucketItems>,
    ): {
        defaultSort: ISortConfig["defaultSort"];
        availableSorts: ISortConfig["availableSorts"];
    } {
        const measureIds = isEmpty(stackBy) ? measures.map((m) => m.localIdentifier) : [];

        return {
            defaultSort: [newAttributeAreaSort(viewBy[0].localIdentifier, "desc")],
            availableSorts: [newAvailableSortsGroup(viewBy[0].localIdentifier, measureIds)],
        };
    }

    private getSortForUnstackedSingleViewBy(
        measures: ReturnType<typeof getBucketItems>,
        viewBy: ReturnType<typeof getBucketItems>,
    ): {
        defaultSort: ISortConfig["defaultSort"];
        availableSorts: ISortConfig["availableSorts"];
    } {
        return {
            defaultSort: [newMeasureSort(measures[0].localIdentifier, "desc")],
            availableSorts: [
                newAvailableSortsGroup(
                    viewBy[0].localIdentifier,
                    measures.map((m) => m.localIdentifier),
                    true,
                    measures.length > 1,
                ),
            ],
        };
    }
    private isSortDisabled(referencePoint: IReferencePoint) {
        const { buckets } = referencePoint;
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const measures = getBucketItems(buckets, BucketNames.MEASURES);
        const disabled = viewBy.length < 1 || measures.length < 1;
        const disabledExplanation = getCustomSortDisabledExplanation(measures, viewBy, this.intl);
        return {
            disabled,
            disabledExplanation,
        };
    }
    public override getSortConfig(referencePoint: IReferencePoint): Promise<ISortConfig> {
        const { buckets, properties, availableSorts: previousAvailableSorts } = referencePoint;

        const { defaultSort, availableSorts } = this.getDefaultAndAvailableSort(
            referencePoint,
            canSortStackTotalValue(buckets, properties),
        );

        const { disabled, disabledExplanation } = this.isSortDisabled(referencePoint);

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
            availableSorts: availableSorts,
            ...(disabledExplanation && { disabledExplanation }),
        });
    }
}
