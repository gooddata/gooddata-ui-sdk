// (C) 2022-2025 GoodData Corporation
import { useRef } from "react";
import { Dropdown, useMediaQuery } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

import { useAttributeFilterComponentsContext } from "../../Context/AttributeFilterComponentsContext.js";
import { useAttributeFilterContext } from "../../Context/AttributeFilterContext.js";
import { useResolveAttributeFilterSubtitle } from "../../hooks/useResolveAttributeFilterSubtitle.js";
import { AttributeFilterButtonErrorTooltip } from "../DropdownButton/AttributeFilterButtonErrorTooltip.js";
import noop from "lodash/noop.js";

const ALIGN_POINTS = [
    { align: "bl tl" },
    { align: "tr tl" },
    { align: "br tr", offset: { x: -11 } },

    { align: "tl bl", offset: { x: 0, y: 0 } },

    { align: "tr tl", offset: { x: 0, y: -50 } },
    { align: "tr tl", offset: { x: 0, y: -100 } },
    { align: "tr tl", offset: { x: 0, y: -200 } },
    { align: "tr tl", offset: { x: 0, y: -300 } },
    { align: "tr tl", offset: { x: 0, y: -400 } },
];

/**
 * @internal
 */
export function AttributeFilterDropdown() {
    const { DropdownButtonComponent, DropdownBodyComponent, LoadingComponent, ErrorComponent } =
        useAttributeFilterComponentsContext();

    const {
        title,
        isInitializing,
        initError,
        isFiltering,
        committedSelectionElements,
        workingSelectionElements,
        onReset,
        onApply,
        onOpen,
        fullscreenOnMobile,
        isCommittedSelectionInverted,
        isWorkingSelectionInverted,
        selectionMode,
        disabled,
        customIcon,
        withoutApply,
        isSelectionInvalid,
        overlayPositionType,
    } = useAttributeFilterContext();

    const isMobile = useMediaQuery("mobileDevice");

    const isSelectionInverted = useLastValidValue(
        withoutApply ? isWorkingSelectionInverted : isCommittedSelectionInverted,
        !isSelectionInvalid || !withoutApply,
    );
    const selectionElements = useLastValidValue(
        withoutApply ? workingSelectionElements : committedSelectionElements,
        !isSelectionInvalid || !withoutApply,
    );
    const subtitle = useResolveAttributeFilterSubtitle(isSelectionInverted, selectionElements);

    const isMultiselect = selectionMode !== "single";
    const showSelectionCount = isMultiselect && selectionElements.length !== 0;

    return (
        <Dropdown
            className="gd-attribute-filter__next"
            closeOnParentScroll={true}
            closeOnMouseDrag={true}
            closeOnOutsideClick={true}
            enableEventPropagation={true}
            alignPoints={ALIGN_POINTS}
            fullscreenOnMobile={fullscreenOnMobile}
            autofocusOnOpen
            overlayPositionType={overlayPositionType}
            renderButton={({ toggleDropdown, isOpen, buttonRef, dropdownId }) => {
                const handleClickAction = disabled ? noop : toggleDropdown;
                return (
                    <div className={cx({ "gd-is-mobile": fullscreenOnMobile && isMobile && isOpen })}>
                        {!!isInitializing && <LoadingComponent onClick={handleClickAction} isOpen={isOpen} />}
                        {!isInitializing && !!initError && !title && (
                            <ErrorComponent message={initError.message} error={initError} />
                        )}
                        {!isInitializing && !!title && (
                            <AttributeFilterButtonErrorTooltip errorMessage={initError?.message}>
                                <DropdownButtonComponent
                                    title={title}
                                    subtitle={subtitle}
                                    isFiltering={isFiltering}
                                    isLoaded={!isInitializing}
                                    isLoading={isInitializing}
                                    isOpen={isOpen}
                                    selectedItemsCount={selectionElements.length}
                                    showSelectionCount={showSelectionCount}
                                    disabled={disabled}
                                    customIcon={customIcon}
                                    onClick={handleClickAction}
                                    isError={!!initError}
                                    buttonRef={buttonRef}
                                    dropdownId={dropdownId}
                                />
                            </AttributeFilterButtonErrorTooltip>
                        )}
                    </div>
                );
            }}
            onOpenStateChanged={(isOpen) => {
                if (!isOpen) {
                    onReset();
                } else {
                    onOpen();
                }
            }}
            renderBody={({ closeDropdown, ariaAttributes }) => (
                <div
                    role="dialog"
                    id={ariaAttributes.id}
                    className={cx({ "gd-is-mobile": fullscreenOnMobile && isMobile })}
                    style={{ height: fullscreenOnMobile && isMobile ? "100%" : "auto" }}
                >
                    <DropdownBodyComponent
                        onApplyButtonClick={() => {
                            onApply(true, withoutApply);
                            closeDropdown();
                        }}
                        onCancelButtonClick={closeDropdown}
                    />
                </div>
            )}
        />
    );
}

function useLastValidValue<T>(value: T, isValid: boolean): T {
    const lastValidValue = useRef<T | null>(null);
    if (isValid) {
        lastValidValue.current = value;
    }
    return lastValidValue.current ?? value;
}
