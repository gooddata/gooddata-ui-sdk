// (C) 2026 GoodData Corporation

import {
    type IUiListboxItem,
    SingleSelectListItem,
    type UiListboxAriaAttributes,
} from "@gooddata/sdk-ui-kit";

import { FilterModeMenuSectionHeader } from "./FilterModeMenuSectionHeader.js";
import { FilterModeMenuSelectableSection } from "./FilterModeMenuSelectableSection.js";
import { type ILabelItemData, type IModeItemData } from "./types.js";

export type IFilterModeMenuDropdownBodyProps = {
    showModeSection: boolean;
    showDisplayForms: boolean;
    modeListboxItems: IUiListboxItem<IModeItemData, never>[];
    selectedModeItemId?: string;
    onModeSelect: (item: IUiListboxItem<IModeItemData, never>) => void;
    labelListboxItems: IUiListboxItem<ILabelItemData, never>[];
    selectedLabelItemId?: string;
    onLabelSelect: (item: IUiListboxItem<ILabelItemData, never>) => void;
    closeDropdown: () => void;
    ariaAttributes: UiListboxAriaAttributes;
    selectionTitle: string;
    selectionTooltip: string;
    valuesAsTitle: string;
    valuesAsTooltip: string;
};

export function FilterModeMenuDropdownBody({
    showModeSection,
    showDisplayForms,
    modeListboxItems,
    selectedModeItemId,
    onModeSelect,
    labelListboxItems,
    selectedLabelItemId,
    onLabelSelect,
    closeDropdown,
    ariaAttributes,
    selectionTitle,
    selectionTooltip,
    valuesAsTitle,
    valuesAsTooltip,
}: IFilterModeMenuDropdownBodyProps) {
    const valuesAsAriaAttributes: UiListboxAriaAttributes = {
        ...ariaAttributes,
        id: `${ariaAttributes.id}-values-as`,
        "aria-label": valuesAsTitle,
        "aria-labelledby": undefined,
    };

    return (
        <div className="gd-filter-mode-menu__dropdown" data-testid="filter-mode-menu-dropdown">
            {showModeSection ? (
                <>
                    <FilterModeMenuSectionHeader title={selectionTitle} tooltip={selectionTooltip} />
                    <FilterModeMenuSelectableSection<IModeItemData>
                        items={modeListboxItems}
                        selectedItemId={selectedModeItemId}
                        onSelect={onModeSelect}
                        onClose={closeDropdown}
                        ariaAttributes={ariaAttributes}
                    />
                </>
            ) : null}

            {showModeSection && showDisplayForms ? (
                <SingleSelectListItem
                    type="separator"
                    className="gd-filter-mode-menu__divider"
                    accessibilityConfig={{
                        role: "separator",
                    }}
                />
            ) : null}

            {showDisplayForms ? (
                <>
                    <FilterModeMenuSectionHeader title={valuesAsTitle} tooltip={valuesAsTooltip} />
                    <FilterModeMenuSelectableSection<ILabelItemData>
                        items={labelListboxItems}
                        selectedItemId={selectedLabelItemId}
                        onSelect={onLabelSelect}
                        onClose={closeDropdown}
                        ariaAttributes={showModeSection ? valuesAsAriaAttributes : ariaAttributes}
                    />
                </>
            ) : null}
        </div>
    );
}
