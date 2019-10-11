// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import merge = require("lodash/merge");
import flatMap = require("lodash/flatMap");
import isNil = require("lodash/isNil");
import includes = require("lodash/includes");
import * as React from "react";
import Measure from "react-measure";
import { render, unmountComponentAtNode } from "react-dom";
import { InjectedIntl } from "react-intl";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig";
import UnsupportedConfigurationPanel from "../../configurationPanels/UnsupportedConfigurationPanel";

import * as VisEvents from "../../../../base/interfaces/Events";
import * as BucketNames from "../../../../base/constants/bucketNames";
import {
    IBucketFilter,
    IBucketItem,
    IBucketOfFun,
    IExtendedReferencePoint,
    ILocale,
    IReferencePoint,
    IVisCallbacks,
    IVisConstruct,
    IVisProps,
    IVisualizationProperties,
} from "../../../interfaces/Visualization";

import { ATTRIBUTE, DATE, METRIC } from "../../../constants/bucket";

import {
    getAllItemsByType,
    getItemsFromBuckets,
    getTotalsFromBucket,
    removeDuplicateBucketItems,
    sanitizeUnusedFilters,
} from "../../../utils/bucketHelper";

import { setPivotTableUiConfig } from "../../../utils/uiConfigHelpers/pivotTableUiConfigHelper";
import { createInternalIntl } from "../../../utils/internalIntlProvider";
import { DEFAULT_PIVOT_TABLE_UICONFIG } from "../../../constants/uiConfig";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper";
import { VisualizationEnvironment, VisualizationTypes } from "../../../../base/constants/visualizationTypes";
import { CorePivotTable } from "../../../../pivotTable/CorePivotTable";
import { generateDimensions } from "../../../../base/helpers/dimensions";
import { DEFAULT_LOCALE } from "../../../../base/constants/localization";
import {
    attributeId,
    bucketAttributes,
    bucketsFind,
    bucketsMeasures,
    IAttributeSortItem,
    IBucket,
    IDimension,
    IInsight,
    IMeasureSortItem,
    insightBuckets,
    insightHasDataDefined,
    insightProperties,
    isAttributeSort,
    isMeasureLocator,
    isMeasureSort,
    measureId,
    SortItem,
} from "@gooddata/sdk-model";
import { IExecutionFactory } from "@gooddata/sdk-backend-spi";
import { createSorts } from "../../../utils/sort";
import { ICorePivotTableProps } from "../../../../pivotTable/types";

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
    originalSortItems: SortItem[],
    measureLocalIdentifiers: string[],
    rowAttributeLocalIdentifiers: string[],
    columnAttributeLocalIdentifiers: string[],
): SortItem[] {
    const attributeLocalIdentifiers = [...rowAttributeLocalIdentifiers, ...columnAttributeLocalIdentifiers];

    return originalSortItems.reduce((sortItems: SortItem[], sortItem: SortItem) => {
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
    originalSortItems: SortItem[],
    measures: IBucketItem[],
    rowAttributes: IBucketItem[],
    columnAttributes: IBucketItem[],
): SortItem[] {
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

function adaptMdObjectSortItemsToPivotTable(originalSortItems: SortItem[], buckets: IBucket[]): SortItem[] {
    const measureLocalIdentifiers = bucketsMeasures(buckets).map(measureId);
    const rowAttributeLocalIdentifiers = bucketAttributes(bucketsFind(buckets, BucketNames.ATTRIBUTE)).map(
        attributeId,
    );
    const columnAttributeLocalIdentifiers = bucketAttributes(bucketsFind(buckets, BucketNames.COLUMNS)).map(
        attributeId,
    );

    return adaptSortItemsToPivotTable(
        originalSortItems,
        measureLocalIdentifiers,
        rowAttributeLocalIdentifiers,
        columnAttributeLocalIdentifiers,
    );
}

const isAttributeSortItemVisible = (_sortItem: IAttributeSortItem, _filters: IBucketFilter[]): boolean =>
    true;

const isMeasureSortItemMatchedByFilter = (sortItem: IMeasureSortItem, filter: IBucketFilter): boolean =>
    filter.selectedElements.some(selectedElement =>
        sortItem.measureSortItem.locators.some(
            locator =>
                !isMeasureLocator(locator) && locator.attributeLocatorItem.element === selectedElement.uri,
        ),
    );

const isMeasureSortItemVisible = (sortItem: IMeasureSortItem, filters: IBucketFilter[]): boolean =>
    filters.reduce((isVisible, filter) => {
        const shouldBeMatched = !filter.isInverted;
        return isVisible && shouldBeMatched === isMeasureSortItemMatchedByFilter(sortItem, filter);
    }, true);

export const isSortItemVisible = (sortItem: SortItem, filters: IBucketFilter[]): boolean =>
    isAttributeSort(sortItem)
        ? isAttributeSortItemVisible(sortItem, filters)
        : isMeasureSortItemVisible(sortItem, filters);

export function addDefaultSort(
    sortItems: SortItem[],
    filters: IBucketFilter[],
    rowAttributes: IBucketItem[],
    previousRowAttributes?: IBucketItem[],
): SortItem[] {
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
    private element: string;
    private configPanelElement: string;
    private callbacks: IVisCallbacks;
    private intl: InjectedIntl;
    private visualizationProperties: IVisualizationProperties;
    private locale: ILocale;
    private environment: VisualizationEnvironment;

    constructor(props: IVisConstruct) {
        super();
        this.projectId = props.projectId;
        this.element = props.element;
        this.configPanelElement = props.configPanelElement;
        this.callbacks = props.callbacks;
        this.locale = props.locale ? props.locale : DEFAULT_LOCALE;
        this.intl = createInternalIntl(this.locale);
        this.onExportReady = props.callbacks.onExportReady && this.onExportReady.bind(this);
        this.environment = props.environment;
    }

    public unmount() {
        unmountComponentAtNode(document.querySelector(this.element));
        if (document.querySelector(this.configPanelElement)) {
            unmountComponentAtNode(document.querySelector(this.configPanelElement));
        }
    }

    public update(options: IVisProps, insight: IInsight, executionFactory: IExecutionFactory) {
        this.visualizationProperties = insightProperties(insight);
        this.renderVisualization(options, insight, executionFactory);
        this.renderConfigurationPanel(insight);
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

        const originalSortItems: SortItem[] = get(newReferencePoint.properties, "sortItems", []);

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
        newReferencePoint.filters = sanitizeUnusedFilters(newReferencePoint, referencePoint).filters;

        return Promise.resolve(newReferencePoint);
    }

    protected renderVisualization(
        options: IVisProps,
        insight: IInsight,
        executionFactory: IExecutionFactory,
    ) {
        if (!insightHasDataDefined(insight)) {
            // there is nothing in the insight's bucket that can be visualized
            // bail out
            return;
        }

        const { locale, custom, dimensions, config } = options;
        const { height } = dimensions;
        const { drillableItems } = custom;
        const { afterRender, onError, onLoadingChanged, pushData } = this.callbacks;

        const execution = executionFactory
            .forInsight(insight)
            .withDimensions(...this.getDimensions(insight))
            .withSorting(...createSorts(VisualizationTypes.TABLE, insight));

        let configUpdated = config;
        if (this.environment !== "dashboards") {
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
            config: configUpdated,
            locale,
            afterRender,
            onLoadingChanged,
            pushData,
            onError,
            onExportReady: this.onExportReady,
            LoadingComponent: null as any,
            ErrorComponent: null as any,
            intl: this.intl,
        };

        // TODO: SDK8: check the height handling; previously, code was passing height prop down to core
        //  pivot table; now.. this component had this prop but it seems to me that it was never taken
        //  into account (it had the prop because it inherited from same base as charts). Checked the history
        //  and it seems that CorePivotTable never used the 'height' prop

        if (this.environment === "dashboards") {
            if (isNil(height)) {
                render(
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
                                    <CorePivotTable {...pivotTableProps} config={{ maxHeight: usedHeight }} />
                                </div>
                            );
                        }}
                    </Measure>,
                    document.querySelector(this.element),
                );

                return;
            }

            render(
                <div style={{ height: 328, textAlign: "left" }} className="gd-table-dashboard-wrapper">
                    <CorePivotTable {...pivotTableProps} />
                </div>,
                document.querySelector(this.element),
            );
        } else {
            render(<CorePivotTable {...pivotTableProps} />, document.querySelector(this.element));
        }
    }

    protected onExportReady(exportResult: VisEvents.IExportFunction) {
        const { onExportReady } = this.callbacks;
        if (onExportReady) {
            onExportReady(exportResult);
        }
    }

    protected renderConfigurationPanel(insight: IInsight) {
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
                    pushData={this.callbacks.pushData}
                    properties={sanitizedProperties}
                />,
                document.querySelector(this.configPanelElement),
            );
        }
    }

    protected getDimensions(insight: IInsight): IDimension[] {
        return generateDimensions(insight, VisualizationTypes.TABLE);
    }
}
