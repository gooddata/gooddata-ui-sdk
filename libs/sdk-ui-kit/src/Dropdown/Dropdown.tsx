// (C) 2007-2025 GoodData Corporation
import React, { useState, useCallback, useEffect, useRef } from "react";
import noop from "lodash/noop.js";

import { FullScreenOverlay, Overlay } from "../Overlay/index.js";
import { useMediaQuery } from "../responsive/useMediaQuery.js";
import { IAlignPoint } from "../typings/positioning.js";
import { OverlayPositionType } from "../typings/overlay.js";
import { useId } from "../utils/useId.js";
import { UiFocusTrap } from "../@ui/UiFocusTrap/UiFocusTrap.js";

const SCROLLBAR_SELECTOR = ".fixedDataTableLayout_main .ScrollbarLayout_main";
const MOBILE_DROPDOWN_ALIGN_POINTS: IAlignPoint[] = [
    {
        align: "tl tl",
    },
];

/**
 * Element.matches is only supported via prefix in IE11 and Edge.
 */
function matches(element: Element, selector: string): boolean {
    const matchesImpl = element.matches ?? (element as any).msMatchesSelector;
    return matchesImpl.call(element, selector);
}

/**
 * Prevent the overlay from closing when scrolling and finishing
 * with a cursor position outside of the overlay.
 */
function shouldCloseOnClick(e: Event) {
    const activeElement = document.activeElement ?? (e.target as Element);

    if (!activeElement) {
        return false;
    }

    const hasScrolled = matches(activeElement, SCROLLBAR_SELECTOR);

    return !hasScrolled;
}

/**
 * @internal
 */
export interface IDropdownButtonRenderProps {
    isMobile: boolean;
    isOpen: boolean;
    dropdownId: string;
    buttonRef: React.MutableRefObject<HTMLElement | null>;
    openDropdown: () => void;
    closeDropdown: () => void;
    toggleDropdown: () => void;
}

/**
 * @internal
 */
export interface IDropdownBodyRenderProps {
    isMobile: boolean;
    closeDropdown: () => void;
}

/**
 * @internal
 */
export interface IDropdownProps {
    renderBody: (props: IDropdownBodyRenderProps) => React.ReactNode;

    renderButton: (props: IDropdownButtonRenderProps) => React.ReactNode;

    openOnInit?: boolean;

    className?: string;

    alignPoints?: IAlignPoint[];

    closeOnMouseDrag?: boolean;
    closeOnOutsideClick?: boolean;
    closeOnParentScroll?: boolean;

    ignoreClicksOnByClass?: string[];

    onOpenStateChanged?: (isOpen: boolean) => void;

    overlayPositionType?: OverlayPositionType;
    overlayZIndex?: number;

    /**
     * Should the dropdown body be fullscreen on smaller screens? Defaults to true.
     */
    fullscreenOnMobile?: boolean;

    enableEventPropagation?: boolean;

    closeOnEscape?: boolean;

    autofocusOnOpen?: boolean;
}

/**
 * @internal
 */
interface IDropdownState {
    isOpen: boolean;
}

/**
 * @internal
 */
export const Dropdown: React.FC<IDropdownProps> = (props) => {
    const {
        className,

        openOnInit,
        closeOnParentScroll,
        closeOnMouseDrag,
        closeOnOutsideClick = true,

        overlayPositionType,
        alignPoints = [
            {
                align: "bl tl",
            },
        ],

        overlayZIndex,
        ignoreClicksOnByClass = [],

        renderBody,
        renderButton,

        onOpenStateChanged,

        fullscreenOnMobile = true,
        enableEventPropagation = false,
        closeOnEscape = false,
        autofocusOnOpen = false,
    } = props;
    const [{ isOpen }, setState] = useState<IDropdownState>({
        isOpen: !!openOnInit,
    });

    const id = useId();
    const dropdownId = `dropdown-${id}`;

    const _renderButton = (renderProps: IDropdownButtonRenderProps) => (
        <div className={dropdownId}>{renderButton(renderProps)}</div>
    );

    const toggleDropdown = useCallback((): void => {
        setState((state) => ({
            ...state,
            isOpen: !state.isOpen,
        }));
    }, []);

    const closeDropdown = useCallback((): void => {
        setState((state) => ({
            ...state,
            isOpen: false,
        }));
    }, []);

    const openDropdown = useCallback((): void => {
        setState((state) => ({
            ...state,
            isOpen: true,
        }));
    }, []);

    const mountRef = useRef(false);

    const buttonRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (mountRef.current && onOpenStateChanged) {
            onOpenStateChanged(isOpen);
        }
        return () => {
            mountRef.current = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const renderButtonProps = {
        isOpen: isOpen,
        openDropdown: openDropdown,
        closeDropdown: closeDropdown,
        toggleDropdown: toggleDropdown,
        dropdownId,
    };

    const isMobileDevice = useMediaQuery("mobileDevice");

    const renderDropdown =
        isOpen &&
        (fullscreenOnMobile && isMobileDevice ? (
            <FullScreenOverlay alignTo="body" alignPoints={MOBILE_DROPDOWN_ALIGN_POINTS}>
                <div className="gd-mobile-dropdown-overlay overlay gd-flex-row-container">
                    <div className="gd-mobile-dropdown-header gd-flex-item">
                        {_renderButton({
                            ...renderButtonProps,
                            isMobile: true,
                            buttonRef,
                        })}
                    </div>

                    <div className="gd-mobile-dropdown-content gd-flex-item-stretch gd-flex-row-container">
                        {renderBody({
                            closeDropdown,
                            isMobile: true,
                        })}
                    </div>
                </div>
            </FullScreenOverlay>
        ) : (
            <Overlay
                alignTo={`.${dropdownId}`}
                positionType={overlayPositionType}
                alignPoints={alignPoints}
                closeOnOutsideClick={closeOnOutsideClick}
                closeOnMouseDrag={closeOnMouseDrag}
                closeOnParentScroll={closeOnParentScroll}
                closeOnEscape={closeOnEscape}
                shouldCloseOnClick={shouldCloseOnClick}
                ignoreClicksOnByClass={ignoreClicksOnByClass}
                onClose={closeDropdown}
                // Overlay prevents event propagation by default using defaultProps for these
                onClick={enableEventPropagation ? noop : undefined}
                onMouseOver={enableEventPropagation ? noop : undefined}
                onMouseUp={enableEventPropagation ? noop : undefined}
                zIndex={overlayZIndex}
            >
                <UiFocusTrap returnFocusTo={buttonRef} autofocusOnOpen={autofocusOnOpen}>
                    <div className="overlay dropdown-body" id={dropdownId}>
                        {renderBody({
                            closeDropdown,
                            isMobile: false,
                        })}
                    </div>
                </UiFocusTrap>
            </Overlay>
        ));

    return (
        <div className={className}>
            {_renderButton({
                ...renderButtonProps,
                isMobile: false,
                buttonRef,
            })}
            {renderDropdown}
        </div>
    );
};
