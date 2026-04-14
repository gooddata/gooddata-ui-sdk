// (C) 2007-2026 GoodData Corporation

import cx from "classnames";
import { defineMessages, useIntl } from "react-intl";

import { type IDropdownButtonRenderProps, UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { TEXT_FILTER_MENU_BUTTON_ID } from "./accessibility/elementId.js";

const filterMenuButtonMessages = defineMessages({
    moreOptions: {
        id: "attributeFilter.selectionType.moreOptions",
    },
});

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

/**
 * Button that triggers the filter menu dropdown.
 *
 * @alpha
 */
export function FilterMenuButton(props: IFilterMenuButtonProps) {
    const { isOpen, onClick, ariaAttributes, accessibilityConfig } = props;
    const { formatMessage } = useIntl();
    const moreOptionsLabel = formatMessage(filterMenuButtonMessages.moreOptions);
    const mergedAccessibilityConfig = {
        ...accessibilityConfig,
        ariaLabel: moreOptionsLabel,
    };

    return (
        <div
            className={cx(
                "gd-filter-menu__button",
                "gd-filter-menu__button--icon",
                "s-filter-menu-button",

                {
                    "is-active": isOpen,
                },
            )}
            data-testid="filter-menu-button"
        >
            <UiTooltip
                triggerBy={["hover", "focus"]}
                content={moreOptionsLabel}
                arrowPlacement="left"
                anchor={
                    <UiIconButton
                        id={TEXT_FILTER_MENU_BUTTON_ID}
                        icon="ellipsis"
                        size="large"
                        variant="tertiary"
                        iconColor="complementary-7"
                        isActive={isOpen}
                        onClick={onClick}
                        ariaAttributes={ariaAttributes}
                        label={moreOptionsLabel}
                        accessibilityConfig={mergedAccessibilityConfig}
                    />
                }
            />
        </div>
    );
}
