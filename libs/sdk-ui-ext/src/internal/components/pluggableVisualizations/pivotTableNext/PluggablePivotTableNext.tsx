// (C) 2025 GoodData Corporation

import { cloneDeep, isEmpty, isEqual } from "lodash-es";

import { IBackendCapabilities, IExecutionFactory } from "@gooddata/sdk-backend-spi";
import {
    IDimension,
    IInsight,
    IInsightDefinition,
    ISettings,
    ISortItem,
    bucketAttributes,
    bucketMeasures,
    insightBucket,
    insightBuckets,
    insightFilters,
    insightHasDataDefined,
    insightProperties,
    insightSanitize,
    insightSorts,
} from "@gooddata/sdk-model";
import { BucketNames, VisualizationEnvironment, VisualizationTypes } from "@gooddata/sdk-ui";
import { ColumnHeadersPosition, ColumnWidthItem, MeasureGroupDimension } from "@gooddata/sdk-ui-pivot";
import {
    CorePivotTableNext,
    ICorePivotTableNextProps,
    PivotTableNextConfig,
} from "@gooddata/sdk-ui-pivot/next";

import { getColumnAttributes, getRowAttributes, shouldAdjustColumnHeadersPositionToTop } from "./helpers.js";
import { adaptReferencePointSortItemsToPivotTable, getSanitizedSortItems } from "./sortHelpers.js";
import { removeInvalidTotals } from "./totalsHelpers.js";
import {
    adaptMdObjectWidthItemsToPivotTable,
    adaptReferencePointWidthItemsToPivotTable,
} from "./widthItemsHelpers.js";
import { METRIC } from "../../../constants/bucket.js";
import { DASHBOARDS_ENVIRONMENT } from "../../../constants/properties.js";
import { PIVOT_TABLE_NEXT_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import {
    IBucketFilter,
    IDrillDownContext,
    IExtendedReferencePoint,
    IGdcConfig,
    IReferencePoint,
    IVisConstruct,
    IVisProps,
    IVisualizationProperties,
    RenderFunction,
    UnmountFunction,
} from "../../../interfaces/Visualization.js";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig.js";
import {
    getAllItemsByType,
    getTotalsFromBucket,
    limitNumberOfMeasuresInBuckets,
    removeDuplicateBucketItems,
    sanitizeFilters,
} from "../../../utils/bucketHelper.js";
import { isSetColumnHeadersPositionToLeftAllowed } from "../../../utils/controlsHelper.js";
import { generateDimensions } from "../../../utils/dimensions.js";
import {
    getColumnHeadersPositionFromProperties,
    getColumnWidthsFromProperties,
    getGrandTotalsPositionFromProperties,
    getMeasureGroupDimensionFromProperties,
    getPivotTableProperties,
    getReferencePointWithSupportedProperties,
    getSupportedPropertiesControls,
    getTextWrappingFromProperties,
} from "../../../utils/propertiesHelper.js";
import {
    getPivotTableNextDefaultUiConfig,
    getPivotTableNextMeasuresLimit,
    setPivotTableNextUiConfig,
} from "../../../utils/uiConfigHelpers/pivotTableNextUiConfigHelper.js";
import PivotTableConfigurationPanel from "../../configurationPanels/PivotTableConfigurationPanel.js";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization.js";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    sanitizeTableProperties,
} from "../drillDownUtil.js";

const PROPERTIES_AFFECTING_REFERENCE_POINT = ["measureGroupDimension"];

export function createPivotTableNextConfig(
    config: IGdcConfig,
    environment: VisualizationEnvironment,
    settings: ISettings,
): PivotTableNextConfig {
    let tableConfig: PivotTableNextConfig = {
        separators: config.separators,
        enableExecutionCancelling: settings.enableExecutionCancelling ?? false,
        agGridToken: config.agGridToken,
        enablePivotTableAutoSizeReset: settings.enablePivotTableAutoSizeReset ?? true,
    };

    if (environment !== DASHBOARDS_ENVIRONMENT) {
        tableConfig = {
            ...tableConfig,
            menu: {
                aggregations: true,
                aggregationsSubMenu: true,
                aggregationsSubMenuForRows: true,
            },
        };
    }

    return tableConfig;
}

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
    private environment: VisualizationEnvironment;

    constructor(props: IVisConstruct) {
        super(props);

        this.environment = props.environment;
        this.renderFun = props.renderFun;
        this.unmountFun = props.unmountFun;
        this.settings = props.featureFlags ?? {};
        this.onColumnResized = this.onColumnResized.bind(this);
        this.handlePushData = this.handlePushData.bind(this);
        this.supportedPropertiesList = PIVOT_TABLE_NEXT_SUPPORTED_PROPERTIES;
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
            ? newReferencePoint.filters.items.flatMap((item) => item.filters)
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

        const originalColumnWidths: ColumnWidthItem[] =
            newReferencePoint.properties?.controls?.["columnWidths"];
        const originalMeasureGroupDimension =
            newReferencePoint.properties?.controls?.["measureGroupDimension"];
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
            : newReferencePoint.properties?.controls?.["columnHeadersPosition"];

        const columnWidths = adaptReferencePointWidthItemsToPivotTable(
            originalColumnWidths,
            measures,
            rowAttributes,
            columnAttributes,
            previousRowAttributes || [],
            previousColumnAttributes || [],
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
            sortItems: adaptReferencePointSortItemsToPivotTable(
                originalSortItems,
                measures,
                rowAttributes,
                columnAttributes,
                originalMeasureGroupDimension,
            ),
            controls,
        };

        setPivotTableNextUiConfig(newReferencePoint, this.intl, VisualizationTypes.TABLE, this.settings);
        configurePercent(newReferencePoint, false);
        configureOverTimeComparison(newReferencePoint);
        Object.assign(
            newReferencePoint,
            getReferencePointWithSupportedProperties(newReferencePoint, this.supportedPropertiesList),
        );

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    public override getInsightWithDrillDownApplied(
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
        );
        return sanitizeTableProperties(insightSanitize(drillDownInsightWithFilters));
    }

    private getSanitizedConfig(_insight: IInsightDefinition, customVisualizationConfig: any) {
        return customVisualizationConfig;
    }

    public getExecution(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ) {
        const { dateFormat, executionConfig, customVisualizationConfig } = options;
        const sanitizedConfig = this.getSanitizedConfig(insight, customVisualizationConfig);
        const measureGroupDimension =
            getMeasureGroupDimensionFromProperties(insightProperties(insight)) || "columns";
        const sortItems = getSanitizedSortItems(insightSorts(insight), measureGroupDimension) ?? [];

        return executionFactory
            .forInsight(insight)
            .withDimensions(...this.getDimensions(insight, sanitizedConfig))
            .withSorting(...sortItems)
            .withDateFormat(dateFormat)
            .withExecConfig(executionConfig);
    }

    protected initializeProperties(visualizationProperties: IVisualizationProperties): void {
        const controls = visualizationProperties?.controls;

        const supportedProperties = getSupportedPropertiesControls(controls, this.supportedPropertiesList);
        const initialProperties = {
            supportedProperties: {
                controls: supportedProperties,
                sortItems: visualizationProperties?.sortItems ?? [],
            },
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

    protected override updateInstanceProperties(
        options: IVisProps,
        insight: IInsightDefinition,
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

        const { customVisualizationConfig = {}, theme, custom, config } = options;
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
        const sortBy = insightSorts(insight);

        const measureGroupDimension =
            getMeasureGroupDimensionFromProperties(insightProperties(insight)) || "columns";

        const columnHeadersPosition: ColumnHeadersPosition = isSetColumnHeadersPositionToLeftAllowed(insight)
            ? getColumnHeadersPositionFromProperties(insightProperties(insight))
            : "top";
        const growToFit = this.environment === DASHBOARDS_ENVIRONMENT;
        const { isInEditMode } = config;
        const tableConfig: PivotTableNextConfig = {
            ...createPivotTableNextConfig(config, this.environment, this.settings),
            ...customVisualizationConfig,
            measureGroupDimension,
            columnHeadersPosition,
            columnSizing: {
                columnWidths: getColumnWidthsFromProperties(insightProperties(insight)),
                defaultWidth: "autoresizeAll",
                growToFit,
            },
            textWrapping: getTextWrappingFromProperties(insightProperties(insight)),
            grandTotalsPosition: getGrandTotalsPositionFromProperties(insightProperties(insight)),
            enableCellSelection: !isInEditMode,
        };

        const pivotTableProps: ICorePivotTableNextProps = {
            ...this.createCorePivotTableProps(),
            locale: this.locale,
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
            const panelConfig = {
                supportsAttributeHierarchies: this.backendCapabilities.supportsAttributeHierarchies,
            };

            this.renderFun(
                <PivotTableConfigurationPanel
                    locale={this.locale}
                    properties={this.visualizationProperties}
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
            this.visualizationProperties.controls["columnWidths"] = adaptedColumnWidths;
            this.pushData({
                properties: {
                    controls: {
                        ...getPivotTableProperties(this.settings, visualizationProperties),
                        columnWidths: adaptedColumnWidths,
                    },
                },
            });
        }
    }

    private onColumnResized(columnWidths: ColumnWidthItem[]) {
        const properties = this.visualizationProperties ?? {};
        this.pushData({
            properties: {
                ...properties,
                controls: {
                    ...getPivotTableProperties(this.settings, properties),
                    columnWidths,
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
        } else if (data?.properties?.controls) {
            // Enrich with current column widths if not present so they do not get lost in other properties changing
            const columnWidths =
                getColumnWidthsFromProperties(data.properties) ??
                getColumnWidthsFromProperties(this.visualizationProperties);
            const shouldAddColumnWidths = !data.properties.controls.columnWidths;

            const properties = {
                ...data.properties,
                ...(shouldAddColumnWidths && {
                    controls: {
                        ...data.properties.controls,
                        columnWidths,
                    },
                }),
            };

            this.pushData({ properties });
        } else {
            this.pushData(data);
        }
    }
}
