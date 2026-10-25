// (C) 2023-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { createPostMessageContextFromId } from "../actions/post_message_action_helper.js";

import { PostEventActionTypeKeys } from "./action_types.js";

export const attributeHierarchyModified = createAction(
    PostEventActionTypeKeys.ATTRIBUTE_HIERARCHY_MODIFIED,
    (contextId?: string) => ({ payload: createPostMessageContextFromId(contextId) }),
);

export type IAttributeHieararchyModifiedAction = ReturnType<typeof attributeHierarchyModified>;
