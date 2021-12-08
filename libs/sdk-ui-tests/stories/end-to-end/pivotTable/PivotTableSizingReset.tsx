// (C) 2020 GoodData Corporation
import { ReferenceMd, ReferenceData } from "@gooddata/reference-workspace";
import {
    IAttributeLocatorItem,
    ILocatorItem,
    IMeasureLocatorItem,
    newAttributeLocator,
} from "@gooddata/sdk-model";
import {
    IAllMeasureColumnWidthItem,
    IAttributeColumnWidthItem,
    IMeasureColumnWidthItem,
    isAttributeColumnWidthItem,
    isMeasureColumnWidthItem,
    PivotTable,
} from "@gooddata/sdk-ui-pivot";
import { storiesOf } from "@storybook/react";
import React, { Component } from "react";
import { ReferenceWorkspaceId, StorybookBackend } from "../../_infra/backend";
import { StoriesForEndToEndTests } from "../../_infra/storyGroups";

import {
    allMeasureColumnWidthItem,
    attributeColumnWidthItem,
    measureColumnWidthItemSimple,
} from "./widthItems";

const backend = StorybookBackend();
const measures = [ReferenceMd.Amount];
const attributes = [ReferenceMd.Product.Name];
const columns = [ReferenceMd.Region];

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

const measureWidth = (width: number) =>
    measureColumnWidthItemSimple(measures[0], width, [
        newAttributeLocator(ReferenceMd.Region, ReferenceData.Region.EastCoast.uri),
    ]);

class PivotTableSizingReset extends Component {
    public state = {
        columnWidths: [],
        autoResize: false,
        growToFit: false,
        gridTableCount: 0,
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
                        onClick={this.onAttributeButtonClick}
                    >
                        Change Product column width to 400
                    </button>
                    <button
                        className="gd-button gd-button-secondary gd-button gd-button-secondary s-change-width-button-measure"
                        onClick={this.onMeasureButtonClick}
                    >
                        Change East Coast Amount column width to 60
                    </button>
                    <button
                        className="gd-button gd-button-secondary gd-button gd-button-secondary s-change-width-button-measure-all"
                        onClick={this.onAllMeasureButtonClick}
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
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        measures={measures}
                        rows={attributes}
                        columns={columns}
                        config={{
                            columnSizing: {
                                columnWidths: [...this.state.columnWidths],
                                defaultWidth: this.state.autoResize ? "autoresizeAll" : "unset",
                                growToFit: this.state.growToFit,
                            },
                        }}
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

    private setColumnWidths = (
        columnWidthItem: IMeasureColumnWidthItem | IAttributeColumnWidthItem | IAllMeasureColumnWidthItem,
    ) => {
        const filteredColumnWidths = this.state.columnWidths.filter(
            (item) => !isSameWidthItem(item, columnWidthItem),
        );

        this.setState({
            columnWidths: [...filteredColumnWidths, columnWidthItem],
        });
    };

    private onAttributeButtonClick = () => {
        this.setColumnWidths(attributeWidth(400));
    };

    private onMeasureButtonClick = () => {
        this.setColumnWidths(measureWidth(60));
    };

    private onAllMeasureButtonClick = () => {
        this.setColumnWidths(allMeasureWidth(60));
    };
}

storiesOf(`${StoriesForEndToEndTests}/Pivot Table`, module).add("complex table with resizing", () => (
    <PivotTableSizingReset />
));
