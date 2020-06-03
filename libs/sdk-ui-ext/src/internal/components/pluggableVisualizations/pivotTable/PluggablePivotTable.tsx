// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import flatMap = require("lodash/flatMap");
import get = require("lodash/get");
import includes = require("lodash/includes");
import isNil = require("lodash/isNil");
import merge = require("lodash/merge");
import { IExecutionFactory } from "@gooddata/sdk-backend-spi";
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
    isAttributeSort,
    isMeasureLocator,
    isMeasureSort,
    measureLocalId,
    ISortItem,
} from "@gooddata/sdk-model";

import { BucketNames, VisualizationEnvironment, VisualizationTypes } from "@gooddata/sdk-ui";
import { CorePivotTable, ICorePivotTableProps } from "@gooddata/sdk-ui-pivot";
import * as React from "react";
import { render } from "react-dom";
import Measure from "react-measure";

import { ATTRIBUTE, DATE, METRIC } from "../../../constants/bucket";
import { DASHBOARDS_ENVIRONMENT } from "../../../constants/properties";
import { DEFAULT_PIVOT_TABLE_UICONFIG } from "../../../constants/uiConfig";
import {
    IAttributeFilter,
    IBucketFilter,
    IBucketItem,
    IBucketOfFun,
    IExtendedReferencePoint,
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
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper";
import { createSorts } from "../../../utils/sort";

import { setPivotTableUiConfig } from "../../../utils/uiConfigHelpers/pivotTableUiConfigHelper";
import UnsupportedConfigurationPanel from "../../configurationPanels/UnsupportedConfigurationPanel";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization";

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
        [BucketNames.ATTRIBUTE, BucketNames.ATTRIBUTES, BucketNames.VIEW, BucketNames.TREND],
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
    const attributeLocalIdentifiers = [...rowAttributeLocalIdentifiers, ...columnAttributeLocalIdentifiers];

    return originalSortItems.reduce((sortItems: ISortItem[], sortItem: ISortItem) => {
        if (isMeasureSort(sortItem)) {
            // filter out invalid locators
            const filteredSortItem: IMeasureSortItem = {
                measureSortItem: {
                    ...sortItem.measureSortItem,
                    locators: sortItem.measureSortItem.locators.filter(locator => {
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
                filteredSortItem.measureSortItem.locators.some(locator => isMeasureLocator(locator)) &&
                filteredSortItem.measureSortItem.locators.length ===
                    columnAttributeLocalIdentifiers.length + 1
            ) {
                return [...sortItems, filteredSortItem];
            }

            // otherwise just carry over previous sortItems
            return sortItems;
        }
        if (includes(attributeLocalIdentifiers, sortItem.attributeSortItem.attributeIdentifier)) {
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
    const measureLocalIdentifiers = measures.map(measure => measure.localIdentifier);
    const rowAttributeLocalIdentifiers = rowAttributes.map(rowAttribute => rowAttribute.localIdentifier);
    const columnAttributeLocalIdentifiers = columnAttributes.map(
        columnAttribute => columnAttribute.localIdentifier,
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
        ? filter.selectedElements.some(selectedElement =>
              sortItem.measureSortItem.locators.some(
                  locator =>
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
    const hasVisibleCustomSort = sortItems.some(sortItem => {
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

    return hasVisibleCustomSort
        ? sortItems
        : [
              {
                  attributeSortItem: {
                      attributeIdentifier: firstRow.localIdentifier,
                      direction: "asc",
                  },
              },
          ];
}

export class PluggablePivotTable extends AbstractPluggableVisualization {
    // @ts-ignore
    private projectId: string;
    private environment: VisualizationEnvironment;
    private renderFun: RenderFunction;

    constructor(props: IVisConstruct) {
        super(props);

        this.projectId = props.projectId;
        this.environment = props.environment;
        this.renderFun = props.renderFun;
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

        const originalSortItems: ISortItem[] = get(newReferencePoint.properties, "sortItems", []);

        newReferencePoint.properties = {
            sortItems: addDefaultSort(
                adaptReferencePointSortItemsToPivotTable(
                    originalSortItems,
                    measures,
                    rowAttributes,
                    columnAttributes,
                ),
                newReferencePoint.filters
                    ? flatMap(newReferencePoint.filters.items, item => item.filters)
                    : [],
                rowAttributes,
                previousRowAttributes,
            ),
        };

        setPivotTableUiConfig(newReferencePoint, this.intl, VisualizationTypes.TABLE);
        configurePercent(newReferencePoint, false);
        configureOverTimeComparison(newReferencePoint);
        Object.assign(
            newReferencePoint,
            getReferencePointWithSupportedProperties(newReferencePoint, this.supportedPropertiesList),
        );

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

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

        const { locale, custom, dimensions, config } = options;
        const height = dimensions?.height;
        const { drillableItems } = custom;

        const execution = executionFactory
            .forInsight(insight)
            .withDimensions(...this.getDimensions(insight))
            .withSorting(...createSorts(VisualizationTypes.TABLE, insight));

        let configUpdated = config;
        if (this.environment !== DASHBOARDS_ENVIRONMENT) {
            // Menu aggregations turned off in KD
            configUpdated = merge(
                {
                    menu: {
                        aggregations: true,
                        aggregationsSubMenu: true,
                    },
                },
                configUpdated,
            );
        }

        const pivotTableProps: ICorePivotTableProps = {
            execution,
            drillableItems,
            onDrill: this.onDrill,
            config: configUpdated,
            locale,
            afterRender: this.afterRender,
            onLoadingChanged: this.onLoadingChanged,
            pushData: this.pushData,
            onError: this.onError,
            onExportReady: this.onExportReady,
            ErrorComponent: null as any,
            intl: this.intl,
        };

        // TODO: SDK8: check the height handling; previously, code was passing height prop down to core
        //  pivot table; now.. this component had this prop but it seems to me that it was never taken
        //  into account (it had the prop because it inherited from same base as charts). Checked the history
        //  and it seems that CorePivotTable never used the 'height' prop

        if (this.environment === DASHBOARDS_ENVIRONMENT) {
            if (isNil(height)) {
                this.renderFun(
                    <Measure client={true}>
                        {({ measureRef, contentRect }: any) => {
                            const usedHeight = Math.floor(contentRect.client.height || 0);
                            const pivotWrapperStyle: React.CSSProperties = {
                                height: "100%",
                                textAlign: "left",
                            };

                            // TODO: SDK8: height={usedHeight} was passed here but seems it was never taken
                            //  into account by core pivot table (see above)
                            return (
                                <div
                                    ref={measureRef}
                                    style={pivotWrapperStyle}
                                    className="gd-table-dashboard-wrapper"
                                >
                                    <CorePivotTable
                                        {...pivotTableProps}
                                        config={{ ...config, maxHeight: usedHeight }}
                                    />
                                </div>
                            );
                        }}
                    </Measure>,
                    document.querySelector(this.element),
                );

                return;
            }

            this.renderFun(
                <div style={{ height: 328, textAlign: "left" }} className="gd-table-dashboard-wrapper">
                    <CorePivotTable {...pivotTableProps} />
                </div>,
                document.querySelector(this.element),
            );
        } else {
            this.renderFun(<CorePivotTable {...pivotTableProps} />, document.querySelector(this.element));
        }
    }

    protected renderConfigurationPanel(insight: IInsightDefinition) {
        if (document.querySelector(this.configPanelElement)) {
            const properties: IVisualizationProperties = get(
                this.visualizationProperties,
                "properties",
                {},
            ) as IVisualizationProperties;

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
}
