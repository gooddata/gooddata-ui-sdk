// (C) 2020-2023 GoodData Corporation
import React, { useState } from "react";
import {
    ColumnWidthItem,
    isAllMeasureColumnWidthItem,
    isAttributeColumnWidthItem,
    isMeasureColumnWidthItem,
    PivotTable,
    IMeasureColumnWidthItem,
    ISliceMeasureColumnWidthItem,
    IMixedValuesColumnWidthItem,
} from "@gooddata/sdk-ui-pivot";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import * as ReferenceMd from "../../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";
import {
    IAttributeLocatorItem,
    ILocatorItem,
    IMeasureLocatorItem,
    IAttribute,
    attributeLocalId,
    IMeasure,
    measureLocalId,
    newAttributeLocator,
} from "@gooddata/sdk-model";
import { workspace } from "../../../../../constants";

const measures = [ReferenceMd.Amount];
const attributes = [ReferenceMd.Product.Name];
const columns = [ReferenceMd.Region];

export const attributeColumnWidthItem = (attribute: IAttribute, width: number) => {
    return {
        attributeColumnWidthItem: {
            width: { value: width },
            attributeIdentifier: attributeLocalId(attribute),
        },
    };
};

export const measureColumnWidthItemSimple = (
    measure: IMeasure,
    width: number,
    obj?: IAttributeLocatorItem[],
): IMeasureColumnWidthItem => {
    const measureColumnWidthItemHolder: IMeasureColumnWidthItem["measureColumnWidthItem"] = {
        width: { value: width },
        locators: [
            {
                measureLocatorItem: {
                    measureIdentifier: measureLocalId(measure),
                },
            },
        ],
    };

    if (obj) {
        measureColumnWidthItemHolder.locators.splice(
            -2,
            0,
            ...obj.map((attributeLocatorItem) => ({
                ...attributeLocatorItem,
            })),
        );
    }

    return { measureColumnWidthItem: measureColumnWidthItemHolder };
};

export const allMeasureColumnWidthItem = (width: number) => {
    return {
        measureColumnWidthItem: {
            width: { value: width },
        },
    };
};

export const sliceMeasureColumnWidthItem = (
    measure: IMeasure,
    width: number,
): ISliceMeasureColumnWidthItem => {
    const sliceMeasureColumnWidthItem: ISliceMeasureColumnWidthItem["sliceMeasureColumnWidthItem"] = {
        width: { value: width },
        locators: [
            {
                measureLocatorItem: {
                    measureIdentifier: measureLocalId(measure),
                },
            },
        ],
    };

    return { sliceMeasureColumnWidthItem };
};

export const mixedValuesColumnWidthItem = (measure: IMeasure, width: number): IMixedValuesColumnWidthItem => {
    const mixedValuesColumnWidthItem: IMixedValuesColumnWidthItem["mixedValuesColumnWidthItem"] = {
        width: { value: width },
        locators: [
            {
                measureLocatorItem: {
                    measureIdentifier: measureLocalId(measure),
                },
            },
        ],
    };

    return { mixedValuesColumnWidthItem };
};

const attributeWidth = (width: number) => attributeColumnWidthItem(attributes[0], width);

const allMeasureWidth = (width: number) => allMeasureColumnWidthItem(width);

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

    return isAllMeasureColumnWidthItem(item) && isAllMeasureColumnWidthItem(newItem);
};

const EastCoastUri = `/gdc/md/${workspace}/obj/1085/elements?id=460488`;

const measureWidth = (width: number) =>
    measureColumnWidthItemSimple(measures[0], width, [newAttributeLocator(ReferenceMd.Region, EastCoastUri)]);

const sliceMeasureWidth = (width: number) => sliceMeasureColumnWidthItem(measures[0], width);

const mixedValuesWidth = (width: number) => mixedValuesColumnWidthItem(measures[0], width);

export const PivotTableComplexResetScenario: React.FC = () => {
    const [columnWidths, setColumnWidths] = useState<Array<ColumnWidthItem>>([]);
    const [autoResize, setAutoResize] = useState(false);
    const [growToFit, setGrowToFit] = useState(false);
    const [gridTableCount, setGridTableCount] = useState(0);

    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const onColumnResized = (widths: ColumnWidthItem[]) => {
        setColumnWidths(widths);
    };

    const updateColumnWidths = (columnWidthItem: ColumnWidthItem) => {
        const filteredColumnWidths = columnWidths.filter((item) => !isSameWidthItem(item, columnWidthItem));

        setColumnWidths([...filteredColumnWidths, columnWidthItem]);
    };

    const onAttributeButtonClick = () => {
        updateColumnWidths(attributeWidth(400));
    };

    const onMeasureButtonClick = () => {
        updateColumnWidths(measureWidth(60));
    };

    const onAllMeasureButtonClick = () => {
        updateColumnWidths(allMeasureWidth(60));
    };

    const onAutoResizeChanged = () => {
        // change also PivotTable key so by this checkbox we simulate init render
        setAutoResize((prev) => !prev);
        setGridTableCount((prev) => prev + 1);
    };

    const onGrowToFitChanged = () => {
        // change also PivotTable key so by this checkbox we simulate init render
        setGrowToFit((prev) => !prev);
        setGridTableCount((prev) => prev + 1);
    };

    return (
        <div>
            <div>
                <button className="s-change-width-button-attribute" onClick={onAttributeButtonClick}>
                    Change Product column width to 400
                </button>
                <button className="s-change-width-button-measure" onClick={onMeasureButtonClick}>
                    Change East Coast Amount column width to 60
                </button>
                <button className="s-change-width-button-measure-all" onClick={onAllMeasureButtonClick}>
                    Change all measures width
                </button>

                <label style={{ paddingLeft: 20 }}>
                    Auto resize:
                    <input
                        className="s-pivot-table-sizing-complex-autoresize-checkbox"
                        name="autoresize-checkbox"
                        type="checkbox"
                        checked={autoResize}
                        onChange={onAutoResizeChanged}
                    />
                </label>

                <label style={{ paddingLeft: 20 }}>
                    Grow to Fit:
                    <input
                        className="s-pivot-table-sizing-complex-grow-to-fit-checkbox"
                        name="grow-to-fit-checkbox"
                        type="checkbox"
                        checked={growToFit}
                        onChange={onGrowToFitChanged}
                    />
                </label>
            </div>

            <div
                style={{ width: 1000, height: 300, marginTop: 20, resize: "both", overflow: "auto" }}
                className="s-pivot-table-sizing-complex"
            >
                <PivotTable
                    key={`PivotTableKey-${gridTableCount}`}
                    backend={backend}
                    workspace={workspace}
                    measures={measures}
                    rows={attributes}
                    columns={columns}
                    config={{
                        columnSizing: {
                            columnWidths: [...columnWidths],
                            defaultWidth: autoResize ? "autoresizeAll" : "unset",
                            growToFit: growToFit,
                        },
                    }}
                    onColumnResized={onColumnResized}
                />
            </div>
            <div>columns state:</div>
            <div className="s-pivot-table-sizing-complex-callback">{JSON.stringify(columnWidths)}</div>
        </div>
    );
};

export const PivotTableTransposedComplexResetScenario: React.FC = () => {
    const [columnWidths, setColumnWidths] = useState<Array<ColumnWidthItem>>([]);
    const [autoResize, setAutoResize] = useState(false);
    const [growToFit, setGrowToFit] = useState(false);
    const [gridTableCount, setGridTableCount] = useState(0);

    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const onColumnResized = (widths: ColumnWidthItem[]) => {
        setColumnWidths(widths);
    };

    const updateTranposedColumnWidths = (columnWidthItem: ColumnWidthItem) => {
        const transposedFilteredColumnWidths = columnWidths.filter(
            (item) => !isSameWidthItem(item, columnWidthItem),
        );

        setColumnWidths([...transposedFilteredColumnWidths, columnWidthItem]);
    };

    const onSliceMeasureButtonClick = () => {
        updateTranposedColumnWidths(sliceMeasureWidth(60));
    };

    const onMixedValuesButtonClick = () => {
        updateTranposedColumnWidths(mixedValuesWidth(400));
    };

    const onAutoResizeChanged = () => {
        // change also PivotTable key so by this checkbox we simulate init render
        setAutoResize((prev) => !prev);
        setGridTableCount((prev) => prev + 1);
    };

    const onGrowToFitChanged = () => {
        // change also PivotTable key so by this checkbox we simulate init render
        setGrowToFit((prev) => !prev);
        setGridTableCount((prev) => prev + 1);
    };

    return (
        <div>
            <div>
                <button className="s-change-width-button-slice-measure" onClick={onSliceMeasureButtonClick}>
                    Change Amount name column width to 60
                </button>

                <button
                    className="s-change-width-button-mixed-values-measure"
                    onClick={onMixedValuesButtonClick}
                >
                    Change Amount value column width to 400
                </button>

                <label style={{ paddingLeft: 20 }}>
                    Auto resize:
                    <input
                        className="s-pivot-table-sizing-complex-autoresize-checkbox"
                        name="autoresize-checkbox"
                        type="checkbox"
                        checked={autoResize}
                        onChange={onAutoResizeChanged}
                    />
                </label>

                <label style={{ paddingLeft: 20 }}>
                    Grow to Fit:
                    <input
                        className="s-pivot-table-sizing-complex-grow-to-fit-checkbox"
                        name="grow-to-fit-checkbox"
                        type="checkbox"
                        checked={growToFit}
                        onChange={onGrowToFitChanged}
                    />
                </label>
            </div>

            <div
                style={{ width: 1000, height: 300, marginTop: 20, resize: "both", overflow: "auto" }}
                className="s-pivot-table-sizing-complex"
            >
                <PivotTable
                    key={`PivotTableKey-${gridTableCount}`}
                    backend={backend}
                    workspace={workspace}
                    measures={measures}
                    rows={attributes}
                    config={{
                        columnHeadersPosition: "left",
                        measureGroupDimension: "rows",
                        columnSizing: {
                            columnWidths: [...columnWidths],
                            defaultWidth: autoResize ? "autoresizeAll" : "unset",
                            growToFit: growToFit,
                        },
                    }}
                    onColumnResized={onColumnResized}
                />
            </div>
            <div>columns state:</div>
            <div className="s-pivot-table-sizing-complex-callback">{JSON.stringify(columnWidths)}</div>
        </div>
    );
};
