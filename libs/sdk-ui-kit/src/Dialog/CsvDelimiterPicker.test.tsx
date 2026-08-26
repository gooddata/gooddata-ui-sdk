// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getCsvDelimiterState } from "@gooddata/sdk-model";
import { withIntlForTest } from "@gooddata/sdk-ui";

import { CsvDelimiterPicker, type ICsvDelimiterPickerProps } from "./CsvDelimiterPicker.js";

const Wrapped = withIntlForTest(CsvDelimiterPicker);

function renderPicker(props: Partial<ICsvDelimiterPickerProps> = {}) {
    const onChange = vi.fn();
    render(<Wrapped value={getCsvDelimiterState(",")} onChange={onChange} {...props} />);
    return { onChange };
}

function openMenu() {
    fireEvent.click(document.querySelector(".s-csv-delimiter-dropdown")!);
}

describe("CsvDelimiterPicker", () => {
    it("shows the Inherit option by default", () => {
        renderPicker();
        openMenu();

        expect(screen.getByText("Inherit")).toBeInTheDocument();
        expect(screen.getByText("Comma")).toBeInTheDocument();
    });

    it("hides the Inherit option when hideInherit is set", () => {
        renderPicker({ hideInherit: true });
        openMenu();

        expect(screen.queryByText("Inherit")).not.toBeInTheDocument();
        expect(screen.getByText("Comma")).toBeInTheDocument();
    });

    it("falls back to the default preset when hideInherit is set but value is inherit", () => {
        renderPicker({ hideInherit: true, value: getCsvDelimiterState(undefined) });

        expect(document.querySelector(".s-csv-delimiter-dropdown")).not.toHaveTextContent("Inherit");
        expect(document.querySelector(".s-csv-delimiter-dropdown")).toHaveTextContent("Comma");
    });
});
