// (C) 2020-2022 GoodData Corporation
import React, { useState } from "react";
import {
    ColumnWidthItem,
    isAllMeasureColumnWidthItem,
    isAttributeColumnWidthItem,
    isMeasureColumnWidthItem,
    PivotTable,
    IMeasureColumnWidthItem,
} from "@gooddata/sdk-ui-pivot";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import * as ReferenceMd from "../../../../../md/full";
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

    if (isAllMeasureColumnWidthItem(item) && isAllMeasureColumnWidthItem(newItem)) {
        return true;
    }

    return false;
};

const EastCoastUri = "/gdc/md/frho3i7qc6epdek7mcgergm9vtm6o5ty/obj/1083/elements?id=460488";

const measureWidth = (width: number) =>
    measureColumnWidthItemSimple(measures[0], width, [newAttributeLocator(ReferenceMd.Region, EastCoastUri)]);

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
