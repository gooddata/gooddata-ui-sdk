// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { IObjectAccessSummary } from "@gooddata/sdk-ui-ext";

import {
    catalogDetailAccessRowPrivate,
    catalogDetailAccessRowShared,
    catalogDetailAccessRowWorkspace,
} from "../../automation/testIds.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";

import { CatalogDetailAccessRow } from "./CatalogDetailAccessRow.js";

function summary(overrides: Partial<IObjectAccessSummary>): IObjectAccessSummary {
    return {
        generalAccess: "RESTRICTED",
        workspaceLevel: "VIEW",
        granteeCount: 0,
        selfIsGrantee: false,
        ...overrides,
    };
}

function renderRow(s: IObjectAccessSummary) {
    return render(
        <TestIntlProvider>
            <dl>
                <CatalogDetailAccessRow summary={s} />
            </dl>
        </TestIntlProvider>,
    );
}

describe("CatalogDetailAccessRow", () => {
    it("shows only Private when nobody but the caller has access", () => {
        renderRow(summary({ granteeCount: 1, selfIsGrantee: true }));

        expect(screen.getByTestId(catalogDetailAccessRowPrivate)).toHaveTextContent("Private");
        expect(screen.queryByTestId(catalogDetailAccessRowWorkspace)).not.toBeInTheDocument();
        expect(screen.queryByTestId(catalogDetailAccessRowShared)).not.toBeInTheDocument();
    });

    it("shows both lines at once when the workspace and named grantees are independent", () => {
        renderRow(summary({ generalAccess: "WORKSPACE", granteeCount: 2, selfIsGrantee: true }));

        expect(screen.getByTestId(catalogDetailAccessRowWorkspace)).toHaveTextContent(
            "All workspace users can view",
        );
        expect(screen.getByTestId(catalogDetailAccessRowShared)).toHaveTextContent(
            "Shared with 1 user/group",
        );
        expect(screen.queryByTestId(catalogDetailAccessRowPrivate)).not.toBeInTheDocument();
    });

    it.each([
        ["VIEW", "All workspace users can view"],
        ["SHARE", "All workspace users can share"],
        ["EDIT", "All workspace users can edit"],
    ] as const)("picks the %s copy for the workspace-wide level", (workspaceLevel, text) => {
        renderRow(summary({ generalAccess: "WORKSPACE", workspaceLevel }));

        expect(screen.getByTestId(catalogDetailAccessRowWorkspace)).toHaveTextContent(text);
    });

    it("renders no interactive control — the row is read-only", () => {
        renderRow(summary({ generalAccess: "WORKSPACE", granteeCount: 2 }));

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });
});
