// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { Messages } from "../Messages";
import { IMessage, IMessagesProps } from "../typings";

const mockMessages: Array<IMessage> = [
    {
        id: "1",
        type: "success",
        text: "cool",
    },
];

const mockError: Array<IMessage> = [
    {
        id: "1",
        type: "error",
        text: "cool",
        showMore: "Show More",
        showLess: "Show Less",
        errorDetail: "test",
    },
];

function renderMessages(options: Partial<IMessagesProps>) {
    return mount(<Messages messages={[]} {...options} />);
}

describe("Messages", () => {
    describe("message close", () => {
        it("should call callback on message close", () => {
            const onMessageClose = jest.fn();
            const wrapper = renderMessages({
                messages: mockMessages,
                onMessageClose,
            });

            wrapper.find(".gd-message-dismiss").simulate("click");
            expect(onMessageClose).toHaveBeenCalledWith(mockMessages[0].id);
        });
    });

    it("Show More", () => {
        const onMessageClose = jest.fn();
        const wrapper = renderMessages({
            messages: mockError,
            onMessageClose,
        });
        const showMore = wrapper.find(".gd-message-text-showmorelink");
        const errorDetail = wrapper.find(".gd-message-text-content").text();

        expect(showMore.text()).toMatch("Show More");
        expect(errorDetail).toMatch("");
        showMore.simulate("click");
        expect(showMore.text()).toMatch("Show Less");
        expect(errorDetail).toMatch("test");
    });
});
