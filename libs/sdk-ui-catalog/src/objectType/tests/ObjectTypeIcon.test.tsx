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
    it("renders analytical dashboard icon with accessible label", () => {
        render(<TestObjectTypeIcon type="analyticalDashboard" />, { wrapper });
        expect(screen.getByRole("img", { name: "Dashboard" })).toBeVisible();
    });

    it("renders insight icon with Visualization accessible label when visualization type is not provided", () => {
        render(<TestObjectTypeIcon type="insight" />, { wrapper });
        expect(screen.getByRole("img", { name: "Visualization" })).toBeVisible();
    });

    it("renders insight icon label based on visualization type when available", () => {
        render(<TestObjectTypeIcon type="insight" visualizationType="table" />, { wrapper });
        expect(screen.getByRole("img", { name: "Table" })).toBeVisible();
    });

    it("renders measure icon with accessible label", () => {
        render(<TestObjectTypeIcon type="measure" />, { wrapper });
        expect(screen.getByRole("img", { name: "Metric" })).toBeVisible();
    });

    it("renders parameter icon with accessible label", () => {
        render(<TestObjectTypeIcon type="parameter" />, { wrapper });
        expect(screen.getByRole("img", { name: "Parameter" })).toBeVisible();
    });

    it("renders attribute icon with accessible label", () => {
        render(<TestObjectTypeIcon type="attribute" />, { wrapper });
        expect(screen.getByRole("img", { name: "Attribute" })).toBeVisible();
    });

    it("renders fact icon with accessible label", () => {
        render(<TestObjectTypeIcon type="fact" />, { wrapper });
        expect(screen.getByRole("img", { name: "Fact" })).toBeVisible();
    });

    it("renders date dataset icon with accessible label", () => {
        render(<TestObjectTypeIcon type="dataSet" />, { wrapper });
        expect(screen.getByRole("img", { name: "Date dataset" })).toBeVisible();
    });
});
