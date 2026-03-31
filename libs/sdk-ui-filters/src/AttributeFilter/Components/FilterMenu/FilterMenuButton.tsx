// (C) 2007-2026 GoodData Corporation

import cx from "classnames";
import { defineMessages, useIntl } from "react-intl";

import { type IDropdownButtonRenderProps, UiIconButton } from "@gooddata/sdk-ui-kit";

import { TEXT_FILTER_MENU_BUTTON_ID } from "./accessibility/elementId.js";

/**
 * Props for FilterMenuButton component.
 *
 * @alpha
 */
export interface IFilterMenuButtonProps {
    /**
     * Whether the dropdown is open
     */
    isOpen: boolean;

    /**
     * Click handler
     */
    onClick: () => void;

    /**
     * ARIA attributes from dropdown trigger render props.
     */
    ariaAttributes?: IDropdownButtonRenderProps["ariaAttributes"];

    /**
     * Accessibility config from dropdown trigger render props.
     */
    accessibilityConfig?: IDropdownButtonRenderProps["accessibilityConfig"];
}

const selectionTypeMessages = defineMessages({
    selection: { id: "attributeFilter.selectionType.selection" },
});

/**
 * Button that triggers the filter menu dropdown.
 *
 * @alpha
 */
export function FilterMenuButton(props: IFilterMenuButtonProps) {
    const { isOpen, onClick, ariaAttributes, accessibilityConfig } = props;
    const { formatMessage } = useIntl();

    return (
        <div
            className={cx("gd-filter-menu__button", "gd-filter-menu__button--icon", "s-filter-menu-button", {
                "is-active": isOpen,
            })}
            data-testid="filter-menu-button"
        >
            <UiIconButton
                id={TEXT_FILTER_MENU_BUTTON_ID}
                icon="ellipsis"
                size="large"
                variant="tertiary"
                iconColor="complementary-7"
                isActive={isOpen}
                onClick={onClick}
                ariaAttributes={ariaAttributes}
                label={formatMessage(selectionTypeMessages.selection)}
                accessibilityConfig={accessibilityConfig}
            />
        </div>
    );
}
