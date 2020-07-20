// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import flatMap = require("lodash/flatMap");
import get = require("lodash/get");
import includes = require("lodash/includes");
import isNil = require("lodash/isNil");
import isEmpty = require("lodash/isEmpty");
import { IExecutionFactory, ISettings, SettingCatalog } from "@gooddata/sdk-backend-spi";
import {
    attributeLocalId,
    bucketAttributes,
    bucketsFind,
    bucketsMeasures,
    IAttributeSortItem,
    IBucket,
    IDimension,
    IInsightDefinition,
    IMeasureSortItem,
    insightBuckets,
    insightHasDataDefined,
    insightProperties,
    isAttributeSort,
    isMeasureLocator,
    isMeasureSort,
    ISortItem,
    newAttributeSort,
    measureLocalId,
    insightSorts,
    insightBucket,
    bucketAttribute,
} from "@gooddata/sdk-model";

import { BucketNames, VisualizationEnvironment, VisualizationTypes } from "@gooddata/sdk-ui";
import {
    ColumnWidthItem,
    CorePivotTable,
    IColumnSizing,
    ICorePivotTableProps,
    IPivotTableConfig,
} from "@gooddata/sdk-ui-pivot";
import * as React from "react";
import { render } from "react-dom";
import ReactMeasure from "react-measure";

import { ATTRIBUTE, DATE, METRIC } from "../../../constants/bucket";
import { DASHBOARDS_ENVIRONMENT } from "../../../constants/properties";
import { DEFAULT_PIVOT_TABLE_UICONFIG } from "../../../constants/uiConfig";
import {
    IAttributeFilter,
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
} from "../../../interfaces/Visualization";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig";

import {
    getAllItemsByType,
    getItemsFromBuckets,
    getTotalsFromBucket,
    isAttributeFilter,
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
import { adaptReferencePointWidthItemsToPivotTable } from "./widthItemsHelpers";

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

// removes attribute sortItems with invalid identifiers
// removes measure sortItems with invalid identifiers and invalid number of locators
function adaptSortItemsToPivotTable(
    originalSortItems: ISortItem[],
    measureLocalIdentifiers: string[],
    rowAttributeLocalIdentifiers: string[],
    columnAttributeLocalIdentifiers: string[],
): ISortItem[] {
    return originalSortItems.reduce((sortItems: ISortItem[], sortItem: ISortItem) => {
        if (isMeasureSort(sortItem)) {
            // filter out invalid locators
            const filteredSortItem: IMeasureSortItem = {
                measureSortItem: {
                    ...sortItem.measureSortItem,
                    locators: sortItem.measureSortItem.locators.filter((locator) => {
                        // filter out invalid measure locators
                        if (isMeasureLocator(locator)) {
                            return includes(
                                measureLocalIdentifiers,
                                locator.measureLocatorItem.measureIdentifier,
                            );
                        }
                        // filter out invalid column attribute locators
                        return includes(
                            columnAttributeLocalIdentifiers,
                            locator.attributeLocatorItem.attributeIdentifier,
                        );
                    }),
                },
            };

            // keep sortItem if measureLocator is present and locators are correct length
            if (
                filteredSortItem.measureSortItem.locators.some((locator) => isMeasureLocator(locator)) &&
                filteredSortItem.measureSortItem.locators.length ===
                    columnAttributeLocalIdentifiers.length + 1
            ) {
                return [...sortItems, filteredSortItem];
            }

            // otherwise just carry over previous sortItems
            return sortItems;
        }
        /**
         * Keep only row attribute sorts, column sorts are not supported.
         *
         * This exists to overcome AD weirdness where AD will sometimes send insight with invalid sorts
         * even if the pivot table should NOT be sorted by default by the first row attribute in ascending order since it has no row attributes.
         * Code here fixes this symptom and ensures the default sort is in place only if relevant.
         *
         * Typical case is PivotTable with one measure and one row and then the user moves thee attribute from Row bucket to Column bucket.
         * In that case AD sends insight with the irrelevant sort and then without it.
         *
         * Note: while this may seem small thing, it's actually a messy business. When rendering / switching to the pivot
         * table the AD will call update/render multiple times. Sometimes with sort items, sometimes without sort items. This
         * can seriously mess up the pivot table in return: the column resizing is susceptible to race conditions and timing
         * issues. Because of the flurry of calls, the table may not render or load indefinitely.
         */
        if (includes(rowAttributeLocalIdentifiers, sortItem.attributeSortItem.attributeIdentifier)) {
            return [...sortItems, sortItem];
        }
        return sortItems;
    }, []);
}

export function adaptReferencePointSortItemsToPivotTable(
    originalSortItems: ISortItem[],
    measures: IBucketItem[],
    rowAttributes: IBucketItem[],
    columnAttributes: IBucketItem[],
): ISortItem[] {
    const measureLocalIdentifiers = measures.map((measure) => measure.localIdentifier);
    const rowAttributeLocalIdentifiers = rowAttributes.map((rowAttribute) => rowAttribute.localIdentifier);
    const columnAttributeLocalIdentifiers = columnAttributes.map(
        (columnAttribute) => columnAttribute.localIdentifier,
    );

    return adaptSortItemsToPivotTable(
        originalSortItems,
        measureLocalIdentifiers,
        rowAttributeLocalIdentifiers,
        columnAttributeLocalIdentifiers,
    );
}

function adaptMdObjectSortItemsToPivotTable(originalSortItems: ISortItem[], buckets: IBucket[]): ISortItem[] {
    const measureLocalIdentifiers = bucketsMeasures(buckets).map(measureLocalId);

    const rowBucket = bucketsFind(buckets, BucketNames.ATTRIBUTE);
    const rowAttributeLocalIdentifiers = rowBucket ? bucketAttributes(rowBucket).map(attributeLocalId) : [];

    const columnBucket = bucketsFind(buckets, BucketNames.COLUMNS);
    const columnAttributeLocalIdentifiers = columnBucket
        ? bucketAttributes(columnBucket).map(attributeLocalId)
        : [];

    return adaptSortItemsToPivotTable(
        originalSortItems,
        measureLocalIdentifiers,
        rowAttributeLocalIdentifiers,
        columnAttributeLocalIdentifiers,
    );
}

const isAttributeSortItemVisible = (_sortItem: IAttributeSortItem, _filters: IBucketFilter[]): boolean =>
    true;

const isMeasureSortItemMatchedByFilter = (sortItem: IMeasureSortItem, filter: IAttributeFilter): boolean =>
    filter.selectedElements
        ? filter.selectedElements.some((selectedElement) =>
              sortItem.measureSortItem.locators.some(
                  (locator) =>
                      !isMeasureLocator(locator) &&
                      locator.attributeLocatorItem.element === selectedElement.uri,
              ),
          )
        : false;

const isMeasureSortItemVisible = (sortItem: IMeasureSortItem, filters: IBucketFilter[]): boolean =>
    filters.reduce((isVisible, filter) => {
        if (isAttributeFilter(filter)) {
            const shouldBeMatched = !filter.isInverted;
            return isVisible && shouldBeMatched === isMeasureSortItemMatchedByFilter(sortItem, filter);
        }
        return isVisible;
    }, true);

export const isSortItemVisible = (sortItem: ISortItem, filters: IBucketFilter[]): boolean =>
    isAttributeSort(sortItem)
        ? isAttributeSortItemVisible(sortItem, filters)
        : isMeasureSortItemVisible(sortItem, filters);

export function addDefaultSort(
    sortItems: ISortItem[],
    filters: IBucketFilter[],
    rowAttributes: IBucketItem[],
    previousRowAttributes?: IBucketItem[],
): ISortItem[] {
    // cannot construct default sort without a row
    if (rowAttributes.length < 1) {
        return sortItems;
    }

    // detect custom sort
    const firstRow = rowAttributes[0];
    const previousFirstRow = previousRowAttributes && previousRowAttributes[0];
    const hasVisibleCustomSort = sortItems.some((sortItem) => {
        if (!isSortItemVisible(sortItem, filters)) {
            return false;
        }
        // non attribute sort is definitely custom
        if (!isAttributeSort(sortItem)) {
            return true;
        }
        // asc sort on first row is considered default
        if (
            sortItem.attributeSortItem.attributeIdentifier === firstRow.localIdentifier &&
            sortItem.attributeSortItem.direction === "asc"
        ) {
            return false;
        }
        // asc sort on row that was first until now is considered default as well
        if (
            previousFirstRow &&
            sortItem.attributeSortItem.attributeIdentifier === previousFirstRow.localIdentifier &&
            sortItem.attributeSortItem.direction === "asc"
        ) {
            return false;
        }
        return true;
    });

    return hasVisibleCustomSort ? sortItems : [newAttributeSort(firstRow.localIdentifier, "asc")];
}

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

    public unmount() {
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
            [],
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

        const controlsObj =
            isManualResizingEnabled(this.settings) || columnWidths.length > 0
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

    protected renderVisualization(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ) {
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

    protected renderConfigurationPanel(insight: IInsightDefinition) {
        if (document.querySelector(this.configPanelElement)) {
            const properties = this.visualizationProperties ?? {};

            // we need to handle cases when attribute previously bearing the default sort is no longer available
            const sanitizedProperties = properties.sortItems
                ? {
                      ...properties,
                      sortItems: adaptMdObjectSortItemsToPivotTable(
                          properties.sortItems,
                          insightBuckets(insight),
                      ),
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

    private getMergedProperties(newProperties: any): IVisualizationProperties {
        const properties = this.visualizationProperties ?? {};

        return {
            ...properties,
            ...newProperties,
        };
    }

    private onColumnResized(columnWidths: ColumnWidthItem[]) {
        this.pushData({
            properties: this.getMergedProperties({
                controls: {
                    columnWidths,
                },
            }),
        });
    }

    private handlePushData(data: any) {
        if (data && data.properties && data.properties.sortItems) {
            this.pushData({
                properties: this.getMergedProperties({
                    sortItems: data.properties.sortItems,
                }),
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
    const growToFit = settings[SettingCatalog.enableTableColumnsGrowToFit];
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
        return sorts;
    }

    const rowBucket = insightBucket(insight, BucketNames.ATTRIBUTE);
    const rowAttribute = rowBucket && bucketAttribute(rowBucket);

    if (rowAttribute) {
        return [newAttributeSort(rowAttribute, "asc")];
    }
}
