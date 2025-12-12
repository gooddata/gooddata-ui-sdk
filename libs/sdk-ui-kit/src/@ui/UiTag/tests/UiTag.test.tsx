// (C) 2025 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IUiTagAccessibilityConfig, UiTag, type UiTagProps } from "../UiTag.js";

describe("UiTag", () => {
    const renderTag = (props: Partial<UiTagProps> = {}) => {
        const defaultAriaAttributes: IUiTagAccessibilityConfig = {
            ariaLabel: props.label ?? "Tag",
            deleteAriaLabel: "Delete",
        };

        return render(
            <UiTag label={props.label ?? "Tag"} accessibilityConfig={defaultAriaAttributes} {...props} />,
        );
    };

    it("should render simple tag", () => {
        renderTag();

        expect(screen.getByText("Tag")).toBeInTheDocument();
        expect(screen.queryByLabelText("Delete")).not.toBeInTheDocument();
    });

    it("should render simple tag, deletable", () => {
        renderTag({
            isDeletable: true,
        });

        expect(screen.getByText("Tag")).toBeInTheDocument();
        expect(screen.getByLabelText("Delete")).toBeInTheDocument();
    });

    it("should render simple tag, deletable, call onDelete", () => {
        const onDelete = vi.fn();
        renderTag({
            isDeletable: true,
            onDelete,
        });

        expect(screen.getByText("Tag")).toBeInTheDocument();
        expect(screen.getByLabelText("Delete")).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText("Delete"));
        expect(onDelete).toHaveBeenCalled();
    });

    it("should render simple tag, deletable, call onDeleteKeyDown", () => {
        const onDeleteKeyDown = vi.fn();
        renderTag({
            isDeletable: true,
            onDeleteKeyDown,
        });

        expect(screen.getByText("Tag")).toBeInTheDocument();
        expect(screen.getByLabelText("Delete")).toBeInTheDocument();

        fireEvent.keyDown(screen.getByLabelText("Delete"), {
            key: "Esc",
        });
        expect(onDeleteKeyDown).toHaveBeenCalled();
    });

    it("should render simple tag, call onClick", () => {
        const onClick = vi.fn();
        renderTag({
            isDeletable: true,
            onClick,
        });

        expect(screen.getByText("Tag")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Tag"));
        expect(onClick).toHaveBeenCalled();
    });
});
