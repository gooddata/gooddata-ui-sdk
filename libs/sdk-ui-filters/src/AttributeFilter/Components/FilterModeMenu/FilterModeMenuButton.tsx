// (C) 2007-2026 GoodData Corporation

import cx from "classnames";
import { defineMessages, useIntl } from "react-intl";

import { type IDropdownButtonRenderProps, UiIconButton } from "@gooddata/sdk-ui-kit";

/**
 * Props for FilterModeMenuButton component.
 *
 * @alpha
 */
export interface IFilterModeMenuButtonProps {
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

const modeMessages = defineMessages({
    selection: { id: "attributeFilter.mode.selection" },
});

/**
 * Button that triggers the filter mode menu dropdown.
 *
 * @alpha
 */
export function FilterModeMenuButton(props: IFilterModeMenuButtonProps) {
    const { isOpen, onClick, ariaAttributes, accessibilityConfig } = props;
    const { formatMessage } = useIntl();

    return (
        <div
            className={cx(
                "gd-filter-mode-menu__button",
                "gd-filter-mode-menu__button--icon",
                "s-filter-mode-menu-button",
                {
                    "is-active": isOpen,
                },
            )}
            data-testid="filter-mode-menu-button"
        >
            <UiIconButton
                icon="ellipsis"
                size="large"
                variant="tertiary"
                iconColor="complementary-7"
                isActive={isOpen}
                onClick={onClick}
                ariaAttributes={ariaAttributes}
                label={formatMessage(modeMessages.selection)}
                accessibilityConfig={accessibilityConfig}
            />
        </div>
    );
}
