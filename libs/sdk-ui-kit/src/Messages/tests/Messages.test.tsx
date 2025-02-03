// (C) 2007-2022 GoodData Corporation
import React from "react";
import { screen, waitFor, render } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { defaultImport } from "default-import";

import { Messages } from "../Messages.js";
import { IMessage, IMessagesProps } from "../typings.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

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
    return render(<Messages messages={[]} {...options} />);
}

describe("Messages", () => {
    describe("message close", () => {
        it("should call callback on message close", async () => {
            const onMessageClose = vi.fn();
            renderMessages({
                messages: mockMessages,
                onMessageClose,
            });

            await userEvent.click(screen.getByLabelText("dismiss"));

            await waitFor(() => {
                expect(onMessageClose).toBeCalledWith(expect.stringContaining(mockMessages[0].id));
            });
        });
    });

    it("Show More", async () => {
        const onMessageClose = vi.fn();
        renderMessages({
            messages: mockError,
            onMessageClose,
        });

        expect(screen.getByText("Show More")).toBeInTheDocument();
        expect(screen.queryByText("Show Less")).not.toBeInTheDocument();
        expect(screen.getByText(mockError[0].errorDetail)).toBeInTheDocument();

        await userEvent.click(screen.getByText("Show More"));

        expect(await screen.findByText("Show Less")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText("Show More")).not.toBeInTheDocument();
        });
    });
});
