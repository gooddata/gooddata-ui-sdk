// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";

import { messagesSliceReducer } from "../../messages/messagesSlice.js";
import { type RootState } from "../../types.js";
import { agentSwitchingActiveSelector, isPreviewSelector } from "../chatWindowSelectors.js";
import { chatWindowSliceName, getInitialChatWindowState } from "../chatWindowSlice.js";

const agentSwitchingSettings = {
    enableGenAiAgentSwitching: true,
} as IUserWorkspaceSettings;

const makeState = (isPreview?: boolean): RootState => ({
    messages: messagesSliceReducer(undefined, { type: "test/init" }),
    [chatWindowSliceName]: {
        ...getInitialChatWindowState({ isPreview }),
        settings: agentSwitchingSettings,
    },
});

describe("chatWindowSelectors", () => {
    it("should initialize preview mode before side effects read selectors", () => {
        const state = makeState(true);

        expect(isPreviewSelector(state)).toBe(true);
        expect(agentSwitchingActiveSelector(state)).toBe(false);
    });

    it("should keep agent switching active outside of preview mode", () => {
        expect(agentSwitchingActiveSelector(makeState(false))).toBe(true);
    });
});
