// (C) 2020 GoodData Corporation
import React, { Component } from "react";
import {
    PivotTable,
    isAttributeColumnWidthItem,
    isMeasureColumnWidthItem,
    IAllMeasureColumnWidthItem,
    IMeasureColumnWidthItem,
    IAttributeColumnWidthItem,
} from "@gooddata/sdk-ui-pivot";
import { ILocatorItem, IAttributeLocatorItem, IMeasureLocatorItem } from "@gooddata/sdk-model";

import { LdmExt } from "../../../ldm";
import {
    attributeColumnWidthItem,
    measureColumnWidthItemSimple,
    allMeasureColumnWidthItem,
} from "../../pivotTable/utils/widthItems";

const measures = [LdmExt.FranchiseFees];

const attributes = [LdmExt.LocationState];

const columns = [LdmExt.quaterDate];

const attributeWidth = (width: number) => attributeColumnWidthItem(attributes[0], width);

const allMeasureWidth = (width: number) => allMeasureColumnWidthItem(width);

const isAllMeasureColumnWidthItem = (columnWidthItem: IMeasureColumnWidthItem) => {
    return (
        columnWidthItem.measureColumnWidthItem !== undefined &&
        columnWidthItem.measureColumnWidthItem.locators === undefined
    );
};

const areLocatorsEqual = (locator1: ILocatorItem[], locator2: ILocatorItem[]) => {
    return (
        (locator1[0] as IAttributeLocatorItem).attributeLocatorItem.element ===
            (locator2[0] as IAttributeLocatorItem).attributeLocatorItem.element &&
        (locator1[1] as IMeasureLocatorItem).measureLocatorItem.measureIdentifier ===
            (locator2[1] as IMeasureLocatorItem).measureLocatorItem.measureIdentifier
    );
};

const isSameWidthItem = (item: any, newItem: any) => {
    if (isAttributeColumnWidthItem(item) && isAttributeColumnWidthItem(newItem)) {
        return (
            item.attributeColumnWidthItem.attributeIdentifier ===
            newItem.attributeColumnWidthItem.attributeIdentifier
        );
    }

    if (isMeasureColumnWidthItem(item) && isMeasureColumnWidthItem(newItem)) {
        return areLocatorsEqual(
            item.measureColumnWidthItem.locators as ILocatorItem[],
            newItem.measureColumnWidthItem.locators as ILocatorItem[],
        );
    }

    if (isAllMeasureColumnWidthItem(item) && isAllMeasureColumnWidthItem(newItem)) {
        return true;
    }

    return false;
};

const measureWidth = (width: number) => measureColumnWidthItemSimple(measures[0], width);

export class PivotTableSizingComplexExample extends Component {
    public state = {
        columnWidths: [],
        autoResize: false,
        growToFit: false,
        gridTableCount: 0,
    };

    public onButtonClick = (
        columnWidthItem: IMeasureColumnWidthItem | IAttributeColumnWidthItem | IAllMeasureColumnWidthItem,
    ) => {
        const filteredColumnWidths = this.state.columnWidths.filter(
            (item) => !isSameWidthItem(item, columnWidthItem),
        );

        this.setState({
            columnWidths: [...filteredColumnWidths, columnWidthItem],
        });
    };

    public onColumnResized = (
        columnWidths: Array<IMeasureColumnWidthItem | IAttributeColumnWidthItem | IAllMeasureColumnWidthItem>,
    ) => {
        this.setState({ columnWidths });
    };

    public onAutoResizeChanged = () => {
        // change also PivotTable key so by this checkbox we simulate init render
        this.setState((prevState: any) => ({
            ...prevState,
            autoResize: !prevState.autoResize,
            gridTableCount: prevState.gridTableCount + 1,
        }));
    };

    public onGrowToFitChanged = () => {
        this.setState((prevState: any) => ({
            ...prevState,
            growToFit: !prevState.growToFit,
            gridTableCount: prevState.gridTableCount + 1,
        }));
    };

    public render() {
        return (
            <div>
                <div>
                    <button
                        className="gd-button gd-button-secondary gd-button gd-button-secondary s-change-width-button-attribute"
                        onClick={() => this.onButtonClick(attributeWidth(400))}
                    >
                        Change Location State column width to 400
                    </button>
                    <button
                        className="gd-button gd-button-secondary gd-button gd-button-secondary s-change-width-button-measure"
                        onClick={() => this.onButtonClick(measureWidth(60))}
                    >
                        Change Q1 column width to 60
                    </button>
                    <button
                        className="gd-button gd-button-secondary gd-button gd-button-secondary s-change-width-button-measure-all"
                        onClick={() => this.onButtonClick(allMeasureWidth(60))}
                    >
                        Change all measures width
                    </button>

                    <label style={{ paddingLeft: 20 }}>
                        Auto resize:
                        <input
                            className="s-pivot-table-sizing-complex-autoresize-checkbox"
                            name="autoresize-checkbox"
                            type="checkbox"
                            checked={this.state.autoResize}
                            onChange={this.onAutoResizeChanged}
                        />
                    </label>

                    <label style={{ paddingLeft: 20 }}>
                        Grow to Fit:
                        <input
                            className="s-pivot-table-sizing-complex-grow-to-fit-checkbox"
                            name="grow-to-fit-checkbox"
                            type="checkbox"
                            checked={this.state.growToFit}
                            onChange={this.onGrowToFitChanged}
                        />
                    </label>
                </div>
                <div
                    style={{ width: 1000, height: 300, marginTop: 20, resize: "both", overflow: "auto" }}
                    className="s-pivot-table-sizing-complex"
                >
                    <PivotTable
                        key={`PivotTableKey-${this.state.gridTableCount}`}
                        measures={measures}
                        rows={attributes}
                        columns={columns}
                        config={{
                            columnSizing: {
                                columnWidths: [...this.state.columnWidths],
                                defaultWidth: this.state.autoResize ? "viewport" : "unset",
                                growToFit: this.state.growToFit,
                            },
                        }}
                        pageSize={20}
                        onColumnResized={this.onColumnResized}
                    />
                </div>
                <div>columns state:</div>
                <div className="s-pivot-table-sizing-complex-callback">
                    {JSON.stringify(this.state.columnWidths)}
                </div>
            </div>
        );
    }
}

export default PivotTableSizingComplexExample;
