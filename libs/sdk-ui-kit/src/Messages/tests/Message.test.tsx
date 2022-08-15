// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import noop from "lodash/noop";

import { Message } from "../Message";
import { IMessageProps } from "../typings";

function renderMessage(options: Partial<IMessageProps>, children: JSX.Element = null) {
    return render(
        <Message type={"success"} {...options}>
            {children}
        </Message>,
    );
}

interface IMessageComponentProps {
    onClick?: () => void;
}

const MessageComponent: React.FC<IMessageComponentProps> = ({ onClick = noop }) => (
    <div>
        Test component with
        <a className="link" onClick={onClick}>
            fake link
        </a>
    </div>
);

function renderMessageComponent(options = {}) {
    return <MessageComponent {...options} />;
}

describe("Message", () => {
    it("should show message with custom component", () => {
        renderMessage(
            {
                type: "error",
            },
            renderMessageComponent(),
        );

        expect(screen.getByText("fake link")).toBeInTheDocument();
    });

    it("should create message with custom component containing link and click on it once", async () => {
        const onClick = jest.fn();
        renderMessage(
            {
                type: "error",
            },
            renderMessageComponent({ onClick }),
        );

        await userEvent.click(screen.getByText("fake link"));
        await waitFor(() => {
            expect(onClick).toHaveBeenCalledTimes(1);
        });
    });

    it("should show close button and be able to click", async () => {
        const onClose = jest.fn();
        renderMessage({
            type: "error",
            onClose,
        });

        await userEvent.click(screen.getByLabelText("dismiss"));
        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
