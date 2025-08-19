// (C) 2022-2025 GoodData Corporation
import React from "react";

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TestingDashboardCustomizationLogger } from "./fixtures/TestingDashboardCustomizationLogger.js";
import { EMPTY_MUTATIONS } from "./utils.js";
import { ITitleProps } from "../../../presentation/index.js";
import { DefaultTitleCustomizer } from "../titleCustomizer.js";
import { CustomizerMutationsContext, createCustomizerMutationsContext } from "../types.js";

//
//
//

function renderToHtml(customizer: DefaultTitleCustomizer) {
    const provider = customizer.getCustomizerResult();
    const Component = provider.TitleComponent;

    // Component can be null if no override
    if (!Component) {
        return null;
    }

    const props: ITitleProps = {
        title: "Title",
        onTitleChanged: () => {},
    };

    const { container } = render(<Component {...props} />);
    return container.innerHTML;
}

describe("title customizer", () => {
    let Customizer: DefaultTitleCustomizer;
    let mockWarn: ReturnType<typeof vi.fn>;
    let mutationContext: CustomizerMutationsContext;

    beforeEach(() => {
        mockWarn = vi.fn();
        mutationContext = createCustomizerMutationsContext();
        Customizer = new DefaultTitleCustomizer(
            new TestingDashboardCustomizationLogger({ warn: mockWarn }),
            mutationContext,
            () => {
                function Comp() {
                    return <div>Default</div>;
                }
                return Comp;
            },
        );
    });

    describe("title rendering mode", () => {
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
                title: ["decorator"],
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
                title: ["provider"],
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
