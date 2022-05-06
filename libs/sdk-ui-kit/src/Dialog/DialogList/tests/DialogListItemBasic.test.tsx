// (C) 2022 GoodData Corporation

import { mount } from "enzyme";
import React from "react";

import { DialogListItemBasic } from "../DialogListItemBasic";
import { IDialogListItemComponentProps } from "../typings";

const ITEM_SELECTOR = ".s-dialog-list-item-content";
const DELETE_ICON_SELECTOR = ".s-dialog-list-item-delete-icon";

describe("DialogListItemBasic", () => {
    const render = (props?: IDialogListItemComponentProps) => {
        return mount(<DialogListItemBasic {...props} />);
    };

    it("should call onClick when clicked on item", () => {
        const onClickMock = jest.fn();
        const wrapper = render({
            item: { id: "id", title: "title", isClickable: true },
            onClick: onClickMock,
        });

        wrapper.find(ITEM_SELECTOR).hostNodes().simulate("click");

        expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when clicked on disabled item", () => {
        const onClickMock = jest.fn();
        const wrapper = render({
            item: { id: "id", title: "title", isDisabled: true },
            onClick: onClickMock,
        });

        wrapper.find(ITEM_SELECTOR).hostNodes().simulate("click");

        expect(onClickMock).toHaveBeenCalledTimes(0);
    });

    it("should not call onClick when clicked on item that is not clickable", () => {
        const onClickMock = jest.fn();
        const wrapper = render({
            item: { id: "id", title: "title", isClickable: false },
            onClick: onClickMock,
        });

        wrapper.find(ITEM_SELECTOR).hostNodes().simulate("click");

        expect(onClickMock).toHaveBeenCalledTimes(0);
    });

    it("should call onDelete when clicked on delete icon", () => {
        const onDeleteMock = jest.fn();
        const wrapper = render({ item: { id: "id", title: "title" }, onDelete: onDeleteMock });

        wrapper.find(DELETE_ICON_SELECTOR).hostNodes().simulate("click");

        expect(onDeleteMock).toHaveBeenCalledTimes(1);
    });

    it("should not render delete icon for disabled item", () => {
        const wrapper = render({
            item: { id: "id", title: "title", isDisabled: true },
        });

        expect(wrapper.find(DELETE_ICON_SELECTOR)).not.toExist();
    });

    it("should not render delete icon for non-deletable item", () => {
        const wrapper = render({
            item: { id: "id", title: "title", isDeletable: false },
        });

        expect(wrapper.find(DELETE_ICON_SELECTOR)).not.toExist();
    });
});
