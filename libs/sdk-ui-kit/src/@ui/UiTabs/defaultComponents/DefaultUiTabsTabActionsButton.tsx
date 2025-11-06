// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";

import { EmptyObject } from "@gooddata/util";

import { UiIconButton } from "../../UiIconButton/UiIconButton.js";
import { getTypedUiTabsContextStore } from "../context.js";
import { messages } from "../messages.js";
import { IUiTabComponentProps } from "../types.js";

/**
 * @internal
 */
export function DefaultUiTabsTabActionsButton<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
>({
    tab,
    onClick,
    ariaAttributes,
    tabIndex,
    id,
    isOpen,
}: IUiTabComponentProps<"TabActionsButton", TTabProps, TTabActionProps>) {
    const intl = useIntl();
    const store = getTypedUiTabsContextStore<TTabProps, TTabActionProps>();
    const { size } = store.useContextStoreValues(["size"]);

    if (tab.actions.length === 0) {
        return null;
    }

    return (
        <UiIconButton
            icon={"ellipsisVertical"}
            size={size === "large" ? "small" : "xsmall"}
            variant={isOpen ? "secondary" : "tertiary"}
            accessibilityConfig={{
                ariaLabel: intl.formatMessage(messages["actions"]),
            }}
            ariaAttributes={ariaAttributes}
            onClick={onClick}
            tabIndex={tabIndex}
            id={id}
        />
    );
}
