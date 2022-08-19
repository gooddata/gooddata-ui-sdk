// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";

import { Bubble, IBubbleProps } from "../Bubble";

function renderBubble(options: Partial<IBubbleProps>) {
    return render(<Bubble {...options}>lorem ipsum</Bubble>);
}

describe("Bubble", () => {
    describe("render", () => {
        it("should have correct default align points", () => {
            renderBubble({});

            expect(document.querySelector(".target-bl")).toBeInTheDocument();
            expect(document.querySelector(".self-tl")).toBeInTheDocument();
        });
    });

    describe("css classes", () => {
        it("should have given className", () => {
            const customClass = "bubble-primary";
            renderBubble({
                className: customClass,
            });

            expect(document.querySelector(`.${customClass}`)).toBeInTheDocument();
        });

        it.each([
            ["bl tl", ".arrow-top-direction", ".arrow-tl"],
            ["cc cc", ".arrow-none-direction", ".arrow-cc"],
            ["tc bc", ".arrow-bottom-direction", ".arrow-bc"],
        ])(
            "should have correct arrow classes for align points %s",
            (alignPoints: string, expectedDirectionClass: string, expectAligntClass: string) => {
                renderBubble({ alignPoints: [{ align: alignPoints }] });

                expect(document.querySelector(expectedDirectionClass)).toBeInTheDocument();
                expect(document.querySelector(expectAligntClass)).toBeInTheDocument();
            },
        );
    });
});
