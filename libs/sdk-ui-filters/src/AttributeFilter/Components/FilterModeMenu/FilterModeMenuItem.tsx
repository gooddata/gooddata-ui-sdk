// (C) 2007-2026 GoodData Corporation

import cx from "classnames";
import { defineMessages, useIntl } from "react-intl";

import { SingleSelectListItem, UiIcon } from "@gooddata/sdk-ui-kit";

import { type AttributeFilterMode } from "../../filterModeTypes.js";

/**
 * Props for FilterModeMenuItem component.
 *
 * @alpha
 */
export interface IFilterModeMenuItemProps {
    /**
     * Filter mode represented by this menu item.
     */
    mode: AttributeFilterMode;

    /**
     * Whether this option is currently selected
     */
    isSelected: boolean;

    /**
     * Click handler
     */
    onClick: () => void;
}

const modeMessages = defineMessages({
    list: { id: "attributeFilter.mode.list" },
    text: { id: "attributeFilter.mode.text" },
});

/**
 * Individual menu item in the filter mode menu.
 *
 * @alpha
 */
export function FilterModeMenuItem(props: IFilterModeMenuItemProps) {
    const { mode, isSelected, onClick } = props;
    const intl = useIntl();
    const title = intl.formatMessage(mode === "text" ? modeMessages.text : modeMessages.list);

    return (
        <SingleSelectListItem
            className={cx("gd-filter-mode-menu__item", `s-filter-mode-${mode}`)}
            title={title}
            isSelected={isSelected}
            elementType="button"
            onClick={onClick}
            info={isSelected ? "selected" : undefined}
            infoRenderer={() =>
                isSelected ? (
                    <span className="gd-filter-mode-menu__item-check">
                        <UiIcon type="check" color="primary" size={14} />
                    </span>
                ) : null
            }
        />
    );
}
