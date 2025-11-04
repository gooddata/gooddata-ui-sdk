// (C) 2025 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { StaticFilter } from "../StaticFilter.js";

const wrapper = TestIntlProvider;

describe("StaticFilter", () => {
    it("renders wrapper with provided data-testid", () => {
        const dataTestId = "test-id";

        render(
            <StaticFilter
                dataTestId={dataTestId}
                label="Test Filter"
                options={[]}
                selection={[]}
                isSelectionInverted={false}
                onSelectionChange={vi.fn()}
                getItemKey={vi.fn()}
                getItemTitle={vi.fn()}
                noDataMessage={null}
            />,
            { wrapper },
        );

        expect(screen.getByTestId(dataTestId)).toBeInTheDocument();
    });
});
