// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import noop from "lodash/noop";
import { Message } from "../Message";
import { IMessageProps } from "../typings";

function renderMessage(options: Partial<IMessageProps>, children: JSX.Element = null) {
    return mount(
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
    describe("message with component", () => {
        it("should show message with custom component", () => {
            const wrapper = renderMessage(
                {
                    type: "error",
                },
                renderMessageComponent(),
            );

            expect(wrapper.find(".link")).toHaveLength(1);
        });

        it("should create message with custom component containing link and click on it once", () => {
            const onClick = jest.fn();
            const wrapper = renderMessage(
                {
                    type: "error",
                },
                renderMessageComponent({ onClick }),
            );

            wrapper.find(".link").simulate("click");
            expect(onClick).toHaveBeenCalledTimes(1);
        });
    });

    describe("close", () => {
        it("should show close button and be able to click", () => {
            const onClose = jest.fn();
            const wrapper = renderMessage({
                type: "error",
                onClose,
            });

            wrapper.find(".gd-message-dismiss").simulate("click");
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
