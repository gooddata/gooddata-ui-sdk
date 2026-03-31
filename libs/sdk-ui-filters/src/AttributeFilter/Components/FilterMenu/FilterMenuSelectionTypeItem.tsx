// (C) 2007-2026 GoodData Corporation

import cx from "classnames";
import { defineMessages, useIntl } from "react-intl";

import { SingleSelectListItem, UiIcon } from "@gooddata/sdk-ui-kit";

import { type AttributeFilterSelectionType } from "../../selectionTypes.js";

/**
 * Props for FilterMenuSelectionTypeItem component.
 *
 * @alpha
 */
export interface IFilterMenuSelectionTypeItemProps {
    /**
     * Filter selection type represented by this menu item.
     */
    selectionType: AttributeFilterSelectionType;

    /**
     * Whether this option is currently selected
     */
    isSelected: boolean;

    /**
     * Click handler
     */
    onClick: () => void;
}

const selectionTypeMessages = defineMessages({
    list: { id: "attributeFilter.selectionType.list" },
    text: { id: "attributeFilter.selectionType.text" },
});

/**
 * Individual menu item in the filter menu.
 *
 * @alpha
 */
export function FilterMenuSelectionTypeItem(props: IFilterMenuSelectionTypeItemProps) {
    const { selectionType, isSelected, onClick } = props;
    const intl = useIntl();
    const title = intl.formatMessage(
        selectionType === "text" ? selectionTypeMessages.text : selectionTypeMessages.list,
    );

    return (
        <SingleSelectListItem
            className={cx("gd-filter-menu__item", `s-selection-type-${selectionType}`)}
            dataTestId={`selection-type-${selectionType}`}
            title={title}
            isSelected={isSelected}
            elementType="button"
            onClick={onClick}
            info={isSelected ? "selected" : undefined}
            infoRenderer={() =>
                isSelected ? (
                    <span className="gd-filter-menu__item-check">
                        <UiIcon type="check" color="primary" size={14} />
                    </span>
                ) : null
            }
        />
    );
}
