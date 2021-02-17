// (C) 2019-2021 GoodData Corporation
import { DashboardViewLayoutBuilder } from "../layout";
import { IDashboardViewLayout } from "../../interfaces/dashboardLayout";
import { createEmptyFluidLayoutBuilder, defaultColumnXlSize } from "./utils";
import { idRef } from "@gooddata/sdk-model";
import { newInsightWidget, newKpiWidget } from "@gooddata/sdk-backend-base";

describe("DashboardViewLayoutBuilder", () => {
    describe("constructors", () => {
        describe(".for()", () => {
            it("should use the provided layout", () => {
                const layout: IDashboardViewLayout<any> = {
                    type: "fluidLayout",
                    rows: [{ columns: [] }],
                };

                expect(DashboardViewLayoutBuilder.for(layout).build()).toBe(layout);
            });

            it("should throw error, when the layout is damaged", () => {
                const boom = () => {
                    const layoud: any = {
                        type: "yolo",
                        rowz: [{ columnz: [] }],
                    };

                    DashboardViewLayoutBuilder.for(layoud);
                };

                expect(boom).toThrowErrorMatchingSnapshot();
            });
        });
    });

    it("should resize columns with particular insight", () => {
        const tableInsightRef = idRef("tableInsight");
        const barInsightRef = idRef("barInsight");
        const columnInsightRef = idRef("columnInsight");

        const contentRows = [
            [
                newInsightWidget(tableInsightRef, (w) => w.title("Table widget").ref(idRef("widget1"))),
                newInsightWidget(barInsightRef, (w) => w.title("Bar widget").ref(idRef("widget2"))),
                newInsightWidget(columnInsightRef, (w) => w.title("Column widget").ref(idRef("widget3"))),
            ],
            [newInsightWidget(tableInsightRef, (w) => w.title("Table widget 2").ref(idRef("widget4")))],
        ];

        const layoutBuilder = createEmptyFluidLayoutBuilder();

        for (const contentRow of contentRows) {
            layoutBuilder.addRow((row) => {
                for (const content of contentRow) {
                    row.addColumn(defaultColumnXlSize, (col) => col.content(content));
                }
                return row;
            });
        }

        const layoutBefore = layoutBuilder.build();
        const layoutAfter = layoutBuilder
            .modifyRows((r) =>
                r.modifyColumns(
                    (column) => column.size({ xl: { widthAsGridColumnsCount: 2, heightAsRatio: 25 } }),
                    (columns) => columns.filter((column) => column.hasWidgetWithInsightRef(tableInsightRef)),
                ),
            )
            .build();

        expect(layoutBefore).toMatchSnapshot("before");
        expect(layoutAfter).toMatchSnapshot("after");
    });

    it("should remove all columns with kpi widget", () => {
        const insightRef = idRef("insightRef");
        const measureRef = idRef("measure");
        const insightWidgetRef = idRef("insightWidget");
        const kpiWidgetRef = idRef("kpiWidget");

        const contentRows = [
            [
                newInsightWidget(insightRef, (w) => w.title("Insight widget").ref(insightWidgetRef)),
                newKpiWidget(measureRef, (w) => w.title("Kpi widget").ref(kpiWidgetRef)),
            ],
            [newKpiWidget(measureRef, (w) => w.title("Kpi widget").ref(kpiWidgetRef))],
            [newInsightWidget(insightRef, (w) => w.title("Insight widget").ref(insightWidgetRef))],
        ];

        const layoutBuilder = createEmptyFluidLayoutBuilder();

        for (const contentRow of contentRows) {
            layoutBuilder.addRow((row) => {
                for (const content of contentRow) {
                    row.addColumn(defaultColumnXlSize, (col) => col.content(content));
                }
                return row;
            });
        }

        const layoutBefore = layoutBuilder.build();
        const layoutAfter = layoutBuilder
            .modifyRows((r) =>
                r.removeColumns((columns) => {
                    return columns.filter((column) => column.hasKpiWidgetContent());
                }),
            )
            .removeEmptyRows()
            .build();

        expect(layoutBefore).toMatchSnapshot("before");
        expect(layoutAfter).toMatchSnapshot("after");
    });
});
