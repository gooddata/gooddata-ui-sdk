// (C) 2021-2025 GoodData Corporation

import { FluidLayoutCustomizer } from "../fluidLayoutCustomizer.js";
import { IDashboardLayout, IDashboardLayoutSection, IDashboardLayoutItem } from "@gooddata/sdk-model";
import { ExtendedDashboardWidget, ICustomWidget, newCustomWidget } from "../../../model/index.js";
import { DashboardCustomizationLogger } from "../customizationLogging.js";
import { createCustomizerMutationsContext, CustomizerMutationsContext } from "../types.js";
import { describe, it, expect, beforeEach } from "vitest";
import { EMPTY_MUTATIONS } from "./utils";

const EmptyLayout: IDashboardLayout<ExtendedDashboardWidget> = {
    type: "IDashboardLayout",
    sections: [],
};

const LayoutWithOneSection: IDashboardLayout<ExtendedDashboardWidget> = {
    type: "IDashboardLayout",
    sections: [
        {
            type: "IDashboardLayoutSection",
            items: [],
        },
    ],
};

const LayoutWithNestedSections: IDashboardLayout<ExtendedDashboardWidget> = {
    type: "IDashboardLayout",
    sections: [
        {
            type: "IDashboardLayoutSection",
            items: [
                createTestItem(newCustomWidget("1", "custom1")),
                createTestItem(newCustomWidget("2", "custom2")),
            ],
        },
        {
            type: "IDashboardLayoutSection",
            items: [
                createTestItem(newCustomWidget("3", "custom3")),
                {
                    type: "IDashboardLayoutItem",
                    size: {
                        xl: {
                            gridWidth: 12,
                        },
                    },
                    widget: {
                        type: "IDashboardLayout",
                        sections: [
                            {
                                type: "IDashboardLayoutSection",
                                items: [
                                    createTestItem(newCustomWidget("4", "custom4")),
                                    createTestItem(newCustomWidget("5", "custom5")),
                                ],
                            },
                            {
                                type: "IDashboardLayoutSection",
                                items: [
                                    createTestItem(newCustomWidget("6", "custom6")),
                                    createTestItem(newCustomWidget("7", "custom7")),
                                ],
                            },
                        ],
                    } as unknown as ICustomWidget,
                },
            ],
        },
    ],
};

function createTestItem(widget: ICustomWidget): IDashboardLayoutItem<ICustomWidget> {
    return {
        type: "IDashboardLayoutItem",
        size: {
            xl: {
                gridWidth: 12,
            },
        },
        widget,
    };
}

// note: the tests here are minimal; the fluid customizer defers all heavy lifting to layout builder which
// has its own battery of tests
describe("fluid layout customizer", () => {
    let Customizer: FluidLayoutCustomizer;
    let mutationContext: CustomizerMutationsContext;

    beforeEach(() => {
        mutationContext = createCustomizerMutationsContext();
        Customizer = new FluidLayoutCustomizer(new DashboardCustomizationLogger(), mutationContext);
    });

    it("should add new section with custom widgets", () => {
        const newSection: IDashboardLayoutSection<ICustomWidget> = {
            type: "IDashboardLayoutSection",
            items: [
                createTestItem(newCustomWidget("1", "custom1")),
                createTestItem(newCustomWidget("2", "custom1")),
            ],
        };

        Customizer.addSection(-1, newSection);

        const updatedEmptyLayout = Customizer.applyTransformations(EmptyLayout);
        expect(updatedEmptyLayout.sections[0]).toEqual(newSection);

        const updatedNonEmptyLayout = Customizer.applyTransformations(LayoutWithOneSection);
        expect(updatedNonEmptyLayout.sections[1]).toEqual(newSection);
        expect(mutationContext).toEqual({
            ...EMPTY_MUTATIONS,
            layouts: {
                "1": "inserted",
                "2": "inserted",
            },
        });
    });

    it("should add new section with one new item to layout with nested layout", () => {
        const newSection: IDashboardLayoutSection<ICustomWidget> = {
            type: "IDashboardLayoutSection",
            items: [createTestItem(newCustomWidget("8", "custom8"))],
        };

        Customizer.addSectionToPath(
            { parent: [{ sectionIndex: 1, itemIndex: 1 }], sectionIndex: 1 },
            newSection,
        );

        const updatedLayout = Customizer.applyTransformations(LayoutWithNestedSections);

        expect((updatedLayout.sections[1].items[1].widget as IDashboardLayout).sections?.[1]).toEqual(
            newSection,
        );
        expect(mutationContext).toEqual({
            ...EMPTY_MUTATIONS,
            layouts: {
                "8": "inserted",
            },
        });
    });

    it("should not add new section widget which is not nested layout", () => {
        const newSection: IDashboardLayoutSection<ICustomWidget> = {
            type: "IDashboardLayoutSection",
            items: [createTestItem(newCustomWidget("8", "custom8"))],
        };

        Customizer.addSectionToPath(
            { parent: [{ sectionIndex: 0, itemIndex: 0 }], sectionIndex: 1 },
            newSection,
        );

        let updatedLayout;
        expect(() => {
            updatedLayout = Customizer.applyTransformations(LayoutWithNestedSections);
        }).toThrowError('Nested layout at path [{"sectionIndex":0,"itemIndex":0}] does not exist.');

        expect(mutationContext).toEqual({
            ...EMPTY_MUTATIONS,
        });
    });

    it("should not add empty section", () => {
        const emptySection: IDashboardLayoutSection<ICustomWidget> = {
            type: "IDashboardLayoutSection",
            items: [],
        };

        Customizer.addSection(-1, emptySection);

        const updatedEmptyLayout = Customizer.applyTransformations(EmptyLayout);
        expect(updatedEmptyLayout.sections.length).toEqual(0);
        expect(mutationContext).toEqual({
            ...EMPTY_MUTATIONS,
        });
    });

    it("should not add section with item that has no widget", () => {
        const sectionWithBadItem: IDashboardLayoutSection<ICustomWidget> = {
            type: "IDashboardLayoutSection",
            items: [
                {
                    type: "IDashboardLayoutItem",
                    size: {
                        xl: {
                            gridWidth: 6,
                        },
                    },
                },
                createTestItem(newCustomWidget("1", "custom1")),
            ],
        };

        Customizer.addSection(-1, sectionWithBadItem);

        const updatedEmptyLayout = Customizer.applyTransformations(EmptyLayout);
        expect(updatedEmptyLayout.sections.length).toEqual(0);
        expect(mutationContext).toEqual({
            ...EMPTY_MUTATIONS,
        });
    });

    it("should add new item into an existing section", () => {
        const item = createTestItem(newCustomWidget("1", "custom1"));

        Customizer.addItem(0, -1, item);
        const updatedNonEmptyLayout = Customizer.applyTransformations(LayoutWithOneSection);

        expect(updatedNonEmptyLayout.sections[0].items).toEqual([item]);
        expect(mutationContext).toEqual({
            ...EMPTY_MUTATIONS,
            layouts: {
                "1": "inserted",
            },
        });
    });

    it("should add new item into an existing section in nested layout", () => {
        const item = createTestItem(newCustomWidget("8", "custom8"));

        Customizer.addItemToPath(
            [
                { sectionIndex: 1, itemIndex: 1 },
                { sectionIndex: 1, itemIndex: 0 },
            ],
            item,
        );
        const updatedNestedLayout = Customizer.applyTransformations(LayoutWithNestedSections);

        expect(
            (updatedNestedLayout.sections[1].items[1].widget as IDashboardLayout).sections?.[1].items[0],
        ).toEqual(item);

        expect(mutationContext).toEqual({
            ...EMPTY_MUTATIONS,
            layouts: {
                "8": "inserted",
            },
        });
    });

    it("should not add item without widget", () => {
        Customizer.addItem(0, -1, {
            type: "IDashboardLayoutItem",
            size: {
                xl: {
                    gridWidth: 6,
                },
            },
        });

        const updatedNonEmptyLayout = Customizer.applyTransformations(LayoutWithOneSection);
        expect(updatedNonEmptyLayout.sections[0]).toEqual(LayoutWithOneSection.sections[0]);
        expect(mutationContext).toEqual({
            ...EMPTY_MUTATIONS,
        });
    });

    it("should first add new items then new sections", () => {
        const newSection: IDashboardLayoutSection<ICustomWidget> = {
            type: "IDashboardLayoutSection",
            items: [createTestItem(newCustomWidget("1", "custom1"))],
        };
        const newItem = createTestItem(newCustomWidget("2", "custom1"));

        Customizer.addSection(0, newSection);
        Customizer.addItem(0, -1, newItem);

        const updatedNonEmptyLayout = Customizer.applyTransformations(LayoutWithOneSection);

        expect(updatedNonEmptyLayout.sections[0]).toEqual(newSection);
        expect(updatedNonEmptyLayout.sections[1].items).toEqual([newItem]);

        expect(mutationContext).toEqual({
            ...EMPTY_MUTATIONS,
            layouts: {
                "1": "inserted",
                "2": "inserted",
            },
        });
    });
});
