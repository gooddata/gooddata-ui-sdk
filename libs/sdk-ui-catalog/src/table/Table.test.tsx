// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TestIntlProvider } from "../localization/TestIntlProvider.js";

import { Table } from "./Table.js";

const wrapper = TestIntlProvider;

describe("Table", () => {
    it("announces the error state as an alert including its message and description", () => {
        render(
            <Table
                status="error"
                items={[]}
                relatedItems={[]}
                relatedItemsStatus="idle"
                totalCount={0}
                next={vi.fn()}
                hasNext={false}
            />,
            { wrapper },
        );

        const alert = screen.getByRole("alert");
        expect(alert).toHaveTextContent("Unknown error");
        expect(alert).toHaveTextContent("We’re not quite sure what went wrong. Please try again later.");
        expect(alert.querySelector(".info-label-icon")).toHaveAttribute("aria-hidden", "true");
    });
});
