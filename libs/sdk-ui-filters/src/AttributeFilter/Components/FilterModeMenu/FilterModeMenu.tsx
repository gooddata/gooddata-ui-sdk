// (C) 2007-2026 GoodData Corporation

import { useMemo } from "react";

import { defineMessages, useIntl } from "react-intl";

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { Dropdown, type IAlignPoint, type IUiListboxItem } from "@gooddata/sdk-ui-kit";

import { FilterModeMenuButton } from "./FilterModeMenuButton.js";
import { FilterModeMenuDropdownBody } from "./FilterModeMenuDropdownBody.js";
import { type IFilterModeMenuProps, type ILabelItemData, type IModeItemData } from "./types.js";
import { type AttributeFilterMode } from "../../filterModeTypes.js";

const ALIGN_POINTS: IAlignPoint[] = [{ align: "bl tl" }, { align: "tl bl" }];
const modeMessages = defineMessages({
    list: { id: "attributeFilter.mode.list" },
    text: { id: "attributeFilter.mode.text" },
});

/**
 * Menu for switching between different attribute filter modes.
 *
 * @alpha
 */
export function FilterModeMenu(props: IFilterModeMenuProps) {
    const {
        currentMode,
        availableModes = ["elements", "text"],
        onModeChange,
        labels = [],
        selectedLabelRef,
        onLabelChange: onDisplayFormChange,
        hideTooltips,
    } = props;
    const intl = useIntl();

    // Simplified: just 2 options per Figma design
    const allOptions: AttributeFilterMode[] = ["elements", "text"];

    // Filter options based on available modes
    const visibleOptions = allOptions.filter((mode) => availableModes.includes(mode));
    const showModeSection = visibleOptions.length > 1;
    const showDisplayForms = labels.length > 1;
    const hasMenuContent = showModeSection || showDisplayForms;

    const handleOptionClick = (mode: AttributeFilterMode) => {
        onModeChange(mode);
    };

    const handleDisplayFormClick = (displayFormRef: ObjRef) => {
        onDisplayFormChange?.(displayFormRef);
    };

    const modeListboxItems = useMemo<IUiListboxItem<IModeItemData, never>[]>(() => {
        return visibleOptions.map((mode) => ({
            type: "interactive",
            id: `mode:${mode}`,
            stringTitle: intl.formatMessage(mode === "text" ? modeMessages.text : modeMessages.list),
            data: { mode },
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

    const selectedModeItemId = useMemo(() => {
        return showModeSection && visibleOptions.includes(currentMode) ? `mode:${currentMode}` : undefined;
    }, [currentMode, showModeSection, visibleOptions]);

    if (!hasMenuContent) {
        return null;
    }

    return (
        <div className="gd-filter-mode-menu s-filter-mode-menu">
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
                    <FilterModeMenuButton
                        isOpen={dropdownIsOpen}
                        onClick={toggleDropdown}
                        ariaAttributes={ariaAttributes}
                        accessibilityConfig={accessibilityConfig}
                    />
                )}
                renderBody={({ closeDropdown, ariaAttributes }) => {
                    return (
                        <FilterModeMenuDropdownBody
                            showModeSection={showModeSection}
                            showDisplayForms={showDisplayForms}
                            modeListboxItems={modeListboxItems}
                            selectedModeItemId={selectedModeItemId}
                            onModeSelect={(item) => {
                                handleOptionClick(item.data.mode);
                            }}
                            labelListboxItems={labelListboxItems}
                            selectedLabelItemId={selectedLabelItemId}
                            onLabelSelect={(item) => {
                                handleDisplayFormClick(item.data.labelRef);
                            }}
                            closeDropdown={closeDropdown}
                            ariaAttributes={ariaAttributes}
                            selectionTitle={intl.formatMessage({ id: "attributeFilter.mode.selection" })}
                            selectionTooltip={intl.formatMessage({
                                id: "attributeFilter.mode.selection.tooltip",
                            })}
                            valuesAsTitle={intl.formatMessage({ id: "attributeFilter.mode.valuesAs" })}
                            valuesAsTooltip={intl.formatMessage({
                                id: "attributeFilter.mode.valuesAs.tooltip",
                            })}
                            hideTooltips={hideTooltips}
                        />
                    );
                }}
            />
        </div>
    );
}
