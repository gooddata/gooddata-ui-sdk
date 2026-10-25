// (C) 2020-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type AdCommandData } from "@gooddata/sdk-embedding";

import { PostEventActionTypeKeys } from "./action_types.js";

export const commandReceived = createAction(
    PostEventActionTypeKeys.COMMAND_RECEIVED,
    (data: AdCommandData, origin: string) => ({
        payload: {
            data,
            origin,
        },
    }),
);

export type ICommandReceivedAction = ReturnType<typeof commandReceived>;
