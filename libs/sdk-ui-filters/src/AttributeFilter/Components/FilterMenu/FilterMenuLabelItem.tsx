// (C) 2007-2026 GoodData Corporation

import { type IAttributeDisplayFormMetadataObject } from "@gooddata/sdk-model";
import { SingleSelectListItem, UiIcon } from "@gooddata/sdk-ui-kit";

/**
 * Props for FilterMenuLabelItem component.
 *
 * @alpha
 */
export interface IFilterMenuLabelItemProps {
    /**
     * Label metadata for this menu item.
     */
    label: IAttributeDisplayFormMetadataObject;

    /**
     * Whether this label is currently selected.
     */
    isSelected: boolean;

    /**
     * Click handler.
     */
    onClick: () => void;
}

/**
 * Individual label menu item in the filter menu "Values as" section.
 *
 * @alpha
 */
export function FilterMenuLabelItem(props: IFilterMenuLabelItemProps) {
    const { label, isSelected, onClick } = props;

    return (
        <SingleSelectListItem
            className="gd-filter-menu__item"
            title={label.title}
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
