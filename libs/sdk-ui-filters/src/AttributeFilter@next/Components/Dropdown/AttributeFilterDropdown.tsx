// (C) 2022 GoodData Corporation
import React from "react";
import { Dropdown, useMediaQuery } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

import { useAttributeFilterComponentsContext } from "../../Context/AttributeFilterComponentsContext";
import { useAttributeFilterContext } from "../../Context/AttributeFilterContext";
import { useResolveAttributeFilterSubtitle } from "../../hooks/useResolveAttributeFilterSubtitle";

const ALIGN_POINTS = [
    { align: "bl tl" },
    { align: "tr tl" },
    { align: "br tr", offset: { x: -11 } },
    { align: "tr tl", offset: { x: 0, y: -100 } },
    { align: "tr tl", offset: { x: 0, y: -50 } },
];

/**
 * @internal
 */
export const AttributeFilterDropdown: React.VFC = () => {
    const { DropdownButtonComponent, DropdownBodyComponent } = useAttributeFilterComponentsContext();

    const {
        title,
        isInitializing,
        initError,
        isFiltering,
        committedSelectionElements,
        onReset,
        onApply,
        fullscreenOnMobile,
        isCommittedSelectionInverted,
    } = useAttributeFilterContext();

    const isMobile = useMediaQuery("mobileDevice");

    const subtitle = useResolveAttributeFilterSubtitle(
        isCommittedSelectionInverted,
        committedSelectionElements,
    );

    return (
        <Dropdown
            className="gd-attribute-filter__next"
            closeOnParentScroll={true}
            closeOnMouseDrag={true}
            closeOnOutsideClick={true}
            enableEventPropagation={true}
            alignPoints={ALIGN_POINTS}
            fullscreenOnMobile={fullscreenOnMobile}
            renderButton={({ toggleDropdown, isOpen }) => (
                <div className={cx({ "gd-is-mobile": fullscreenOnMobile && isMobile && isOpen })}>
                    <DropdownButtonComponent
                        title={title}
                        subtitle={subtitle}
                        isFiltering={isFiltering}
                        isLoaded={!isInitializing && !initError}
                        isLoading={isInitializing}
                        isOpen={isOpen}
                        selectedItemsCount={committedSelectionElements.length}
                        onClick={toggleDropdown}
                    />
                </div>
            )}
            onOpenStateChanged={(isOpen) => {
                if (!isOpen) {
                    onReset();
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
                        onCloseButtonClick={closeDropdown}
                    />
                </div>
            )}
        />
    );
};
