// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";

import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    getInitialChatWindowState,
    loadDataAction,
    setSettingsAction,
} from "../../store/chatWindow/chatWindowSlice.js";

import { useDataLoad } from "./useDataLoad.js";

describe("useDataLoad", () => {
    it("does not dispatch loadDataAction when settings are not present", () => {
        const store = configureStore({
            reducer: {
                [chatWindowSliceName]: chatWindowSliceReducer,
            },
        });
        const dispatchSpy = vi.spyOn(store, "dispatch");

        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>{children}</Provider>
        );

        renderHook(() => useDataLoad(), { wrapper });

        expect(dispatchSpy).not.toHaveBeenCalledWith(loadDataAction());
    });

    it("dispatches loadDataAction when settings are present in the store", () => {
        const store = configureStore({
            reducer: {
                [chatWindowSliceName]: chatWindowSliceReducer,
            },
            preloadedState: {
                [chatWindowSliceName]: {
                    ...getInitialChatWindowState(),
                    settings: { enableAiContextSetup: true } as IUserWorkspaceSettings,
                },
            },
        });
        const dispatchSpy = vi.spyOn(store, "dispatch");

        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>{children}</Provider>
        );

        renderHook(() => useDataLoad(), { wrapper });

        expect(dispatchSpy).toHaveBeenCalledWith(loadDataAction());
    });

    it("dispatches loadDataAction when settings are updated into the store", () => {
        const store = configureStore({
            reducer: {
                [chatWindowSliceName]: chatWindowSliceReducer,
            },
        });
        const dispatchSpy = vi.spyOn(store, "dispatch");

        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>{children}</Provider>
        );

        renderHook(() => useDataLoad(), { wrapper });

        expect(dispatchSpy).not.toHaveBeenCalledWith(loadDataAction());

        act(() => {
            store.dispatch(
                setSettingsAction({ settings: { enableAiContextSetup: true } as IUserWorkspaceSettings }),
            );
        });

        expect(dispatchSpy).toHaveBeenCalledWith(loadDataAction());
    });
});
