// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import type { IKdaDefinition } from "@gooddata/sdk-ui-dashboard";

import { isKeyDriverAnalysisMountedSelector } from "../store/chatWindow/chatWindowSelectors.js";
import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    getInitialChatWindowState,
} from "../store/chatWindow/chatWindowSlice.js";
import { messagesSliceName, messagesSliceReducer } from "../store/messages/messagesSlice.js";

import { GenAiKeyDriverAnalysis } from "./GenAiKeyDriverAnalysis.js";

const { intlWrapperMock, kdaDialogControllerMock } = vi.hoisted(() => ({
    intlWrapperMock: vi.fn(),
    kdaDialogControllerMock: vi.fn(),
}));

vi.mock("@gooddata/sdk-ui-dashboard/internal", () => ({
    IntlWrapper: ({ children, locale }: { children: ReactNode; locale: string }) => {
        intlWrapperMock(locale);
        return children;
    },
    KdaStoreProvider: ({ children }: { children: ReactNode }) => children,
    KdaDialogController: (props: { locale: string }) => {
        kdaDialogControllerMock(props);
        return null;
    },
}));

describe("KeyDriverAnalysis", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

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
                <GenAiKeyDriverAnalysis />
            </Provider>,
        );

        expect(isKeyDriverAnalysisMountedSelector(store.getState())).toBe(true);

        unmount();

        expect(isKeyDriverAnalysisMountedSelector(store.getState())).toBe(false);
    });

    it.each([
        ["the component prop", "cs-CZ", "de-DE", "cs-CZ"],
        ["workspace settings", undefined, "de-DE", "de-DE"],
        ["the default locale", undefined, undefined, "en-US"],
    ])("should use locale from %s", (_source, locale, settingsLocale, expectedLocale) => {
        const store = configureStore({
            reducer: {
                [chatWindowSliceName]: chatWindowSliceReducer,
                [messagesSliceName]: messagesSliceReducer,
            },
            preloadedState: {
                [chatWindowSliceName]: {
                    ...getInitialChatWindowState(),
                    keyDriverAnalysis: {} as IKdaDefinition,
                    settings: settingsLocale
                        ? ({ locale: settingsLocale } as IUserWorkspaceSettings)
                        : undefined,
                },
            },
        });

        render(
            <Provider store={store}>
                <GenAiKeyDriverAnalysis locale={locale} />
            </Provider>,
        );

        expect(intlWrapperMock).toHaveBeenLastCalledWith(expectedLocale);
        expect(kdaDialogControllerMock).toHaveBeenLastCalledWith(
            expect.objectContaining({ locale: expectedLocale }),
        );
    });
});
