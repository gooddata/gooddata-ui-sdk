// (C) 2007-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { type IAttributeDisplayFormMetadataObject, type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { Dropdown, type IAlignPoint } from "@gooddata/sdk-ui-kit";

import { FilterModeMenuButton } from "./FilterModeMenuButton.js";
import { FilterModeMenuItem } from "./FilterModeMenuItem.js";
import { FilterModeMenuLabelItem } from "./FilterModeMenuLabelItem.js";
import { type AttributeFilterMode } from "../../filterModeTypes.js";

/**
 * Props for FilterModeMenu component.
 *
 * @alpha
 */
export interface IFilterModeMenuProps {
    /**
     * Current filter mode
     */
    currentMode: AttributeFilterMode;

    /**
     * Available filter modes
     */
    availableModes?: AttributeFilterMode[];

    /**
     * Callback when mode is selected
     */
    onModeChange: (mode: AttributeFilterMode) => void;

    /**
     * Labels for "Values as" section.
     * When more than one, the section is shown.
     */
    labels?: IAttributeDisplayFormMetadataObject[];

    /**
     * Currently selected label ref.
     */
    selectedLabelRef?: ObjRef;

    /**
     * Callback when label is selected.
     */
    onLabelChange?: (labelRef: ObjRef) => void;
}

const ALIGN_POINTS: IAlignPoint[] = [{ align: "bl tl" }, { align: "tl bl" }];

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
    } = props;

    // Simplified: just 2 options per Figma design
    const allOptions: AttributeFilterMode[] = ["elements", "text"];

    // Filter options based on available modes
    const visibleOptions = allOptions.filter((mode) => availableModes.includes(mode));
    const showModeSection = visibleOptions.length > 1;
    const showDisplayForms = labels.length > 1;
    const hasMenuContent = showModeSection || showDisplayForms;

    const handleOptionClick = (mode: AttributeFilterMode, closeDropdown: () => void) => {
        onModeChange(mode);
        closeDropdown();
    };

    const handleDisplayFormClick = (displayFormRef: ObjRef, closeDropdown: () => void) => {
        onDisplayFormChange?.(displayFormRef);
        closeDropdown();
    };

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
                renderButton={({ toggleDropdown, isOpen: dropdownIsOpen }) => (
                    <FilterModeMenuButton isOpen={dropdownIsOpen} onClick={toggleDropdown} />
                )}
                renderBody={({ closeDropdown }) => (
                    <div className="gd-filter-mode-menu__dropdown">
                        {showModeSection ? (
                            <>
                                <div className="gd-filter-mode-menu__section">
                                    <div className="gd-filter-mode-menu__section-label">
                                        <span className="gd-filter-mode-menu__section-text">
                                            <FormattedMessage id="attributeFilter.mode.selection" />
                                        </span>
                                        {/* TODO: NEN CQ-2014 follow-up - add tooltip once final texts are ready */}
                                        {/* <UiTooltip
                                            anchor={
                                                <span
                                                    className="gd-filter-mode-menu__section-icon"
                                                    aria-hidden="true"
                                                >
                                                    <UiIconButton
                                                        icon="question"
                                                        size="xsmall"
                                                        variant="tertiary"
                                                        iconColor="complementary-7"
                                                        dataTestId="attribute-filter-details-trigger"
                                                    />
                                                </span>
                                            }
                                            content={
                                                <FormattedMessage id="attributeFilter.mode.selection.tooltip" />
                                            }
                                            triggerBy={["hover", "focus"]}
                                            arrowPlacement="left"
                                        /> */}
                                    </div>
                                </div>
                                {visibleOptions.map((mode) => {
                                    const isSelected = mode === currentMode;

                                    return (
                                        <FilterModeMenuItem
                                            key={mode}
                                            mode={mode}
                                            isSelected={isSelected}
                                            onClick={() => handleOptionClick(mode, closeDropdown)}
                                        />
                                    );
                                })}
                            </>
                        ) : null}
                        {showModeSection && showDisplayForms ? (
                            <div className="gd-filter-mode-menu__divider" />
                        ) : null}
                        {showDisplayForms ? (
                            <>
                                <div className="gd-filter-mode-menu__section">
                                    <div className="gd-filter-mode-menu__section-label">
                                        <span className="gd-filter-mode-menu__section-text">
                                            <FormattedMessage id="attributeFilter.mode.valuesAs" />
                                        </span>
                                        {/* TODO: NEN CQ-2014 follow-up - add tooltip once final texts are ready */}
                                        {/* <UiTooltip
                                            anchor={
                                                <span
                                                    className="gd-filter-mode-menu__section-icon"
                                                    aria-hidden="true"
                                                >
                                                    <UiIconButton
                                                        icon="question"
                                                        size="xsmall"
                                                        variant="tertiary"
                                                        iconColor="complementary-7"
                                                        dataTestId="attribute-filter-details-trigger"
                                                    />
                                                </span>
                                            }
                                            content={
                                                <FormattedMessage id="attributeFilter.mode.valuesAs.tooltip" />
                                            }
                                            triggerBy={["hover", "focus"]}
                                            arrowPlacement="left"
                                        /> */}
                                    </div>
                                </div>
                                {labels.map((label) => {
                                    const isSelected =
                                        !!selectedLabelRef && areObjRefsEqual(label.ref, selectedLabelRef);

                                    return (
                                        <FilterModeMenuLabelItem
                                            key={label.id}
                                            label={label}
                                            isSelected={isSelected}
                                            onClick={() => handleDisplayFormClick(label.ref, closeDropdown)}
                                        />
                                    );
                                })}
                            </>
                        ) : null}
                    </div>
                )}
            />
        </div>
    );
}
