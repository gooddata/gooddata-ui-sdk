// (C) 2025-2026 GoodData Corporation

import { type ComponentProps, type ReactNode, useState } from "react";

import { act, fireEvent, render } from "@testing-library/react";
import { IntlProvider, createIntl, createIntlCache } from "react-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type ILegendModel } from "../../../types/legend/model.js";
import { type LegendMessageFormatter } from "../legendMessages.js";
import { MultiLayerLegendPanel } from "../MultiLayerLegendPanel.js";

const intlMessages: Record<string, string> = {
    "geochart.legend.colorScale.label": "Color scale from {min} to {max}",
    "geochart.legend.layer.hidden": "Map layer {name} hidden",
    "geochart.legend.layer.shown": "Map layer {name} shown",
    "geochart.legend.item.hidden": "{name} hidden",
    "geochart.legend.item.shown": "{name} shown",
};

function IntlWrapper({ children }: { children: ReactNode }) {
    return (
        <IntlProvider locale="en" messages={intlMessages}>
            {children}
        </IntlProvider>
    );
}

const testIntl = createIntl({ locale: "en", messages: intlMessages }, createIntlCache());
const formatLegendMessage: LegendMessageFormatter = (id, values = {}) =>
    testIntl.formatMessage({ id }, values);

function A11yEnabledLegendPanel(props: ComponentProps<typeof MultiLayerLegendPanel>) {
    return (
        <MultiLayerLegendPanel
            enableGeoChartA11yImprovements
            {...props}
            formatMessage={props.formatMessage ?? formatLegendMessage}
        />
    );
}

function StatefulA11yEnabledLegendPanel(
    props: Omit<ComponentProps<typeof MultiLayerLegendPanel>, "hiddenLayers">,
) {
    const [hiddenLayers, setHiddenLayers] = useState<Set<string>>(new Set());

    return (
        <A11yEnabledLegendPanel
            {...props}
            hiddenLayers={hiddenLayers}
            onLayerVisibilityChange={(layerId) => {
                setHiddenLayers((prev) => {
                    const next = new Set(prev);
                    if (next.has(layerId)) {
                        next.delete(layerId);
                    } else {
                        next.add(layerId);
                    }
                    return next;
                });
                props.onLayerVisibilityChange?.(layerId);
            }}
        />
    );
}

const SELECTORS = {
    colorList: ".gd-geo-multi-layer-legend__color-list",
    sectionContent: ".gd-geo-multi-layer-legend__section-content",
    sectionHeaderButton: ".gd-geo-multi-layer-legend__section-header-btn",
} as const;

function queryRequiredElement<T extends Element>(container: ParentNode, selector: string): T {
    const element = container.querySelector(selector);
    if (!element) {
        throw new Error(`Expected element not found for selector: ${selector}`);
    }
    return element as T;
}

function getColorList(container: ParentNode): HTMLDivElement {
    return queryRequiredElement<HTMLDivElement>(container, SELECTORS.colorList);
}

function getSectionContent(section: ParentNode): HTMLDivElement {
    return queryRequiredElement<HTMLDivElement>(section, SELECTORS.sectionContent);
}

function getSectionHeaderButton(section: ParentNode): HTMLButtonElement {
    return queryRequiredElement<HTMLButtonElement>(section, SELECTORS.sectionHeaderButton);
}

const mockModel: ILegendModel = {
    title: "Legend",
    sections: [
        {
            layerId: "layer-1",
            layerTitle: "Layer 1",
            layerKind: "pushpin",
            groups: [],
        },
    ],
};

describe("MultiLayerLegendPanel", () => {
    it("renders explicit corner positions literally", () => {
        const { getByTestId } = render(<A11yEnabledLegendPanel model={mockModel} position="bottom-left" />, {
            wrapper: IntlWrapper,
        });

        expect(getByTestId("gd-geo-multi-layer-legend")).toHaveClass(
            "gd-geo-multi-layer-legend--bottom-left",
        );
    });

    it("maps auto position to top-right overlay placement", () => {
        const { getByTestId } = render(<A11yEnabledLegendPanel model={mockModel} position="auto" />, {
            wrapper: IntlWrapper,
        });

        expect(getByTestId("gd-geo-multi-layer-legend")).toHaveClass("gd-geo-multi-layer-legend--top-right");
    });

    it("does not render when disabled", () => {
        const { queryByTestId } = render(<A11yEnabledLegendPanel enabled={false} model={mockModel} />, {
            wrapper: IntlWrapper,
        });

        expect(queryByTestId("gd-geo-multi-layer-legend")).toBeNull();
    });

    it("renders legend sections in reverse order (first layer on top)", () => {
        const model: ILegendModel = {
            title: "Legend",
            sections: [
                { layerId: "layer-1", layerTitle: "Layer 1", layerKind: "pushpin", groups: [] },
                { layerId: "layer-2", layerTitle: "Layer 2", layerKind: "pushpin", groups: [] },
                { layerId: "layer-3", layerTitle: "Layer 3", layerKind: "pushpin", groups: [] },
            ],
        };

        const { getByTestId } = render(<A11yEnabledLegendPanel model={model} />, {
            wrapper: IntlWrapper,
        });

        const legend = getByTestId("gd-geo-multi-layer-legend");
        const sectionNodes = Array.from(legend.querySelectorAll('[data-testid^="gd-geo-legend-section-"]'));

        expect(sectionNodes).toHaveLength(3);
        expect(sectionNodes[0]).toHaveAttribute("data-testid", "gd-geo-legend-section-layer-3");
        expect(sectionNodes[1]).toHaveAttribute("data-testid", "gd-geo-legend-section-layer-2");
        expect(sectionNodes[2]).toHaveAttribute("data-testid", "gd-geo-legend-section-layer-1");
    });

    it("does not expose clickable legend items when the layer is hidden", () => {
        const modelWithColorItems: ILegendModel = {
            title: "Legend",
            sections: [
                {
                    layerId: "layer-1",
                    layerTitle: "Layer 1",
                    layerKind: "pushpin",
                    groups: [
                        {
                            kind: "color",
                            title: "Color",
                            items: [
                                {
                                    type: "colorCategory",
                                    label: "A",
                                    color: "#ff0000",
                                    uri: "u1",
                                    isVisible: true,
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const onItemClick = () => undefined;

        const { getByTestId } = render(
            <A11yEnabledLegendPanel
                model={modelWithColorItems}
                hiddenLayers={new Set(["layer-1"])}
                onItemClick={onItemClick}
            />,
            { wrapper: IntlWrapper },
        );

        const item = getByTestId("gd-geo-legend-color-item-u1");
        // When the layer is hidden, the section strips onItemClick so the list
        // downgrades from listbox/option to list/listitem semantics.
        expect(item).toHaveAttribute("role", "listitem");
        expect(item).not.toHaveAttribute("aria-selected");
        expect(item).not.toHaveAttribute("tabindex");
    });

    it("shows layer toggle for a single section when explicitly requested", () => {
        const singleSectionModel: ILegendModel = {
            title: "Legend",
            sections: [
                {
                    layerId: "layer-1",
                    layerTitle: "Layer 1",
                    layerKind: "pushpin",
                    isAttributeOnlySection: true,
                    groups: [],
                },
            ],
        };

        const { getByRole } = render(<A11yEnabledLegendPanel model={singleSectionModel} />, {
            wrapper: IntlWrapper,
        });

        expect(getByRole("switch", { name: "Toggle Layer 1 visibility" })).toBeInTheDocument();
    });

    it("keeps attribute-only color group non-interactive even when onItemClick is provided", () => {
        const modelWithNonInteractiveGroup: ILegendModel = {
            title: "Legend",
            sections: [
                {
                    layerId: "layer-1",
                    layerTitle: "Layer 1",
                    layerKind: "area",
                    groups: [
                        {
                            kind: "color",
                            title: "",
                            isInteractive: false,
                            items: [
                                {
                                    type: "colorCategory",
                                    label: "Location",
                                    color: "#14b2e2",
                                    uri: "__attribute_only__:layer-1",
                                    isVisible: true,
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const onItemClick = vi.fn();
        const { container, getByTestId } = render(
            <A11yEnabledLegendPanel model={modelWithNonInteractiveGroup} onItemClick={onItemClick} />,
            { wrapper: IntlWrapper },
        );

        const colorList = getColorList(container);
        expect(colorList).toHaveAttribute("role", "list");
        expect(colorList).not.toHaveAttribute("tabindex");

        const item = getByTestId("gd-geo-legend-color-item-__attribute_only__:layer-1");
        expect(item).toHaveAttribute("role", "listitem");

        fireEvent.click(item);
        expect(onItemClick).not.toHaveBeenCalled();
    });

    describe("attribute-only section auto-hide (mirrors GeoChartLegendOverlay logic)", () => {
        const attributeOnlyModel: ILegendModel = {
            title: "Legend",
            sections: [
                {
                    layerId: "layer-1",
                    layerTitle: "Layer 1",
                    layerKind: "area",
                    isAttributeOnlySection: true,
                    groups: [
                        {
                            kind: "color",
                            title: "",
                            isInteractive: false,
                            items: [
                                {
                                    type: "colorCategory",
                                    label: "Area",
                                    color: "#14b2e2",
                                    uri: "__attribute_only__:layer-1",
                                    isVisible: true,
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        it("does not render when enabled=false (attribute-only auto-hidden by overlay)", () => {
            const { queryByTestId } = render(
                <A11yEnabledLegendPanel enabled={false} model={attributeOnlyModel} />,
                { wrapper: IntlWrapper },
            );
            expect(queryByTestId("gd-geo-multi-layer-legend")).toBeNull();
        });

        it("renders when enabled=true (explicit legend.enabled overrides auto-hide)", () => {
            const { queryByTestId } = render(<A11yEnabledLegendPanel enabled model={attributeOnlyModel} />, {
                wrapper: IntlWrapper,
            });
            expect(queryByTestId("gd-geo-multi-layer-legend")).not.toBeNull();
        });
    });

    it("renders without IntlProvider when a11y improvements are disabled", () => {
        const colorScaleModel: ILegendModel = {
            title: "Legend",
            sections: [
                {
                    layerId: "layer-1",
                    layerTitle: "Layer 1",
                    layerKind: "area",
                    groups: [
                        {
                            kind: "colorScale",
                            title: "Intensity",
                            items: [
                                {
                                    type: "colorScale",
                                    minLabel: "0",
                                    maxLabel: "100",
                                    minColor: "#f0f0f0",
                                    maxColor: "#000000",
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const { container } = render(<MultiLayerLegendPanel model={colorScaleModel} />);
        const bar = container.querySelector(".gd-geo-multi-layer-legend__color-scale-bar");

        expect(bar).not.toBeNull();
        expect(bar).not.toHaveAttribute("aria-label");
    });

    describe("section header accessibility (C1)", () => {
        it("renders the expand/collapse control as a native button", () => {
            const { getByTestId } = render(<A11yEnabledLegendPanel model={mockModel} />, {
                wrapper: IntlWrapper,
            });

            const section = getByTestId("gd-geo-legend-section-layer-1");
            const btn = section.querySelector(SELECTORS.sectionHeaderButton);

            expect(btn).not.toBeNull();
            expect(btn!.tagName).toBe("BUTTON");
            expect(btn).toHaveAttribute("type", "button");
        });

        it("does not have explicit role or tabindex on the button", () => {
            const { getByTestId } = render(<A11yEnabledLegendPanel model={mockModel} />, {
                wrapper: IntlWrapper,
            });

            const section = getByTestId("gd-geo-legend-section-layer-1");
            const btn = getSectionHeaderButton(section);

            expect(btn).not.toHaveAttribute("role");
            expect(btn).not.toHaveAttribute("tabindex");
        });

        it("has aria-expanded and aria-controls linking to content", () => {
            const { getByTestId } = render(<A11yEnabledLegendPanel model={mockModel} />, {
                wrapper: IntlWrapper,
            });

            const section = getByTestId("gd-geo-legend-section-layer-1");
            const btn = getSectionHeaderButton(section);

            expect(btn).toHaveAttribute("aria-expanded", "true");
            const controlsId = btn.getAttribute("aria-controls")!;
            expect(controlsId).toBeTruthy();
            expect(section.querySelector(`#${CSS.escape(controlsId)}`)).not.toBeNull();
        });

        it("calls onExpandedChange when header button is clicked", () => {
            const model: ILegendModel = {
                title: "Legend",
                sections: [
                    { layerId: "layer-1", layerTitle: "Layer 1", layerKind: "pushpin", groups: [] },
                    { layerId: "layer-2", layerTitle: "Layer 2", layerKind: "pushpin", groups: [] },
                ],
            };

            const { getByTestId } = render(<A11yEnabledLegendPanel model={model} />, {
                wrapper: IntlWrapper,
            });

            const section = getByTestId("gd-geo-legend-section-layer-1");
            const btn = getSectionHeaderButton(section);

            fireEvent.click(btn);

            // After click, aria-expanded should toggle to false (was true by default)
            expect(btn).toHaveAttribute("aria-expanded", "false");
        });
    });

    describe("color list composite widget (B1)", () => {
        const colorModel: ILegendModel = {
            title: "Legend",
            sections: [
                {
                    layerId: "layer-1",
                    layerTitle: "Layer 1",
                    layerKind: "pushpin",
                    groups: [
                        {
                            kind: "color",
                            title: "Category",
                            items: [
                                {
                                    type: "colorCategory",
                                    label: "Alpha",
                                    color: "#ff0000",
                                    uri: "u1",
                                    isVisible: true,
                                },
                                {
                                    type: "colorCategory",
                                    label: "Beta",
                                    color: "#00ff00",
                                    uri: "u2",
                                    isVisible: true,
                                },
                                {
                                    type: "colorCategory",
                                    label: "Gamma",
                                    color: "#0000ff",
                                    uri: "u3",
                                    isVisible: false,
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        it("renders one focusable composite container for interactive color list", () => {
            const onItemClick = vi.fn();
            const { container } = render(
                <A11yEnabledLegendPanel model={colorModel} onItemClick={onItemClick} />,
                { wrapper: IntlWrapper },
            );

            const colorList = getColorList(container);
            expect(colorList).toHaveAttribute("tabindex", "0");
            expect(colorList).toHaveAttribute("role", "listbox");

            // Individual items should NOT have tabindex
            const items = container.querySelectorAll('[data-testid^="gd-geo-legend-color-item-"]');
            items.forEach((item) => {
                expect(item).not.toHaveAttribute("tabindex");
            });
        });

        it("has aria-activedescendant pointing to first item by default", () => {
            const onItemClick = vi.fn();
            const { container } = render(
                <A11yEnabledLegendPanel model={colorModel} onItemClick={onItemClick} />,
                { wrapper: IntlWrapper },
            );

            const colorList = getColorList(container);
            const activeDescendant = colorList.getAttribute("aria-activedescendant")!;
            expect(activeDescendant).toBeTruthy();

            const activeItem = container.querySelector(`#${CSS.escape(activeDescendant)}`)!;
            expect(activeItem).toHaveAttribute("aria-label", "Alpha");
        });

        it("updates aria-activedescendant on ArrowDown navigation", () => {
            const onItemClick = vi.fn();
            const { container } = render(
                <A11yEnabledLegendPanel model={colorModel} onItemClick={onItemClick} />,
                { wrapper: IntlWrapper },
            );

            const colorList = getColorList(container);

            fireEvent.keyDown(colorList, { code: "ArrowDown" });
            const activeId = colorList.getAttribute("aria-activedescendant")!;
            const activeItem = container.querySelector(`#${CSS.escape(activeId)}`)!;
            expect(activeItem).toHaveAttribute("aria-label", "Beta");
        });

        it("scrolls active item into view during keyboard navigation", () => {
            const onItemClick = vi.fn();
            const { container, getByTestId } = render(
                <A11yEnabledLegendPanel model={colorModel} onItemClick={onItemClick} />,
                { wrapper: IntlWrapper },
            );

            const colorList = getColorList(container);
            colorList.focus();

            const betaItem = getByTestId("gd-geo-legend-color-item-u2");
            const scrollIntoViewSpy = vi.fn();
            Object.defineProperty(betaItem, "scrollIntoView", {
                value: scrollIntoViewSpy,
                writable: true,
            });

            fireEvent.keyDown(colorList, { code: "ArrowDown" });

            expect(scrollIntoViewSpy).toHaveBeenCalledWith({ block: "nearest" });
        });

        it("scrolls active item into view when focus returns to the list", () => {
            const onItemClick = vi.fn();
            const { container, getByTestId } = render(
                <A11yEnabledLegendPanel model={colorModel} onItemClick={onItemClick} />,
                { wrapper: IntlWrapper },
            );

            const colorList = getColorList(container);
            colorList.focus();

            // Move active item to "Gamma"
            fireEvent.keyDown(colorList, { code: "End" });

            const gammaItem = getByTestId("gd-geo-legend-color-item-u3");
            const scrollIntoViewSpy = vi.fn();
            Object.defineProperty(gammaItem, "scrollIntoView", {
                value: scrollIntoViewSpy,
                writable: true,
            });

            // Simulate leaving and returning focus to the list.
            fireEvent.blur(colorList);
            fireEvent.focus(colorList);

            expect(scrollIntoViewSpy).toHaveBeenCalledWith({ block: "nearest" });
        });

        it("updates aria-activedescendant on ArrowUp navigation", () => {
            const onItemClick = vi.fn();
            const { container } = render(
                <A11yEnabledLegendPanel model={colorModel} onItemClick={onItemClick} />,
                { wrapper: IntlWrapper },
            );

            const colorList = getColorList(container);

            // Move down first, then up
            fireEvent.keyDown(colorList, { code: "ArrowDown" });
            fireEvent.keyDown(colorList, { code: "ArrowUp" });
            const activeId = colorList.getAttribute("aria-activedescendant")!;
            const activeItem = container.querySelector(`#${CSS.escape(activeId)}`)!;
            expect(activeItem).toHaveAttribute("aria-label", "Alpha");
        });

        it("jumps to last item on End key", () => {
            const onItemClick = vi.fn();
            const { container } = render(
                <A11yEnabledLegendPanel model={colorModel} onItemClick={onItemClick} />,
                { wrapper: IntlWrapper },
            );

            const colorList = getColorList(container);

            fireEvent.keyDown(colorList, { code: "End" });
            const activeId = colorList.getAttribute("aria-activedescendant")!;
            const activeItem = container.querySelector(`#${CSS.escape(activeId)}`)!;
            expect(activeItem).toHaveAttribute("aria-label", "Gamma");
        });

        it("jumps to first item on Home key", () => {
            const onItemClick = vi.fn();
            const { container } = render(
                <A11yEnabledLegendPanel model={colorModel} onItemClick={onItemClick} />,
                { wrapper: IntlWrapper },
            );

            const colorList = getColorList(container);

            // Move to last, then Home
            fireEvent.keyDown(colorList, { code: "End" });
            fireEvent.keyDown(colorList, { code: "Home" });
            const activeId = colorList.getAttribute("aria-activedescendant")!;
            const activeItem = container.querySelector(`#${CSS.escape(activeId)}`)!;
            expect(activeItem).toHaveAttribute("aria-label", "Alpha");
        });

        it("toggles active item on Enter", () => {
            const onItemClick = vi.fn();
            const { container } = render(
                <A11yEnabledLegendPanel model={colorModel} onItemClick={onItemClick} />,
                { wrapper: IntlWrapper },
            );

            const colorList = getColorList(container);

            // Move to second item, then press Enter
            fireEvent.keyDown(colorList, { code: "ArrowDown" });
            fireEvent.keyDown(colorList, { code: "Enter" });

            expect(onItemClick).toHaveBeenCalledWith("layer-1", "u2");
        });

        it("toggles active item on Space", () => {
            const onItemClick = vi.fn();
            const { container } = render(
                <A11yEnabledLegendPanel model={colorModel} onItemClick={onItemClick} />,
                { wrapper: IntlWrapper },
            );

            const colorList = getColorList(container);

            fireEvent.keyDown(colorList, { code: "Space" });

            expect(onItemClick).toHaveBeenCalledWith("layer-1", "u1");
        });

        it("uses simple item aria-label without color hex or prefix", () => {
            const onItemClick = vi.fn();
            const { getByTestId } = render(
                <A11yEnabledLegendPanel model={colorModel} onItemClick={onItemClick} />,
                { wrapper: IntlWrapper },
            );

            const item = getByTestId("gd-geo-legend-color-item-u1");
            const label = item.getAttribute("aria-label")!;
            expect(label).toBe("Alpha");
            expect(label).not.toContain("#");
            expect(label).not.toContain("Category:");
            expect(label).not.toContain("Color:");
        });

        it("renders color list with role=list and aria-label", () => {
            const onItemClick = vi.fn();
            const { container } = render(
                <A11yEnabledLegendPanel model={colorModel} onItemClick={onItemClick} />,
                { wrapper: IntlWrapper },
            );

            const colorList = getColorList(container);
            expect(colorList).toHaveAttribute("role", "listbox");
            expect(colorList).toHaveAttribute("aria-label", "Category");
        });

        it("renders each item with role=option", () => {
            const onItemClick = vi.fn();
            const { container } = render(
                <A11yEnabledLegendPanel model={colorModel} onItemClick={onItemClick} />,
                { wrapper: IntlWrapper },
            );

            const items = container.querySelectorAll('[data-testid^="gd-geo-legend-color-item-"]');
            expect(items).toHaveLength(3);
            items.forEach((item) => {
                expect(item).toHaveAttribute("role", "option");
            });
        });

        it("does not make color list focusable when non-interactive", () => {
            const { container } = render(<A11yEnabledLegendPanel model={colorModel} />, {
                wrapper: IntlWrapper,
            });

            const colorList = getColorList(container);
            expect(colorList).toHaveAttribute("role", "list");
            expect(colorList).not.toHaveAttribute("tabindex");
            expect(colorList).not.toHaveAttribute("aria-activedescendant");
        });

        it("wraps ArrowDown from last item to first", () => {
            const onItemClick = vi.fn();
            const { container } = render(
                <A11yEnabledLegendPanel model={colorModel} onItemClick={onItemClick} />,
                { wrapper: IntlWrapper },
            );

            const colorList = getColorList(container);

            // Go to last item, then ArrowDown should wrap to first
            fireEvent.keyDown(colorList, { code: "End" });
            fireEvent.keyDown(colorList, { code: "ArrowDown" });
            const activeId = colorList.getAttribute("aria-activedescendant")!;
            const activeItem = container.querySelector(`#${CSS.escape(activeId)}`)!;
            expect(activeItem).toHaveAttribute("aria-label", "Alpha");
        });
    });

    describe("group title semantics (C3)", () => {
        it("links color group to its title with role=group and aria-labelledby", () => {
            const model: ILegendModel = {
                title: "Legend",
                sections: [
                    {
                        layerId: "layer-1",
                        layerTitle: "Layer 1",
                        layerKind: "pushpin",
                        groups: [
                            {
                                kind: "color",
                                title: "Customer country",
                                items: [
                                    {
                                        type: "colorCategory",
                                        label: "US",
                                        color: "#ff0000",
                                        uri: "u1",
                                        isVisible: true,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };

            const { container } = render(<A11yEnabledLegendPanel model={model} />, {
                wrapper: IntlWrapper,
            });

            const group = container.querySelector(".gd-geo-multi-layer-legend__group--color")!;
            expect(group).toHaveAttribute("role", "group");

            const labelledBy = group.getAttribute("aria-labelledby")!;
            expect(labelledBy).toBeTruthy();
            const titleEl = container.querySelector(`#${CSS.escape(labelledBy)}`)!;
            expect(titleEl.textContent).toBe("Customer country");
        });

        it("links size group to its title with role=group and aria-labelledby", () => {
            const model: ILegendModel = {
                title: "Legend",
                sections: [
                    {
                        layerId: "layer-1",
                        layerTitle: "Layer 1",
                        layerKind: "pushpin",
                        groups: [
                            {
                                kind: "size",
                                title: "Order quantity",
                                items: [
                                    { type: "sizeAnchor", label: "10", sizePx: 8, value: 10 },
                                    { type: "sizeAnchor", label: "100", sizePx: 24, value: 100 },
                                ],
                            },
                        ],
                    },
                ],
            };

            const { container } = render(<A11yEnabledLegendPanel model={model} />, {
                wrapper: IntlWrapper,
            });

            const group = container.querySelector(".gd-geo-multi-layer-legend__group--size")!;
            expect(group).toHaveAttribute("role", "group");

            const labelledBy = group.getAttribute("aria-labelledby")!;
            expect(labelledBy).toBeTruthy();
            const titleEl = container.querySelector(`#${CSS.escape(labelledBy)}`)!;
            expect(titleEl.textContent).toBe("Order quantity");
        });

        it("links color scale group to its title with role=group and aria-labelledby", () => {
            const model: ILegendModel = {
                title: "Legend",
                sections: [
                    {
                        layerId: "layer-1",
                        layerTitle: "Layer 1",
                        layerKind: "area",
                        groups: [
                            {
                                kind: "colorScale",
                                title: "Revenue",
                                items: [
                                    {
                                        type: "colorScale",
                                        minLabel: "7",
                                        maxLabel: "6,684",
                                        minColor: "#ffffff",
                                        maxColor: "#000000",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };

            const { container } = render(<A11yEnabledLegendPanel model={model} />, { wrapper: IntlWrapper });

            const group = container.querySelector(".gd-geo-multi-layer-legend__group--color-scale")!;
            expect(group).toHaveAttribute("role", "group");

            const labelledBy = group.getAttribute("aria-labelledby")!;
            expect(labelledBy).toBeTruthy();
            const titleEl = container.querySelector(`#${CSS.escape(labelledBy)}`)!;
            expect(titleEl.textContent).toBe("Revenue");
        });
    });

    describe("size list semantics (C2)", () => {
        const sizeModel: ILegendModel = {
            title: "Legend",
            sections: [
                {
                    layerId: "layer-1",
                    layerTitle: "Layer 1",
                    layerKind: "pushpin",
                    groups: [
                        {
                            kind: "size",
                            title: "Order quantity",
                            items: [
                                { type: "sizeAnchor", label: "10", sizePx: 8, value: 10 },
                                { type: "sizeAnchor", label: "50", sizePx: 16, value: 50 },
                                { type: "sizeAnchor", label: "100", sizePx: 24, value: 100 },
                            ],
                        },
                    ],
                },
            ],
        };

        it("renders size list with role=list and aria-label", () => {
            const { container } = render(<A11yEnabledLegendPanel model={sizeModel} />, {
                wrapper: IntlWrapper,
            });

            const sizeList = container.querySelector(".gd-geo-multi-layer-legend__size-list")!;
            expect(sizeList).toHaveAttribute("role", "list");
            expect(sizeList).toHaveAttribute("aria-label", "Order quantity");
        });

        it("renders each size anchor with a listitem wrapper", () => {
            const { container } = render(<A11yEnabledLegendPanel model={sizeModel} />, {
                wrapper: IntlWrapper,
            });

            const listitems = container.querySelectorAll(".gd-geo-multi-layer-legend__size-anchor-wrapper");
            expect(listitems).toHaveLength(3);
            listitems.forEach((wrapper) => {
                expect(wrapper).toHaveAttribute("role", "listitem");
            });
        });

        it("makes the whole size group keyboard-focusable when section content is accessible", () => {
            const { container } = render(<A11yEnabledLegendPanel model={sizeModel} />, {
                wrapper: IntlWrapper,
            });

            const sizeGroup = container.querySelector(".gd-geo-multi-layer-legend__group--size")!;
            expect(sizeGroup).toHaveAttribute("tabindex", "0");
        });

        it("does not keep size group keyboard-focusable when layer is hidden", () => {
            const { container } = render(
                <A11yEnabledLegendPanel model={sizeModel} hiddenLayers={new Set(["layer-1"])} />,
                {
                    wrapper: IntlWrapper,
                },
            );

            const sizeGroup = container.querySelector(".gd-geo-multi-layer-legend__group--size")!;
            expect(sizeGroup).not.toHaveAttribute("tabindex");
        });
    });

    describe("color scale text alternative (C5)", () => {
        const colorScaleModel: ILegendModel = {
            title: "Legend",
            sections: [
                {
                    layerId: "layer-1",
                    layerTitle: "Layer 1",
                    layerKind: "area",
                    groups: [
                        {
                            kind: "colorScale",
                            title: "Revenue",
                            items: [
                                {
                                    type: "colorScale",
                                    minLabel: "7",
                                    maxLabel: "6,684",
                                    minColor: "#ffffff",
                                    maxColor: "#000000",
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        it("renders gradient bar with role=img and localized aria-label", () => {
            const { container } = render(<A11yEnabledLegendPanel model={colorScaleModel} />, {
                wrapper: IntlWrapper,
            });

            const bar = container.querySelector(".gd-geo-multi-layer-legend__color-scale-bar")!;
            const colorScaleGroup = container.querySelector(
                ".gd-geo-multi-layer-legend__group--color-scale",
            )!;
            expect(bar).toHaveAttribute("role", "img");
            expect(bar).toHaveAttribute("aria-label", "Color scale from 7 to 6,684");
            expect(colorScaleGroup).toHaveAttribute("tabindex", "0");
        });

        it("does not keep color scale focusable when layer is hidden", () => {
            const { container } = render(
                <A11yEnabledLegendPanel model={colorScaleModel} hiddenLayers={new Set(["layer-1"])} />,
                {
                    wrapper: IntlWrapper,
                },
            );

            const colorScaleGroup = container.querySelector(
                ".gd-geo-multi-layer-legend__group--color-scale",
            )!;
            expect(colorScaleGroup).not.toHaveAttribute("tabindex");
        });
    });

    describe("section content hidden semantics (C6)", () => {
        it("is not aria-hidden when section is expanded and visible", () => {
            const { getByTestId } = render(<A11yEnabledLegendPanel model={mockModel} />, {
                wrapper: IntlWrapper,
            });

            const section = getByTestId("gd-geo-legend-section-layer-1");
            const content = getSectionContent(section);

            expect(content).not.toHaveAttribute("aria-hidden");
        });

        it("is aria-hidden when section is collapsed", () => {
            const { getByTestId } = render(<A11yEnabledLegendPanel model={mockModel} />, {
                wrapper: IntlWrapper,
            });

            const section = getByTestId("gd-geo-legend-section-layer-1");
            const btn = getSectionHeaderButton(section);

            // Collapse the section
            fireEvent.click(btn);

            const content = getSectionContent(section);
            expect(content).toHaveAttribute("aria-hidden", "true");
        });

        it("is aria-hidden when layer is hidden", () => {
            const { getByTestId } = render(
                <A11yEnabledLegendPanel model={mockModel} hiddenLayers={new Set(["layer-1"])} />,
                { wrapper: IntlWrapper },
            );

            const section = getByTestId("gd-geo-legend-section-layer-1");
            const content = getSectionContent(section);

            expect(content).toHaveAttribute("aria-hidden", "true");
        });

        it("does not have aria-disabled attribute (regression guard)", () => {
            const { getByTestId } = render(
                <A11yEnabledLegendPanel model={mockModel} hiddenLayers={new Set(["layer-1"])} />,
                { wrapper: IntlWrapper },
            );

            const section = getByTestId("gd-geo-legend-section-layer-1");
            const content = getSectionContent(section);

            expect(content).not.toHaveAttribute("aria-disabled");
        });
    });

    describe("live region announcements (D1)", () => {
        // Mock requestAnimationFrame so the clear-then-set pattern resolves synchronously
        let rafCallbacks: Array<{ id: number; cb: () => void }> = [];
        let nextRafId = 1;

        function flushRAF() {
            const cbs = rafCallbacks.map((entry) => entry.cb);
            rafCallbacks = [];
            cbs.forEach((cb) => act(() => cb()));
        }

        beforeEach(() => {
            rafCallbacks = [];
            nextRafId = 1;
            vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
                const id = nextRafId++;
                rafCallbacks.push({ id, cb: cb as () => void });
                return id;
            });
            vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
                rafCallbacks = rafCallbacks.filter((entry) => entry.id !== id);
            });
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("renders live region with correct ARIA attributes", () => {
            const { getByTestId } = render(<A11yEnabledLegendPanel model={mockModel} />, {
                wrapper: IntlWrapper,
            });

            const liveRegion = getByTestId("gd-geo-legend-live-region");
            expect(liveRegion).toHaveAttribute("aria-live", "polite");
            expect(liveRegion).toHaveAttribute("aria-atomic", "true");
            expect(liveRegion).toHaveClass("sr-only");
            expect(liveRegion.textContent).toBe("");
        });

        it("announces 'Map layer {name} hidden' when hiding a layer", () => {
            const twoLayerModel: ILegendModel = {
                title: "Legend",
                sections: [
                    { layerId: "layer-1", layerTitle: "Cities", layerKind: "pushpin", groups: [] },
                    { layerId: "layer-2", layerTitle: "Regions", layerKind: "area", groups: [] },
                ],
            };

            const onLayerVisibilityChange = vi.fn();
            const { getByTestId, getByRole } = render(
                <A11yEnabledLegendPanel
                    model={twoLayerModel}
                    onLayerVisibilityChange={onLayerVisibilityChange}
                />,
                { wrapper: IntlWrapper },
            );

            // Click the visibility toggle for "Cities" — currently visible, will be hidden
            const toggle = getByRole("switch", { name: "Toggle Cities visibility" });
            fireEvent.click(toggle);
            flushRAF();

            const liveRegion = getByTestId("gd-geo-legend-live-region");
            expect(liveRegion.textContent).toBe("Map layer Cities hidden");
            expect(onLayerVisibilityChange).toHaveBeenCalledWith("layer-1");
        });

        it("announces 'Map layer {name} shown' when showing a layer", () => {
            const twoLayerModel: ILegendModel = {
                title: "Legend",
                sections: [
                    { layerId: "layer-1", layerTitle: "Cities", layerKind: "pushpin", groups: [] },
                    { layerId: "layer-2", layerTitle: "Regions", layerKind: "area", groups: [] },
                ],
            };

            const onLayerVisibilityChange = vi.fn();
            const { getByTestId, getByRole } = render(
                <A11yEnabledLegendPanel
                    model={twoLayerModel}
                    hiddenLayers={new Set(["layer-1"])}
                    onLayerVisibilityChange={onLayerVisibilityChange}
                />,
                { wrapper: IntlWrapper },
            );

            // Click the visibility toggle for "Cities" — currently hidden, will be shown
            const toggle = getByRole("switch", { name: "Toggle Cities visibility" });
            fireEvent.click(toggle);
            flushRAF();

            const liveRegion = getByTestId("gd-geo-legend-live-region");
            expect(liveRegion.textContent).toBe("Map layer Cities shown");
        });

        it("announces '{name} hidden' when hiding a legend item", () => {
            const colorModel: ILegendModel = {
                title: "Legend",
                sections: [
                    {
                        layerId: "layer-1",
                        layerTitle: "Layer 1",
                        layerKind: "pushpin",
                        groups: [
                            {
                                kind: "color",
                                title: "Category",
                                items: [
                                    {
                                        type: "colorCategory",
                                        label: "Alpha",
                                        color: "#ff0000",
                                        uri: "u1",
                                        isVisible: true,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };

            const onItemClick = vi.fn();
            const { getByTestId } = render(
                <A11yEnabledLegendPanel model={colorModel} onItemClick={onItemClick} />,
                { wrapper: IntlWrapper },
            );

            // Click the visible item — it will be hidden
            const item = getByTestId("gd-geo-legend-color-item-u1");
            fireEvent.click(item);
            flushRAF();

            const liveRegion = getByTestId("gd-geo-legend-live-region");
            expect(liveRegion.textContent).toBe("Alpha hidden");
            expect(onItemClick).toHaveBeenCalledWith("layer-1", "u1");
        });

        it("announces '{name} shown' when showing a legend item", () => {
            const colorModel: ILegendModel = {
                title: "Legend",
                sections: [
                    {
                        layerId: "layer-1",
                        layerTitle: "Layer 1",
                        layerKind: "pushpin",
                        groups: [
                            {
                                kind: "color",
                                title: "Category",
                                items: [
                                    {
                                        type: "colorCategory",
                                        label: "Alpha",
                                        color: "#ff0000",
                                        uri: "u1",
                                        isVisible: false,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };

            const onItemClick = vi.fn();
            const { getByTestId } = render(
                <A11yEnabledLegendPanel model={colorModel} onItemClick={onItemClick} />,
                { wrapper: IntlWrapper },
            );

            const item = getByTestId("gd-geo-legend-color-item-u1");
            fireEvent.click(item);
            flushRAF();

            const liveRegion = getByTestId("gd-geo-legend-live-region");
            expect(liveRegion.textContent).toBe("Alpha shown");
        });

        it("announces only once when duplicate uri appears in multiple groups", () => {
            const duplicatedUriModel: ILegendModel = {
                title: "Legend",
                sections: [
                    {
                        layerId: "layer-1",
                        layerTitle: "Layer 1",
                        layerKind: "pushpin",
                        groups: [
                            {
                                kind: "color",
                                title: "Category A",
                                items: [
                                    {
                                        type: "colorCategory",
                                        label: "Alpha",
                                        color: "#ff0000",
                                        uri: "dup-uri",
                                        isVisible: true,
                                    },
                                ],
                            },
                            {
                                kind: "color",
                                title: "Category B",
                                items: [
                                    {
                                        type: "colorCategory",
                                        label: "Alpha duplicate",
                                        color: "#00ff00",
                                        uri: "dup-uri",
                                        isVisible: true,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };

            const onItemClick = vi.fn();
            const { getByTestId, getAllByTestId } = render(
                <A11yEnabledLegendPanel model={duplicatedUriModel} onItemClick={onItemClick} />,
                { wrapper: IntlWrapper },
            );

            const [item] = getAllByTestId("gd-geo-legend-color-item-dup-uri");
            fireEvent.click(item);
            flushRAF();

            const liveRegion = getByTestId("gd-geo-legend-live-region");
            expect(liveRegion.textContent).toBe("Alpha hidden");
            expect(onItemClick).toHaveBeenCalledWith("layer-1", "dup-uri");
            expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
        });

        it("re-announces the same message on repeated toggle", () => {
            const twoLayerModel: ILegendModel = {
                title: "Legend",
                sections: [
                    { layerId: "layer-1", layerTitle: "Cities", layerKind: "pushpin", groups: [] },
                    { layerId: "layer-2", layerTitle: "Regions", layerKind: "area", groups: [] },
                ],
            };

            const onLayerVisibilityChange = vi.fn();
            const { getByTestId, getByRole } = render(
                <A11yEnabledLegendPanel
                    model={twoLayerModel}
                    onLayerVisibilityChange={onLayerVisibilityChange}
                />,
                { wrapper: IntlWrapper },
            );

            const toggle = getByRole("switch", { name: "Toggle Cities visibility" });

            // First toggle: hide
            fireEvent.click(toggle);
            flushRAF();
            expect(getByTestId("gd-geo-legend-live-region").textContent).toBe("Map layer Cities hidden");

            // The component now has hiddenLayers controlled externally, but
            // handleVisibilityChange uses the prop value at call time.
            // Clicking again with same props means hiddenLayers still empty → will announce "hidden" again.
            // This tests the clear-then-set re-announcement pattern.
            fireEvent.click(toggle);
            flushRAF();
            expect(getByTestId("gd-geo-legend-live-region").textContent).toBe("Map layer Cities hidden");
        });

        it("cancels pending announcement frame on unmount", () => {
            const twoLayerModel: ILegendModel = {
                title: "Legend",
                sections: [
                    { layerId: "layer-1", layerTitle: "Cities", layerKind: "pushpin", groups: [] },
                    { layerId: "layer-2", layerTitle: "Regions", layerKind: "area", groups: [] },
                ],
            };

            const { getByRole, unmount } = render(<A11yEnabledLegendPanel model={twoLayerModel} />, {
                wrapper: IntlWrapper,
            });
            fireEvent.click(getByRole("switch", { name: "Toggle Cities visibility" }));
            expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);

            unmount();
            expect(window.cancelAnimationFrame).toHaveBeenCalledTimes(1);
        });
    });

    describe("toggle operability", () => {
        it("can hide and show the same layer section repeatedly", () => {
            const model: ILegendModel = {
                title: "Legend",
                sections: [
                    { layerId: "layer-1", layerTitle: "Cities", layerKind: "pushpin", groups: [] },
                    { layerId: "layer-2", layerTitle: "Regions", layerKind: "area", groups: [] },
                ],
            };

            const { getByRole, getByTestId } = render(<StatefulA11yEnabledLegendPanel model={model} />, {
                wrapper: IntlWrapper,
            });

            const toggle = getByRole("switch", { name: "Toggle Cities visibility" });
            const section = getByTestId("gd-geo-legend-section-layer-1");
            const sectionHeaderButton = getSectionHeaderButton(section);

            expect(toggle).toHaveAttribute("aria-checked", "true");
            expect(sectionHeaderButton).toHaveAttribute("aria-expanded", "true");

            fireEvent.click(toggle);
            expect(toggle).toHaveAttribute("aria-checked", "false");
            expect(sectionHeaderButton).toHaveAttribute("aria-expanded", "false");

            fireEvent.click(toggle);
            expect(toggle).toHaveAttribute("aria-checked", "true");
            expect(sectionHeaderButton).toHaveAttribute("aria-expanded", "true");
        });
    });
});
