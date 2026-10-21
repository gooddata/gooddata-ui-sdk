// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardItemHeadlineContainer } from "./DashboardItemHeadlineContainer.js";

describe("DashboardItemHeadlineContainer", () => {
    it.each<[number | undefined, string]>([
        [undefined, "item-headline-outer"],
        [100, "item-headline-outer item-headline-outer--small"],
        [119, "item-headline-outer item-headline-outer--small"],
        [120, "item-headline-outer item-headline-outer--no-top-margin"],
        [140, "item-headline-outer item-headline-outer--no-top-margin"],
        [141, "item-headline-outer"],
    ])("should size the title of a widget %s px high by class %s", (clientHeight, expectedClassName) => {
        const { container } = render(
            <DashboardItemHeadlineContainer clientHeight={clientHeight}>
                Title
            </DashboardItemHeadlineContainer>,
        );
        const outer = container.querySelector(".item-headline-outer");

        expect(outer?.className).toBe(expectedClassName);
        expect(outer?.getAttribute("style")).toBeNull();
    });
});
