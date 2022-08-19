// (C) 2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import { DialogList } from "../DialogList";
import { IDialogListProps } from "../typings";

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
