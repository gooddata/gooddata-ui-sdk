// (C) 2026 GoodData Corporation

import {
    type KeyboardEvent as ReactKeyboardEvent,
    type ReactNode,
    createContext,
    useCallback,
    useContext,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    FloatingFocusManager,
    FloatingOverlay,
    FloatingPortal,
    useDismiss,
    useFloating,
    useInteractions,
} from "@floating-ui/react";

import { ConditionalScopedThemeProvider } from "@gooddata/sdk-ui-theme-provider";

import { useOverlayZIndexWithRegister } from "../../Overlay/OverlayContext.js";
import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { bem } from "../@utils/bem.js";

const { b, e } = bem("gd-ui-kit-modal-dialog");

interface IUiDialogContext {
    titleId: string;
    descriptionId: string;
    /**
     * Called by `UiDialogBody` from `useLayoutEffect` on mount; returns a
     * cleanup to call on unmount. The modal counts mounted bodies so
     * `aria-describedby` is set when at least one body is rendered and
     * cleared when the last one unmounts.
     */
    registerBody: () => () => void;
}

const UiDialogContext = createContext<IUiDialogContext | null>(null);

/**
 * @internal
 */
export function useUiDialogContext(): IUiDialogContext | null {
    return useContext(UiDialogContext);
}

/**
 * @internal
 */
export interface IUiModalDialogProps {
    /** Dialog content composed by the caller — typically `UiDialogHeader`,
     *  an optional `UiDialogBody`, and `UiDialogFooter`. */
    children: ReactNode;
    /** Whether the modal is shown. */
    isOpen: boolean;
    /** Fires when the user dismisses via Esc, backdrop click, or `onClose` from inside. */
    onClose: () => void;
    /** Card width in px. Defaults to 540. */
    width?: number;
    /**
     * Overrides for the dialog landmark's accessible name. Usually unnecessary —
     * the landmark auto-wires `aria-labelledby` to the `UiDialogHeader` title
     * via context. For headerless dialogs, pass `ariaLabel`; to point at an
     * external title, pass `ariaLabelledBy`.
     */
    accessibilityConfig?: Pick<IAccessibilityConfigBase, "ariaLabel" | "ariaLabelledBy">;
    /** Test id forwarded to the overlay element. */
    dataTestId?: string;
}

/**
 * Modal dialog — portal, dimmed backdrop, card chrome (radius, shadow, fill,
 * padding), focus management, dismiss-on-outside / Esc, and the dialog
 * landmark (`role="dialog"`, `aria-modal="true"`). Compose `UiDialogHeader`,
 * an optional `UiDialogBody`, and `UiDialogFooter` as children.
 *
 * @internal
 */
export function UiModalDialog({
    children,
    isOpen,
    onClose,
    width,
    accessibilityConfig,
    dataTestId,
}: IUiModalDialogProps) {
    if (!isOpen) {
        return null;
    }
    return (
        <OpenModalDialog
            onClose={onClose}
            width={width}
            accessibilityConfig={accessibilityConfig}
            dataTestId={dataTestId}
        >
            {children}
        </OpenModalDialog>
    );
}

/**
 * Inner body — only mounted while the modal is open so the z-index slot is
 * reserved for the open lifetime only. Splitting this out matters because
 * `useOverlayZIndexWithRegister` registers in a mount effect.
 */
function OpenModalDialog({
    children,
    onClose,
    width = 540,
    accessibilityConfig,
    dataTestId,
}: {
    children: ReactNode;
    onClose: () => void;
    width?: number;
    accessibilityConfig?: IUiModalDialogProps["accessibilityConfig"];
    dataTestId?: string;
}) {
    const zIndex = useOverlayZIndexWithRegister();
    const titleId = useId();
    const descriptionId = useId();
    // Ref-counted so multiple UiDialogBody siblings + dynamic mount/unmount
    // (multi-step cards, conditional descriptions) keep `aria-describedby` in
    // sync with whether a description element is actually rendered.
    const [bodyCount, setBodyCount] = useState(0);
    const registerBody = useCallback(() => {
        setBodyCount((n) => n + 1);
        return () => setBodyCount((n) => n - 1);
    }, []);
    const hasBody = bodyCount > 0;

    const { refs, context } = useFloating({
        open: true,
        onOpenChange: (open) => {
            if (!open) {
                onClose();
            }
        },
    });

    // Prefer a deliberate `autoFocus` target (e.g. `UiConfirmDialogCard`'s
    // Cancel button) over `FloatingFocusManager`'s default of first-tabbable
    // — which would land focus on the header close icon and break the safe
    // initial keyboard target for confirm dialogs. We resolve the target via
    // a callback ref on the floating element so the lookup happens before
    // `FloatingFocusManager` reads `initialFocusRef.current` on mount.
    // When no `[autofocus]` child exists we leave the ref null and pass
    // `undefined` to `FloatingFocusManager` so it uses its default
    // first-tabbable behavior — passing a ref whose `.current` is `null`
    // makes it focus the dialog card itself instead of the first action.
    const initialFocusRef = useRef<HTMLElement>(null);
    const [hasAutofocusTarget, setHasAutofocusTarget] = useState(false);
    const setFloatingRef = useCallback(
        (node: HTMLElement | null) => {
            refs.setFloating(node);
            const target = node?.querySelector<HTMLElement>("[autofocus]") ?? null;
            initialFocusRef.current = target;
            setHasAutofocusTarget(target !== null);
        },
        [refs],
    );

    const dismiss = useDismiss(context, {
        outsidePressEvent: "mousedown",
        // Nested kit floating popups (dropdowns, menus, autocomplete listbox)
        // portal their bodies outside our `refs.floating`, so a click on a
        // popup option looks like a backdrop press. Suppress dismiss when
        // the press lands inside any kit floating element (canonical kit
        // marker) or inside another floating-ui portal sibling.
        outsidePress: (event) => {
            const target = event.target as Element | null;
            if (target?.closest("[data-gd-floating-element]")) {
                return false;
            }
            const pressedPortal = target?.closest("[data-floating-ui-portal]");
            const ownPortal = refs.floating.current?.closest("[data-floating-ui-portal]");
            return !(pressedPortal && pressedPortal !== ownPortal);
        },
        // Escape is handled locally on the card (see `onKeyDown` below) so
        // that pressing Escape inside a portaled child popover dismisses the
        // popover only — not the modal underneath. floating-ui's default
        // document-level Escape listener would fire on the modal first.
        escapeKey: false,
    });
    const { getFloatingProps } = useInteractions([dismiss]);

    const onCardKeyDown = useCallback(
        (event: ReactKeyboardEvent<HTMLDivElement>) => {
            if (event.key !== "Escape" || event.defaultPrevented) {
                return;
            }
            // React events bubble through the JSX parent chain, so a keydown
            // inside a portaled child popover still reaches this handler.
            // Only act when the original target sits inside the card's DOM
            // subtree — otherwise the inner popover handles its own dismiss.
            const card = refs.floating.current;
            if (card && event.target instanceof Node && !card.contains(event.target)) {
                return;
            }
            event.stopPropagation();
            onClose();
        },
        [onClose, refs],
    );

    const ariaLabelledBy =
        accessibilityConfig?.ariaLabelledBy ?? (accessibilityConfig?.ariaLabel ? undefined : titleId);

    const dialogContextValue = useMemo(
        () => ({ titleId, descriptionId, registerBody }),
        [titleId, descriptionId, registerBody],
    );

    // Nested kit popovers/menus (UiPopover, UiTooltip, dropdowns) portal
    // out of the modal card into sibling `[data-floating-ui-portal]` nodes.
    // FloatingFocusManager defaults to `modal=true`, which treats everything
    // outside `refs.floating` as inaccessible and blocks Tab into those
    // portals. Surface them as inside elements so keyboard navigation can
    // reach the menus while the modal trap remains in effect.
    //
    // Narrow scope: snapshot the portals present at modal mount and treat
    // only later-added portals as nested. Without the snapshot, foreign
    // floating UI mounted elsewhere on the page (toasts, persistent
    // pickers) would be considered inside the trap and Tab could escape
    // the modal.
    const portalsAtMountRef = useRef<Set<Element> | null>(null);
    if (portalsAtMountRef.current === null) {
        portalsAtMountRef.current = new Set(
            Array.from(document.querySelectorAll("[data-floating-ui-portal]")),
        );
    }
    const getInsideElements = useCallback((): Element[] => {
        const snapshot = portalsAtMountRef.current ?? new Set<Element>();
        return Array.from(document.querySelectorAll("[data-floating-ui-portal]")).filter(
            (node) => !snapshot.has(node) && !node.contains(refs.floating.current),
        );
    }, [refs]);

    return (
        <FloatingPortal>
            <ConditionalScopedThemeProvider>
                <FloatingOverlay lockScroll className={b()} data-testid={dataTestId} style={{ zIndex }}>
                    <FloatingFocusManager
                        context={context}
                        initialFocus={hasAutofocusTarget ? initialFocusRef : undefined}
                        getInsideElements={getInsideElements}
                    >
                        <div
                            ref={setFloatingRef}
                            className={e("card")}
                            style={{ width }}
                            role="dialog"
                            aria-modal="true"
                            aria-label={accessibilityConfig?.ariaLabel}
                            aria-labelledby={ariaLabelledBy}
                            aria-describedby={hasBody ? descriptionId : undefined}
                            {...getFloatingProps()}
                            onKeyDown={onCardKeyDown}
                        >
                            <UiDialogContext.Provider value={dialogContextValue}>
                                {children}
                            </UiDialogContext.Provider>
                        </div>
                    </FloatingFocusManager>
                </FloatingOverlay>
            </ConditionalScopedThemeProvider>
        </FloatingPortal>
    );
}
