// (C) 2025 GoodData Corporation

import { type IContextStore, createContextStore } from "@gooddata/sdk-ui";
import { type EmptyObject } from "@gooddata/util";

import { type IUiTabContext } from "./types.js";

const UiTabsContextStore = createContextStore<IUiTabContext<Record<any, any>, Record<any, any>>>("UiTabs");

/**
 * @internal
 */
export function getTypedUiTabsContextStore<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
>() {
    return UiTabsContextStore as unknown as IContextStore<IUiTabContext<TTabProps, TTabActionProps>>;
}
