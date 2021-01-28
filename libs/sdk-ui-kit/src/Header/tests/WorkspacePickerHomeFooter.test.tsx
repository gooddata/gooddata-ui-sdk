// (C) 2021 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { WorkspacePickerHomeFooter, IWorkspacePickerHomeFooterProps } from "../WorkspacePickerHomeFooter";

describe("WorkspacePickerHomeFooter", () => {
    function renderWorkspacePickerHomeFooter(props: IWorkspacePickerHomeFooterProps = {}) {
        return mount(<WorkspacePickerHomeFooter {...props} />);
    }

    it("should call onClick when clicked", () => {
        const onClick = jest.fn();
        const wrapper = renderWorkspacePickerHomeFooter({ onClick });
        wrapper.simulate("click");

        expect(onClick).toBeCalled();
    });
});
