// (C) 2025-2026 GoodData Corporation

import { useState } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IAccessibilityConfigBase } from "../../../typings/accessibility.js";
import { UiFocusTrap } from "../../UiFocusManager/UiFocusTrap.js";
import { type IUiTagDef, type IUiTagsProps } from "../types.js";
import { UiTags } from "../UiTags.js";

const shortTags: IUiTagsProps["tags"] = [
    { label: "Tag 1", id: "tag1" },
    { label: "Tag 2", id: "tag2", isDeletable: false },
    { label: "Tag 3", id: "tag3" },
];

describe("UiTags", () => {
    let onTagAdd: (tag: IUiTagDef) => void;
    let onTagClick: (tag: IUiTagDef) => void;
    let onTagRemove: (tag: IUiTagDef) => void;

    const renderTag = (tags: IUiTagsProps["tags"], props: Partial<IUiTagsProps> = {}) => {
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

    it("should allow tabbing to Cancel/Save in add tag popover even when wrapped in parent focus trap", () => {
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

    it("should focus the previous tag after deleting the last tag", async () => {
        render(<StatefulTags initialTags={shortTags} />);

        fireEvent.click(screen.getByLabelText("Remove Tag 3"));

        await waitFor(() => {
            expect(document.activeElement).toHaveClass("gd-ui-kit-tag");
        });
        expect(document.activeElement?.closest("[data-tag-id]")).toHaveAttribute("data-tag-id", "tag2");
    });

    it("should focus the next tag after deleting the first tag", async () => {
        render(<StatefulTags initialTags={shortTags} />);

        fireEvent.click(screen.getByLabelText("Remove Tag 1"));

        await waitFor(() => {
            expect(document.activeElement).toHaveClass("gd-ui-kit-tag");
        });
        expect(document.activeElement?.closest("[data-tag-id]")).toHaveAttribute("data-tag-id", "tag2");
    });

    it("should focus the add button when the last remaining tag is deleted", async () => {
        const singleTag: IUiTagDef[] = [{ id: "single", label: "Single" }];

        render(<StatefulTags initialTags={singleTag} canCreateTag />);

        fireEvent.click(screen.getByLabelText("Remove Single"));

        await waitFor(() => {
            expect(screen.getByLabelText("Add tag")).toHaveFocus();
        });
    });

    it("should focus the next hidden tag after deleting a hidden tag in dialog", async () => {
        render(<StatefulTags initialTags={shortTags} mode="single-line" canCreateTag={false} />);

        fireEvent.click(screen.getByRole("button", { name: "More tags" }));
        fireEvent.click(screen.getByLabelText("Remove Tag 3"));

        await waitFor(() => {
            expect(document.activeElement).toHaveClass("gd-ui-kit-tag");
        });
        expect(document.activeElement?.closest("[data-tag-id]")).toHaveAttribute("data-tag-id", "tag2");
    });

    it("should focus the last visible tag when the last hidden tag is deleted in dialog", async () => {
        const tags: IUiTagDef[] = [
            { id: "visible", label: "Visible Tag" },
            { id: "hidden", label: "Hidden Tag" },
        ];

        render(<StatefulTags initialTags={tags} mode="single-line" canCreateTag={false} />);

        fireEvent.click(screen.getByRole("button", { name: "More tags" }));
        fireEvent.click(screen.getByLabelText("Remove Hidden Tag"));

        await waitFor(() => {
            expect(document.activeElement).toHaveClass("gd-ui-kit-tag");
        });
        expect(document.activeElement?.closest("[data-tag-id]")).toHaveAttribute("data-tag-id", "visible");
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

function StatefulTags(props: Partial<Omit<IUiTagsProps, "onTagRemove">> & { initialTags: IUiTagDef[] }) {
    const { initialTags, ...rest } = props;
    const [tags, setTags] = useState<IUiTagDef[]>(initialTags);

    return (
        <div style={{ width: 500 }}>
            <UiTags
                tags={tags}
                onTagRemove={(tag) => setTags((t) => t.filter((t2) => t2.id !== tag.id))}
                onTagAdd={vi.fn()}
                accessibilityConfig={{ ariaLabel: "Tags" }}
                mode="multi-line"
                canDeleteTags
                {...rest}
            />
        </div>
    );
}
