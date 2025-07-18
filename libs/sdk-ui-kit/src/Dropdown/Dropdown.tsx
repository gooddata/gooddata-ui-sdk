// (C) 2007-2025 GoodData Corporation
import {
    MutableRefObject,
    RefObject,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    ComponentType,
} from "react";
import noop from "lodash/noop.js";

import { FullScreenOverlay, Overlay } from "../Overlay/index.js";
import { useMediaQuery } from "../responsive/useMediaQuery.js";
import { IAlignPoint } from "../typings/positioning.js";
import { OverlayPositionType } from "../typings/overlay.js";
import { useId } from "../utils/useId.js";
import { usePropState } from "@gooddata/sdk-ui";
import { DropdownButtonKeyboardWrapper } from "./DropdownButtonKeyboardWrapper.js";
import { IButtonAccessibilityConfig } from "../Button/index.js";
import { UiFocusManager } from "../@ui/UiFocusManager/UiFocusManager.js";
import { resolveRef } from "../@ui/UiFocusManager/utils.js";
import { IDropdownAriaAttributes, UiListboxAriaAttributes } from "../@ui/@types/dropdown.js";

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
    buttonRef: MutableRefObject<HTMLElement | null>;
    openDropdown: () => void;
    closeDropdown: () => void;
    toggleDropdown: (desiredState?: boolean | unknown) => void;
    /**
     * Props supporting accessibility that can be just passed through to the rendered element
     */
    ariaAttributes: UiListboxAriaAttributes;
    /**
     * Props supporting accessibility that can be passed down to a <Button/>
     */
    accessibilityConfig: Pick<IButtonAccessibilityConfig, "role" | "isExpanded" | "popupId" | "ariaLabel">;
}

/**
 * @internal
 */
export interface IDropdownBodyRenderProps {
    isMobile: boolean;
    closeDropdown: () => void;
    ariaAttributes: IDropdownAriaAttributes;
}

/**
 * @internal
 */
export interface IDropdownProps {
    renderBody: ComponentType<IDropdownBodyRenderProps> | ((props: IDropdownBodyRenderProps) => ReactNode);

    renderButton:
        | ComponentType<IDropdownButtonRenderProps>
        | ((props: IDropdownButtonRenderProps) => ReactNode);

    isOpen?: boolean;
    /**
     * Toggles the open state or sets the state to the desired value.
     * The `desiredState` argument's type includes `unknown` to facilitate ease of use as an event handler (`onClick={onToggle}`)
     * @param desiredState - The desired state. If not provided, the state will be toggled.
     */
    onToggle?: ((desiredState?: boolean) => void) | (() => void);

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
    initialFocus?: RefObject<HTMLElement> | string;
    returnFocusTo?: RefObject<HTMLElement> | string;

    accessibilityConfig?: {
        triggerRole?: "button" | "combobox";
        popupRole?: "listbox" | "tree" | "grid" | "dialog";
    };

    shouldTrapFocus?: boolean;
}

/**
 * @internal
 */
export function Dropdown({
    isOpen: isOpenProp,
    onToggle,

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

    renderBody: RenderBody,
    renderButton: RenderButton,

    onOpenStateChanged,

    fullscreenOnMobile = true,
    enableEventPropagation = false,
    closeOnEscape = false,
    autofocusOnOpen = false,
    initialFocus,
    returnFocusTo,

    accessibilityConfig,

    shouldTrapFocus = true,
}: IDropdownProps) {
    const [isOpen, setIsOpen] = usePropState(isOpenProp ?? openOnInit ?? false);

    const id = useId();
    const dropdownId = `dropdown-${id}`;
    const dropdownButtonId = `dropdown-button-${id}`;

    const buttonWrapperRef = useRef<HTMLElement>(null);
    const _renderButton = (renderProps: IDropdownButtonRenderProps) => (
        <DropdownButtonKeyboardWrapper
            onToggle={renderProps.toggleDropdown}
            closeOnEscape={closeOnEscape}
            isOpen={renderProps.isOpen}
            ref={buttonWrapperRef}
            id={dropdownButtonId}
        >
            <RenderButton {...renderProps} />
        </DropdownButtonKeyboardWrapper>
    );

    const toggleDropdown = useCallback(
        (desiredState?: boolean | unknown): void => {
            if (typeof desiredState === "boolean") {
                if (onToggle) {
                    onToggle(desiredState);
                } else {
                    setIsOpen(desiredState);
                }
            } else {
                if (onToggle) {
                    onToggle();
                } else {
                    setIsOpen((state) => !state);
                }
            }
        },
        [onToggle, setIsOpen],
    );

    const closeDropdown = useCallback((): void => {
        toggleDropdown(false);
    }, [toggleDropdown]);

    const openDropdown = useCallback((): void => {
        toggleDropdown(true);
    }, [toggleDropdown]);

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
    const renderButtonProps = useMemo<Omit<IDropdownButtonRenderProps, "isMobile" | "buttonRef">>(() => {
        const role = accessibilityConfig?.triggerRole ?? "button";

        return {
            isOpen,
            openDropdown,
            closeDropdown,
            toggleDropdown,
            dropdownId,
            ariaAttributes: {
                id: undefined as string,
                role,
                "aria-controls": isOpen ? dropdownId : undefined,
                "aria-expanded": isOpen,
                "aria-haspopup": accessibilityConfig?.popupRole ?? true,
            },
            accessibilityConfig: {
                role,
                popupId: dropdownId,
                isExpanded: isOpen,
            },
        };
    }, [
        accessibilityConfig?.popupRole,
        accessibilityConfig?.triggerRole,
        closeDropdown,
        dropdownId,
        isOpen,
        openDropdown,
        toggleDropdown,
    ]);

    const renderBodyProps = {
        closeDropdown,
        ariaAttributes: {
            id: dropdownId,
            "aria-labelledby": dropdownButtonId,
            role: accessibilityConfig?.popupRole ?? "dialog",
        },
    };

    const handleTabOut = useCallback(() => {
        closeDropdown();
        resolveRef(returnFocusTo)?.focus();
    }, [closeDropdown, returnFocusTo]);

    const isMobileDevice = useMediaQuery("mobileDevice");

    const renderDropdown = isOpen ? (
        fullscreenOnMobile && isMobileDevice ? (
            <FullScreenOverlay alignTo="body" alignPoints={MOBILE_DROPDOWN_ALIGN_POINTS}>
                <UiFocusManager
                    tabOutHandler={shouldTrapFocus ? undefined : handleTabOut}
                    enableFocusTrap={shouldTrapFocus}
                    enableAutofocus={autofocusOnOpen ? { initialFocus } : false}
                    enableReturnFocusOnUnmount={{ returnFocusTo }}
                >
                    <div className="gd-mobile-dropdown-overlay overlay gd-flex-row-container">
                        <div className="gd-mobile-dropdown-header gd-flex-item">
                            {_renderButton({
                                ...renderButtonProps,
                                isMobile: true,
                                buttonRef: { current: null },
                            })}
                        </div>

                        <div className="gd-mobile-dropdown-content gd-flex-item-stretch gd-flex-row-container">
                            <RenderBody {...renderBodyProps} isMobile />
                        </div>
                    </div>
                </UiFocusManager>
            </FullScreenOverlay>
        ) : (
            <Overlay
                alignTo={`#${dropdownButtonId}`}
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
                <UiFocusManager
                    tabOutHandler={shouldTrapFocus ? undefined : handleTabOut}
                    enableFocusTrap={shouldTrapFocus}
                    enableAutofocus={autofocusOnOpen ? { initialFocus } : false}
                    enableReturnFocusOnUnmount={{ returnFocusTo }}
                >
                    <div className="overlay dropdown-body">
                        <RenderBody {...renderBodyProps} isMobile={false} />
                    </div>
                </UiFocusManager>
            </Overlay>
        )
    ) : null;

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
}
