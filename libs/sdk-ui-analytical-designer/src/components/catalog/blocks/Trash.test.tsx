// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { createStore } from "../../../create_store.js";
import {
    highlightItemsToBeRemovedByTrash,
    resetHighlightedItemsToBeRemoved,
} from "../../../sagas/highlighting/highlighting_ui_actions.js";
import { withIntl } from "../../../utils/with_intl.js";

import { type ITrashProps, Trash } from "./Trash.js";

describe("Trash", () => {
    const renderComponent = (customProps: Partial<ITrashProps> = {}) => {
        const WrappedTrash = withIntl(Trash);
        const { store } = createStore();
        const dispatchSpy = vi.spyOn(store, "dispatch");

        const renderTrash = (props: ITrashProps) => (
            <Provider store={store}>
                <WrappedTrash {...props} />
            </Provider>
        );

        const { rerender, ...rest } = render(renderTrash({ isOver: false, ...customProps }));

        return {
            ...rest,
            dispatchSpy,
            rerenderWith: (props: Partial<ITrashProps>) =>
                rerender(renderTrash({ isOver: false, ...customProps, ...props })),
        };
    };

    it("should not add hover class when isOver is false", () => {
        const { container } = renderComponent();

        const trash = container.querySelector(".adi-trash");

        expect(trash).not.toHaveClass("adi-droppable-hover");
    });

    it("should add hover class when isOver is true", () => {
        const { container } = renderComponent({ isOver: true });

        const trash = container.querySelector(".adi-trash");

        expect(trash).toHaveClass("adi-droppable-hover");
    });

    it("should not dispatch any highlighting action on mount", () => {
        const { dispatchSpy } = renderComponent();

        expect(dispatchSpy).not.toHaveBeenCalledWith(highlightItemsToBeRemovedByTrash());
        expect(dispatchSpy).not.toHaveBeenCalledWith(resetHighlightedItemsToBeRemoved());
    });

    it("should dispatch highlighting action when item enters the drop zone", () => {
        const { dispatchSpy, rerenderWith } = renderComponent();

        rerenderWith({ isOver: true });

        expect(dispatchSpy).toHaveBeenCalledWith(highlightItemsToBeRemovedByTrash());
    });

    it("should dispatch reset action when item leaves the drop zone", () => {
        const { dispatchSpy, rerenderWith } = renderComponent({ isOver: true });

        rerenderWith({ isOver: false });

        expect(dispatchSpy).toHaveBeenCalledWith(resetHighlightedItemsToBeRemoved());
    });
});
