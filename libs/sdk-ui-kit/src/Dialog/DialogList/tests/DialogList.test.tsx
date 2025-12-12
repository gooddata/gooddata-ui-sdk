// (C) 2022-2025 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DialogList } from "../DialogList.js";
import { type IDialogListProps } from "../typings.js";

describe("DialogList", () => {
    const createComponent = (props: IDialogListProps) => {
        return render(<DialogList {...props} />);
    };

    it("should createComponent DialogListLoading component", () => {
        createComponent({ items: [], isLoading: true });
        expect(screen.getByLabelText("loading")).toBeInTheDocument();
    });

    it("should createComponent DialogListEmpty component", () => {
        createComponent({ items: [] });
        expect(screen.getByLabelText("dialog-list-empty")).toBeInTheDocument();
    });

    it("should createComponent DialogListItemBasic components", () => {
        createComponent({
            items: [
                { id: "0", title: "0" },
                { id: "1", title: "1" },
            ],
        });
        expect(screen.getAllByRole("dialog-list-item")).toHaveLength(2);
    });
});
