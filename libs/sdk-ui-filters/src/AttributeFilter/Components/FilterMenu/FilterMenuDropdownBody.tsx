// (C) 2026 GoodData Corporation

import {
    type IUiListboxItem,
    SingleSelectListItem,
    type UiListboxAriaAttributes,
} from "@gooddata/sdk-ui-kit";

import { FilterMenuSectionHeader } from "./FilterMenuSectionHeader.js";
import { FilterMenuSelectableSection } from "./FilterMenuSelectableSection.js";
import { type ILabelItemData, type ISelectionTypeItemData } from "./types.js";

export type IFilterMenuDropdownBodyProps = {
    showSelectionTypeSection: boolean;
    showDisplayForms: boolean;
    selectionTypeListboxItems: IUiListboxItem<ISelectionTypeItemData, never>[];
    selectedSelectionTypeItemId?: string;
    onSelectionTypeSelect: (item: IUiListboxItem<ISelectionTypeItemData, never>) => void;
    labelListboxItems: IUiListboxItem<ILabelItemData, never>[];
    selectedLabelItemId?: string;
    onLabelSelect: (item: IUiListboxItem<ILabelItemData, never>) => void;
    closeDropdown: () => void;
    ariaAttributes: UiListboxAriaAttributes;
    selectionTitle: string;
    selectionTooltip: string;
    valuesAsTitle: string;
    valuesAsTooltip: string;
    hideTooltips?: boolean;
};

export function FilterMenuDropdownBody({
    showSelectionTypeSection,
    showDisplayForms,
    selectionTypeListboxItems,
    selectedSelectionTypeItemId,
    onSelectionTypeSelect,
    labelListboxItems,
    selectedLabelItemId,
    onLabelSelect,
    closeDropdown,
    ariaAttributes,
    selectionTitle,
    selectionTooltip,
    valuesAsTitle,
    valuesAsTooltip,
    hideTooltips,
}: IFilterMenuDropdownBodyProps) {
    const valuesAsAriaAttributes: UiListboxAriaAttributes = {
        ...ariaAttributes,
        id: `${ariaAttributes.id}-values-as`,
        "aria-label": valuesAsTitle,
        "aria-labelledby": undefined,
    };

    return (
        <div className="gd-filter-menu__dropdown" data-testid="filter-menu-dropdown">
            {showSelectionTypeSection ? (
                <>
                    <FilterMenuSectionHeader
                        title={selectionTitle}
                        tooltip={selectionTooltip}
                        hideTooltip={hideTooltips}
                    />
                    <FilterMenuSelectableSection<ISelectionTypeItemData>
                        items={selectionTypeListboxItems}
                        selectedItemId={selectedSelectionTypeItemId}
                        onSelect={onSelectionTypeSelect}
                        onClose={closeDropdown}
                        ariaAttributes={ariaAttributes}
                    />
                </>
            ) : null}

            {showSelectionTypeSection && showDisplayForms ? (
                <SingleSelectListItem
                    type="separator"
                    className="gd-filter-menu__divider"
                    accessibilityConfig={{
                        role: "separator",
                    }}
                />
            ) : null}

            {showDisplayForms ? (
                <>
                    <FilterMenuSectionHeader
                        title={valuesAsTitle}
                        tooltip={valuesAsTooltip}
                        hideTooltip={hideTooltips}
                    />
                    <FilterMenuSelectableSection<ILabelItemData>
                        items={labelListboxItems}
                        selectedItemId={selectedLabelItemId}
                        onSelect={onLabelSelect}
                        onClose={closeDropdown}
                        ariaAttributes={showSelectionTypeSection ? valuesAsAriaAttributes : ariaAttributes}
                    />
                </>
            ) : null}
        </div>
    );
}
