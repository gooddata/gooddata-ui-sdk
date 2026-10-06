// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import { isKeyDriverAnalysisMountedSelector } from "../store/chatWindow/chatWindowSelectors.js";
import { chatWindowSliceName, chatWindowSliceReducer } from "../store/chatWindow/chatWindowSlice.js";
import { messagesSliceName, messagesSliceReducer } from "../store/messages/messagesSlice.js";

import { GenAiKeyDriverAnalysis } from "./GenAiKeyDriverAnalysis.js";

describe("KeyDriverAnalysis", () => {
    it("should set isKeyDriverAnalysisMounted to true on mount and false on unmount", () => {
        const store = configureStore({
            reducer: {
                [chatWindowSliceName]: chatWindowSliceReducer,
                [messagesSliceName]: messagesSliceReducer,
            },
        });

        expect(isKeyDriverAnalysisMountedSelector(store.getState())).toBe(false);

        const { unmount } = render(
            <Provider store={store}>
                <IntlProvider locale="en">
                    <GenAiKeyDriverAnalysis />
                </IntlProvider>
            </Provider>,
        );

        expect(isKeyDriverAnalysisMountedSelector(store.getState())).toBe(true);

        unmount();

        expect(isKeyDriverAnalysisMountedSelector(store.getState())).toBe(false);
    });
});
