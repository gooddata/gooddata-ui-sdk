// (C) 2024-2025 GoodData Corporation
import { type chatWindowSliceName, type chatWindowSliceReducer } from "./chatWindow/chatWindowSlice.js";
import { type messagesSliceName, type messagesSliceReducer } from "./messages/messagesSlice.js";

export type RootState = {
    [messagesSliceName]: ReturnType<typeof messagesSliceReducer>;
    [chatWindowSliceName]: ReturnType<typeof chatWindowSliceReducer>;
};
