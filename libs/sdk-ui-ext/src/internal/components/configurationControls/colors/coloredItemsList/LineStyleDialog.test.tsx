// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type LineStyle } from "@gooddata/sdk-ui-charts";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";
import { colorPalette } from "../tests/testColorHelper.test.helpers.js";

import { LineStyleDialog } from "./LineStyleDialog.js";

function renderDialog(lineStyle: LineStyle) {
    const anchor = document.createElement("div");
    document.body.appendChild(anchor);
    return render(
        <InternalIntlWrapper>
            <LineStyleDialog
                alignTo={anchor}
                color={{ r: 20, g: 178, b: 226 }}
                colorPalette={colorPalette}
                lineStyle={lineStyle}
                onColorSelected={() => {}}
                onLineStyleChange={() => {}}
                onLineWidthChange={() => {}}
                onClose={() => {}}
            />
        </InternalIntlWrapper>,
    );
}

async function getLineStyleButton() {
    return screen.findByRole("button", { name: "Line style" });
}

async function getOptionIcon(title: string) {
    const option = await screen.findByText(title);
    return option.closest(".gd-list-item")?.querySelector("svg");
}

describe("LineStyleDialog", () => {
    it("should show the same style glyph on the line style button for every selected style", async () => {
        const glyphs: Array<string | undefined> = [];
        for (const lineStyle of ["solid", "dashed", "dotted"] as const) {
            const { unmount } = renderDialog(lineStyle);
            glyphs.push((await getLineStyleButton()).querySelector("svg")?.innerHTML);
            unmount();
        }

        expect(glyphs[0]).toBeTruthy();
        expect(new Set(glyphs).size).toBe(1);
    });

    it("should draw the style glyph as solid, dashed, short dashed and dotted rows", async () => {
        renderDialog("solid");

        const glyph = (await getLineStyleButton()).querySelector("svg");

        expect(glyph?.querySelectorAll("rect")).toHaveLength(6);
        expect(glyph?.querySelectorAll("circle")).toHaveLength(6);
    });

    it("should draw the dashed option as two separated dashes", async () => {
        renderDialog("solid");
        fireEvent.click(await getLineStyleButton());

        const dashes = Array.from((await getOptionIcon("Dashed"))?.querySelectorAll("rect") ?? []);

        expect(dashes).toHaveLength(2);
        const firstDashEnd = Number(dashes[0].getAttribute("x")) + Number(dashes[0].getAttribute("width"));
        expect(Number(dashes[1].getAttribute("x")) - firstDashEnd).toBeGreaterThanOrEqual(2.8);
    });

    it("should draw the dotted option as four dots", async () => {
        renderDialog("solid");
        fireEvent.click(await getLineStyleButton());

        expect((await getOptionIcon("Dotted"))?.querySelectorAll("circle")).toHaveLength(4);
    });

    it("should draw thicker weight icons for higher line weights", async () => {
        renderDialog("solid");
        fireEvent.click(await screen.findByRole("button", { name: "Line weight" }));

        const heights: number[] = [];
        for (const title of ["1 px", "2 px", "3 px", "4 px"]) {
            heights.push(Number((await getOptionIcon(title))?.querySelector("rect")?.getAttribute("height")));
        }

        expect(heights.every((height, index) => index === 0 || height > heights[index - 1])).toBe(true);
    });

    it("should draw the solid option as one line", async () => {
        renderDialog("solid");
        fireEvent.click(await getLineStyleButton());

        expect((await getOptionIcon("Solid"))?.querySelectorAll("rect")).toHaveLength(1);
    });
});
