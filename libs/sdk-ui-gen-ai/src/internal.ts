// (C) 2024-2025 GoodData Corporation

import { makeTextContents, makeUserMessage } from "./model.js";
import { clearThreadAction, newMessageAction } from "./store/index.js";

export { GenAIChatDialog } from "./components/GenAIChatDialog.js";
export type { GenAIChatDialogProps } from "./components/GenAIChatDialog.js";
export { clearThreadAction, newMessageAction, makeUserMessage, makeTextContents };
