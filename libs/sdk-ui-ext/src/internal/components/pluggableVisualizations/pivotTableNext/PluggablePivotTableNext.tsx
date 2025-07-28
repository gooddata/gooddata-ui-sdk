// (C) 2025 GoodData Corporation

import React from "react";
import {
    bucketAttributes,
    bucketMeasures,
    IDimension,
    IInsight,
    IInsightDefinition,
    insightBucket,
    insightHasDataDefined,
    insightProperties,
    insightFilters,
    insightBuckets,
    insightSanitize,
    ISettings,
    ISortItem,
} from "@gooddata/sdk-model";
import { IBackendCapabilities, IExecutionFactory } from "@gooddata/sdk-backend-spi";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import {
    CorePivotTableNext,
    ICorePivotTableNextProps,
    PivotTableNextConfig,
} from "@gooddata/sdk-ui-pivot/next";
import { ColumnHeadersPosition, ColumnWidthItem, MeasureGroupDimension } from "@gooddata/sdk-ui-pivot";
import isEmpty from "lodash/isEmpty.js";
import isEqual from "lodash/isEqual.js";
import flatMap from "lodash/flatMap.js";
import cloneDeep from "lodash/cloneDeep.js";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization.js";
import {
    IBucketFilter,
    IDrillDownContext,
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
    IVisProps,
    IVisualizationProperties,
    RenderFunction,
    UnmountFunction,
} from "../../../interfaces/Visualization.js";
import { METRIC } from "../../../constants/bucket.js";
import {
    getMeasureGroupDimensionFromProperties,
    getReferencePointWithSupportedProperties,
    getColumnWidthsFromProperties,
    getColumnHeadersPositionFromProperties,
    getSupportedPropertiesControls,
    getPivotTableProperties,
} from "../../../utils/propertiesHelper.js";
import { sanitizePivotTableConfig } from "./configHelpers.js";
import PivotTableConfigurationPanel from "../../configurationPanels/PivotTableConfigurationPanel.js";
import {
    getPivotTableNextDefaultUiConfig,
    getPivotTableNextMeasuresLimit,
    setPivotTableNextUiConfig,
} from "../../../utils/uiConfigHelpers/pivotTableNextUiConfigHelper.js";
import {
    getAllItemsByType,
    getTotalsFromBucket,
    limitNumberOfMeasuresInBuckets,
    removeDuplicateBucketItems,
    sanitizeFilters,
} from "../../../utils/bucketHelper.js";
import { PIVOT_TABLE_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig.js";
import { generateDimensions } from "../../../utils/dimensions.js";
import { isSetColumnHeadersPositionToLeftAllowed } from "../../../utils/controlsHelper.js";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    sanitizeTableProperties,
} from "../drillDownUtil.js";
import { getColumnAttributes, getRowAttributes, shouldAdjustColumnHeadersPositionToTop } from "./helpers.js";
import {
    adaptReferencePointSortItemsToPivotTable,
    addDefaultSort,
    getPivotTableSortItems,
    getSanitizedSortItems,
    sanitizePivotTableSorts,
} from "./sortHelpers.js";
import {
    adaptMdObjectWidthItemsToPivotTable,
    adaptReferencePointWidthItemsToPivotTable,
} from "./widthItemsHelpers.js";
import { removeInvalidTotals } from "./totalsHelpers.js";

const PROPERTIES_AFFECTING_REFERENCE_POINT = ["measureGroupDimension"];

/**
 * Pluggable component for pivot table next.
 *
 * This component uses CorePivotTableNext component to render the pivot table. It creates its own execution and unlike PivotTableNext or CorePivotTableNext,
 * it does its own validation and sanitization of the props from extended reference point and visualization properties.
 */
export class PluggablePivotTableNext extends AbstractPluggableVisualization {
    private renderFun: RenderFunction;
    private unmountFun: UnmountFunction;
    private readonly settings: ISettings;
    private backendCapabilities: IBackendCapabilities;

    constructor(props: IVisConstruct) {
        super(props);

        this.renderFun = props.renderFun;
        this.unmountFun = props.unmountFun;
        this.settings = props.featureFlags ?? {};
        this.onColumnResized = this.onColumnResized.bind(this);
        this.handlePushData = this.handlePushData.bind(this);
        this.supportedPropertiesList = PIVOT_TABLE_SUPPORTED_PROPERTIES;
        this.propertiesAffectingReferencePoint = PROPERTIES_AFFECTING_REFERENCE_POINT;
        this.initializeProperties(props.visualizationProperties);
        this.backendCapabilities = props.backend.capabilities;
    }

    public unmount(): void {
        this.unmountFun([this.getElement(), this.getConfigPanelElement()]);
    }

    public getExtendedReferencePoint(
        referencePoint: IReferencePoint,
        previousReferencePoint?: IReferencePoint,
    ): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        const newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: getPivotTableNextDefaultUiConfig(),
        };

        const buckets = newReferencePoint.buckets;

        const limit = getPivotTableNextMeasuresLimit(this.settings, buckets);
        const limitedBuckets = limitNumberOfMeasuresInBuckets(buckets, limit, true);
        const measures = getAllItemsByType(limitedBuckets, [METRIC]);
        const rowAttributes = getRowAttributes(buckets);
        const previousRowAttributes =
            previousReferencePoint && getRowAttributes(previousReferencePoint.buckets);

        const columnAttributes = getColumnAttributes(buckets);
        const previousColumnAttributes =
            previousReferencePoint && getColumnAttributes(previousReferencePoint.buckets);

        const filters: IBucketFilter[] = newReferencePoint.filters
            ? flatMap(newReferencePoint.filters.items, (item) => item.filters)
            : [];

        const rowTotals = removeInvalidTotals(getTotalsFromBucket(buckets, BucketNames.ATTRIBUTE), filters);
        const colTotals = removeInvalidTotals(getTotalsFromBucket(buckets, BucketNames.COLUMNS), filters);

        newReferencePoint.buckets = removeDuplicateBucketItems([
            {
                localIdentifier: BucketNames.MEASURES,
                items: measures,
            },
            {
                localIdentifier: BucketNames.ATTRIBUTE,
                items: rowAttributes,
                // This is needed because at the beginning totals property is
                // missing from buckets. If we would pass empty array or
                // totals: undefined, reference points would differ.
                ...(rowTotals.length > 0 ? { totals: rowTotals } : null),
            },
            {
                localIdentifier: BucketNames.COLUMNS,
                items: columnAttributes,
                // This is needed because at the beginning totals property is
                // missing from buckets. If we would pass empty array or
                // totals: undefined, reference points would differ.
                ...(colTotals.length > 0 ? { totals: colTotals } : null),
            },
        ]);

        const originalColumnWidths: ColumnWidthItem[] = newReferencePoint.properties?.controls?.columnWidths;
        const originalMeasureGroupDimension = newReferencePoint.properties?.controls?.measureGroupDimension;
        const originalSortItems: ISortItem[] = getSanitizedSortItems(
            newReferencePoint.properties?.sortItems,
            originalMeasureGroupDimension,
        );

        const originalColumnHeadersPosition = shouldAdjustColumnHeadersPositionToTop(
            newReferencePoint,
            rowAttributes,
            originalMeasureGroupDimension,
        )
            ? "top"
            : newReferencePoint.properties?.controls?.columnHeadersPosition;

        const columnWidths = adaptReferencePointWidthItemsToPivotTable(
            originalColumnWidths,
            measures,
            rowAttributes,
            columnAttributes,
            previousRowAttributes ? previousRowAttributes : [],
            previousColumnAttributes ? previousColumnAttributes : [],
            filters,
            originalMeasureGroupDimension,
        );

        // Build controls object with conditional properties
        const controls = {
            ...newReferencePoint.properties?.controls,
            ...(columnWidths && { columnWidths }),
            ...(originalMeasureGroupDimension && {
                measureGroupDimension: originalMeasureGroupDimension,
            }),
            ...(originalColumnHeadersPosition && {
                columnHeadersPosition: originalColumnHeadersPosition,
            }),
        };

        newReferencePoint.properties = {
            sortItems: addDefaultSort(
                adaptReferencePointSortItemsToPivotTable(
                    originalSortItems,
                    measures,
                    rowAttributes,
                    columnAttributes,
                ),
                filters,
                rowAttributes,
                previousRowAttributes,
                columnAttributes,
            ),
            controls,
        };

        setPivotTableNextUiConfig(newReferencePoint, this.intl, VisualizationTypes.TABLE, this.settings);
        configurePercent(newReferencePoint, false);
        configureOverTimeComparison(newReferencePoint, !!this.settings?.["enableWeekFilters"]);
        Object.assign(
            newReferencePoint,
            getReferencePointWithSupportedProperties(newReferencePoint, this.supportedPropertiesList),
        );

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    public getInsightWithDrillDownApplied(
        sourceVisualization: IInsight,
        drillDownContext: IDrillDownContext,
        backendSupportsElementUris: boolean,
    ): IInsight {
        const drillDownInsight = modifyBucketsAttributesForDrillDown(
            sourceVisualization,
            drillDownContext.drillDefinition,
        );
        const drillDownInsightWithFilters = addIntersectionFiltersToInsight(
            drillDownInsight,
            drillDownContext.event.drillContext.intersection,
            backendSupportsElementUris,
            this.settings?.enableDuplicatedLabelValuesInAttributeFilter,
        );
        return sanitizeTableProperties(insightSanitize(drillDownInsightWithFilters));
    }

    private getSanitizedConfig(insight: IInsightDefinition, customVisualizationConfig: any) {
        return sanitizePivotTableConfig(insight, customVisualizationConfig, this.settings);
    }

    public getExecution(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ) {
        const { dateFormat, executionConfig, customVisualizationConfig } = options;
        const sanitizedConfig = this.getSanitizedConfig(insight, customVisualizationConfig);

        return executionFactory
            .forInsight(insight)
            .withDimensions(...this.getDimensions(insight, sanitizedConfig))
            .withSorting(...(getPivotTableSortItems(insight) ?? []))
            .withDateFormat(dateFormat)
            .withExecConfig(executionConfig);
    }

    protected initializeProperties(visualizationProperties: IVisualizationProperties): void {
        const controls = visualizationProperties?.controls;

        const supportedProperties = getSupportedPropertiesControls(controls, this.supportedPropertiesList);
        const initialProperties = {
            supportedProperties: { controls: supportedProperties },
        };

        this.pushData({
            initialProperties,
        });
    }

    private createCorePivotTableProps = () => {
        return {
            intl: this.intl,
            ErrorComponent: null as any,
            LoadingComponent: null as any,

            onDrill: this.onDrill,
            afterRender: this.afterRender,
            onLoadingChanged: this.onLoadingChanged,
            pushData: this.handlePushData,
            onError: this.onError,
            onExportReady: this.onExportReady,
            onDataView: this.onDataView,
            onColumnResized: this.onColumnResized,
        };
    };

    protected updateInstanceProperties(
        options: IVisProps,
        insight: IInsightDefinition,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        insightPropertiesMeta: any,
    ): void {
        super.updateInstanceProperties(options, insight, insightPropertiesMeta);

        /*
         * This was ported from v7. For some reason (likely related KD interop?) the entire content of properties
         * would be picked up and used.
         */
        this.visualizationProperties = insightProperties(insight);
        this.adaptPropertiesToInsight(this.visualizationProperties, this.currentInsight);
    }

    protected renderVisualization(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ): void {
        if (!insightHasDataDefined(insight)) {
            // there is nothing in the insight's bucket that can be visualized
            // bail out
            return;
        }

        const { customVisualizationConfig = {}, theme, custom } = options;
        const { drillableItems } = custom;
        const execution = this.getExecution(options, insight, executionFactory);

        // Extract bucket data to send down the pivot table
        const measuresBucket = insightBucket(insight, BucketNames.MEASURES);
        const rowsBucket = insightBucket(insight, BucketNames.ATTRIBUTE);
        const columnsBucket = insightBucket(insight, BucketNames.COLUMNS);

        const measures = measuresBucket ? bucketMeasures(measuresBucket) : [];
        const rows = rowsBucket ? bucketAttributes(rowsBucket) : [];
        const columns = columnsBucket ? bucketAttributes(columnsBucket) : [];
        const filters = insightFilters(insight) || [];
        const sortBy = getPivotTableSortItems(insight);

        const measureGroupDimension =
            getMeasureGroupDimensionFromProperties(insightProperties(insight)) || "columns";

        const columnHeadersPosition: ColumnHeadersPosition = !isSetColumnHeadersPositionToLeftAllowed(insight)
            ? "top"
            : getColumnHeadersPositionFromProperties(insightProperties(insight));

        const tableConfig: PivotTableNextConfig = {
            ...customVisualizationConfig,
            measureGroupDimension,
            columnHeadersPosition,
        };

        const pivotTableProps: ICorePivotTableNextProps = {
            ...this.createCorePivotTableProps(),
            execution,
            drillableItems,
            measures,
            rows,
            columns,
            filters,
            sortBy,
            config: tableConfig,
            theme,
        };

        this.renderFun(<CorePivotTableNext {...pivotTableProps} />, this.getElement());
    }

    protected renderConfigurationPanel(insight: IInsightDefinition, options: IVisProps): void {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
            const properties = this.visualizationProperties ?? {};

            // we need to handle cases when attribute previously bearing the default sort is no longer available
            // and when measure sort is present but table is transposed
            const sanitizedProperties = properties.sortItems
                ? {
                      ...properties,
                      sortItems: sanitizePivotTableSorts(
                          properties.sortItems,
                          insightBuckets(insight),
                          getMeasureGroupDimensionFromProperties(properties),
                      ),
                  }
                : properties;

            const panelConfig = {
                supportsAttributeHierarchies: this.backendCapabilities.supportsAttributeHierarchies,
            };

            this.renderFun(
                <PivotTableConfigurationPanel
                    locale={this.locale}
                    properties={sanitizedProperties}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
                    pushData={this.handlePushData}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                    featureFlags={this.settings}
                    panelConfig={panelConfig}
                    configurationPanelRenderers={options.custom?.configurationPanelRenderers}
                />,
                configPanelElement,
            );
        }
    }

    protected getDimensions(insight: IInsightDefinition, customVisualizationConfig?: any): IDimension[] {
        return generateDimensions(insight, VisualizationTypes.TABLE, customVisualizationConfig);
    }

    private adaptPropertiesToInsight(
        visualizationProperties: IVisualizationProperties,
        insight: IInsightDefinition,
    ) {
        const measureGroupDimension = getMeasureGroupDimensionFromProperties(visualizationProperties);
        // This is sanitization of properties from KD vs current mdObject from AD
        const columnWidths = getColumnWidthsFromProperties(visualizationProperties);
        if (columnWidths) {
            this.sanitizeColumnWidths(columnWidths, insight, visualizationProperties, measureGroupDimension);
        }
    }

    private sanitizeColumnWidths(
        columnWidths: ColumnWidthItem[],
        insight: IInsightDefinition,
        visualizationProperties: IVisualizationProperties,
        measureGroupDimension: MeasureGroupDimension,
    ) {
        if (isEmpty(insightBuckets(insight))) {
            return;
        }

        const adaptedColumnWidths = adaptMdObjectWidthItemsToPivotTable(
            columnWidths,
            insight,
            measureGroupDimension,
        );

        if (!isEqual(columnWidths, adaptedColumnWidths)) {
            this.visualizationProperties.controls.columnWidths = adaptedColumnWidths;
            this.pushData({
                properties: {
                    controls: {
                        columnWidths: adaptedColumnWidths,
                        ...getPivotTableProperties(this.settings, visualizationProperties),
                    },
                },
            });
        }
    }

    private onColumnResized(columnWidths: ColumnWidthItem[]) {
        const properties = this.visualizationProperties ?? {};

        this.pushData({
            properties: {
                controls: {
                    columnWidths,
                    ...getPivotTableProperties(this.settings, properties),
                },
            },
        });
    }

    private handlePushData(data: any) {
        if (data?.properties?.sortItems) {
            // Handle sort items with optional totals
            const properties = {
                sortItems: data.properties.sortItems,
                ...(data.properties.controls && { controls: data.properties.controls }),
                ...(data.properties.totals && {
                    totals: data.properties.totals,
                    bucketType: data.properties.bucketType,
                }),
            };

            this.pushData({ properties });
        } else {
            this.pushData(data);
        }
    }
}
