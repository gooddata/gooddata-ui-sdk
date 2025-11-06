// (C) 2025 GoodData Corporation

import { EmptyObject } from "@gooddata/util";

import { getTypedUiTabsContextStore } from "./context.js";
import { IUiTabsProps } from "./types.js";
import { useUiTabsContextStoreValue } from "./useUiTabsContextStoreValue.js";

/**
 * @internal
 */
export function UiTabs<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
>(props: IUiTabsProps<TTabProps, TTabActionProps>) {
    const ContextStore = getTypedUiTabsContextStore<TTabProps, TTabActionProps>();
    const contextStoreValue = useUiTabsContextStoreValue(props);
    const Container = contextStoreValue.Container;

    return (
        <ContextStore value={contextStoreValue}>
            <Container />
        </ContextStore>
    );
}
