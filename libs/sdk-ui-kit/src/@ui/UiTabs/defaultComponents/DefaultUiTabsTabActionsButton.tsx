// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";

import { EmptyObject } from "@gooddata/util";

import { UiIcon } from "../../UiIcon/UiIcon.js";
import { UiLink } from "../../UiLink/UiLink.js";
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
}: IUiTabComponentProps<"TabActionsButton", TTabProps, TTabActionProps>) {
    const intl = useIntl();
    const store = getTypedUiTabsContextStore<TTabProps, TTabActionProps>();
    const { size } = store.useContextStoreValues(["size"]);

    if (tab.actions.length === 0) {
        return null;
    }

    return (
        <UiLink
            variant={"secondary"}
            role={"button"}
            aria-label={intl.formatMessage(messages["actions"])}
            {...ariaAttributes}
            onClick={onClick}
            tabIndex={tabIndex}
            id={id}
        >
            <UiIcon
                type={"ellipsisVertical"}
                size={size === "large" ? 18 : 14}
                layout={"block"}
                ariaHidden
                color={"complementary-5"}
            />
        </UiLink>
    );
}
