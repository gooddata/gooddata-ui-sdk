// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ICatalogItem } from "../../catalogItem/types.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { CatalogDetailTabCertification } from "../CatalogDetailTabCertification.js";

const wrapper = TestIntlProvider;

const baseItem: ICatalogItem = {
    type: "insight",
    identifier: "insight.id",
    title: "Revenue insight",
    description: "Description",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    isLocked: false,
    isEditable: true,
};

describe("CatalogDetailTabCertification", () => {
    it("hides message field for non-certified objects", () => {
        render(<CatalogDetailTabCertification item={baseItem} canEdit onCertificationChange={vi.fn()} />, {
            wrapper,
        });

        expect(screen.queryByText("Message")).not.toBeInTheDocument();
    });

    it("shows message field for certified objects", () => {
        render(
            <CatalogDetailTabCertification
                item={{
                    ...baseItem,
                    certification: { status: "CERTIFIED", message: "Trusted metric" },
                }}
                canEdit
                onCertificationChange={vi.fn()}
            />,
            { wrapper },
        );

        expect(screen.getByText("Message")).toBeInTheDocument();
        expect(screen.getByText("Trusted metric")).toBeInTheDocument();
    });

    it("updates certification to undefined when Not certified is selected", () => {
        const onCertificationChange = vi.fn();
        render(
            <CatalogDetailTabCertification
                item={{
                    ...baseItem,
                    certification: { status: "CERTIFIED", message: "Trusted metric" },
                }}
                canEdit
                onCertificationChange={onCertificationChange}
            />,
            { wrapper },
        );

        fireEvent.click(screen.getByRole("combobox", { name: "Status" }));
        fireEvent.click(screen.getByText("Not certified"));

        expect(onCertificationChange).toHaveBeenCalledWith(undefined);
    });

    it("updates certification to CERTIFIED when Certified is selected", () => {
        const onCertificationChange = vi.fn();
        render(
            <CatalogDetailTabCertification
                item={baseItem}
                canEdit
                onCertificationChange={onCertificationChange}
            />,
            { wrapper },
        );

        fireEvent.click(screen.getByRole("combobox", { name: "Status" }));
        fireEvent.click(screen.getByText("Certified"));

        expect(onCertificationChange).toHaveBeenCalledWith({ status: "CERTIFIED" });
    });
});
