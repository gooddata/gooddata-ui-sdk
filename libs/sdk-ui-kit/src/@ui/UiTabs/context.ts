// (C) 2025 GoodData Corporation

import { IContextStore, createContextStore } from "@gooddata/sdk-ui";
import { EmptyObject } from "@gooddata/util";

import { IUiTabContext } from "./types.js";

const UiTabsContextStore = createContextStore<IUiTabContext<unknown, unknown>>("UiTabs");

/**
 * @internal
 */
export function getTypedUiTabsContextStore<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
>() {
    return UiTabsContextStore as IContextStore<IUiTabContext<TTabProps, TTabActionProps>>;
}
