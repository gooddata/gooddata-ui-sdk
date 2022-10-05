// (C) 2022 GoodData Corporation
import React, { useState, useLayoutEffect } from "react";
import { Dropdown, useMediaQuery, IAlignPoint } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { useAttributeFilterComponentsContext } from "../../Context/AttributeFilterComponentsContext";
import { useAttributeFilterContext } from "../../Context/AttributeFilterContext";
import { useResolveAttributeFilterSubtitle } from "../../hooks/useResolveAttributeFilterSubtitle";

import { useElementPositionChange } from "./useElementPositionChange";

const ALIGN_POINTS: IAlignPoint[] = [
    // below
    { align: "bl tl" },
    // above
    { align: "tl bl" },
];

const MIN_BODY_HEIGHT = 250;
const MAX_BODY_HEIGHT = 520;
const OFFSET = 30;

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

    const [height, setHeight] = useState<number | string>(0);
    const { ref, rect, viewport } = useElementPositionChange();

    useLayoutEffect(() => {
        if (rect) {
            if (viewport.vh - rect.bottom <= MIN_BODY_HEIGHT) {
                // Cannot be rendered below - will be rendered above
                const targetHeight = Math.min(Math.max(rect.top - OFFSET, MIN_BODY_HEIGHT), MAX_BODY_HEIGHT);
                setHeight(targetHeight);
            } else {
                // Can be rendered below
                const targetHeight = Math.min(
                    Math.max(viewport.vh - rect.bottom - OFFSET, MIN_BODY_HEIGHT),
                    MAX_BODY_HEIGHT,
                );
                setHeight(targetHeight);
            }
        }
    }, [rect, viewport]);

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
                <div className={cx({ "gd-is-mobile": fullscreenOnMobile && isMobile && isOpen })} ref={ref}>
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
                        onCancelButtonClick={closeDropdown}
                        height={height}
                    />
                </div>
            )}
        />
    );
};
