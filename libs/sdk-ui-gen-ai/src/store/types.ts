// (C) 2024 GoodData Corporation
import { messagesSliceName, messagesSliceReducer } from "./messages/messagesSlice.js";
import { agentSliceName, agentSliceReducer } from "./agent/agentSlice.js";

export type RootState = {
    [messagesSliceName]: ReturnType<typeof messagesSliceReducer>;
    [agentSliceName]: ReturnType<typeof agentSliceReducer>;
};
