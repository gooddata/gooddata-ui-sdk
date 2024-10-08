// (C) 2024 GoodData Corporation
import { messagesSliceName, messagesSliceReducer } from "./messages/messagesSlice.js";

export type RootState = {
    [messagesSliceName]: ReturnType<typeof messagesSliceReducer>;
};
