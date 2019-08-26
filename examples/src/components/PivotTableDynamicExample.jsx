// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { PivotTable, Table, HeaderPredicateFactory, Model } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import {
    projectId,
    quarterDateIdentifier,
    monthDateIdentifier,
    locationStateDisplayFormIdentifier,
    locationNameDisplayFormIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    menuCategoryAttributeDFIdentifier,
    locationStateAttributeCaliforniaUri,
    monthDateIdentifierJanuary,
    dateDatasetIdentifier,
} from "../utils/fixtures";
import { createColumnTotal } from "../utils/helpers";
import { ElementWithParam } from "./utils/ElementWithParam";

const measureFranchiseFees = Model.measure(franchiseFeesIdentifier).localIdentifier(franchiseFeesIdentifier);
const measureAdRoyalty = Model.measure(franchiseFeesAdRoyaltyIdentifier).localIdentifier(
    franchiseFeesAdRoyaltyIdentifier,
);
const attributeLocationState = Model.attribute(locationStateDisplayFormIdentifier).localIdentifier(
    locationStateDisplayFormIdentifier,
);
const attributeLocationName = Model.attribute(locationNameDisplayFormIdentifier).localIdentifier(
    locationNameDisplayFormIdentifier,
);
const attributeMenuCategory = Model.attribute(menuCategoryAttributeDFIdentifier).localIdentifier(
    menuCategoryAttributeDFIdentifier,
);
const attributeQuarter = Model.attribute(quarterDateIdentifier).localIdentifier(quarterDateIdentifier);
const attributeMonth = Model.attribute(monthDateIdentifier).localIdentifier(monthDateIdentifier);

const measures = [measureFranchiseFees, measureAdRoyalty];
const columns = [attributeQuarter, attributeMonth];
const rows = [attributeLocationState, attributeLocationName, attributeMenuCategory];

const bucketPresets = {
    measures: {
        label: "Measures",
        key: "measures",
        bucketProps: {
            measures,
        },
    },
    columnAttributes: {
        label: "Column attributes",
        key: "columnAttributes",
        bucketProps: {
            columns,
        },
    },
    rowAttributes: {
        label: "Row attributes",
        key: "rowAttributes",
        bucketProps: {
            rows,
        },
    },
    columnAndRowAttributes: {
        label: "Column and row attributes",
        key: "columnAndRowAttributes",
        bucketProps: {
            columns,
            rows,
        },
    },
    measuresColumnAndRowAttributes: {
        label: "Measures, column and row attributes",
        key: "measuresColumnAndRowAttributes",
        bucketProps: {
            measures,
            columns,
            rows,
        },
    },
    measuresAndColumnAttributes: {
        label: "Measures and column attributes",
        key: "measuresAndColumnAttributes",
        bucketProps: {
            measures,
            columns,
        },
    },
    measuresAndRowAttributes: {
        label: "Measures and row attributes",
        key: "measuresAndRowAttributes",
        bucketProps: {
            measures,
            rows,
        },
    },
    measuresAndMirroredAttributes: {
        label: "Measures and mirrored attributes",
        key: "measuresAndMirroredAttributes",
        bucketProps: {
            measures,
            rows,
            columns: rows.map(attribute => ({
                visualizationAttribute: {
                    ...attribute.visualizationAttribute,
                    localIdentifier: `${attribute.visualizationAttribute.localIdentifier}_2`,
                },
            })),
        },
    },
    smallDataSet: {
        label: "Small data set",
        key: "smallDataSet",
        bucketProps: {
            measures,
            rows: [attributeLocationState],
        },
    },
    smallWideDataSet: {
        label: "Small wide data set",
        key: "smallWideDataSet",
        bucketProps: {
            measures,
            rows: [attributeLocationState],
            columns: [attributeQuarter],
        },
    },
};

const drillingPresets = {
    measure: {
        label: "Measure Franchise Fees",
        key: "measure",
        drillableItem: HeaderPredicateFactory.identifierMatch(franchiseFeesIdentifier),
    },
    attributeMonth: {
        label: "Attribute Month",
        key: "attributeMonth",
        drillableItem: HeaderPredicateFactory.identifierMatch(monthDateIdentifier),
    },
    attributeQuarter: {
        label: "Attribute Quarter",
        key: "attributeQuarter",
        drillableItem: HeaderPredicateFactory.identifierMatch(quarterDateIdentifier),
    },
    attributeLocationState: {
        label: "Attribute Location state",
        key: "attributeLocationState",
        drillableItem: HeaderPredicateFactory.identifierMatch(locationStateDisplayFormIdentifier),
    },
    attributeMenuCategory: {
        label: "Attribute Menu category",
        key: "attributeMenuCategory",
        drillableItem: HeaderPredicateFactory.identifierMatch(menuCategoryAttributeDFIdentifier),
    },
    attributeValueCalifornia: {
        label: "Attribute value California",
        key: "attributeValueCalifornia",
        drillableItem: HeaderPredicateFactory.uriMatch(locationStateAttributeCaliforniaUri),
    },
    attributeValueJanuary: {
        label: "Attribute value January",
        key: "attributeValueJanuary",
        drillableItem: HeaderPredicateFactory.uriMatch(monthDateIdentifierJanuary),
    },
};
const totalPresets = {
    franchiseFeesSum: {
        label: "Franchise Fees Sum",
        key: "franchiseFeesSum",
        totalItem: createColumnTotal(franchiseFeesIdentifier, locationStateDisplayFormIdentifier),
    },
    franchiseFeesAvg: {
        label: "Franchise Fees Average",
        key: "franchiseFeesAvg",
        totalItem: createColumnTotal(franchiseFeesIdentifier, locationStateDisplayFormIdentifier, "avg"),
    },
    franchiseFeesAdRoyaltySum: {
        label: "Franchise Fees Ad Royalty Sum",
        key: "franchiseFeesAdRoyaltySum",
        totalItem: createColumnTotal(franchiseFeesAdRoyaltyIdentifier, locationStateDisplayFormIdentifier),
    },
    franchiseFeesAdRoyaltyMax: {
        label: "Franchise Fees Ad Royalty Max",
        key: "franchiseFeesAdRoyaltyMax",
        totalItem: createColumnTotal(
            franchiseFeesAdRoyaltyIdentifier,
            locationStateDisplayFormIdentifier,
            "max",
        ),
    },
    franchiseFeesMaxByLocationState: {
        label: "Subtotal Franchise Fees Max by Location State",
        key: "franchiseFeesMaxByLocationState",
        totalItem: createColumnTotal(
            franchiseFeesAdRoyaltyIdentifier,
            locationNameDisplayFormIdentifier,
            "max",
        ),
    },
};
const filterPresets = {
    attributeCalifornia: {
        label: "Attribute (California)",
        key: "attributeCalifornia",
        filterItem: Model.positiveAttributeFilter(locationStateDisplayFormIdentifier, [
            locationStateAttributeCaliforniaUri,
        ]),
    },
    lastYear: {
        label: "Last year",
        key: "lastYear",
        filterItem: Model.relativeDateFilter(dateDatasetIdentifier, "GDC.time.year", -1, -1),
    },
    noData: {
        label: "No Data",
        key: "noData",
        filterItem: Model.relativeDateFilter(dateDatasetIdentifier, "GDC.time.year", 1, 1),
    },
    franchiseFeesCalifornia: {
        label: "Franchise Fees California",
        key: "franchiseFeesCalifornia",
        filterItem: null,
    },
};

const franchiseFeesCalifornia = Model.measure(franchiseFeesIdentifier)
    .localIdentifier("franchiseFeesCalifornia")
    .alias("FranchiseFees (California)")
    .filters(filterPresets.attributeCalifornia.filterItem);

const sortingPresets = {
    noSort: {
        label: "No sort",
        key: "noSort",
        sortBy: [],
    },
    byMenuCategory: {
        label: "By Menu Category ASC",
        key: "byMenuCategory",
        sortBy: [Model.attributeSortItem(menuCategoryAttributeDFIdentifier, "asc")],
    },
    byLocationState: {
        label: "By Location State DESC",
        key: "byLocationState",
        sortBy: [Model.attributeSortItem(locationStateDisplayFormIdentifier, "desc")],
    },
    byQ1JanFranchiseFees: {
        label: "by Q1 / Jan / FranchiseFees DESC",
        key: "byQ1JanFranchiseFees",
        sortBy: [
            Model.measureSortItem(franchiseFeesIdentifier, "desc").attributeLocators(
                {
                    attributeIdentifier: quarterDateIdentifier,
                    element: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2009/elements?id=1",
                },
                {
                    attributeIdentifier: monthDateIdentifier,
                    element: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2071/elements?id=1",
                },
            ),
        ],
    },
    byLocationStateAndQ1JanFranchiseFees: {
        label: "By Location State ASC And Q1 Jan Franchise Fees DESC",
        key: "byLocationStateAndQ1JanFranchiseFees",
        sortBy: [
            Model.attributeSortItem(locationStateDisplayFormIdentifier, "asc"),
            Model.measureSortItem(franchiseFeesIdentifier, "desc").attributeLocators(
                {
                    attributeIdentifier: quarterDateIdentifier,
                    element: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2009/elements?id=1",
                },
                {
                    attributeIdentifier: monthDateIdentifier,
                    element: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2071/elements?id=1",
                },
            ),
        ],
    },
};

const menuPresets = {
    noMenu: {
        label: "No menu",
        key: "noMenu",
        menuConfig: null,
    },
    aggregations: {
        label: "Aggregations",
        key: "aggregations",
        menuConfig: { aggregations: true },
    },
    aggregationsWithSubTotals: {
        label: "Aggregations with subtotals",
        key: "aggregationsWithSubTotals",
        menuConfig: {
            aggregations: true,
            aggregationsSubMenu: true,
        },
    },
};

const pivotTableSizePresets = {
    default: {
        label: "Default",
        key: "default",
        styles: { width: "100%", height: 300 },
    },
    wide: {
        label: "Wide",
        key: "wide",
        styles: { width: 1500, height: 500 },
    },
};

const maxHeightPresets = {
    none: {
        key: "none",
        label: "None",
        value: undefined,
    },
    oneHundred: {
        key: "oneHundred",
        label: "100px",
        value: 100,
    },
    twoHundredFifty: {
        key: "twoHundredFifty",
        label: "250px",
        value: 250,
    },
};

const groupRowsPresets = {
    disabledGrouping: {
        label: "Disabled",
        key: "disabledGrouping",
        value: false,
    },
    activeGrouping: {
        label: "Active",
        key: "activeGrouping",
        value: true,
    },
};

export const getDrillableItems = drillableKeys => {
    return Object.keys(drillableKeys)
        .filter(itemKey => drillableKeys[itemKey])
        .map(itemKey => drillingPresets[itemKey].drillableItem);
};

export const getTotalItems = totalKeys => {
    return Object.keys(totalKeys)
        .filter(itemKey => totalKeys[itemKey])
        .map(itemKey => totalPresets[itemKey].totalItem);
};

export const getGroupRows = groupRowsKey => {
    return groupRowsPresets[groupRowsKey].value;
};

export class PivotTableDrillingExample extends Component {
    constructor(props) {
        super(props);

        const drillingPresetKeys = {
            attributeValueCalifornia: true,
            measure: true,
            attributeMenuCategory: true,
            attributeValueJanuary: true,
        };

        this.state = {
            bucketPresetKey: "measuresColumnAndRowAttributes",
            drillEvent: null,
            drillingPresetKeys,
            filterPresetKeys: {},
            drillableItems: getDrillableItems(drillingPresetKeys),
            totalPresetKeys: {},
            sortingPresetKey: "noSort",
            menuPresetKey: "noMenu",
            pivotTableSizeKey: "default",
            maxHeightPresetKey: "none",
            groupRowsKey: "disabledGrouping",
        };
    }

    onDrillingPresetChange = drillingPresetKey => {
        const drillingPresetKeys = {
            ...this.state.drillingPresetKeys,
            [drillingPresetKey]: !this.state.drillingPresetKeys[drillingPresetKey],
        };
        this.setState({
            drillingPresetKeys,
            drillableItems: getDrillableItems(drillingPresetKeys),
        });
    };
    onTotalPresetChange = totalPresetKey => {
        const totalPresetKeys = {
            ...this.state.totalPresetKeys,
            [totalPresetKey]: !this.state.totalPresetKeys[totalPresetKey],
        };
        this.setState({
            totalPresetKeys,
        });
    };
    onFilterPresetChange = filterPresetKey => {
        const filterPresetKeys = {
            ...this.state.filterPresetKeys,
            [filterPresetKey]: !this.state.filterPresetKeys[filterPresetKey],
        };
        this.setState({
            filterPresetKeys,
        });
    };
    onBucketPresetChange = bucketPresetKey => {
        this.setState({
            bucketPresetKey,
        });
    };
    onSortingPresetChange = sortingPresetKey => {
        this.setState({
            sortingPresetKey,
        });
    };
    onMenuPresetChange = menuPresetKey => {
        this.setState({
            menuPresetKey,
        });
    };
    onPivotTableSizeChange = pivotTableSizeKey => {
        this.setState({
            pivotTableSizeKey,
        });
    };
    onMaxHeightPresetChange = maxHeightPresetKey => {
        this.setState({
            maxHeightPresetKey,
        });
    };

    onGroupRowsPresetChange = groupRowsKey => {
        this.setState({
            groupRowsKey,
        });
    };

    onDrill = drillEvent => {
        // eslint-disable-next-line no-console
        console.log(
            "onFiredDrillEvent",
            drillEvent,
            JSON.stringify(drillEvent.drillContext.intersection, null, 2),
        );
        this.setState({
            drillEvent,
        });
        return true;
    };

    render() {
        const {
            bucketPresetKey,
            sortingPresetKey,
            drillEvent,
            drillableItems,
            drillingPresetKeys,
            filterPresetKeys,
            totalPresetKeys,
            menuPresetKey,
            pivotTableSizeKey,
            maxHeightPresetKey,
            groupRowsKey,
        } = this.state;
        const { bucketProps } = bucketPresets[bucketPresetKey];
        const { sortBy } = sortingPresets[sortingPresetKey];

        // Exchange FranchiseFees for franchiseFeesCalifornia if filterPresetKeys.franchiseFeesCalifornia === true
        const bucketPropsWithFilters =
            filterPresetKeys.franchiseFeesCalifornia && bucketProps.measures.length > 0
                ? {
                      ...bucketProps,
                      measures: [franchiseFeesCalifornia, ...bucketProps.measures.slice(1)],
                  }
                : bucketProps;
        const tableBucketProps = {
            ...bucketPropsWithFilters,
        };
        delete tableBucketProps.columns;
        if (bucketPropsWithFilters.rows) {
            tableBucketProps.attributes = bucketPropsWithFilters.rows;
        }

        const filters = Object.keys(filterPresets)
            .filter(itemKey => filterPresetKeys[itemKey] && filterPresets[itemKey].filterItem)
            .map(itemKey => filterPresets[itemKey].filterItem);
        const filtersProp = filters.length > 0 ? { filters } : {};

        const totals = getTotalItems(totalPresetKeys);
        const grandTotalsOnly = totals.filter(total => {
            const firstAttribute = rows[0];
            return (
                firstAttribute !== undefined &&
                total.attributeIdentifier === firstAttribute.visualizationAttribute.localIdentifier
            );
        });

        const groupRows = getGroupRows(groupRowsKey);

        return (
            <div>
                <style jsx>
                    {`
                        .presets {
                            margin: -5px;
                            margin-top: 0;
                            margin-bottom: 10px;
                        }
                        .presets :global(.preset-option) {
                            margin: 5px;
                        }
                    `}
                </style>
                <div className="presets">
                    Data presets:{" "}
                    {Object.keys(bucketPresets).map(presetItemKey => {
                        const { key, label } = bucketPresets[presetItemKey];
                        return (
                            <ElementWithParam
                                key={key}
                                className={`preset-option gd-button gd-button-secondary s-bucket-preset-${key} ${
                                    bucketPresetKey === key ? " is-active" : ""
                                }`}
                                onClick={this.onBucketPresetChange}
                                params={[key]}
                            >
                                {label}
                            </ElementWithParam>
                        );
                    })}
                </div>
                <div className="presets">
                    Filter presets:{" "}
                    {Object.keys(filterPresets).map(presetItemKey => {
                        const { key, label } = filterPresets[presetItemKey];
                        return (
                            <ElementWithParam
                                key={key}
                                className={`preset-option gd-button gd-button-secondary s-drilling-preset-${key} ${
                                    filterPresetKeys[key] ? " is-active" : ""
                                }`}
                                onClick={this.onFilterPresetChange}
                                params={[key]}
                            >
                                {label}
                            </ElementWithParam>
                        );
                    })}
                </div>
                <div className="presets">
                    Drilling presets:{" "}
                    {Object.keys(drillingPresets).map(presetItemKey => {
                        const { key, label } = drillingPresets[presetItemKey];
                        return (
                            <ElementWithParam
                                key={key}
                                className={`preset-option gd-button gd-button-secondary s-drilling-preset-${key} ${
                                    drillingPresetKeys[key] ? " is-active" : ""
                                }`}
                                onClick={this.onDrillingPresetChange}
                                params={[key]}
                            >
                                {label}
                            </ElementWithParam>
                        );
                    })}
                </div>
                <div className="presets">
                    Sorting presets:{" "}
                    {Object.keys(sortingPresets).map(presetItemKey => {
                        const { key, label } = sortingPresets[presetItemKey];
                        return (
                            <ElementWithParam
                                key={key}
                                className={`preset-option gd-button gd-button-secondary s-sorting-preset-${key} ${
                                    sortingPresetKey === key ? " is-active" : ""
                                }`}
                                onClick={this.onSortingPresetChange}
                                params={[key]}
                            >
                                {label}
                            </ElementWithParam>
                        );
                    })}
                </div>
                <div className="presets">
                    Total presets:{" "}
                    {Object.keys(totalPresets).map(presetItemKey => {
                        const { key, label } = totalPresets[presetItemKey];
                        return (
                            <ElementWithParam
                                key={key}
                                className={`preset-option gd-button gd-button-secondary s-total-preset-${key} ${
                                    totalPresetKeys[key] ? " is-active" : ""
                                }`}
                                onClick={this.onTotalPresetChange}
                                params={[key]}
                            >
                                {label}
                            </ElementWithParam>
                        );
                    })}
                </div>
                <div className="presets">
                    Menu presets:{" "}
                    {Object.keys(menuPresets).map(presetItemKey => {
                        const { key, label } = menuPresets[presetItemKey];
                        return (
                            <ElementWithParam
                                key={key}
                                className={`preset-option gd-button gd-button-secondary s-total-preset-${key} ${
                                    menuPresetKey === key ? " is-active" : ""
                                }`}
                                onClick={this.onMenuPresetChange}
                                params={[key]}
                            >
                                {label}
                            </ElementWithParam>
                        );
                    })}
                </div>
                <div className="presets">
                    Pivot table size:{" "}
                    {Object.keys(pivotTableSizePresets).map(presetItemKey => {
                        const { key, label } = pivotTableSizePresets[presetItemKey];
                        return (
                            <ElementWithParam
                                key={key}
                                className={`preset-option gd-button gd-button-secondary s-total-preset-${key} ${
                                    pivotTableSizeKey === key ? " is-active" : ""
                                }`}
                                onClick={this.onPivotTableSizeChange}
                                params={[key]}
                            >
                                {label}
                            </ElementWithParam>
                        );
                    })}
                </div>
                <div className="presets">
                    Max height:{" "}
                    {Object.keys(maxHeightPresets).map(presetItemKey => {
                        const { key, label } = maxHeightPresets[presetItemKey];
                        return (
                            <ElementWithParam
                                key={key}
                                className={`preset-option gd-button gd-button-secondary s-max-height-preset-${key} ${
                                    maxHeightPresetKey === key ? " is-active" : ""
                                }`}
                                onClick={this.onMaxHeightPresetChange}
                                params={[key]}
                            >
                                {label}
                            </ElementWithParam>
                        );
                    })}
                </div>
                <div className="presets">
                    Group rows:{" "}
                    {Object.keys(groupRowsPresets).map(presetItemKey => {
                        const { key, label } = groupRowsPresets[presetItemKey];
                        return (
                            <ElementWithParam
                                key={key}
                                className={`preset-option gd-button gd-button-secondary s-group-rows-preset-${key} ${
                                    groupRowsKey === key ? " is-active" : ""
                                }`}
                                onClick={this.onGroupRowsPresetChange}
                                params={[key]}
                            >
                                {label}
                            </ElementWithParam>
                        );
                    })}
                </div>

                <div
                    className={`s-pivot-table-${bucketPresetKey}`}
                    style={pivotTableSizePresets[pivotTableSizeKey].styles}
                >
                    <PivotTable
                        // Table components are completely reset because they
                        // heavily use JS to compute dimensions and when we just
                        // change style prop they did not re-render with correct
                        // width. To get around this problem we completely
                        // reset both table components.
                        key={`${pivotTableSizeKey}__${maxHeightPresetKey}__${groupRows}`}
                        projectId={projectId}
                        pageSize={20}
                        {...bucketPropsWithFilters}
                        {...filtersProp}
                        drillableItems={drillableItems}
                        onFiredDrillEvent={this.onDrill}
                        sortBy={sortBy}
                        config={{
                            maxHeight: maxHeightPresets[maxHeightPresetKey].value,
                            menu: menuPresets[menuPresetKey].menuConfig,
                        }}
                        totals={totals}
                        groupRows={groupRows}
                    />
                </div>

                <h2>Table component for reference</h2>
                <div style={{ height: 300 }}>
                    <Table
                        key={`${pivotTableSizeKey}__${maxHeightPresetKey}__${groupRows}`}
                        projectId={projectId}
                        {...tableBucketProps}
                        {...filtersProp}
                        drillableItems={drillableItems}
                        onFiredDrillEvent={this.onDrill}
                        sortBy={sortBy}
                        totals={grandTotalsOnly}
                    />
                </div>

                <pre className="s-output">
                    {JSON.stringify(
                        drillEvent || {
                            ...bucketPropsWithFilters,
                            drillableItems,
                        },
                        null,
                        4,
                    )}
                </pre>
            </div>
        );
    }
}

export default PivotTableDrillingExample;
