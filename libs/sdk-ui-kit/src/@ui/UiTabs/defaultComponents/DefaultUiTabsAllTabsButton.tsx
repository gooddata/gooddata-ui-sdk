// (C) 2025 GoodData Corporation

import { Ref } from "react";

import { useIntl } from "react-intl";

import { forwardRefWithGenerics } from "@gooddata/sdk-ui";
import { EmptyObject } from "@gooddata/util";

import { useMediaQuery } from "../../../responsive/index.js";
import { UiButton } from "../../UiButton/UiButton.js";
import { UiIconButton } from "../../UiIconButton/UiIconButton.js";
import { messages } from "../messages.js";
import { IUiTabComponentProps } from "../types.js";

function DefaultUiTabsAllTabsButtonNotWrapped<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
>(
    { isOpen, onClick }: IUiTabComponentProps<"AllTabsButton", TTabProps, TTabActionProps>,
    ref: Ref<HTMLElement>,
) {
    const intl = useIntl();
    const isMobile = useMediaQuery("mobileDevice");

    return isMobile ? (
        <UiIconButton
            icon={isOpen ? "navigateUp" : "navigateDown"}
            variant={"tertiary"}
            label={intl.formatMessage(messages["all"])}
            accessibilityConfig={{
                ariaLabel: intl.formatMessage(messages["showAllTabs"]),
                ariaExpanded: isOpen,
            }}
            onClick={onClick}
            ref={ref as Ref<HTMLButtonElement>}
            disableAnimation
        />
    ) : (
        <UiButton
            label={intl.formatMessage(messages["all"])}
            iconAfter={isOpen ? "navigateUp" : "navigateDown"}
            variant="tertiary"
            accessibilityConfig={{
                ariaLabel: intl.formatMessage(messages["showAllTabs"]),
                ariaExpanded: isOpen,
            }}
            onClick={onClick}
            ref={ref as Ref<HTMLButtonElement>}
            disableIconAnimation
        />
    );
}

/**
 * @internal
 */
export const DefaultUiTabsAllTabsButton = forwardRefWithGenerics(DefaultUiTabsAllTabsButtonNotWrapped);
