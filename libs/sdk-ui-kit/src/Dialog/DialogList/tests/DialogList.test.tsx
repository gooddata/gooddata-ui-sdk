// (C) 2022 GoodData Corporation

import { mount } from "enzyme";
import React from "react";

import { DialogList } from "../DialogList";
import { DialogListLoading } from "../DialogListLoading";
import { DialogListEmpty } from "../DialogListEmpty";
import { DialogListItemBasic } from "../DialogListItemBasic";
import { IDialogListProps } from "../typings";

describe("DialogList", () => {
    const render = (props: IDialogListProps) => {
        return mount(<DialogList {...props} />);
    };

    it("should render DialogListLoading component", () => {
        expect(render({ items: [], isLoading: true }).find(DialogListLoading)).toExist();
    });

    it("should render DialogListEmpty component", () => {
        expect(render({ items: [] }).find(DialogListEmpty)).toExist();
    });

    it("should render DialogListItemBasic components", () => {
        expect(
            render({
                items: [
                    { id: "0", title: "0" },
                    { id: "1", title: "1" },
                ],
            }).find(DialogListItemBasic),
        ).toHaveLength(2);
    });
});
