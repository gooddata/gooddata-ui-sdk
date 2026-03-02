// (C) 2026 GoodData Corporation

import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FileDropzone } from "../FileDropzone.js";

describe("FileDropzone", () => {
    it("should pass dropped files to callback", () => {
        const onFilesSelected = vi.fn();
        const file = new File(["a,b"], "table.csv", { type: "text/csv" });

        render(<FileDropzone idleLabel="Drop file" onFilesSelected={onFilesSelected} />);

        fireEvent.drop(screen.getByRole("button"), {
            dataTransfer: { files: [file] },
        });

        expect(onFilesSelected).toHaveBeenCalledWith([file]);
    });

    it("should reject dropped files that do not match acceptedFileTypes", () => {
        const onFilesSelected = vi.fn();
        const file = new File(["png"], "image.png", { type: "image/png" });

        render(
            <FileDropzone
                idleLabel="Drop file"
                acceptedFileTypes="text/csv"
                onFilesSelected={onFilesSelected}
            />,
        );

        fireEvent.drop(screen.getByRole("button"), {
            dataTransfer: { files: [file] },
        });

        expect(onFilesSelected).not.toHaveBeenCalled();
    });

    it("should accept dropped files that match extension rules", () => {
        const onFilesSelected = vi.fn();
        const file = new File(["a,b"], "table.csv");

        render(
            <FileDropzone idleLabel="Drop file" acceptedFileTypes=".csv" onFilesSelected={onFilesSelected} />,
        );

        fireEvent.drop(screen.getByRole("button"), {
            dataTransfer: { files: [file] },
        });

        expect(onFilesSelected).toHaveBeenCalledWith([file]);
    });

    it("should accept dropped files with unknown MIME type when MIME restrictions are configured", () => {
        const onFilesSelected = vi.fn();
        const file = new File(["a,b"], "table.csv");

        render(
            <FileDropzone
                idleLabel="Drop file"
                acceptedFileTypes="text/csv"
                onFilesSelected={onFilesSelected}
            />,
        );

        fireEvent.drop(screen.getByRole("button"), {
            dataTransfer: { files: [file] },
        });

        expect(onFilesSelected).toHaveBeenCalledWith([file]);
    });

    it("should reject dropping multiple files when multiple is false", () => {
        const onFilesSelected = vi.fn();
        const file1 = new File(["a,b"], "table1.csv", { type: "text/csv" });
        const file2 = new File(["c,d"], "table2.csv", { type: "text/csv" });

        render(<FileDropzone idleLabel="Drop file" onFilesSelected={onFilesSelected} />);

        fireEvent.drop(screen.getByRole("button"), {
            dataTransfer: { files: [file1, file2] },
        });

        expect(onFilesSelected).not.toHaveBeenCalled();
    });

    it("should reject dropping too many files without calling callback", () => {
        const onFilesSelected = vi.fn();
        const file1 = new File(["a,b"], "table1.csv", { type: "text/csv" });
        const file2 = new File(["c,d"], "table2.csv", { type: "text/csv" });

        render(<FileDropzone idleLabel="Drop file" onFilesSelected={onFilesSelected} />);

        fireEvent.drop(screen.getByRole("button"), {
            dataTransfer: { files: [file1, file2] },
        });

        expect(screen.getByText("Drop file")).toBeDefined();
        expect(screen.getByRole("button")).not.toHaveClass("gd-file-dropzone--invalid");
        expect(onFilesSelected).not.toHaveBeenCalled();
    });

    it("should pass dropped files when multiple is true", () => {
        const onFilesSelected = vi.fn();
        const file1 = new File(["a,b"], "table1.csv", { type: "text/csv" });
        const file2 = new File(["c,d"], "table2.csv", { type: "text/csv" });

        render(<FileDropzone idleLabel="Drop file" multiple onFilesSelected={onFilesSelected} />);

        fireEvent.drop(screen.getByRole("button"), {
            dataTransfer: { files: [file1, file2] },
        });

        expect(onFilesSelected).toHaveBeenCalledWith([file1, file2]);
    });

    it("should open picker on enter key", () => {
        const onFilesSelected = vi.fn();
        const file = new File(["x"], "row.csv", { type: "text/csv" });

        const { container } = render(
            <FileDropzone idleLabel="Drop file" onFilesSelected={onFilesSelected} />,
        );

        fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
        const input = container.querySelector('input[type="file"]');
        fireEvent.change(input as HTMLInputElement, {
            target: { files: [file] },
        });

        expect(onFilesSelected).toHaveBeenCalledWith([file]);
    });

    it("should ignore interactions when disabled", () => {
        const onFilesSelected = vi.fn();
        const file = new File(["a,b"], "table.csv", { type: "text/csv" });

        render(<FileDropzone idleLabel="Drop file" disabled onFilesSelected={onFilesSelected} />);

        fireEvent.drop(screen.getByRole("button"), {
            dataTransfer: { files: [file] },
        });

        expect(onFilesSelected).not.toHaveBeenCalled();
    });

    it("should show invalid label when dragging a disallowed file type", () => {
        const onFilesSelected = vi.fn();

        render(
            <FileDropzone
                idleLabel="Drop file"
                invalidLabel="Only CSV files are supported"
                acceptedFileTypes="text/csv"
                onFilesSelected={onFilesSelected}
            />,
        );

        fireEvent.dragOver(screen.getByRole("button"), {
            dataTransfer: {
                items: [{ kind: "file", type: "image/png", getAsFile: () => null }],
            },
        });

        expect(screen.getByText("Only CSV files are supported")).toBeDefined();
        expect(screen.getByRole("button")).toHaveClass("gd-file-dropzone--invalid");
    });

    it("should set dropEffect to none when dragging invalid file", () => {
        const onFilesSelected = vi.fn();

        render(
            <FileDropzone
                idleLabel="Drop file"
                acceptedFileTypes="text/csv"
                onFilesSelected={onFilesSelected}
            />,
        );

        const button = screen.getByRole("button");
        const event = createEvent.dragOver(button) as DragEvent;
        Object.defineProperty(event, "dataTransfer", {
            value: {
                items: [{ kind: "file", type: "image/png", getAsFile: () => null }],
                dropEffect: "copy",
            },
        });

        fireEvent(button, event);

        expect(event.dataTransfer?.dropEffect).toBe("none");
    });

    it("should show active label when dragging a valid file", () => {
        const onFilesSelected = vi.fn();

        render(
            <FileDropzone
                idleLabel="Drop file"
                activeLabel="Drop here"
                acceptedFileTypes="text/csv"
                onFilesSelected={onFilesSelected}
            />,
        );

        fireEvent.dragOver(screen.getByRole("button"), {
            dataTransfer: {
                items: [{ kind: "file", type: "text/csv", getAsFile: () => null }],
            },
        });

        expect(screen.getByText("Drop here")).toBeDefined();
        expect(screen.getByRole("button")).toHaveClass("gd-file-dropzone--active");
    });

    it("should set dropEffect to copy when dragging valid file", () => {
        const onFilesSelected = vi.fn();

        render(
            <FileDropzone
                idleLabel="Drop file"
                acceptedFileTypes="text/csv"
                onFilesSelected={onFilesSelected}
            />,
        );

        const button = screen.getByRole("button");
        const event = createEvent.dragOver(button) as DragEvent;
        Object.defineProperty(event, "dataTransfer", {
            value: {
                items: [{ kind: "file", type: "text/csv", getAsFile: () => null }],
                dropEffect: "none",
            },
        });

        fireEvent(button, event);

        expect(event.dataTransfer?.dropEffect).toBe("copy");
    });

    it("should reset to idle label on drag leave", () => {
        const onFilesSelected = vi.fn();

        render(
            <FileDropzone idleLabel="Drop file" activeLabel="Drop here" onFilesSelected={onFilesSelected} />,
        );

        fireEvent.dragOver(screen.getByRole("button"), {
            dataTransfer: {
                items: [{ kind: "file", type: "text/csv", getAsFile: () => null }],
            },
        });
        fireEvent.dragLeave(screen.getByRole("button"));

        expect(screen.getByText("Drop file")).toBeDefined();
        expect(screen.getByRole("button")).not.toHaveClass("gd-file-dropzone--active");
    });
});
