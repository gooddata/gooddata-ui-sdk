// (C) 2025 GoodData Corporation

import { EmptyObject } from "@gooddata/util";

import { UiTabsBem } from "../bem.js";
import { getTypedUiTabsContextStore } from "../context.js";
import { IUiTabComponentProps } from "../types.js";

/**
 * @internal
 */
export function DefaultUiTabsTabValue<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
>({ tab, isSelected }: IUiTabComponentProps<"TabValue", TTabProps, TTabActionProps>) {
    const store = getTypedUiTabsContextStore<TTabProps, TTabActionProps>();
    const { maxLabelLength } = store.useContextStoreValues(["maxLabelLength"]);

    const isOverflowing = tab.label.length > maxLabelLength;

    return (
        <span className={UiTabsBem.e("label", { selected: isSelected })}>
            {isOverflowing ? tab.label.substring(0, maxLabelLength) + "…" : tab.label}
        </span>
    );
}
