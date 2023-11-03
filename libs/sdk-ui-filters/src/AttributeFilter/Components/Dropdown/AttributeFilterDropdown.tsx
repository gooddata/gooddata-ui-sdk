// (C) 2022-2023 GoodData Corporation
import React from "react";
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
export const AttributeFilterDropdown: React.VFC = () => {
    const { DropdownButtonComponent, DropdownBodyComponent, LoadingComponent, ErrorComponent } =
        useAttributeFilterComponentsContext();

    const {
        title,
        isInitializing,
        initError,
        isFiltering,
        committedSelectionElements,
        onReset,
        onApply,
        onOpen,
        fullscreenOnMobile,
        isCommittedSelectionInverted,
        selectionMode,
        disabled,
        customIcon,
    } = useAttributeFilterContext();

    const isMobile = useMediaQuery("mobileDevice");

    const subtitle = useResolveAttributeFilterSubtitle(
        isCommittedSelectionInverted,
        committedSelectionElements,
    );

    const isMultiselect = selectionMode !== "single";
    const showSelectionCount = isMultiselect && committedSelectionElements.length !== 0;

    return (
        <Dropdown
            className="gd-attribute-filter__next"
            closeOnParentScroll={true}
            closeOnMouseDrag={true}
            closeOnOutsideClick={true}
            enableEventPropagation={true}
            alignPoints={ALIGN_POINTS}
            fullscreenOnMobile={fullscreenOnMobile}
            renderButton={({ toggleDropdown, isOpen }) => {
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
                                    selectedItemsCount={committedSelectionElements.length}
                                    showSelectionCount={showSelectionCount}
                                    disabled={disabled}
                                    customIcon={customIcon}
                                    onClick={handleClickAction}
                                    isError={!!initError}
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
            renderBody={({ closeDropdown }) => (
                <div
                    className={cx({ "gd-is-mobile": fullscreenOnMobile && isMobile })}
                    style={{ height: fullscreenOnMobile && isMobile ? "100%" : "auto" }}
                >
                    <DropdownBodyComponent
                        onApplyButtonClick={() => {
                            onApply();
                            closeDropdown();
                        }}
                        onCancelButtonClick={closeDropdown}
                    />
                </div>
            )}
        />
    );
};
