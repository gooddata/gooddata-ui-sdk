// (C) 2019-2020 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";

import { Attachment, IAttachmentProps } from "../Attachment";
import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider";

describe("Attachment", () => {
    const FILE_NAME = "ABC.pdf";
    function renderComponent(customProps: Partial<IAttachmentProps> = {}): ReactWrapper {
        const defaultProps = {
            includeFilterContext: false,
            isMobile: false,
            label: "",
            fileName: FILE_NAME,
            ...customProps,
        };

        return mount(
            <InternalIntlWrapper>
                <Attachment {...defaultProps} />
            </InternalIntlWrapper>,
        );
    }

    it("should render component", () => {
        const component = renderComponent();
        expect(component).toExist();
    });

    it("should render label", () => {
        const label = "attachments";
        const component = renderComponent({ label });
        expect(component.find("label.gd-label").text()).toBe(label);
    });

    it("should render fileName", () => {
        const component = renderComponent();
        expect(component.find(".s-attachment-name").text()).toBe(`${FILE_NAME} (with currently set filters)`);
    });
});
