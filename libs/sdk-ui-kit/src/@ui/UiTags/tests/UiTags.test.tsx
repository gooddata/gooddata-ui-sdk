// (C) 2025 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IAccessibilityConfigBase } from "../../../typings/accessibility.js";
import { UiFocusTrap } from "../../UiFocusManager/UiFocusTrap.js";
import { type UiTagsProps } from "../types.js";
import { UiTags } from "../UiTags.js";

const shortTags: UiTagsProps["tags"] = [
    { label: "Tag 1", id: "tag1" },
    { label: "Tag 2", id: "tag2", isDeletable: false },
    { label: "Tag 3", id: "tag3" },
];

describe("UiTags", () => {
    let onTagAdd: ReturnType<typeof vi.fn>;
    let onTagClick: ReturnType<typeof vi.fn>;
    let onTagRemove: ReturnType<typeof vi.fn>;

    const renderTag = (tags: UiTagsProps["tags"], props: Partial<UiTagsProps> = {}) => {
        const defaultAriaAttributes: IAccessibilityConfigBase = {
            ariaLabel: "Tags",
        };

        return render(
            <>
                <div style={{ width: 300 }}>
                    <UiTags
                        tags={tags}
                        onTagAdd={onTagAdd}
                        onTagClick={onTagClick}
                        onTagRemove={onTagRemove}
                        accessibilityConfig={defaultAriaAttributes}
                        {...props}
                    />
                </div>
            </>,
        );
    };

    beforeEach(() => {
        onTagAdd = vi.fn();
        onTagClick = vi.fn();
        onTagRemove = vi.fn();
    });

    it("should render simple tags, single line mode, deletable, creatable, not readOnly", () => {
        renderTag(shortTags, {
            mode: "single-line",
            canCreateTag: true,
            canDeleteTags: true,
            readOnly: false,
        });

        expectVisible("Tag 1", true);
        expectVisible("Tag 2", false);
        expectVisible("Tag 3", true);
        expectAddTag(true, true);
    });

    it("should render simple tags, single line mode, not deletable, creatable, not readOnly", () => {
        renderTag(shortTags, {
            mode: "single-line",
            canCreateTag: true,
            canDeleteTags: false,
            readOnly: false,
        });

        expectVisible("Tag 1", false);
        expectVisible("Tag 2", false);
        expectVisible("Tag 3", false);
        expectAddTag(true, true);
    });

    it("should render simple tags, single line mode, deletable, not creatable, not readOnly", () => {
        renderTag(shortTags, {
            mode: "single-line",
            canCreateTag: false,
            canDeleteTags: true,
            readOnly: false,
        });

        expectVisible("Tag 1", true);
        expectVisible("Tag 2", false);
        expectVisible("Tag 3", true);
        expectAddTag(false, true);
    });

    it("should render simple tags, single line mode, deletable, creatable, readOnly", () => {
        renderTag(shortTags, {
            mode: "single-line",
            canCreateTag: true,
            canDeleteTags: true,
            readOnly: true,
        });

        expectVisible("Tag 1", false);
        expectVisible("Tag 2", false);
        expectVisible("Tag 3", false);
        expectAddTag(false, true);
    });

    it("should render empty tags, single line mode, deletable, creatable, not readOnly", () => {
        renderTag([], {
            mode: "single-line",
            canCreateTag: true,
            canDeleteTags: true,
            readOnly: false,
        });

        expectAddTag(true, false);
    });

    it("should render empty tags, single line mode, deletable, creatable, readOnly", () => {
        renderTag([], {
            mode: "single-line",
            canCreateTag: true,
            canDeleteTags: true,
            readOnly: true,
        });

        expectAddTag(false, false);
        expectNoTags();
    });

    //events

    it("should add tag", () => {
        renderTag([], {
            mode: "single-line",
            canCreateTag: true,
            canDeleteTags: true,
            readOnly: false,
        });

        expectAddTag(true, false);
        fireEvent.click(screen.getByText("Add tag"));
        fireEvent.change(screen.getByRole("combobox"), { target: { value: "john_doe" } });
        fireEvent.click(screen.getByText("Save"));
        expect(onTagAdd).toHaveBeenCalled();
    });

    it("should allow tabbing to Cancel/Save in add tag popover even when wrapped in parent focus trap", async () => {
        render(
            <UiFocusTrap root={<div />}>
                <div style={{ width: 300 }}>
                    <UiTags tags={[]} onTagAdd={onTagAdd} onTagClick={onTagClick} onTagRemove={onTagRemove} />
                </div>
            </UiFocusTrap>,
        );

        fireEvent.click(screen.getByText("Add tag"));

        const input: HTMLInputElement = screen.getByRole("combobox");
        // In unit tests, `UiAutofocus` relies on `IntersectionObserver` which may not always focus immediately.
        // Focus the input explicitly to verify tab navigation behaviour.
        input.focus();
        expect(input).toHaveFocus();

        // Enable the Save button (disabled buttons are not focusable, so Tab navigation cannot reach it).
        fireEvent.change(input, { target: { value: "john_doe" } });

        fireEvent.keyDown(input, { code: "Tab", key: "Tab" });
        expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();

        fireEvent.keyDown(screen.getByRole("button", { name: "Cancel" }), { code: "Tab", key: "Tab" });
        expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
    });
});

function expectVisible(text: string, deletable: boolean) {
    const dt = screen.getAllByText(text);

    expect(dt.length).toBeGreaterThanOrEqual(1);
    expect(dt[0]).toBeInTheDocument();

    if (deletable) {
        expect(screen.getByLabelText(`Delete ${text}`)).toBeInTheDocument();
    } else {
        expect(screen.queryByLabelText(`Delete ${text}`)).not.toBeInTheDocument();
    }
}

function expectAddTag(exists: boolean, short: boolean) {
    if (exists) {
        if (short) {
            expect(screen.getByLabelText(`Add tag`)).toBeInTheDocument();
        } else {
            expect(screen.getByText(`Add tag`)).toBeInTheDocument();
        }
    } else {
        if (short) {
            expect(screen.queryByLabelText(`Add tag`)).not.toBeInTheDocument();
        } else {
            expect(screen.queryByText(`Add tag`)).not.toBeInTheDocument();
        }
    }
}

function expectNoTags() {
    expect(screen.queryByText("Tag 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Tag 2")).not.toBeInTheDocument();
    expect(screen.queryByText("Tag 3")).not.toBeInTheDocument();

    expect(screen.queryByText("No tags")).toBeInTheDocument();
}
