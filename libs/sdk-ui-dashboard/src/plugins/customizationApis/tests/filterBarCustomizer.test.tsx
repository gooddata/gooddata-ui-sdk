// (C) 2022-2025 GoodData Corporation

import { render } from "@testing-library/react";
import { invariant } from "ts-invariant";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TestingDashboardCustomizationLogger } from "./fixtures/TestingDashboardCustomizationLogger.js";
import { EMPTY_MUTATIONS } from "./utils.js";
import { HiddenFilterBar, type IFilterBarProps } from "../../../presentation/index.js";
import { DefaultFilterBarCustomizer } from "../filterBarCustomizer.js";
import { type CustomizerMutationsContext, createCustomizerMutationsContext } from "../types.js";

//
//
//

function renderToHtml(customizer: DefaultFilterBarCustomizer) {
    const provider = customizer.getCustomizerResult();
    const Component = provider.FilterBarComponent;
    const props: IFilterBarProps = {
        DefaultFilterBar: () => <div />,
        filters: [],
        onAttributeFilterChanged: () => {},
        onDateFilterChanged: () => {},
    };

    // this should not happen; if it does something is seriously hosed in the customizer
    invariant(Component);

    const { container } = render(<Component {...props} />);
    return container.innerHTML;
}

describe("filter bar customizer", () => {
    let Customizer: DefaultFilterBarCustomizer;
    let mockWarn: ReturnType<typeof vi.fn>;
    let mutationContext: CustomizerMutationsContext;

    beforeEach(() => {
        mockWarn = vi.fn();
        mutationContext = createCustomizerMutationsContext();
        Customizer = new DefaultFilterBarCustomizer(
            new TestingDashboardCustomizationLogger({ warn: mockWarn }),
            mutationContext,
        );
    });

    describe("filter bar rendering mode", () => {
        it("should return undefined if no mode was explicitly set", () => {
            const actual = Customizer.getCustomizerResult();
            expect(actual.FilterBarComponent).toBe(undefined);
        });

        it("should return undefined if mode: default was explicitly set", () => {
            Customizer.setRenderingMode("default");
            const actual = Customizer.getCustomizerResult();
            expect(actual.FilterBarComponent).toBe(undefined);
        });

        it("should return HiddenFilterBar if mode: hidden set using the setter", () => {
            Customizer.setRenderingMode("hidden");
            const actual = Customizer.getCustomizerResult();
            expect(actual.FilterBarComponent).toEqual(HiddenFilterBar);
        });

        it("should use the last provided mode if set multiple times", () => {
            Customizer.setRenderingMode("default");
            Customizer.setRenderingMode("hidden");

            const actual = Customizer.getCustomizerResult();
            expect(actual.FilterBarComponent).toEqual(HiddenFilterBar);
        });

        it("should issue a warning if filter bar rendering mode is set multiple times", () => {
            Customizer.setRenderingMode("default");
            Customizer.setRenderingMode("hidden");

            expect(mockWarn).toHaveBeenCalled();
        });

        describe("rendering", () => {
            let Customizer: DefaultFilterBarCustomizer;

            beforeEach(() => {
                mockWarn = vi.fn();
                mutationContext = createCustomizerMutationsContext();
                Customizer = new DefaultFilterBarCustomizer(
                    new TestingDashboardCustomizationLogger({ warn: mockWarn }),
                    mutationContext,
                );
            });

            it("should render with decorator", () => {
                Customizer.withCustomDecorator((_next) => {
                    return (_props) => {
                        function Comp() {
                            return <div>Decorator</div>;
                        }
                        return Comp;
                    };
                });

                expect(renderToHtml(Customizer)).toMatchSnapshot();
                expect(mutationContext).toEqual({
                    ...EMPTY_MUTATIONS,
                    filterBar: ["decorator"],
                });
            });

            it("should render with provider", () => {
                Customizer.withCustomProvider((_props) => {
                    function Comp() {
                        return <div>Provider</div>;
                    }
                    return Comp;
                });

                expect(renderToHtml(Customizer)).toMatchSnapshot();
                expect(mutationContext).toEqual({
                    ...EMPTY_MUTATIONS,
                    filterBar: ["provider"],
                });
            });

            it("should render with default", () => {
                Customizer.setRenderingMode("hidden");

                expect(renderToHtml(Customizer)).toMatchSnapshot();
                expect(mutationContext).toEqual({
                    ...EMPTY_MUTATIONS,
                });
            });
        });
    });
});
