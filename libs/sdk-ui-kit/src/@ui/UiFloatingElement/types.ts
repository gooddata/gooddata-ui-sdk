// (C) 2025 GoodData Corporation

import { type CSSProperties, type MutableRefObject, type ReactNode, type RefObject } from "react";

import {
    type FloatingContext,
    type Middleware,
    type OffsetOptions,
    type Placement,
    type Strategy,
    type VirtualElement,
} from "@floating-ui/react";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";

/**
 * Align point specification using the legacy "bl tl" format.
 * First part is anchor point, second is floating element point.
 * Letters: t=top, b=bottom, l=left, r=right, c=center
 *
 * @example "bl tl" - anchor bottom-left to floating top-left (dropdown below)
 * @example "tl bl" - anchor top-left to floating bottom-left (dropdown above)
 *
 * @internal
 */
export interface ILegacyAlignPoint {
    align: string;
    offset?: {
        x?: number;
        y?: number;
    };
}

/**
 * Anchor element for the floating element - can be an element, ref, selector, or virtual element.
 *
 * @internal
 */
export type IFloatingAnchor = HTMLElement | RefObject<HTMLElement | null> | VirtualElement | string | null;

/**
 * Props for the UiFloatingElement component.
 *
 * @internal
 */
export interface IUiFloatingElementProps {
    children: ReactNode;
    anchor: IFloatingAnchor;
    isOpen: boolean;
    onClose?: () => void;
    placement?: Placement;
    alignPoints?: ILegacyAlignPoint[];
    strategy?: Strategy;
    offset?: OffsetOptions;
    autoFlip?: boolean;
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
    closeOnParentScroll?: boolean;
    closeOnMouseDrag?: boolean;
    ignoreClicksOn?: Array<string | HTMLElement>;
    shouldCloseOnClick?: (event: Event) => boolean;
    zIndex?: number;
    className?: string;
    contentClassName?: string;
    style?: CSSProperties;
    width?: number | "same-as-anchor" | "auto";
    maxWidth?: number | string;
    maxHeight?: number | string;
    accessibilityConfig?: IAccessibilityConfigBase;
    onPlacementChange?: (placement: Placement) => void;
}

/**
 * @internal
 */
export interface IUseFloatingPositionOptions {
    isOpen: boolean;
    onOpenChange?: (open: boolean) => void;
    placement?: Placement;
    alignPoints?: ILegacyAlignPoint[];
    strategy?: Strategy;
    offset?: OffsetOptions;
    autoFlip?: boolean;
    fallbackPlacements?: Placement[];
    arrowRef?: RefObject<SVGSVGElement | null>;
    customMiddleware?: Middleware[];
    maxWidth?: number | string;
    maxHeight?: number | string;
    zIndex?: number;
    /**
     * Padding for the shift middleware to keep the floating element away from viewport edges.
     */
    shiftPadding?: number;
}

/**
 * @internal
 */
export interface IUseFloatingPositionResult {
    refs: {
        setReference: (node: any) => void;
        setFloating: (node: HTMLElement | null) => void;
        reference: MutableRefObject<any>;
        floating: MutableRefObject<HTMLElement | null>;
    };
    floatingStyles: CSSProperties;
    placement: Placement;
    zIndex: number | undefined;
    context: FloatingContext;
    middlewareData: Record<string, any>;
}
