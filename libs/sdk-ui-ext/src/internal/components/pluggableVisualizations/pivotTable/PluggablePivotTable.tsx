// (C) 2019-2023 GoodData Corporation

import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    sanitizeTableProperties,
} from "../drillDownUtil";
import cloneDeep from "lodash/cloneDeep";
import flatMap from "lodash/flatMap";
import isNil from "lodash/isNil";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import { IBackendCapabilities, IExecutionFactory } from "@gooddata/sdk-backend-spi";
import {
    bucketAttribute,
    IDimension,
    IInsight,
    IInsightDefinition,
    insightBucket,
    insightBuckets,
    insightHasDataDefined,
    insightProperties,
    insightSanitize,
    insightSorts,
    ISortItem,
    newAttributeSort,
    ISettings,
} from "@gooddata/sdk-model";

import { BucketNames, VisualizationEnvironment, VisualizationTypes } from "@gooddata/sdk-ui";
import {
    ColumnWidthItem,
    CorePivotTable,
    IColumnSizing,
    ICorePivotTableProps,
    IPivotTableConfig,
    pivotTableMenuForCapabilities,
} from "@gooddata/sdk-ui-pivot";
import React from "react";
import ReactMeasure from "react-measure";

import { ATTRIBUTE, DATE, METRIC } from "../../../constants/bucket";
import { DASHBOARDS_ENVIRONMENT, ANALYTICAL_ENVIRONMENT } from "../../../constants/properties";
import {
    IBucketFilter,
    IBucketItem,
    IBucketOfFun,
    IDrillDownContext,
    IExtendedReferencePoint,
    IGdcConfig,
    IReferencePoint,
    IVisConstruct,
    IVisProps,
    IVisualizationProperties,
    RenderFunction,
} from "../../../interfaces/Visualization";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig";

import {
    getAllItemsByType,
    getItemsFromBuckets,
    getTotalsFromBucket,
    removeDuplicateBucketItems,
    sanitizeFilters,
} from "../../../utils/bucketHelper";
import { generateDimensions } from "../../../utils/dimensions";
import { unmountComponentsAtNodes } from "../../../utils/domHelper";
import {
    getColumnWidthsFromProperties,
    getReferencePointWithSupportedProperties,
} from "../../../utils/propertiesHelper";

import {
    getPivotTableDefaultUiConfig,
    setPivotTableUiConfig,
} from "../../../utils/uiConfigHelpers/pivotTableUiConfigHelper";
//@ts-ignore
import UnsupportedConfigurationPanel from "../../configurationPanels/UnsupportedConfigurationPanel";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization";
import { PIVOT_TABLE_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import {
    adaptMdObjectWidthItemsToPivotTable,
    adaptReferencePointWidthItemsToPivotTable,
} from "./widthItemsHelpers";
import {
    adaptReferencePointSortItemsToPivotTable,
    addDefaultSort,
    sanitizePivotTableSorts,
} from "./sortItemsHelpers";
import { removeInvalidTotals } from "./totalsHelpers";
import PivotTableConfigurationPanel from "../../configurationPanels/PivotTableConfigurationPanel";

export const getColumnAttributes = (buckets: IBucketOfFun[]): IBucketItem[] => {
    return getItemsFromBuckets(
        buckets,
        [BucketNames.COLUMNS, BucketNames.STACK, BucketNames.SEGMENT],
        [ATTRIBUTE, DATE],
    );
};

export const getRowAttributes = (buckets: IBucketOfFun[]): IBucketItem[] => {
    return getItemsFromBuckets(
        buckets,
        [
            BucketNames.ATTRIBUTE,
            BucketNames.ATTRIBUTES,
            BucketNames.ATTRIBUTE_FROM,
            BucketNames.ATTRIBUTE_TO,
            BucketNames.VIEW,
            BucketNames.TREND,
            BucketNames.LOCATION,
        ],
        [ATTRIBUTE, DATE],
    );
};

/**
 * PluggablePivotTable
 *
 * ## Buckets
 *
 * | Name     | Id         | Accepts             |
 * |----------|------------|---------------------|
 * | Measures | measures   | measures only       |
 * | Rows     | attributes | attributes or dates |
 * | Columns  | columns    | attributes or dates |
 *
 * The Rows and Columns can each accept one date at most, unless "enableMultipleDates" FF is on.
 *
 * ### Bucket axioms
 *
 * - |Measures| ≤ 20
 * - |Rows| ≤ 20
 * - |Columns| ≤ 20
 * - |Measures| + |Rows| + |Columns| ≥ 1
 *
 * ## Dimensions
 *
 * The PluggablePivotTable always creates two dimensional execution.
 *
 * - |Measures| ≥ 1 ⇒ [[...Rows], [...Columns, MeasureGroupIdentifier]]
 * - |Measures| = 0 ⇒ [[...Rows], [...Columns]]
 *
 * ## Sorts
 *
 * Unless the user specifies otherwise, the sorts used by default are:
 *
 * - |Rows| ≥ 1 ⇒ [attributeSort(Rows[0])]
 */
export class PluggablePivotTable extends AbstractPluggableVisualization {
    private environment: VisualizationEnvironment;
    private renderFun: RenderFunction;
    private readonly settings: ISettings;
    private backendCapabilities: IBackendCapabilities;

    constructor(props: IVisConstruct) {
        super(props);

        this.environment = props.environment;
        this.renderFun = props.renderFun;
        this.settings = props.featureFlags ?? {};
        this.onColumnResized = this.onColumnResized.bind(this);
        this.handlePushData = this.handlePushData.bind(this);
        this.supportedPropertiesList = PIVOT_TABLE_SUPPORTED_PROPERTIES;
        this.backendCapabilities = props.backend.capabilities;
    }

    public unmount(): void {
        unmountComponentsAtNodes([this.getElement(), this.getConfigPanelElement()]);
    }

    public getExtendedReferencePoint(
        referencePoint: IReferencePoint,
        previousReferencePoint?: IReferencePoint,
    ): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        const newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: getPivotTableDefaultUiConfig(multipleDatesEnabled(this.settings)),
        };

        const buckets = newReferencePoint.buckets;
        const measures = getAllItemsByType(buckets, [METRIC]);
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
        const colTotals = getTotalsFromBucket(buckets, BucketNames.COLUMNS);

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

        const originalSortItems: ISortItem[] = newReferencePoint.properties?.sortItems ?? [];
        const originalColumnWidths: ColumnWidthItem[] = newReferencePoint.properties?.controls?.columnWidths;

        const columnWidths = adaptReferencePointWidthItemsToPivotTable(
            originalColumnWidths,
            measures,
            rowAttributes,
            columnAttributes,
            previousRowAttributes ? previousRowAttributes : [],
            previousColumnAttributes ? previousColumnAttributes : [],
            filters,
        );

        const controlsObj = columnWidths
            ? {
                  controls: {
                      columnWidths,
                      measureGroupDimension: "rows",
                  },
              }
            : {
                controls: {
                    measureGroupDimension: "rows",
                }
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
                tableSortingCheckDisabled(this.settings),
            ),
            ...controlsObj,
        };

        setPivotTableUiConfig(newReferencePoint, this.intl, VisualizationTypes.TABLE);
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
        );
        return sanitizeTableProperties(insightSanitize(drillDownInsightWithFilters));
    }

    public getExecution(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ) {
        const { dateFormat, executionConfig } = options;

        return executionFactory
            .forInsight(insight)
            .withDimensions(...this.getDimensions(insight))
            .withSorting(...(getPivotTableSortItems(insight) ?? []))
            .withDateFormat(dateFormat)
            .withExecConfig(executionConfig);
    }

    private createCorePivotTableProps = () => {
        const onColumnResized = isManualResizingEnabled(this.settings) ? this.onColumnResized : undefined;

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
            onColumnResized,
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

        const { locale, custom, dimensions, config = {}, customVisualizationConfig = {}, theme } = options;
        const { maxHeight, maxWidth } = config;
        const height = dimensions?.height;
        const { drillableItems } = custom;
        const execution = this.getExecution(options, insight, executionFactory);

        const columnWidths: ColumnWidthItem[] | undefined = getColumnWidthsFromProperties(
            insightProperties(insight),
        );

        // TODO:
        const pinned: boolean = insight?.insight?.properties?.controls?.pinned?.enabled;
        const tableConfig: IPivotTableConfig = {
            ...createPivotTableConfig(
                config,
                this.environment,
                this.settings,
                this.backendCapabilities,
                columnWidths,
            ),
            ...customVisualizationConfig,
            maxHeight,
            maxWidth,
            pinned,
        };

        const pivotTableProps: ICorePivotTableProps = {
            ...this.createCorePivotTableProps(),
            execution,
            drillableItems,
            config: tableConfig,
            locale,
            theme,
        };

        if (this.environment === DASHBOARDS_ENVIRONMENT) {
            this.renderFun(
                <ReactMeasure client={true}>
                    {({ measureRef, contentRect }: any) => {
                        const clientHeight = contentRect.client.height;

                        const pivotWrapperStyle: React.CSSProperties = {
                            height: isNil(height) ? "100%" : height,
                            textAlign: "left",
                            display: "flex",
                            flex: "1 1 auto",
                            flexDirection: "column",
                        };

                        const configWithMaxHeight: IPivotTableConfig = {
                            ...tableConfig,
                            maxHeight: clientHeight,
                            ...customVisualizationConfig,
                        };

                        return (
                            <div
                                ref={measureRef}
                                style={pivotWrapperStyle}
                                className="gd-table-dashboard-wrapper"
                            >
                                <CorePivotTable {...pivotTableProps} config={configWithMaxHeight} />
                            </div>
                        );
                    }}
                </ReactMeasure>,
                this.getElement(),
            );
        } else {
            this.renderFun(<CorePivotTable {...pivotTableProps} />, this.getElement());
        }
    }

    protected renderConfigurationPanel(insight: IInsightDefinition): void {
        const configPanelElement = this.getConfigPanelElement();

        // TODO:
        if (configPanelElement) {
            const properties = this.visualizationProperties ?? {};

            // we need to handle cases when attribute previously bearing the default sort is no longer available
            //@ts-ignore
            const sanitizedProperties = properties.sortItems
                ? {
                      ...properties,
                      sortItems: sanitizePivotTableSorts(properties.sortItems, insightBuckets(insight)),
                  }
                : properties;

            this.renderFun(
                <PivotTableConfigurationPanel
                    locale={this.locale}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
                    pushData={this.handlePushData}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                />,
                configPanelElement,
            );
        }
    }

    protected getDimensions(insight: IInsightDefinition): IDimension[] {
        return generateDimensions(insight, VisualizationTypes.TABLE);
    }

    private adaptPropertiesToInsight(
        visualizationProperties: IVisualizationProperties,
        insight: IInsightDefinition,
    ) {
        // This is sanitization of properties from KD vs current mdObject from AD
        const columnWidths = getColumnWidthsFromProperties(visualizationProperties);
        if (columnWidths) {
            this.sanitizeColumnWidths(columnWidths, insight);
        }
    }

    private sanitizeColumnWidths(columnWidths: ColumnWidthItem[], insight: IInsightDefinition) {
        if (isEmpty(insightBuckets(insight))) {
            return;
        }

        const adaptedColumnWidths = adaptMdObjectWidthItemsToPivotTable(columnWidths, insight);

        if (!isEqual(columnWidths, adaptedColumnWidths)) {
            this.visualizationProperties.controls.columnWidths = adaptedColumnWidths;
            this.pushData({
                properties: {
                    controls: {
                        columnWidths: adaptedColumnWidths,
                    },
                },
            });
        }
    }

    private onColumnResized(columnWidths: ColumnWidthItem[]) {
        this.pushData({
            properties: {
                controls: {
                    columnWidths,
                },
            },
        });
    }

    private handlePushData(data: any) {
        if (data?.properties?.sortItems) {
            const addTotals = data?.properties?.totals
                ? {
                      totals: data?.properties?.totals,
                      bucketType: data?.properties?.bucketType,
                  }
                : {};
            this.pushData({
                properties: {
                    sortItems: data.properties.sortItems,
                    controls: data.properties.controls,
                    ...addTotals,
                },
            });
        } else {
            this.pushData(data);
        }
    }
}

function isManualResizingEnabled(settings: ISettings): boolean {
    return settings.enableTableColumnsManualResizing === true;
}

function multipleDatesEnabled(settings: ISettings): boolean {
    return settings.enableMultipleDates === true;
}

function tableSortingCheckDisabled(settings: ISettings): boolean {
    return settings.tableSortingCheckDisabled === true;
}

/**
 * Given plug viz GDC config, current environment and platform settings, this creates pivot table config.
 *
 * @internal
 */
export function createPivotTableConfig(
    config: IGdcConfig,
    environment: VisualizationEnvironment,
    settings: ISettings,
    capabilities: IBackendCapabilities,
    columnWidths: ColumnWidthItem[],
): IPivotTableConfig {
    let tableConfig: IPivotTableConfig = {
        separators: config.separators,
    };

    const enableTableTotalRows = settings.enableTableTotalRows;

    if (environment !== DASHBOARDS_ENVIRONMENT) {
        tableConfig = {
            ...tableConfig,
            menu: pivotTableMenuForCapabilities(capabilities, {
                aggregations: true,
                aggregationsSubMenu: true,
            }),
        };
    }

    if (enableTableTotalRows) {
        tableConfig = {
            ...tableConfig,
            menu: {
                ...tableConfig.menu,
                aggregationsSubMenuForRows: true,
            },
        };
    }

    const autoSize = settings.enableTableColumnsAutoResizing;

    // the growToFit can only be enabled in dashboards
    const growToFit = environment === DASHBOARDS_ENVIRONMENT && settings.enableTableColumnsGrowToFit;

    const manualResizing = settings.enableTableColumnsManualResizing;

    let columnSizing: Partial<IColumnSizing> = {};
    if (autoSize) {
        columnSizing = {
            defaultWidth: config.isExportMode ? "viewport" : "autoresizeAll",
        };
    }
    if (growToFit) {
        columnSizing = {
            ...columnSizing,
            growToFit: true,
        };
    }
    if (manualResizing && columnWidths && columnWidths.length > 0) {
        columnSizing = {
            ...columnSizing,
            columnWidths,
        };
    }

    if (environment === ANALYTICAL_ENVIRONMENT) {
        columnSizing = {
            ...columnSizing,
            growToFit: false,
        };
    }

    return {
        ...tableConfig,
        columnSizing,
    };
}

/**
 * This function exists to overcome AD weirdness where AD will sometimes send insight without any
 * sorts even if the pivot table should be sorted by default by the first row attribute in ascending order. Code here
 * fixes this symptom and ensures the default sort is in place.
 *
 * Note: while this may seem small thing, it's actually a messy business. When rendering / switching to the pivot
 * table the AD will call update/render multiple times. Sometimes with sort items, sometimes without sort items. This
 * can seriously mess up the pivot table in return: the column resizing is susceptible to race conditions and timing
 * issues. Because of the flurry of calls, the table may not render or may render not resized at all.
 */
function getPivotTableSortItems(insight: IInsightDefinition): ISortItem[] {
    const sorts = insightSorts(insight);

    if (!isEmpty(sorts)) {
        /*
         * This is here to ensure that when rendering pivot table in KD, all invalid sort items
         * are filtered out. At this moment, core pivot table does not handle invalid sorts so well and
         * they can knock it off balance and it won't show up (interplay with resizing).
         *
         * Fixing core pivot to strip out invalid sorts has to happen one day - however regardless of that,
         * it is still the responsibility of the PluggablePivotTable to call the CorePivot correctly and so this
         * sanitization here also makes sense.
         */
        return sanitizePivotTableSorts(sorts, insightBuckets(insight));
    }

    const rowBucket = insightBucket(insight, BucketNames.ATTRIBUTE);
    const rowAttribute = rowBucket && bucketAttribute(rowBucket);

    if (rowAttribute) {
        return [newAttributeSort(rowAttribute, "asc")];
    }
}
