// (C) 2019-2021 GoodData Corporation
import {
    IDashboardLayout,
    IDashboardLayoutItem,
    IDashboardLayoutSection,
    IDashboardLayoutSectionHeader,
} from "@gooddata/sdk-backend-spi";
import { DashboardLayoutBuilder } from "../layout";
import { DashboardLayoutSectionBuilder } from "../section";
import {
    createEmptyDashboardLayoutBuilder,
    createEmptyDashboardLayoutSectionBuilder,
    createValueOrUpdateCallbackTestCases,
    defaultItemXlSize,
} from "./utils";

describe("DashboardLayoutSectionBuilder", () => {
    describe("constructors", () => {
        describe(".for()", () => {
            it("should use the correct section", () => {
                const section: IDashboardLayoutSection<any> = {
                    type: "IDashboardLayoutSection",
                    header: { title: "Correct section" },
                    items: [],
                };
                const layout: IDashboardLayout<any> = {
                    type: "IDashboardLayout",
                    sections: [section],
                };
                const layoutBuilder = DashboardLayoutBuilder.for(layout);
                const sectionBuilder = DashboardLayoutSectionBuilder.for(layoutBuilder, 0);
                expect(sectionBuilder.build()).toBe(section);
            });

            it("should throw error, when the section is damaged", () => {
                const boom = () => {
                    const rowh: any = { haeder: "immutable.js!", columnz: [] };
                    const layoud: IDashboardLayout<any> = {
                        type: "IDashboardLayout",
                        sections: [rowh],
                    };
                    const layoutBuilder = DashboardLayoutBuilder.for(layoud);
                    DashboardLayoutSectionBuilder.for(layoutBuilder, 0);
                };

                expect(boom).toThrowErrorMatchingSnapshot();
            });
        });
    });

    describe(".header()", () => {
        const value: IDashboardLayoutSectionHeader = {
            title: "Section title",
            description: "Section description",
        };
        const testCases = createValueOrUpdateCallbackTestCases(value);
        it.each(testCases)("should update header %s", (_, valueOrUpdateCallback) => {
            const sectionBuilder = createEmptyDashboardLayoutSectionBuilder();
            const section = sectionBuilder.header(valueOrUpdateCallback).build();

            expect(section).toMatchSnapshot();
        });
    });

    describe(".createItem()", () => {
        it("should create item at the end of the section by default", () => {
            const sectionBuilder = createEmptyDashboardLayoutSectionBuilder().createItem(defaultItemXlSize);

            const sectionBefore = sectionBuilder.build();
            const sectionAfter = sectionBuilder
                .createItem(defaultItemXlSize, (i) => i.widget("Added item"))
                .build();

            expect(sectionBefore).toMatchSnapshot("before");
            expect(sectionAfter).toMatchSnapshot("after");
        });

        it("should create item at the provided index", () => {
            const sectionBuilder = createEmptyDashboardLayoutSectionBuilder()
                .createItem(defaultItemXlSize)
                .createItem(defaultItemXlSize);

            const sectionBefore = sectionBuilder.build();
            const sectionAfter = sectionBuilder
                .createItem(defaultItemXlSize, (i) => i.widget("Added item"), 1)
                .build();

            expect(sectionBefore).toMatchSnapshot("before");
            expect(sectionAfter).toMatchSnapshot("after");
        });
    });

    describe(".addItem()", () => {
        const testItem = (widget: string): IDashboardLayoutItem<any> => {
            return {
                type: "IDashboardLayoutItem",
                size: {
                    xl: {
                        gridWidth: 12,
                    },
                },
                widget,
            };
        };

        it("should add item at the end of the section by default", () => {
            const sectionBuilder = createEmptyDashboardLayoutSectionBuilder().addItem(
                testItem("Initial item"),
            );

            const sectionBefore = sectionBuilder.build();
            const sectionAfter = sectionBuilder.addItem(testItem("Added item")).build();

            expect(sectionBefore).toMatchSnapshot("before");
            expect(sectionAfter).toMatchSnapshot("after");
        });

        it("should create item at the provided index", () => {
            const sectionBuilder = createEmptyDashboardLayoutSectionBuilder()
                .addItem(testItem("Item 1"))
                .addItem(testItem("Item 2"));

            const sectionBefore = sectionBuilder.build();
            const sectionAfter = sectionBuilder.addItem(testItem("Added item"), 1).build();

            expect(sectionBefore).toMatchSnapshot("before");
            expect(sectionAfter).toMatchSnapshot("after");
        });
    });

    describe(".removeItem()", () => {
        it("should remove the item from the section", () => {
            const rowIndex = 0;
            const columnIndex = 0;

            const layoutBuilder = createEmptyDashboardLayoutBuilder().createSection(
                (section) =>
                    section.createItem(defaultItemXlSize, (i) => i.widget("Item to remove"), columnIndex),
                rowIndex,
            );
            const sectionBuilder = DashboardLayoutSectionBuilder.for(layoutBuilder, rowIndex);

            const sectionBefore = sectionBuilder.build();
            const sectionAfter = sectionBuilder.removeItem(columnIndex).build();

            expect(sectionBefore).toMatchSnapshot("before");
            expect(sectionAfter).toMatchSnapshot("after");
        });

        it("should throw error, when the item at provided index does not exist", () => {
            const boom = () => {
                createEmptyDashboardLayoutSectionBuilder().removeItem(0);
            };

            // Test it outside the catch block to make sure that even if no exception is thrown,
            // the test will make the assertion and fails correctly.
            expect(boom).toThrowErrorMatchingSnapshot();
        });
    });

    describe(".modifyItem()", () => {
        it("should modify the item", () => {
            const columnIndex = 0;
            const sectionBuilder = createEmptyDashboardLayoutSectionBuilder().createItem(
                defaultItemXlSize,
                (i) => i.widget("Original item"),
                columnIndex,
            );

            const sectionBefore = sectionBuilder.build();
            const sectionAfter = sectionBuilder.modifyItem(0, (i) => i.widget("Modified item")).build();

            expect(sectionBefore).toMatchSnapshot("before");
            expect(sectionAfter).toMatchSnapshot("after");
        });

        it("should throw error, when the item at provided index does not exist", () => {
            const boom = () => {
                createEmptyDashboardLayoutSectionBuilder().modifyItem(0, (i) => i.widget("Should throw"));
            };

            expect(boom).toThrowErrorMatchingSnapshot();
        });
    });

    describe(".moveItem()", () => {
        it("should move the item", () => {
            const sectionBuilder = createEmptyDashboardLayoutSectionBuilder()
                .createItem(defaultItemXlSize, (i) => i.widget("Widget 0"))
                .createItem(defaultItemXlSize, (i) => i.widget("Widget 1"))
                .createItem(defaultItemXlSize, (i) => i.widget("Widget 2"));

            const sectionBefore = sectionBuilder.build();
            const sectionAfter = sectionBuilder.moveItem(0, 1).build();

            expect(sectionBefore).toMatchSnapshot("before");
            expect(sectionAfter).toMatchSnapshot("after");
        });

        it("should throw error, when the item at provided index does not exist", () => {
            const boom = () => {
                createEmptyDashboardLayoutSectionBuilder().moveItem(0, 1);
            };

            expect(boom).toThrowErrorMatchingSnapshot();
        });
    });

    describe(".removeItems()", () => {
        it("should remove all items by default", () => {
            const sectionBuilder = createEmptyDashboardLayoutSectionBuilder()
                .createItem(defaultItemXlSize)
                .createItem(defaultItemXlSize);

            const sectionBefore = sectionBuilder.build();
            const sectionAfter = sectionBuilder.removeItems().build();

            expect(sectionBefore).toMatchSnapshot("before");
            expect(sectionAfter).toMatchSnapshot("after");
        });

        it("should remove selected items only", () => {
            const sectionBuilder = createEmptyDashboardLayoutSectionBuilder()
                .createItem(defaultItemXlSize, (i) => i.widget("Item to keep 1"))
                .createItem(defaultItemXlSize)
                .createItem(defaultItemXlSize, (i) => i.widget("Item to keep 2"))
                .createItem(defaultItemXlSize);

            const sectionBefore = sectionBuilder.build();
            const sectionAfter = sectionBuilder
                .removeItems((items) => items.filter((i) => i.isEmpty()))
                .build();

            expect(sectionBefore).toMatchSnapshot("before");
            expect(sectionAfter).toMatchSnapshot("after");
        });

        it("should remove selected item only", () => {
            const contentOfTheColumnToRemove = "Item to remove";
            const sectionBuilder = createEmptyDashboardLayoutSectionBuilder()
                .createItem(defaultItemXlSize)
                .createItem(defaultItemXlSize, (r) => r.widget(contentOfTheColumnToRemove))
                .createItem(defaultItemXlSize);

            const sectionBefore = sectionBuilder.build();
            const sectionAfter = sectionBuilder
                .removeItems((items) => items.find((i) => i.widgetEquals(contentOfTheColumnToRemove)))
                .build();

            expect(sectionBefore).toMatchSnapshot("before");
            expect(sectionAfter).toMatchSnapshot("after");
        });

        it("should not remove any item, when selection result is undefined", () => {
            const sectionBuilder = createEmptyDashboardLayoutSectionBuilder().createItem(defaultItemXlSize);

            const sectionBefore = sectionBuilder.build();
            const sectionAfter = sectionBuilder
                .removeItems((items) => items.find((i) => i.widgetIs("Non-existing content")))
                .build();

            expect(sectionBefore).toMatchSnapshot("before");
            expect(sectionAfter).toMatchSnapshot("after");
        });
    });

    describe(".modifyItems()", () => {
        it("should modify all items by default", () => {
            const sectionBuilder = createEmptyDashboardLayoutSectionBuilder()
                .createItem(defaultItemXlSize)
                .createItem(defaultItemXlSize);

            const sectionBefore = sectionBuilder.build();
            const sectionAfter = sectionBuilder
                .modifyItems((i, f) => i.widget(`Modified item ${f.index()}`))
                .build();

            expect(sectionBefore).toMatchSnapshot("before");
            expect(sectionAfter).toMatchSnapshot("after");
        });

        it("should modify selected items only", () => {
            const sectionBuilder = createEmptyDashboardLayoutSectionBuilder()
                .createItem(defaultItemXlSize, (i) => i.widget("Original item"))
                .createItem(defaultItemXlSize)
                .createItem(defaultItemXlSize, (i) => i.widget("Original item"))
                .createItem(defaultItemXlSize);

            const sectionBefore = sectionBuilder.build();
            const sectionAfter = sectionBuilder
                .modifyItems(
                    (i, f) => i.widget({ title: `Modified section ${f.index()}` }),
                    (items) => items.filter((i) => !i.isEmpty()),
                )
                .build();

            expect(sectionBefore).toMatchSnapshot("before");
            expect(sectionAfter).toMatchSnapshot("after");
        });

        it("should modify selected item only", () => {
            const contentOfTheColumnToModify = "Original item";
            const sectionBuilder = createEmptyDashboardLayoutSectionBuilder()
                .createItem(defaultItemXlSize)
                .createItem(defaultItemXlSize, (i) => i.widget(contentOfTheColumnToModify))
                .createItem(defaultItemXlSize);

            const sectionBefore = sectionBuilder.build();
            const sectionAfter = sectionBuilder
                .modifyItems(
                    (i) => i.widget("Modified item"),
                    (items) => items.find((i) => i.widgetEquals(contentOfTheColumnToModify)),
                )
                .build();

            expect(sectionBefore).toMatchSnapshot("before");
            expect(sectionAfter).toMatchSnapshot("after");
        });

        it("should not modify any item, when selection result is undefined", () => {
            const sectionBuilder = createEmptyDashboardLayoutSectionBuilder().createItem(defaultItemXlSize);

            const sectionBefore = sectionBuilder.build();
            const sectionAfter = sectionBuilder
                .modifyItems(
                    (i) => i.widget("That would never happen"),
                    (items) => items.find((i) => i.widgetIs("Non-existing item content")),
                )
                .build();

            expect(sectionBefore).toMatchSnapshot("before");
            expect(sectionAfter).toMatchSnapshot("after");
        });
    });
});
