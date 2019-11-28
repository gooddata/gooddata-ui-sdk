// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { screenshotWrap } from "@gooddata/test-storybook";

import { PivotTable } from "../../src";
import { newMeasure, newAttribute } from "@gooddata/sdk-model";
import { onErrorHandler } from "../mocks";
import { GERMAN_SEPARATORS } from "../data/numberFormat";
import {
    ATTRIBUTE_1,
    ATTRIBUTE_1_WITH_ALIAS,
    ATTRIBUTE_2,
    ATTRIBUTE_3,
    MEASURE_1,
    MEASURE_1_WITH_ALIAS,
    MEASURE_2,
    MEASURE_2_WITH_FORMAT,
    MEASURE_WITH_NULLS,
    TOTAL_M1_A1,
    TOTAL_M2_A1,
    ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
    ARITHMETIC_MEASURE_USING_ARITHMETIC,
    ATTRIBUTE_COUNTRY,
    GRAND_TOTALS_WITH_SUBTOTALS,
} from "../data/componentProps";
import { VisualizationInput } from "@gooddata/gd-bear-model";

function logTotalsChange(data: any) {
    if (data.properties && data.properties.totals) {
        action("totals changed")(data.properties.totals);
    }
}

const wrapperStyle = { width: 1200, height: 300 };

storiesOf("Core components/PivotTable", module)
    .add("table with resizing", () =>
        screenshotWrap(
            <div
                style={{
                    width: 800,
                    height: 400,
                    padding: 10,
                    border: "solid 1px #000000",
                    resize: "both",
                    overflow: "auto",
                }}
                className="s-table"
            >
                <PivotTable
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    rows={[ATTRIBUTE_2, ATTRIBUTE_1]}
                    totals={[TOTAL_M1_A1, TOTAL_M2_A1]}
                    onError={onErrorHandler}
                    pushData={logTotalsChange}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("custom number separators", () =>
        screenshotWrap(
            <div style={wrapperStyle} className="s-table">
                <PivotTable
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    rows={[ATTRIBUTE_1]}
                    config={GERMAN_SEPARATORS}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("custom measure format", () =>
        screenshotWrap(
            <div style={wrapperStyle} className="s-table">
                <PivotTable
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2_WITH_FORMAT]}
                    rows={[ATTRIBUTE_1]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("empty value", () =>
        screenshotWrap(
            <div style={wrapperStyle} className="s-table">
                <PivotTable
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_WITH_NULLS]}
                    rows={[ATTRIBUTE_1]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("totals - two measures, two row attributes", () =>
        screenshotWrap(
            <div style={wrapperStyle} className="s-table">
                <PivotTable
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    rows={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    totals={[TOTAL_M1_A1, TOTAL_M2_A1]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("totals - two measures, one column attributes, one row attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle} className="s-table">
                <PivotTable
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    columns={[ATTRIBUTE_2]}
                    rows={[ATTRIBUTE_1]}
                    totals={[TOTAL_M1_A1, TOTAL_M2_A1]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("totals - two measures, one row attribute, maxHeight 100", () =>
        screenshotWrap(
            <div style={wrapperStyle} className="s-table">
                <PivotTable
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    rows={[ATTRIBUTE_1]}
                    totals={[TOTAL_M1_A1, TOTAL_M2_A1]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        maxHeight: 100,
                    }}
                />
            </div>,
        ),
    )
    .add("totals - two measures, one row attribute, maxHeight 300", () =>
        screenshotWrap(
            <div style={wrapperStyle} className="s-table">
                <PivotTable
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    rows={[ATTRIBUTE_1]}
                    totals={[TOTAL_M1_A1, TOTAL_M2_A1]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        maxHeight: 300,
                    }}
                />
            </div>,
        ),
    )
    .add("totals - column and row attributes with menu enabled", () =>
        screenshotWrap(
            <div style={wrapperStyle} className="s-table">
                <PivotTable
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    columns={[ATTRIBUTE_3]}
                    rows={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    totals={GRAND_TOTALS_WITH_SUBTOTALS}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        menu: {
                            aggregations: true,
                            aggregationsSubMenu: true,
                        },
                    }}
                />
            </div>,
        ),
    )
    .add("arithmetic measures", () =>
        screenshotWrap(
            <div style={wrapperStyle} className="s-table">
                <PivotTable
                    projectId="storybook"
                    measures={[
                        ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
                        ARITHMETIC_MEASURE_USING_ARITHMETIC,
                        MEASURE_1,
                        MEASURE_2,
                    ]}
                    rows={[ATTRIBUTE_1]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("data grouping - group rows in attribute columns", () =>
        screenshotWrap(
            <div style={wrapperStyle} className="s-table">
                <PivotTable
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    rows={[ATTRIBUTE_1, ATTRIBUTE_COUNTRY, ATTRIBUTE_2]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("data grouping - do not group rows in attribute columns when not sorted by first attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle} className="s-table">
                <PivotTable
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    rows={[ATTRIBUTE_1, ATTRIBUTE_COUNTRY, ATTRIBUTE_2]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    sortBy={[
                        {
                            measureSortItem: {
                                direction: "desc",
                                locators: [
                                    {
                                        measureLocatorItem: {
                                            measureIdentifier: "m1",
                                        },
                                    },
                                ],
                            },
                        },
                    ]}
                />
            </div>,
        ),
    )
    .add("subtotals - all labels", () => {
        const measures = [
            // TODO replace uri by identifier
            newMeasure("/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2352", m => m.localId("m1")),
        ];

        const attributes = [
            // TODO replace uri by identifier
            newAttribute("/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2188", a => a.localId("a1")),
            newAttribute("/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2197", a => a.localId("a2")),
            newAttribute("/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2211", a => a.localId("a3")),
            newAttribute("/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2005", a => a.localId("a4")),
            newAttribute("/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2205", a => a.localId("a5")),
        ];

        const totals: VisualizationInput.ITotal[] = [
            {
                measureIdentifier: "m1",
                type: "min",
                attributeIdentifier: "a1",
            },
            {
                measureIdentifier: "m1",
                type: "sum",
                attributeIdentifier: "a2",
            },
            {
                measureIdentifier: "m1",
                type: "max",
                attributeIdentifier: "a2",
            },
            {
                measureIdentifier: "m1",
                type: "sum",
                attributeIdentifier: "a3",
            },
            {
                measureIdentifier: "m1",
                type: "max",
                attributeIdentifier: "a3",
            },
            {
                measureIdentifier: "m1",
                type: "avg",
                attributeIdentifier: "a5",
            },
        ];

        return screenshotWrap(
            <div style={{ ...wrapperStyle, height: 230 }} className="s-table">
                <PivotTable
                    projectId="storybook"
                    measures={measures}
                    rows={attributes}
                    totals={totals}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        );
    })
    .add("subtotals - two measures, two row attributes", () => {
        // TODO replace uri by identifier
        const measures = [
            newMeasure("/gdc/md/aiugpog6irti75nk93qc1wd1t2wl3xfs/obj/1144", m => m.localId("m1")),
            newMeasure("/gdc/md/aiugpog6irti75nk93qc1wd1t2wl3xfs/obj/1145", m => m.localId("m2")),
        ];
        // TODO replace uri by identifier
        const attributes = [
            newAttribute("/gdc/md/aiugpog6irti75nk93qc1wd1t2wl3xfs/obj/1024", a => a.localId("a1")),
            newAttribute("/gdc/md/aiugpog6irti75nk93qc1wd1t2wl3xfs/obj/1027", a => a.localId("a2")),
        ];

        const totals: VisualizationInput.ITotal[] = [
            {
                measureIdentifier: "m1",
                type: "sum",
                attributeIdentifier: "a2",
            },
            {
                measureIdentifier: "m2",
                type: "max",
                attributeIdentifier: "a2",
            },
        ];

        return screenshotWrap(
            <div style={{ ...wrapperStyle }} className="s-table">
                <PivotTable
                    projectId="storybook"
                    measures={measures}
                    rows={attributes}
                    totals={totals}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        );
    })
    .add("grand total and subtotal - two measures, two row attributes", () => {
        // TODO replace uri by identifier
        const measures = [
            newMeasure("/gdc/md/aiugpog6irti75nk93qc1wd1t2wl3xfs/obj/1144", m => m.localId("m1")),
            newMeasure("/gdc/md/aiugpog6irti75nk93qc1wd1t2wl3xfs/obj/1145", m => m.localId("m2")),
        ];
        // TODO replace uri by identifier
        const attributes = [
            newAttribute("/gdc/md/aiugpog6irti75nk93qc1wd1t2wl3xfs/obj/1024", a => a.localId("a1")),
            newAttribute("/gdc/md/aiugpog6irti75nk93qc1wd1t2wl3xfs/obj/1027", a => a.localId("a2")),
        ];

        const totals: VisualizationInput.ITotal[] = [
            {
                measureIdentifier: "m1",
                type: "sum",
                attributeIdentifier: "a1",
            },
            {
                measureIdentifier: "m2",
                type: "sum",
                attributeIdentifier: "a2",
            },
        ];

        return screenshotWrap(
            <div style={{ ...wrapperStyle, height: 228 }} className="s-table">
                <PivotTable
                    projectId="storybook"
                    measures={measures}
                    rows={attributes}
                    totals={totals}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        );
    });
