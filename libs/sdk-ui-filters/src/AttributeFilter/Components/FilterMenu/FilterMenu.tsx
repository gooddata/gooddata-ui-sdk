// (C) 2007-2026 GoodData Corporation

import { useMemo } from "react";

import { defineMessages, useIntl } from "react-intl";

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { Dropdown, type IAlignPoint, type IUiListboxItem } from "@gooddata/sdk-ui-kit";

import { FilterMenuButton } from "./FilterMenuButton.js";
import { FilterMenuDropdownBody } from "./FilterMenuDropdownBody.js";
import { type IFilterMenuProps, type ILabelItemData, type ISelectionTypeItemData } from "./types.js";
import { type AttributeFilterSelectionType } from "../../selectionTypes.js";

const ALIGN_POINTS: IAlignPoint[] = [{ align: "bl tl" }, { align: "tl bl" }];
const selectionTypeMessages = defineMessages({
    list: { id: "attributeFilter.selectionType.list" },
    text: { id: "attributeFilter.selectionType.text" },
});

/**
 * Menu for switching between different attribute filter selection types.
 *
 * @alpha
 */
export function FilterMenu(props: IFilterMenuProps) {
    const {
        currentSelectionType,
        availableSelectionTypes = ["elements", "text"],
        onSelectionTypeChange,
        labels = [],
        selectedLabelRef,
        onLabelChange: onDisplayFormChange,
        hideTooltips,
    } = props;
    const intl = useIntl();

    // Simplified: just 2 options per Figma design
    const allOptions: AttributeFilterSelectionType[] = ["elements", "text"];

    // Filter options based on available selection types
    const visibleOptions = allOptions.filter((selectionType) =>
        availableSelectionTypes.includes(selectionType),
    );
    const showSelectionTypeSection = visibleOptions.length > 1;
    const showDisplayForms = labels.length > 1;
    const hasMenuContent = showSelectionTypeSection || showDisplayForms;

    const handleOptionClick = (selectionType: AttributeFilterSelectionType) => {
        onSelectionTypeChange(selectionType);
    };

    const handleDisplayFormClick = (displayFormRef: ObjRef) => {
        onDisplayFormChange?.(displayFormRef);
    };

    const selectionTypeListboxItems = useMemo<IUiListboxItem<ISelectionTypeItemData, never>[]>(() => {
        return visibleOptions.map((selectionType) => ({
            type: "interactive",
            id: `mode:${selectionType}`,
            stringTitle: intl.formatMessage(
                selectionType === "text" ? selectionTypeMessages.text : selectionTypeMessages.list,
            ),
            data: { selectionType },
        }));
    }, [intl, visibleOptions]);

    const labelListboxItems = useMemo<IUiListboxItem<ILabelItemData, never>[]>(() => {
        return labels.map((label) => ({
            type: "interactive",
            id: `label:${label.id}`,
            stringTitle: label.title,
            data: { labelRef: label.ref },
        }));
    }, [labels]);

    const selectedLabelItemId = useMemo(() => {
        if (!selectedLabelRef) {
            return undefined;
        }
        const selectedLabel = labels.find((label) => areObjRefsEqual(label.ref, selectedLabelRef));
        return selectedLabel ? `label:${selectedLabel.id}` : undefined;
    }, [labels, selectedLabelRef]);

    const selectedSelectionTypeItemId = useMemo(() => {
        return showSelectionTypeSection && visibleOptions.includes(currentSelectionType)
            ? `mode:${currentSelectionType}`
            : undefined;
    }, [currentSelectionType, showSelectionTypeSection, visibleOptions]);

    if (!hasMenuContent) {
        return null;
    }

    return (
        <div className="gd-filter-menu s-filter-menu">
            <Dropdown
                alignPoints={ALIGN_POINTS}
                closeOnParentScroll
                closeOnOutsideClick
                shouldTrapFocus
                autofocusOnOpen
                renderButton={({
                    toggleDropdown,
                    isOpen: dropdownIsOpen,
                    ariaAttributes,
                    accessibilityConfig,
                }) => (
                    <FilterMenuButton
                        isOpen={dropdownIsOpen}
                        onClick={toggleDropdown}
                        ariaAttributes={ariaAttributes}
                        accessibilityConfig={accessibilityConfig}
                    />
                )}
                renderBody={({ closeDropdown, ariaAttributes }) => {
                    return (
                        <FilterMenuDropdownBody
                            showSelectionTypeSection={showSelectionTypeSection}
                            showDisplayForms={showDisplayForms}
                            selectionTypeListboxItems={selectionTypeListboxItems}
                            selectedSelectionTypeItemId={selectedSelectionTypeItemId}
                            onSelectionTypeSelect={(item) => {
                                handleOptionClick(item.data.selectionType);
                            }}
                            labelListboxItems={labelListboxItems}
                            selectedLabelItemId={selectedLabelItemId}
                            onLabelSelect={(item) => {
                                handleDisplayFormClick(item.data.labelRef);
                            }}
                            closeDropdown={closeDropdown}
                            ariaAttributes={ariaAttributes}
                            selectionTitle={intl.formatMessage({
                                id: "attributeFilter.selectionType.selection",
                            })}
                            selectionTooltip={intl.formatMessage({
                                id: "attributeFilter.selectionType.selection.tooltip",
                            })}
                            valuesAsTitle={intl.formatMessage({
                                id: "attributeFilter.selectionType.valuesAs",
                            })}
                            valuesAsTooltip={intl.formatMessage({
                                id: "attributeFilter.selectionType.valuesAs.tooltip",
                            })}
                            hideTooltips={hideTooltips}
                        />
                    );
                }}
            />
        </div>
    );
}
