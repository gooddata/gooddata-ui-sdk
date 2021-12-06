// (C) 2007-2020 GoodData Corporation
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import {
    attributeLocalId,
    measureLocalId,
    attributeIdentifier,
    measureIdentifier,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
    newAttributeSort,
    newMeasureSort,
    newAttributeLocator,
} from "@gooddata/sdk-model";
import { HeaderPredicates } from "@gooddata/sdk-ui";
import { LdmExt, Ldm } from "../../../md";
import { createColumnTotal } from "../../../utils/helpers";
import { ElementWithParam } from "./ElementWithParam";

const measureFranchiseFees = LdmExt.FranchiseFees;
const measureAdRoyalty = LdmExt.FranchiseFeesAdRoyalty;
const attributeLocationState = LdmExt.LocationState;
const attributeLocationName = LdmExt.LocationName;
const attributeMenuCategory = LdmExt.MenuCategory;
const attributeQuarter = LdmExt.quarterDate;
const attributeMonth = LdmExt.monthDate;

const measures = [measureFranchiseFees, measureAdRoyalty];
const columns = [attributeQuarter, attributeMonth];
const rows = [attributeLocationState, attributeLocationName, attributeMenuCategory];

const bucketPresets: any = {
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
            columns: rows.map((attribute) => ({
                insightViewAttribute: {
                    ...attribute,
                    localIdentifier: `${attributeLocalId(attribute)}_2`,
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

const drillingPresets: any = {
    measure: {
        label: "Measure Franchise Fees",
        key: "measure",
        drillableItem: HeaderPredicates.identifierMatch(measureIdentifier(LdmExt.FranchiseFees)!),
    },
    attributeMonth: {
        label: "Attribute Month",
        key: "attributeMonth",
        drillableItem: HeaderPredicates.identifierMatch(attributeIdentifier(LdmExt.monthDate)!),
    },
    attributeQuarter: {
        label: "Attribute Quarter",
        key: "attributeQuarter",
        drillableItem: HeaderPredicates.identifierMatch(attributeIdentifier(LdmExt.quarterDate)!),
    },
    attributeLocationState: {
        label: "Attribute Location state",
        key: "attributeLocationState",
        drillableItem: HeaderPredicates.identifierMatch(attributeIdentifier(LdmExt.LocationState)!),
    },
    attributeMenuCategory: {
        label: "Attribute Menu category",
        key: "attributeMenuCategory",
        drillableItem: HeaderPredicates.identifierMatch(attributeIdentifier(LdmExt.MenuCategory)!),
    },
    attributeValueCalifornia: {
        label: "Attribute value California",
        key: "attributeValueCalifornia",
        drillableItem: HeaderPredicates.uriMatch(LdmExt.locationStateAttributeCaliforniaUri),
    },
    attributeValueJanuary: {
        label: "Attribute value January",
        key: "attributeValueJanuary",
        drillableItem: HeaderPredicates.uriMatch(LdmExt.monthDateJanuaryUri),
    },
};
const totalPresets: any = {
    franchiseFeesSum: {
        label: "Franchise Fees Sum",
        key: "franchiseFeesSum",
        totalItem: createColumnTotal(
            measureLocalId(LdmExt.FranchiseFees),
            attributeLocalId(LdmExt.LocationState),
        ),
    },
    franchiseFeesAvg: {
        label: "Franchise Fees Average",
        key: "franchiseFeesAvg",
        totalItem: createColumnTotal(
            measureLocalId(LdmExt.FranchiseFees),
            attributeLocalId(LdmExt.LocationState),
            "avg",
        ),
    },
    franchiseFeesAdRoyaltySum: {
        label: "Franchise Fees Ad Royalty Sum",
        key: "franchiseFeesAdRoyaltySum",
        totalItem: createColumnTotal(
            measureLocalId(LdmExt.FranchiseFeesAdRoyalty),
            attributeLocalId(LdmExt.LocationState),
        ),
    },
    franchiseFeesAdRoyaltyMax: {
        label: "Franchise Fees Ad Royalty Max",
        key: "franchiseFeesAdRoyaltyMax",
        totalItem: createColumnTotal(
            measureLocalId(LdmExt.FranchiseFeesAdRoyalty),
            attributeLocalId(LdmExt.LocationState),
            "max",
        ),
    },
    franchiseFeesMaxByLocationState: {
        label: "Subtotal Franchise Fees Max by Location State",
        key: "franchiseFeesMaxByLocationState",
        totalItem: createColumnTotal(
            measureLocalId(LdmExt.FranchiseFeesAdRoyalty),
            attributeLocalId(LdmExt.LocationName),
            "max",
        ),
    },
};
const filterPresets: any = {
    attributeCalifornia: {
        label: "Attribute (California)",
        key: "attributeCalifornia",
        filterItem: newPositiveAttributeFilter(attributeIdentifier(LdmExt.LocationState)!, [
            LdmExt.locationStateAttributeCaliforniaUri,
        ]),
    },
    lastYear: {
        label: "Last year",
        key: "lastYear",
        filterItem: newRelativeDateFilter(Ldm.DateDatasets.Date, "GDC.time.year", -1, -1),
    },
    noData: {
        label: "No Data",
        key: "noData",
        filterItem: newRelativeDateFilter(Ldm.DateDatasets.Date, "GDC.time.year", 1, 1),
    },
    franchiseFeesCalifornia: {
        label: "Franchise Fees California",
        key: "franchiseFeesCalifornia",
        filterItem: null,
    },
};

const franchiseFeesCalifornia = Ldm.$FranchiseFees;
const sortingPresets: any = {
    noSort: {
        label: "No sort",
        key: "noSort",
        sortBy: [],
    },
    byMenuCategory: {
        label: "By Menu Category ASC",
        key: "byMenuCategory",
        sortBy: [newAttributeSort(LdmExt.MenuCategory, "asc")],
    },
    byLocationState: {
        label: "By Location State DESC",
        key: "byLocationState",
        sortBy: [newAttributeSort(LdmExt.LocationState, "desc")],
    },
    byQ1JanFranchiseFees: {
        label: "by Q1 / Jan / FranchiseFees DESC",
        key: "byQ1JanFranchiseFees",
        sortBy: [
            newMeasureSort(LdmExt.FranchiseFees, "desc", [
                newAttributeLocator(
                    Ldm.DateQuarter,
                    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2009/elements?id=1",
                ),
                newAttributeLocator(
                    Ldm.DateMonth.Short,
                    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2071/elements?id=1",
                ),
            ]),
        ],
    },
    byLocationStateAndQ1JanFranchiseFees: {
        label: "By Location State ASC And Q1 Jan Franchise Fees DESC",
        key: "byLocationStateAndQ1JanFranchiseFees",
        sortBy: [
            newAttributeSort(LdmExt.LocationState, "asc"),
            newMeasureSort(LdmExt.FranchiseFees, "desc", [
                newAttributeLocator(
                    Ldm.DateQuarter,
                    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2009/elements?id=1",
                ),
                newAttributeLocator(
                    Ldm.DateMonth.Short,
                    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2071/elements?id=1",
                ),
            ]),
        ],
    },
};

const menuPresets: any = {
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

const pivotTableSizePresets: any = {
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

const maxHeightPresets: any = {
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

const drillHandlingPresets: any = {
    onFiredDrillEvent: {
        label: "Old onFiredDrillEvent",
        key: "onFiredDrillEvent",
        value: true,
    },
    onDrill: {
        label: "New onDrill",
        key: "onDrill",
        value: false,
    },
};

export const getDrillableItems = (drillableKeys: any): any[] => {
    return Object.keys(drillableKeys)
        .filter((itemKey) => drillableKeys[itemKey])
        .map((itemKey) => drillingPresets[itemKey].drillableItem);
};

export const getTotalItems = (totalKeys: any): any[] => {
    return Object.keys(totalKeys)
        .filter((itemKey) => totalKeys[itemKey])
        .map((itemKey) => totalPresets[itemKey].totalItem);
};

export const getGroupRows = (groupRowsKey: any): boolean => {
    return groupRowsPresets[groupRowsKey as keyof typeof groupRowsPresets].value;
};
interface IPivotTableDrillingExampleState {
    bucketPresetKey: string;
    drillEvent: Event | undefined;
    drillingPresetKeys: any;
    filterPresetKeys: any;
    drillableItems: any;
    totalPresetKeys: any;
    sortingPresetKey: string;
    menuPresetKey: string;
    pivotTableSizeKey: string;
    maxHeightPresetKey: string;
    groupRowsKey: Parameters<typeof getGroupRows>[0];
    drillHandlingKey: string;
}

export class PivotTableDrillingExample extends React.Component<unknown, IPivotTableDrillingExampleState> {
    constructor(props: null) {
        super(props);

        const drillingPresetKeys = {
            attributeValueCalifornia: true,
            measure: true,
            attributeMenuCategory: true,
            attributeValueJanuary: true,
        };

        this.state = {
            bucketPresetKey: "measuresColumnAndRowAttributes",
            drillEvent: undefined,
            drillingPresetKeys,
            filterPresetKeys: {},
            drillableItems: getDrillableItems(drillingPresetKeys),
            totalPresetKeys: {},
            sortingPresetKey: "noSort",
            menuPresetKey: "noMenu",
            pivotTableSizeKey: "default",
            maxHeightPresetKey: "none",
            groupRowsKey: "disabledGrouping",
            drillHandlingKey: "onFiredDrillEvent",
        };
    }

    public onDrillingPresetChange = (drillingPresetKey: any): void => {
        const drillingPresetKeys = {
            ...this.state.drillingPresetKeys,
            [drillingPresetKey]: !this.state.drillingPresetKeys[drillingPresetKey],
        };
        this.setState({
            drillingPresetKeys,
            drillableItems: getDrillableItems(drillingPresetKeys),
        });
    };
    public onTotalPresetChange = (totalPresetKey: any): void => {
        const totalPresetKeys = {
            ...this.state.totalPresetKeys,
            [totalPresetKey]: !this.state.totalPresetKeys[totalPresetKey],
        };
        this.setState({
            totalPresetKeys,
        });
    };
    public onFilterPresetChange = (filterPresetKey: any): void => {
        const filterPresetKeys = {
            ...this.state.filterPresetKeys,
            [filterPresetKey]: !this.state.filterPresetKeys[filterPresetKey],
        };
        this.setState({
            filterPresetKeys,
        });
    };
    public onBucketPresetChange = (bucketPresetKey: any): void => {
        this.setState({
            bucketPresetKey,
        });
    };
    public onSortingPresetChange = (sortingPresetKey: any): void => {
        this.setState({
            sortingPresetKey,
        });
    };
    public onMenuPresetChange = (menuPresetKey: any): void => {
        this.setState({
            menuPresetKey,
        });
    };
    public onPivotTableSizeChange = (pivotTableSizeKey: any): void => {
        this.setState({
            pivotTableSizeKey,
        });
    };
    public onMaxHeightPresetChange = (maxHeightPresetKey: any): void => {
        this.setState({
            maxHeightPresetKey,
        });
    };

    public onGroupRowsPresetChange = (groupRowsKey: any): void => {
        this.setState({
            groupRowsKey,
        });
    };

    public onDrillHandlingChange = (drillHandlingKey: any): void => {
        this.setState({
            drillHandlingKey,
        });
    };

    public onFiredDrillEvent = (drillEvent: any): boolean => {
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

    public onDrill = (drillEvent: any): void => {
        // eslint-disable-next-line no-console
        console.log("onDrill", drillEvent, JSON.stringify(drillEvent.drillContext.intersection, null, 2));
        this.setState({
            drillEvent,
        });
    };

    public render(): React.ReactNode {
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
            drillHandlingKey,
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
            .filter((itemKey) => filterPresetKeys[itemKey] && filterPresets[itemKey].filterItem)
            .map((itemKey) => filterPresets[itemKey].filterItem);
        const filtersProp = filters.length > 0 ? { filters } : {};

        const totals = getTotalItems(totalPresetKeys);
        const grandTotalsOnly = totals.filter((total) => {
            const firstAttribute = rows[0];
            return (
                firstAttribute !== undefined &&
                total.attributeIdentifier === attributeIdentifier(firstAttribute)
            );
        });

        const groupRows = getGroupRows(groupRowsKey);
        const drillHandlerProp = {
            // @ts-expect-error this is ok for now
            [drillHandlingKey]: this[drillHandlingKey],
        };

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
                    {Object.keys(bucketPresets).map((presetItemKey) => {
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
                    {Object.keys(filterPresets).map((presetItemKey) => {
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
                    {Object.keys(drillingPresets).map((presetItemKey) => {
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
                    {Object.keys(sortingPresets).map((presetItemKey) => {
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
                    {Object.keys(totalPresets).map((presetItemKey) => {
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
                    {Object.keys(menuPresets).map((presetItemKey) => {
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
                    {Object.keys(pivotTableSizePresets).map((presetItemKey) => {
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
                    {Object.keys(maxHeightPresets).map((presetItemKey) => {
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
                    {Object.keys(groupRowsPresets).map((presetItemKey) => {
                        const { key, label } =
                            groupRowsPresets[presetItemKey as keyof typeof groupRowsPresets];
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
                <div className="presets">
                    Drill handling:{" "}
                    {Object.keys(drillHandlingPresets).map((presetItemKey) => {
                        const { key, label } = drillHandlingPresets[presetItemKey];
                        return (
                            <ElementWithParam
                                key={key}
                                className={`preset-option gd-button gd-button-secondary s-group-rows-preset-${key} ${
                                    drillHandlingKey === key ? " is-active" : ""
                                }`}
                                onClick={this.onDrillHandlingChange}
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
                        pageSize={20}
                        {...bucketPropsWithFilters}
                        {...filtersProp}
                        drillableItems={drillableItems}
                        {...drillHandlerProp}
                        sortBy={sortBy}
                        config={{
                            maxHeight: maxHeightPresets[maxHeightPresetKey].value,
                            menu: menuPresets[menuPresetKey].menuConfig,
                            groupRows,
                        }}
                        totals={totals}
                    />
                </div>

                <h2>Table component for reference</h2>
                <div style={{ height: 300 }}>
                    <PivotTable
                        key={`${pivotTableSizeKey}__${maxHeightPresetKey}__${groupRows}`}
                        {...tableBucketProps}
                        {...filtersProp}
                        drillableItems={drillableItems}
                        onFiredDrillEvent={this.onFiredDrillEvent}
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
