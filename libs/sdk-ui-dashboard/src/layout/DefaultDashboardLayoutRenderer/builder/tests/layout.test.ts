// (C) 2019-2021 GoodData Corporation
import { IDashboardLayout } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import { newInsightWidget, newKpiWidget } from "@gooddata/sdk-backend-base";
import { DashboardLayoutBuilder } from "../layout";
import {
    createEmptyDashboardLayoutBuilder,
    createValueOrUpdateCallbackTestCases,
    defaultItemXlSize,
} from "./utils";

describe("DashboardLayoutBuilder", () => {
    describe("constructors", () => {
        describe(".for()", () => {
            it("should use the provided layout", () => {
                const layout: IDashboardLayout<any> = {
                    type: "IDashboardLayout",
                    sections: [{ type: "IDashboardLayoutSection", items: [] }],
                };

                expect(DashboardLayoutBuilder.for(layout).build()).toBe(layout);
            });

            it("should throw error, when the layout is damaged", () => {
                const boom = () => {
                    const layoud: any = {
                        type: "yolo",
                        sectionz: [{ itemz: [] }],
                    };

                    DashboardLayoutBuilder.for(layoud);
                };

                expect(boom).toThrowErrorMatchingSnapshot();
            });
        });

        describe(".forNewLayout()", () => {
            it("should create new empty layout", () => {
                const layout = DashboardLayoutBuilder.forNewLayout().build();
                expect(layout).toMatchSnapshot();
            });
        });
    });

    describe(".size()", () => {
        const testCases = createValueOrUpdateCallbackTestCases(defaultItemXlSize);
        it.each(testCases)("should update size %s", (_, valueOrUpdateCallback) => {
            const layout = createEmptyDashboardLayoutBuilder().size(valueOrUpdateCallback).build();
            expect(layout).toMatchSnapshot();
        });
    });

    describe(".addSection()", () => {
        it("should add a section to the end of the layout by default", () => {
            const layoutBuilder = createEmptyDashboardLayoutBuilder().addSection();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder.addSection((r) => r.header({ title: "Added section" })).build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should add a section to the provided index", () => {
            const layoutBuilder = createEmptyDashboardLayoutBuilder().addSection().addSection();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder
                .addSection((r) => r.header({ title: "Added section" }), 1)
                .build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });
    });

    describe(".removeSection()", () => {
        it("should remove the section from the layout", () => {
            const rowIndex = 0;
            const layoutBuilder = createEmptyDashboardLayoutBuilder().addSection(
                (r) => r.header({ title: "Row to remove" }),
                rowIndex,
            );

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder.removeSection(rowIndex).build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should throw error, when the section at provided index does not exist", () => {
            const boom = () => {
                createEmptyDashboardLayoutBuilder().removeSection(0);
            };

            expect(boom).toThrowErrorMatchingSnapshot();
        });
    });

    describe(".modifySection()", () => {
        it("should modify the section", () => {
            const layoutBuilder = createEmptyDashboardLayoutBuilder().addSection((r) =>
                r.header({ title: "Original section" }),
            );

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder
                .modifySection(0, (r) => r.header({ title: "Modified section" }))
                .build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should throw error, when the section at provided index does not exist", () => {
            const boom = () => {
                createEmptyDashboardLayoutBuilder().modifySection(0, (r) =>
                    r.header({ title: "Should throw" }),
                );
            };

            expect(boom).toThrowErrorMatchingSnapshot();
        });
    });

    describe(".moveSection()", () => {
        it("should move the section", () => {
            const layoutBuilder = createEmptyDashboardLayoutBuilder()
                .addSection((r) => r.header({ title: "Row 0" }))
                .addSection((r) => r.header({ title: "Row 1" }))
                .addSection((r) => r.header({ title: "Row 2" }));

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder.moveSection(0, 1).build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should throw error, when the section at provided index does not exist", () => {
            const boom = () => {
                createEmptyDashboardLayoutBuilder().moveSection(0, 1);
            };
            expect(boom).toThrowErrorMatchingSnapshot();
        });
    });

    describe(".removeSections()", () => {
        it("should remove all sections by default", () => {
            const layoutBuilder = createEmptyDashboardLayoutBuilder().addSection().addSection();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder.removeSections().build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should remove selected sections only", () => {
            const layoutBuilder = createEmptyDashboardLayoutBuilder()
                .addSection((r) => r.header({ title: "Row to keep 1" }))
                .addSection()
                .addSection((r) => r.header({ title: "Row to keep 2" }))
                .addSection();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder
                .removeSections((sections) => sections.filter((r) => !r.hasHeader()))
                .build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should remove selected section only", () => {
            const titleOfTheRowToRemove = "Row to remove";
            const layoutBuilder = createEmptyDashboardLayoutBuilder()
                .addSection()
                .addSection((r) => r.header({ title: titleOfTheRowToRemove }))
                .addSection();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder
                .removeSections((sections) => sections.find((r) => r.titleEquals(titleOfTheRowToRemove)))
                .build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should not remove any section, when selection result is undefined", () => {
            const layoutBuilder = createEmptyDashboardLayoutBuilder().addSection();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder
                .removeSections((sections) =>
                    sections.find((r) => r.titleEquals("Non-existing section title")),
                )
                .build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });
    });

    describe(".modifySections()", () => {
        it("should modify all sections by default", () => {
            const layoutBuilder = createEmptyDashboardLayoutBuilder().addSection().addSection();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder
                .modifySections((r, f) => r.header({ title: `Modified section ${f.index()}` }))
                .build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should modify selected sections only", () => {
            const layoutBuilder = createEmptyDashboardLayoutBuilder()
                .addSection((r) => r.header({ title: "Original section" }))
                .addSection()
                .addSection((r) => r.header({ title: "Original section" }))
                .addSection();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder
                .modifySections(
                    (r, f) => r.header({ title: `Modified section ${f.index()}` }),
                    (sections) => sections.filter((r) => r.hasHeader()),
                )
                .build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should modify selected section only", () => {
            const titleOfTheRowToModify = "Original section";
            const layoutBuilder = createEmptyDashboardLayoutBuilder()
                .addSection()
                .addSection((r) => r.header({ title: titleOfTheRowToModify }))
                .addSection();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder
                .modifySections(
                    (r) => r.header({ title: "Modified section" }),
                    (sections) => sections.find((r) => r.titleEquals(titleOfTheRowToModify)),
                )
                .build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should not modify any section, when selection result is undefined", () => {
            const layoutBuilder = createEmptyDashboardLayoutBuilder().addSection();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder
                .modifySections(
                    (r) => r.header({ title: "That would never happen" }),
                    (sections) => sections.find((r) => r.titleEquals("Non-existing section title")),
                )
                .build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });
    });

    /// complex scenarios

    it("should resize items with particular insight", () => {
        const tableInsightRef = idRef("tableInsight");
        const barInsightRef = idRef("barInsight");
        const columnInsightRef = idRef("columnInsight");

        const widgetSections = [
            [
                newInsightWidget(tableInsightRef, (w) => w.title("Table widget").ref(idRef("widget1"))),
                newInsightWidget(barInsightRef, (w) => w.title("Bar widget").ref(idRef("widget2"))),
                newInsightWidget(columnInsightRef, (w) => w.title("Column widget").ref(idRef("widget3"))),
            ],
            [newInsightWidget(tableInsightRef, (w) => w.title("Table widget 2").ref(idRef("widget4")))],
        ];

        const layoutBuilder = createEmptyDashboardLayoutBuilder();

        for (const widgetSection of widgetSections) {
            layoutBuilder.addSection((section) => {
                for (const widget of widgetSection) {
                    section.addItem(defaultItemXlSize, (item) => item.widget(widget));
                }
                return section;
            });
        }

        const layoutBefore = layoutBuilder.build();
        const layoutAfter = layoutBuilder
            .modifySections((r) =>
                r.modifyItems(
                    (item) => item.size({ xl: { gridWidth: 2, heightAsRatio: 25 } }),
                    (items) => items.filter((item) => item.isWidgetItemWithInsightRef(tableInsightRef)),
                ),
            )
            .build();

        expect(layoutBefore).toMatchSnapshot("before");
        expect(layoutAfter).toMatchSnapshot("after");
    });

    it("should remove all items with kpi widget", () => {
        const insightRef = idRef("insightRef");
        const measureRef = idRef("measure");
        const insightWidgetRef = idRef("insightWidget");
        const kpiWidgetRef = idRef("kpiWidget");

        const widgetSections = [
            [
                newInsightWidget(insightRef, (w) => w.title("Insight widget").ref(insightWidgetRef)),
                newKpiWidget(measureRef, (w) => w.title("Kpi widget").ref(kpiWidgetRef)),
            ],
            [newKpiWidget(measureRef, (w) => w.title("Kpi widget").ref(kpiWidgetRef))],
            [newInsightWidget(insightRef, (w) => w.title("Insight widget").ref(insightWidgetRef))],
        ];

        const layoutBuilder = createEmptyDashboardLayoutBuilder();

        for (const widgetSection of widgetSections) {
            layoutBuilder.addSection((section) => {
                for (const widget of widgetSection) {
                    section.addItem(defaultItemXlSize, (item) => item.widget(widget));
                }
                return section;
            });
        }

        const layoutBefore = layoutBuilder.build();
        const layoutAfter = layoutBuilder
            .modifySections((r) =>
                r.removeItems((items) => {
                    return items.filter((item) => item.isKpiWidgetItem());
                }),
            )
            .removeEmptySections()
            .build();

        expect(layoutBefore).toMatchSnapshot("before");
        expect(layoutAfter).toMatchSnapshot("after");
    });
});
