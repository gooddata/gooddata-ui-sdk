// (C) 2025-2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { useIntl } from "react-intl";
import { describe, expect, it } from "vitest";

import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { ObjectTypeIcon, type ObjectTypeIconProps } from "../ObjectTypeIcon.js";

const wrapper = TestIntlProvider;

function TestObjectTypeIcon(props: Omit<ObjectTypeIconProps, "intl">) {
    const intl = useIntl();
    return <ObjectTypeIcon intl={intl} {...props} />;
}

describe("ObjectTypeIcon", () => {
    it("renders object type icon with accessible label", () => {
        render(<TestObjectTypeIcon type="analyticalDashboard" />, { wrapper });
        expect(screen.getByRole("img", { name: "Dashboard" })).toBeInTheDocument();
    });

    it("renders insight icon label based on visualization type when available", () => {
        render(<TestObjectTypeIcon type="insight" visualizationType="table" />, { wrapper });
        expect(screen.getByRole("img", { name: "Table" })).toBeInTheDocument();
    });

    it("falls back to visualization label when visualization type is not provided", () => {
        render(<TestObjectTypeIcon type="insight" />, { wrapper });
        expect(screen.getByRole("img", { name: "Visualization" })).toBeInTheDocument();
    });
});
