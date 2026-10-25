// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { attributeHierarchyEditDialogSelector } from "../selectors/dialogs_selector.js";
import { buildAttributeHierarchyMock } from "../tests/catalog_attribute_hierarchy.test.helpers.js";
import { withIntl } from "../utils/with_intl.js";
import { withRedux } from "../utils/with_redux.js";

import { AttributeHierarchyEditingDialog } from "./AttributeHierarchyEditingDialog.js";

vi.hoisted(() => {
    vi.resetModules();
});

const useSelectorMock = vi.hoisted(() => vi.fn());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    return {
        ...actual,
        useSelector: (selector: unknown) => useSelectorMock(selector),
    };
});

vi.mock("@gooddata/sdk-ui-ext", () => ({
    AttributeHierarchyDialog: () => (
        <div className="s-attribute-hierarchy-dialog">
            <div className="s-attribute-hierarchy-title">
                <div className="gd-editable-label-inner">Attribute Hierarchy Title</div>
            </div>
        </div>
    ),
}));

describe("AttributeHierarchyEditingDialog", () => {
    const attributeHierarchy = buildAttributeHierarchyMock();

    function setSelectorValues(openAttributeHierarchyEditDialog: boolean) {
        useSelectorMock.mockImplementation((selector: unknown) => {
            if (selector === attributeHierarchyEditDialogSelector) {
                return { openAttributeHierarchyEditDialog, attributeHierarchy };
            }
            return undefined;
        });
    }

    function renderComponent(openAttributeHierarchyEditDialog: boolean) {
        setSelectorValues(openAttributeHierarchyEditDialog);
        const Wrapped = withRedux(withIntl(AttributeHierarchyEditingDialog));
        return render(<Wrapped />);
    }

    beforeEach(() => {
        useSelectorMock.mockReset();
    });

    it("should not render the dialog by default", () => {
        renderComponent(false);

        expect(document.querySelector(".s-attribute-hierarchy-dialog")).not.toBeInTheDocument();
    });

    it("should render the dialog", () => {
        renderComponent(true);

        expect(document.querySelector(".s-attribute-hierarchy-dialog")).toBeInTheDocument();
    });
});
