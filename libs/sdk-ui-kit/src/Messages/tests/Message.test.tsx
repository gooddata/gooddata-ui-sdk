// (C) 2007-2025 GoodData Corporation
import React from "react";
import { IntlProvider } from "react-intl";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import noop from "lodash/noop.js";
import { describe, it, expect, vi } from "vitest";

import { Message } from "../Message.js";
import { IMessageProps } from "../typings.js";

const DefaultLocale = "en-US";
const messages = {
    "message.accessibility.dismiss.notification": "Dismiss notification",
};

function renderMessage(options: Partial<IMessageProps>, children: JSX.Element = null) {
    return render(
        <IntlProvider key={DefaultLocale} locale={DefaultLocale} messages={messages}>
            <Message type={"success"} {...options}>
                {children}
            </Message>
        </IntlProvider>,
    );
}

interface IMessageComponentProps {
    onClick?: () => void;
}

const MessageComponent: React.FC<IMessageComponentProps> = ({ onClick = noop }) => (
    <div>
        Test component with
        <button className="link" onClick={onClick}>
            fake link
        </button>
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
        const onClick = vi.fn();
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
        const onClose = vi.fn();
        renderMessage({
            type: "error",
            onClose,
        });

        await userEvent.click(screen.getByLabelText("Dismiss notification"));
        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
