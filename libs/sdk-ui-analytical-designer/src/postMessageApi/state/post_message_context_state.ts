// (C) 2026 GoodData Corporation

import { type IPostMessageContextPayload } from "@gooddata/sdk-embedding";

/**
 * appState.meta.postMessageContext slice state — the embedding host's command context content
 * (see actions/set_post_message_context_actions.ts; written by the open-insight saga so later
 * outgoing events can echo the host's contextId). `null` = no context received yet, because a
 * slice cannot store `undefined` for non-draftable state.
 */
export type IPostMessageContextState = NonNullable<IPostMessageContextPayload["postMessageContext"]> | null;

export const postMessageContextInitialState: IPostMessageContextState = null;
