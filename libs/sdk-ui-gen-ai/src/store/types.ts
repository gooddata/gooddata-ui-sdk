// (C) 2024 GoodData Corporation
import { messagesSliceName, messagesSliceReducer } from "./messages/messagesSlice.js";
import { chatWindowSliceName, chatWindowSliceReducer } from "./chatWindow/chatWindowSlice.js";

export type RootState = {
    [messagesSliceName]: ReturnType<typeof messagesSliceReducer>;
    [chatWindowSliceName]: ReturnType<typeof chatWindowSliceReducer>;
};
