// (C) 2021 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";

import { IDashboardEvent } from "./base.js";

/**
 * Creates a type guard for a given {@link IDashboardEvent} subtype.
 *
 * @param type - type discriminator of the given type
 * @typeParam TEvent - type of the event to check
 */
export const eventGuard =
    <TEvent extends IDashboardEvent>(type: TEvent["type"]) =>
    (obj: unknown): obj is TEvent => {
        return !isEmpty(obj) && (obj as TEvent).type === type;
    };
