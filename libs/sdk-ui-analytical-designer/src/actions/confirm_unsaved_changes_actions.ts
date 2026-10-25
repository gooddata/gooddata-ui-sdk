// (C) 2020-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { ActionTypeKeys } from "../constants/actions.js";

export interface IConfirmUnsavedChangesDialogActionPayloadData {
    goToPage?: string;
    firePostMessage?: boolean;
}
export interface IConfirmUnsavedChangesDialogActionPayload {
    active: boolean;
    data?: IConfirmUnsavedChangesDialogActionPayloadData;
}

export const CreateConfirmUnsavedChangesRequestAction = createAction(
    ActionTypeKeys.SAGA_CONFIRM_UNSAVED_CHANGES_REQUEST,
    (payload: IConfirmUnsavedChangesDialogActionPayload) => ({ payload }),
);

/**
 * The post-message variant is a CALL of the one creator, not a second creator over the same type
 * string: one type string means one `createAction`, so `.match` and the devtools stream stay
 * unambiguous.
 */
export const displayConfirmUnsavedChangesDialogWithPostMessageAction = () =>
    CreateConfirmUnsavedChangesRequestAction({ active: true, data: { firePostMessage: true } });

export const showConfirmUnsageChangesDialogAction = createAction(
    ActionTypeKeys.STORE_SHOW_CONFIRM_UNSAVED_CHANGES_DIALOG,
    (payload: IConfirmUnsavedChangesDialogActionPayload) => ({ payload }),
);

export type IShowConfirmUnsavedChangesDialogAction = ReturnType<typeof showConfirmUnsageChangesDialogAction>;

export const createLeaveAnywayButtonClickedAction = createAction(
    ActionTypeKeys.UI_UNSAVE_CHANGES_DIALOG_LEAVE_ANYWAY_BUTTON_CLICKED,
    (payload: IConfirmUnsavedChangesDialogActionPayloadData) => ({ payload }),
);

export type ILeaveAnywayButtonClickedAction = ReturnType<typeof createLeaveAnywayButtonClickedAction>;
