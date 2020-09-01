// (C) 2019 GoodData Corporation

import { modifyBucketsAttributesForDrillDown, sanitizeTableProperties } from "../drillDownUtil";
import cloneDeep from "lodash/cloneDeep";
import flatMap from "lodash/flatMap";
import get from "lodash/get";
import isNil from "lodash/isNil";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import { IExecutionFactory, ISettings, SettingCatalog } from "@gooddata/sdk-backend-spi";
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
} from "@gooddata/sdk-model";

import { BucketNames, VisualizationEnvironment, VisualizationTypes } from "@gooddata/sdk-ui";
import {
    ColumnWidthItem,
    CorePivotTable,
    IColumnSizing,
    ICorePivotTableProps,
    IPivotTableConfig,
} from "@gooddata/sdk-ui-pivot";
import React from "react";
import { render } from "react-dom";
import ReactMeasure from "react-measure";

import { ATTRIBUTE, DATE, METRIC } from "../../../constants/bucket";
import { DASHBOARDS_ENVIRONMENT } from "../../../constants/properties";
import { DEFAULT_PIVOT_TABLE_UICONFIG } from "../../../constants/uiConfig";
import {
    IBucketFilter,
    IBucketItem,
    IBucketOfFun,
    IExtendedReferencePoint,
    IGdcConfig,
    IReferencePoint,
    IVisConstruct,
    IVisProps,
    IVisualizationProperties,
    RenderFunction,
    IDrillDownContext,
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

import { setPivotTableUiConfig } from "../../../utils/uiConfigHelpers/pivotTableUiConfigHelper";
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
            BucketNames.VIEW,
            BucketNames.TREND,
            BucketNames.LOCATION,
        ],
        [ATTRIBUTE, DATE],
    );
};

export class PluggablePivotTable extends AbstractPluggableVisualization {
    private environment: VisualizationEnvironment;
    private renderFun: RenderFunction;
    private readonly settings: ISettings;
    private supportsTotals: boolean;

    constructor(props: IVisConstruct) {
        super(props);

        this.environment = props.environment;
        this.renderFun = props.renderFun;
        this.settings = props.featureFlags ?? {};
        this.onColumnResized = this.onColumnResized.bind(this);
        this.handlePushData = this.handlePushData.bind(this);
        this.supportedPropertiesList = PIVOT_TABLE_SUPPORTED_PROPERTIES;
        this.supportsTotals = props.backend.capabilities.canCalculateTotals ?? false;
    }

    public unmount(): void {
        unmountComponentsAtNodes([this.element, this.configPanelElement]);
    }

    public getExtendedReferencePoint(
        referencePoint: IReferencePoint,
        previousReferencePoint?: IReferencePoint,
    ): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        const newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: cloneDeep(DEFAULT_PIVOT_TABLE_UICONFIG),
        };

        const buckets = newReferencePoint.buckets;
        const measures = getAllItemsByType(buckets, [METRIC]);
        const rowAttributes = getRowAttributes(buckets);
        const previousRowAttributes =
            previousReferencePoint && getRowAttributes(previousReferencePoint.buckets);

        const columnAttributes = getColumnAttributes(buckets);
        const previousColumnAttributes =
            previousReferencePoint && getColumnAttributes(previousReferencePoint.buckets);

        const totals = getTotalsFromBucket(buckets, BucketNames.ATTRIBUTE);

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
                ...(totals.length > 0 ? { totals } : null),
            },
            {
                localIdentifier: BucketNames.COLUMNS,
                items: columnAttributes,
            },
        ]);

        const filters: IBucketFilter[] = newReferencePoint.filters
            ? flatMap(newReferencePoint.filters.items, (item) => item.filters)
            : [];

        const originalSortItems: ISortItem[] = get(newReferencePoint.properties, "sortItems", []);
        const originalColumnWidths: ColumnWidthItem[] = get(
            newReferencePoint.properties,
            "controls.columnWidths",
        );

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
                  },
              }
            : {};

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
            ),
            ...controlsObj,
        };

        setPivotTableUiConfig(newReferencePoint, this.intl, VisualizationTypes.TABLE);
        configurePercent(newReferencePoint, false);
        configureOverTimeComparison(newReferencePoint, !!this.settings?.[SettingCatalog.enableWeekFilters]);
        Object.assign(
            newReferencePoint,
            getReferencePointWithSupportedProperties(newReferencePoint, this.supportedPropertiesList),
        );

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    public getInsightWithDrillDownApplied(
        sourceVisualization: IInsight,
        drillDownContext: IDrillDownContext,
    ): IInsight {
        const insight = modifyBucketsAttributesForDrillDown(
            sourceVisualization,
            drillDownContext.drillDefinition,
        );
        return sanitizeTableProperties(insightSanitize(insight));
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

        const { locale, custom, dimensions, config = {}, customVisualizationConfig = {} } = options;
        const { maxHeight, maxWidth } = config;
        const height = dimensions?.height;
        const { drillableItems } = custom;

        const execution = executionFactory
            .forInsight(insight)
            .withDimensions(...this.getDimensions(insight))
            .withSorting(...getPivotTableSortItems(insight));

        const columnWidths: ColumnWidthItem[] | undefined = getColumnWidthsFromProperties(
            insightProperties(insight),
        );

        const tableConfig: IPivotTableConfig = {
            ...createPivotTableConfig(config, this.environment, this.settings, columnWidths),
            ...(!this.supportsTotals ? { menu: {} } : {}), // suppress the menu for backends without totals
            ...customVisualizationConfig,
            maxHeight,
            maxWidth,
        };

        const pivotTableProps: ICorePivotTableProps = {
            ...this.createCorePivotTableProps(),
            execution,
            drillableItems,
            config: tableConfig,
            locale,
        };

        if (this.environment === DASHBOARDS_ENVIRONMENT) {
            this.renderFun(
                <ReactMeasure client={true}>
                    {({ measureRef, contentRect }: any) => {
                        const clientHeight = contentRect.client.height;

                        /*
                         * For some reason (unknown to me), there was a big if; nil height meant that
                         * the wrapper was to 100%; non-nil height ment fixed size header with the 328 magic
                         * number.
                         *
                         * For a while, there were more differences between the two branches, however after
                         * ONE-4322 the essential difference was reduced to just the wrapper size.
                         */
                        const pivotWrapperStyle: React.CSSProperties = {
                            height: isNil(height) ? "100%" : 328,
                            textAlign: "left",
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
                document.querySelector(this.element),
            );
        } else {
            this.renderFun(<CorePivotTable {...pivotTableProps} />, document.querySelector(this.element));
        }
    }

    protected renderConfigurationPanel(insight: IInsightDefinition): void {
        if (document.querySelector(this.configPanelElement)) {
            const properties = this.visualizationProperties ?? {};

            // we need to handle cases when attribute previously bearing the default sort is no longer available
            const sanitizedProperties = properties.sortItems
                ? {
                      ...properties,
                      sortItems: sanitizePivotTableSorts(properties.sortItems, insightBuckets(insight)),
                  }
                : properties;

            render(
                <UnsupportedConfigurationPanel
                    locale={this.locale}
                    pushData={this.pushData}
                    properties={sanitizedProperties}
                />,
                document.querySelector(this.configPanelElement),
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
        if (data && data.properties && data.properties.sortItems) {
            this.pushData({
                properties: {
                    sortItems: data.properties.sortItems,
                },
            });
        } else {
            this.pushData(data);
        }
    }
}

function isManualResizingEnabled(settings: ISettings): boolean {
    return settings[SettingCatalog.enableTableColumnsManualResizing] === true;
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
    columnWidths: ColumnWidthItem[],
): IPivotTableConfig {
    let tableConfig: IPivotTableConfig = {
        separators: config.separators,
    };

    if (environment !== "dashboards") {
        tableConfig = {
            ...tableConfig,
            menu: {
                aggregations: true,
                aggregationsSubMenu: true,
            },
        };
    }

    const autoSize = settings[SettingCatalog.enableTableColumnsAutoResizing];

    // the growToFit can only be enabled in dashboards
    const growToFit =
        environment === DASHBOARDS_ENVIRONMENT && settings[SettingCatalog.enableTableColumnsGrowToFit];

    const manualResizing = settings[SettingCatalog.enableTableColumnsManualResizing];

    let columnSizing: Partial<IColumnSizing> = {};
    if (autoSize) {
        columnSizing = {
            defaultWidth: "viewport",
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
