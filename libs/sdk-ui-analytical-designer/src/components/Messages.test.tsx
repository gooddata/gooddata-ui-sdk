// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { type UnknownAction } from "redux";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ActionTypeKeys } from "../constants/actions.js";
import { type IMessage } from "../models/message.js";
import { messagesInitialState } from "../store/messages/messages_state.js";
import { type IAppState } from "../store/types.js";
import { withAppState } from "../tests/state_builder.test.helpers.js";
import { withIntl } from "../utils/with_intl.js";
import { withRedux } from "../utils/with_redux.js";

import { Messages } from "./Messages.js";

function getRenderedMessagesCount() {
    return document.querySelectorAll(".gd-message").length;
}

function clickFirstRenderedMessageCloseButton() {
    fireEvent.click(document.querySelector(".gd-message-dismiss.gd-icon-cross"));
}

describe("Messages", () => {
    // the component reads everything from the store, so the tests seed the relevant subtrees and
    // observe the dispatched actions
    function renderComponent({
        messages = [],
        onAction = () => {},
    }: {
        messages?: IMessage[];
        onAction?: (action: UnknownAction) => void;
    }) {
        const seed = (state: IAppState, action: UnknownAction) => {
            onAction(action);
            return withAppState(state, { messages: { ...messagesInitialState, displayed: messages } });
        };
        const Wrapped = withRedux(withIntl(Messages), seed);

        return render(<Wrapped />);
    }

    afterEach(() => {
        document.body.innerHTML = "";
    });

    const messages = [
        {
            id: "id1",
            text: "messages.deleteReportSuccess",
            type: "success",
            createdAt: 420,
        },
        {
            id: "id2",
            text: "messages.deleteReportError",
            type: "error",
            createdAt: 123,
        },
    ] as unknown as IMessage[];

    it("shall render list of messages", () => {
        renderComponent({
            messages,
        });

        expect(getRenderedMessagesCount()).toEqual(2);
    });

    it("renders <b> in a message text as bold", () => {
        renderComponent({
            messages: [
                {
                    id: "messages.parameterReset:Threshold",
                    text: "messages.parameterReset",
                    type: "warning",
                    values: { name: "Threshold" },
                } as IMessage,
            ],
        });

        expect(document.querySelector(".gd-message strong").textContent).toEqual("Warning:");
        expect(document.querySelector(".gd-message").textContent).toContain(
            'Parameter "Threshold" is out of range',
        );
    });

    it("interpolates the stored error text into the message", () => {
        renderComponent({
            messages: [
                {
                    id: "forecast-error",
                    type: "error",
                    text: "messages.visualizations.forecast.error",
                    values: { error: "Not enough data points." },
                } as IMessage,
            ],
        });

        expect(document.querySelector(".gd-message").textContent).toContain(
            "Unable to compute forecast. Not enough data points.",
        );
    });

    it("shall pass message id to onMessageClose callback", () => {
        const ID = "very_unique_id";
        const onAction = vi.fn<(action: UnknownAction) => void>();

        renderComponent({
            messages: [
                {
                    id: ID,
                    text: "messages.longSaving",
                    type: "progress",
                },
            ] as IMessage[],
            onAction,
        });

        clickFirstRenderedMessageCloseButton();

        const hideMessageActions = onAction.mock.calls
            .map(([action]) => action)
            .filter((action) => action.type === ActionTypeKeys.HIDE_MESSAGE);

        expect(hideMessageActions).toEqual([
            { type: ActionTypeKeys.HIDE_MESSAGE, payload: { messageId: ID } },
        ]);
    });
});
