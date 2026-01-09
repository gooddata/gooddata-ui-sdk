// (C) 2022-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { invariant } from "ts-invariant";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IVisualizationSwitcherWidget, idRef } from "@gooddata/sdk-model";

import { TestingDashboardCustomizationLogger } from "./fixtures/TestingDashboardCustomizationLogger.js";
import { EMPTY_MUTATIONS } from "./utils.js";
import { type CustomizerMutationsContext, createCustomizerMutationsContext } from "../types.js";
import { DefaultVisualizationSwitcherCustomizer } from "../visualizationSwitcherCustomizer.js";

//
//
//

const TestVisualizationSwitcher: IVisualizationSwitcherWidget = {
    type: "visualizationSwitcher",
    title: "Test RichText",
    ref: idRef("testKpi"),
    identifier: "testKpi",
    description: "Test RichText Widget",
    uri: "/uri/testKpi",
    visualizations: [],
    drills: [],
    ignoreDashboardFilters: [],
};

function renderSwitcherToHtml(customizer: DefaultVisualizationSwitcherCustomizer) {
    const VisualisationSwitcherComponent =
        customizer.getVisualizationSwitcherComponentProvider()(TestVisualizationSwitcher);

    // this should not happen; if it does something is seriously hosed in the customizer
    invariant(VisualisationSwitcherComponent);

    const { container } = render(
        <VisualisationSwitcherComponent screen="lg" widget={TestVisualizationSwitcher} />,
    );

    return container.innerHTML;
}
function renderToolbarToHtml(customizer: DefaultVisualizationSwitcherCustomizer) {
    const VisualisationToolbarComponent =
        customizer.getVisualizationSwitcherToolbarComponentProvider()(TestVisualizationSwitcher);

    // this should not happen; if it does something is seriously hosed in the customizer
    invariant(VisualisationToolbarComponent);

    const { container } = render(
        <VisualisationToolbarComponent
            onClose={vi.fn()}
            onSelectedVisualizationChanged={vi.fn()}
            onVisualizationAdded={vi.fn()}
            onVisualizationsChanged={vi.fn()}
            onWidgetDelete={vi.fn()}
            widget={TestVisualizationSwitcher}
        />,
    );

    return container.innerHTML;
}

describe("visualisation switcher customizer", () => {
    let Customizer: DefaultVisualizationSwitcherCustomizer;
    let mockWarn: (message: string, ...optionalParams: unknown[]) => void;
    let mutationContext: CustomizerMutationsContext;

    beforeEach(() => {
        mockWarn = vi.fn();
        mutationContext = createCustomizerMutationsContext();
        Customizer = new DefaultVisualizationSwitcherCustomizer(
            new TestingDashboardCustomizationLogger({ warn: mockWarn }),
            mutationContext,
            () => {
                function Comp() {
                    return <div>Switcher</div>;
                }
                return Comp;
            },
            () => {
                function Comp() {
                    return <div>Toolbar</div>;
                }
                return Comp;
            },
        );
    });

    describe("visualisation switcher rendering mode", () => {
        it("should render with decorator", () => {
            Customizer.withCustomSwitcherDecorator((_next) => {
                return (_props) => {
                    function Comp() {
                        return <div>Switcher Decorator</div>;
                    }
                    return Comp;
                };
            });

            expect(renderSwitcherToHtml(Customizer)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                visualizationSwitcher: ["decorator"],
            });
        });

        it("should render with provider", () => {
            Customizer.withCustomSwitcherProvider((_props) => {
                function Comp() {
                    return <div>Switcher Provider</div>;
                }
                return Comp;
            });

            expect(renderSwitcherToHtml(Customizer)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                visualizationSwitcher: ["provider"],
            });
        });

        it("should render with default", () => {
            expect(renderSwitcherToHtml(Customizer)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
            });
        });
    });

    describe("visualisation switcher toolbar rendering mode", () => {
        it("should render with decorator", () => {
            Customizer.withCustomToolbarDecorator((_next) => {
                return (_props) => {
                    function Comp() {
                        return <div>Toolbar Decorator</div>;
                    }
                    return Comp;
                };
            });

            expect(renderToolbarToHtml(Customizer)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                visualizationSwitcherToolbar: ["decorator"],
            });
        });

        it("should render with provider", () => {
            Customizer.withCustomToolbarProvider((_props) => {
                function Comp() {
                    return <div>Toolbar Provider</div>;
                }
                return Comp;
            });

            expect(renderToolbarToHtml(Customizer)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                visualizationSwitcherToolbar: ["provider"],
            });
        });

        it("should render with default", () => {
            expect(renderToolbarToHtml(Customizer)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
            });
        });
    });
});
