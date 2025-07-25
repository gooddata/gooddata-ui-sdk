// (C) 2022-2025 GoodData Corporation
import React from "react";
import { ILoadingProps } from "@gooddata/sdk-ui";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

import { DefaultLoadingCustomizer } from "../loadingCustomizer.js";
import { CustomizerMutationsContext, createCustomizerMutationsContext } from "../types.js";

import { TestingDashboardCustomizationLogger } from "./fixtures/TestingDashboardCustomizationLogger.js";
import { EMPTY_MUTATIONS } from "./utils.js";

//
//
//

function renderToHtml(customizer: DefaultLoadingCustomizer) {
    const provider = customizer.getCustomizerResult();
    const Component = provider.LoadingComponent;

    if (!Component) {
        return null;
    }

    const props: ILoadingProps = {
        imageWidth: 100,
        imageHeight: 100,
        width: 100,
        height: 100,
    };

    const { container } = render(<Component {...props} />);

    return container.innerHTML;
}

describe("loading customizer", () => {
    let Customizer: DefaultLoadingCustomizer;
    let mockWarn: ReturnType<typeof vi.fn>;
    let mutationContext: CustomizerMutationsContext;

    beforeEach(() => {
        mockWarn = vi.fn();
        mutationContext = createCustomizerMutationsContext();
        Customizer = new DefaultLoadingCustomizer(
            new TestingDashboardCustomizationLogger({ warn: mockWarn }),
            mutationContext,
        );
    });

    describe("loading rendering mode", () => {
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
                loading: ["decorator"],
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
                loading: ["provider"],
            });
        });

        it("should render with default", () => {
            expect(renderToHtml(Customizer)).toMatchSnapshot();

            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
            });
        });
    });
});
