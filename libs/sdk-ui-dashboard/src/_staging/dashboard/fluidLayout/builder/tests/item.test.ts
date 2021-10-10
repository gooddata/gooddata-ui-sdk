// (C) 2019-2021 GoodData Corporation
import {
    IDashboardLayout,
    IDashboardLayoutItem,
    IDashboardLayoutSection,
    IDashboardLayoutSizeByScreenSize,
} from "@gooddata/sdk-backend-spi";
import { ValueOrUpdateCallback } from "@gooddata/sdk-backend-base";
import {
    createValueOrUpdateCallbackTestCases,
    createEmptyDashboardLayoutItemBuilder,
    defaultItemXlSize,
} from "./utils";
import { DashboardLayoutBuilder } from "../layout";
import { DashboardLayoutSectionBuilder } from "../section";
import { DashboardLayoutItemBuilder } from "../item";

describe("DashboardLayoutItemBuilder", () => {
    describe("constructors", () => {
        describe(".for()", () => {
            it("should use the provided item", () => {
                const item: IDashboardLayoutItem<any> = {
                    type: "IDashboardLayoutItem",
                    widget: "Correct widget",
                    size: {
                        xl: defaultItemXlSize,
                    },
                };
                const section: IDashboardLayoutSection<any> = {
                    type: "IDashboardLayoutSection",
                    items: [item],
                };
                const layout: IDashboardLayout<any> = {
                    type: "IDashboardLayout",
                    sections: [section],
                };
                const layoutBuilder = DashboardLayoutBuilder.for(layout);
                const sectionBuilder = DashboardLayoutSectionBuilder.for(layoutBuilder, 0);
                const itemBuilder = DashboardLayoutItemBuilder.for(sectionBuilder, 0);

                expect(itemBuilder.build()).toBe(item);
            });

            it("should throw error, when the item is damaged", () => {
                const boom = () => {
                    const ytem: any = {
                        sizzle: {
                            xxxxxl: "Yo item is so fat that when it renders, it breaks your screen 🖥️🔨",
                        },
                    };
                    const zection: IDashboardLayoutSection<any> = {
                        type: "IDashboardLayoutSection",
                        items: [ytem],
                    };
                    const layoud: IDashboardLayout<any> = {
                        type: "IDashboardLayout",
                        sections: [zection],
                    };
                    const layoutBuilder = DashboardLayoutBuilder.for(layoud);
                    const sectionBuilder = DashboardLayoutSectionBuilder.for(layoutBuilder, 0);
                    DashboardLayoutItemBuilder.for(sectionBuilder, 0);
                };

                expect(boom).toThrowErrorMatchingSnapshot();
            });
        });
    });

    describe(".widget()", () => {
        const value = "Widget";
        const testCases = createValueOrUpdateCallbackTestCases(value);
        it.each(testCases)("should update content %s", (_, valueOrUpdateCallback) => {
            const item = createEmptyDashboardLayoutItemBuilder().widget(valueOrUpdateCallback).build();

            expect(item).toMatchSnapshot();
        });
    });

    describe(".size()", () => {
        const value: IDashboardLayoutSizeByScreenSize = {
            xl: { gridWidth: 6, heightAsRatio: 150 },
        };
        const testCases: Array<[string, ValueOrUpdateCallback<IDashboardLayoutSizeByScreenSize>]> = [
            ["by value", value],
            ["by callback", () => value],
        ];
        it.each(testCases)("should update size %s", (_, valueOrUpdateCallback) => {
            const item = createEmptyDashboardLayoutItemBuilder().size(valueOrUpdateCallback).build();

            expect(item).toMatchSnapshot();
        });
    });
});
