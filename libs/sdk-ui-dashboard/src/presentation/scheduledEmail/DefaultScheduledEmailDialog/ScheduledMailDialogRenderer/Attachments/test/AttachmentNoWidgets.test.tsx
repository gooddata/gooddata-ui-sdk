// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { AttachmentNoWidgets, IAttachmentProps } from "../AttachmentNoWidgets.js";

import { IntlWrapper } from "../../../../../localization/IntlWrapper.js";

describe("AttachmentNoWidgets", () => {
    const FILE_NAME = "ABC.pdf";
    function renderComponent(customProps: Partial<IAttachmentProps> = {}) {
        const defaultProps = {
            includeFilterContext: false,
            isMobile: false,
            label: "",
            fileName: FILE_NAME,
            ...customProps,
        };

        return render(
            <IntlWrapper>
                <AttachmentNoWidgets {...defaultProps} />
            </IntlWrapper>,
        );
    }

    it("should render component", () => {
        renderComponent();

        expect(screen.getByText(`${FILE_NAME} (with currently set filters)`)).toBeInTheDocument();
    });

    it("should render label", () => {
        const label = "attachments";
        renderComponent({ label });
        expect(screen.getByText(label)).toBeInTheDocument();
    });
});
