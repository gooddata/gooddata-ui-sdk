// (C) 2025 GoodData Corporation

import { RefObject } from "react";

import { useIntl } from "react-intl";

import { EmptyObject } from "@gooddata/util";

import { UiButton } from "../../UiButton/UiButton.js";
import { messages } from "../messages.js";
import { IUiTabComponentProps } from "../types.js";

/**
 * @internal
 */
export function DefaultUiTabsAllTabsButton<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
>({ isOpen, onClick, ref }: IUiTabComponentProps<"AllTabsButton", TTabProps, TTabActionProps>) {
    const intl = useIntl();

    return (
        <UiButton
            label={intl.formatMessage(messages["all"])}
            iconAfter={isOpen ? "chevronUp" : "chevronDown"}
            size={"small"}
            variant="tertiary"
            accessibilityConfig={{
                ariaLabel: intl.formatMessage(messages["showAllTabs"]),
                ariaExpanded: isOpen,
            }}
            onClick={onClick}
            ref={ref as RefObject<HTMLButtonElement>}
        />
    );
}
