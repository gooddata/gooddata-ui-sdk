// (C) 2026 GoodData Corporation

import { type IMessage } from "../../models/message.js";

/**
 * appState.messages slice state. Both containers are PLAIN arrays (the elements
 * were already plain IMessage objects). `delayed` messages carry a timeoutId of
 * the scheduled reveal; time travel copies this whole subtree between snapshots by reference
 * (messages are deliberately excluded from undo).
 */
export interface IMessagesState {
    displayed: IMessage[];
    delayed: IMessage[];
}

export const messagesInitialState: IMessagesState = {
    displayed: [],
    delayed: [],
};

// Well-known message ids (moved from services/messages_service.ts).
export const MESSAGE_SAVE_REPORT_ERROR = "save_report_error";
export const MESSAGE_SAVE_REPORT_SUCCESS = "save_report_success";
export const MESSAGE_DELETE_REPORT_ERROR = "delete_report_error";
export const MESSAGE_SHOW_WARNING = "show_warning";
export const MESSAGE_LONG_SAVING = "long_saving";
export const MESSAGE_DELETE_REPORT_SUCCESS = "delete_report_success";
export const MESSAGE_DATA_SOURCE_ERROR = "data_source_error";

export const MESSAGE_EXPORT_RESULT_ERROR = "export_result_error";
export const MESSAGE_EXPORT_RESULT_START = "export_result_start";
export const MESSAGE_EXPORT_RESULT_SUCCESS = "export_result_success";
