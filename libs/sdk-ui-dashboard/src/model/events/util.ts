// (C) 2021-2026 GoodData Corporation

import { _isEmpty } from "@gooddata/util";

import { type IDashboardEvent } from "./base.js";

/**
 * Creates a type guard for a given {@link IDashboardEvent} subtype.
 *
 * @param type - type discriminator of the given type
 * @typeParam TEvent - type of the event to check
 */
export const eventGuard =
    <TEvent extends IDashboardEvent>(type: TEvent["type"]) =>
    (obj: unknown): obj is TEvent => {
        return !_isEmpty(obj) && (obj as TEvent).type === type;
    };
