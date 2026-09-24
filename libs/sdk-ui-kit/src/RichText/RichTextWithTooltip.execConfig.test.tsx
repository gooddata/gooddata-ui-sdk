// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IExecutionConfig, idRef } from "@gooddata/sdk-model";

import { type IRichTextProps } from "./RichText.js";
import { RichTextWithTooltip } from "./RichTextWithTooltip.js";

const richTextSpy = vi.hoisted(() => vi.fn());

vi.mock("./RichText.js", () => ({
    RichText: (props: IRichTextProps) => {
        richTextSpy(props);
        return null;
    },
}));

describe("RichTextWithTooltip", () => {
    it("gives the whole execution config to the rich text", () => {
        const execConfig: IExecutionConfig = {
            timestamp: "2026-01-01 00:00:00",
            timezone: "Europe/Prague",
            parameterValues: [{ ref: idRef("mult", "parameter"), value: 5 }],
        };

        render(<RichTextWithTooltip value="{metric/revenue}" showTooltip={false} execConfig={execConfig} />);

        expect(richTextSpy).toHaveBeenLastCalledWith(expect.objectContaining({ execConfig }));
    });
});
