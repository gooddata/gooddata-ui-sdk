// (C) 2024-2025 GoodData Corporation
import { chatWindowSliceName, chatWindowSliceReducer } from "./chatWindow/chatWindowSlice.js";
import { messagesSliceName, messagesSliceReducer } from "./messages/messagesSlice.js";

export type RootState = {
    [messagesSliceName]: ReturnType<typeof messagesSliceReducer>;
    [chatWindowSliceName]: ReturnType<typeof chatWindowSliceReducer>;
};
