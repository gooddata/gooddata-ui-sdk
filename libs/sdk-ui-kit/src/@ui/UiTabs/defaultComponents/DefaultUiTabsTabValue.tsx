// (C) 2025 GoodData Corporation

import { type EmptyObject } from "@gooddata/util";

import { ShortenedText } from "../../../ShortenedText/index.js";
import { UiTabsBem } from "../bem.js";
import { getTypedUiTabsContextStore } from "../context.js";
import { type IUiTabComponentProps } from "../types.js";

/**
 * @internal
 */
export function DefaultUiTabsTabValue<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
>({ tab, isSelected }: IUiTabComponentProps<"TabValue", TTabProps, TTabActionProps>) {
    const store = getTypedUiTabsContextStore<TTabProps, TTabActionProps>();
    const { maxLabelLength } = store.useContextStoreValues(["maxLabelLength"]);

    const isOverflowing = maxLabelLength !== undefined && tab.label.length > maxLabelLength;

    return (
        <ShortenedText
            className={UiTabsBem.e("label", { selected: isSelected, variant: tab.variant ?? "default" })}
            ellipsisPosition={"end"}
            tagName={"div"}
            tooltipAlignPoints={[{ align: "cl cr" }]}
        >
            {isOverflowing && maxLabelLength !== undefined
                ? tab.label.substring(0, maxLabelLength) + "…"
                : tab.label}
        </ShortenedText>
    );
}
