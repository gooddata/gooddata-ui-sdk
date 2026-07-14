// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IDashboardParameter, idRef } from "@gooddata/sdk-model";
import { decompressFromUrl, withIntl } from "@gooddata/sdk-ui";

import { ShareLink } from "../ShareLink.js";
import { type IShareLinkProps } from "../types.js";

const Wrapped = withIntl(ShareLink);

function getShareUrl(): URL {
    const input = screen.getByDisplayValue(/^https?:/i) as HTMLInputElement;
    return new URL(input.value);
}

describe("ShareLink", () => {
    const baseProps: IShareLinkProps = {
        headline: "Share link",
        helperText: "Anyone with the link can view",
        buttonLabel: "Copy",
    };

    it("encodes dashboardParameters into the URL under the `parameters` query key", () => {
        const dashboardParameters: IDashboardParameter[] = [
            { ref: idRef("topN", "parameter"), parameterType: "NUMBER", mode: "active", value: 5 },
        ];

        render(<Wrapped {...baseProps} dashboardParameters={dashboardParameters} />);

        const url = getShareUrl();
        const encoded = url.searchParams.get("parameters");
        expect(encoded).not.toBeNull();
        expect(decompressFromUrl<IDashboardParameter[]>(encoded!)).toEqual(dashboardParameters);
    });

    it("round-trips a STRING override with spaces, URL delimiters, quotes and non-ASCII", () => {
        const dashboardParameters: IDashboardParameter[] = [
            {
                ref: idRef("scenario", "parameter"),
                parameterType: "STRING",
                mode: "active",
                value: 'Q1 & Q2 = "nejlepší" 100%?#déjà',
            },
        ];

        render(<Wrapped {...baseProps} dashboardParameters={dashboardParameters} />);

        // Re-parsing the rendered URL string proves the encoded payload survives URL serialization.
        const url = new URL(getShareUrl().toString());
        const encoded = url.searchParams.get("parameters");
        expect(decompressFromUrl<IDashboardParameter[]>(encoded!)).toEqual(dashboardParameters);
    });

    it.each<[string, IDashboardParameter[] | undefined]>([
        ["undefined", undefined],
        ["empty", []],
    ])("omits the `parameters` query key when dashboardParameters is %s", (_, dashboardParameters) => {
        render(<Wrapped {...baseProps} dashboardParameters={dashboardParameters} />);
        expect(getShareUrl().searchParams.has("parameters")).toBe(false);
    });
});
