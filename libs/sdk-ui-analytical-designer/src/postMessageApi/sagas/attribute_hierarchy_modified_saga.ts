// (C) 2023-2026 GoodData Corporation

import { call, select, takeEvery } from "redux-saga/effects";

import { PostEventActionTypeKeys } from "../actions/action_types.js";
import { type IAttributeHieararchyModifiedAction } from "../actions/attribute_hierarchies_actions.js";
import { attributeHierarchyModified } from "../outgoing/attribute_hierarchies_events.js";
import { getPostMessageContextId } from "../sagas/post_message_saga_helper.js";
import { availableCommandsSelector } from "../state/selectors/post_message_context_selector.js";

export function* handleAttributeHierarchyModified({
    payload: { postMessageContext },
}: IAttributeHieararchyModifiedAction) {
    const contextId = getPostMessageContextId(postMessageContext);
    const availableCommands: ReturnType<typeof availableCommandsSelector> =
        yield select(availableCommandsSelector);
    yield call(attributeHierarchyModified, availableCommands, contextId);
}

export function* watchAttributeHierarchyModified() {
    yield takeEvery(PostEventActionTypeKeys.ATTRIBUTE_HIERARCHY_MODIFIED, handleAttributeHierarchyModified);
}
