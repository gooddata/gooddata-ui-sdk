// (C) 2020-2026 GoodData Corporation

import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";

import { useIntl } from "react-intl";

import { objRefToString } from "@gooddata/sdk-model";
import {
    LoadingMask,
    Overlay,
    OverlayController,
    OverlayControllerProvider,
    useMediaQuery,
} from "@gooddata/sdk-ui-kit";

import { insightEditorOpened } from "../../model/events/insightEditor.js";
import { useDashboardDispatch, useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { useDashboardEventDispatch } from "../../model/react/useDashboardEventDispatch.js";
import { selectEnableInsightEditing } from "../../model/store/config/configSelectors.js";
import { uiActions } from "../../model/store/ui/index.js";
import { selectInsightEditorTarget } from "../../model/store/ui/uiSelectors.js";
import { type InsightEditorTarget } from "../../model/types/insightEditorTypes.js";

import { isInsightOverlayTopmost } from "./insightEditorEscapeGuard.js";
import { type IInsightEditorCloseHandle } from "./types.js";
import { useInsightEditorSession } from "./useInsightEditorSession.js";

// Analytical Designer downloads when the editor first opens, not with the dashboard.
const LazyInsightEditorContent = lazy(() =>
    import("./InsightEditorContent.js").then((module) => ({ default: module.InsightEditorContent })),
);

// AD renders the configuration panels of visualizations in a separate React root, so the overlays it
// opens from there (dropdowns, color pickers) see no OverlayControllerProvider and fall back to the
// ui-kit default z-index 5001. The editor overlay must not paint above them: its controller base 5000
// gives it 5001 too, and the config panel popups win by DOM order.
const overlayController = OverlayController.getInstance(5000);

/**
 * The embedded Analytical Designer on top of the dashboard. It renders only when the dashboard config
 * enables insight editing.
 */
export function InsightEditorOverlay() {
    const isEnabled = useDashboardSelector(selectEnableInsightEditing);
    return isEnabled ? <InsightEditorOverlayCore /> : null;
}

function InsightEditorOverlayCore() {
    const dispatch = useDashboardDispatch();
    const target = useDashboardSelector(selectInsightEditorTarget);
    const isMobile = useMediaQuery("mobileDevice");

    // The editor has no mobile layout, so it does not open on a mobile screen. A breakpoint change
    // after the editor opened keeps it open: an unmount would drop the editing session silently.
    const [openedTarget, setOpenedTarget] = useState({ target, isMobile });
    if (openedTarget.target !== target) {
        setOpenedTarget({ target, isMobile });
    }
    const isBlocked = openedTarget.target === target ? openedTarget.isMobile : isMobile;

    useEffect(() => {
        if (target && isBlocked) {
            dispatch(uiActions.closeInsightEditor());
        }
    }, [dispatch, target, isBlocked]);

    if (!target || isBlocked) {
        return null;
    }
    // Each target gets its own session, so an open of another target never reuses its state.
    return <InsightEditorModal key={getTargetKey(target)} target={target} />;
}

function getTargetKey(target: InsightEditorTarget): string {
    return target.type === "widget" || target.type === "insight"
        ? `${target.type}:${objRefToString(target.ref)}`
        : target.type;
}

function InsightEditorModal({ target }: { target: InsightEditorTarget }) {
    const eventDispatch = useDashboardEventDispatch();
    const session = useInsightEditorSession(target);
    const closeHandleRef = useRef<IInsightEditorCloseHandle | null>(null);
    const intl = useIntl();

    useEffect(() => {
        eventDispatch(insightEditorOpened(target));
    }, [eventDispatch, target]);

    // No focus trap: Analytical Designer portals its dropdowns and dialogs to the body, out of the
    // modal. The dialog takes the focus when it mounts, and the focus returns when the editor closes.
    // The render reads the prior focus: the ref callback moves it before any effect runs.
    const [previouslyFocused] = useState(() => document.activeElement);
    const focusDialog = useCallback((dialog: HTMLDivElement | null) => {
        dialog?.focus({ preventScroll: true });
    }, []);
    useEffect(() => {
        return () => {
            if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
                previouslyFocused.focus();
            }
        };
    }, [previouslyFocused]);

    // Before the AD chunk loads, or when AD fails to start, nothing can confirm the cancellation.
    const requestClose = useCallback(() => {
        if (closeHandleRef.current) {
            closeHandleRef.current.requestClose();
        } else {
            session.cancel();
        }
    }, [session]);

    // The Overlay closeOnEscape listens on window with no stack awareness. An Escape meant for nested
    // AD UI (a filter dropdown, the save dialog) would cancel the whole editing session. Close only
    // when this overlay is the topmost one, so Escape peels one layer per press.
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isInsightOverlayTopmost()) {
                requestClose();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [requestClose]);

    return (
        <OverlayControllerProvider overlayController={overlayController}>
            <Overlay
                containerClassName="gd-insight-editor-overlay"
                className="gd-edit-insight-modal-overlay"
                isModal
                // closeOnOutsideClick stops the propagation of the document mousedowns inside the
                // overlay. AD registers its drag-start listener in the capture phase to survive it.
                closeOnOutsideClick
                closeOnEscape={false}
                ignoreClicksOnByClass={[".s-sort-direction-arrow", ".dash-content"]}
                onClose={requestClose}
                shouldCloseOnClick={isNotBodyClick}
                positionType="fixed"
            >
                <div
                    ref={focusDialog}
                    tabIndex={-1}
                    className="gd-edit-insight-overlay-content s-edit-insight-overlay-content overlay-move-left"
                    role="dialog"
                    aria-modal="true"
                    aria-label={intl.formatMessage({ id: "insightEditor.dialog.label" })}
                >
                    <Suspense fallback={<LoadingMask height="100%" />}>
                        <LazyInsightEditorContent
                            target={target}
                            session={session}
                            closeHandleRef={closeHandleRef}
                        />
                    </Suspense>
                </div>
            </Overlay>
        </OverlayControllerProvider>
    );
}

// The menu item that opens the overlay leaves the DOM during the click, so the browser retargets the
// rest of that click to bare <body>. A click meant to close the overlay lands on a real element (the
// modal mask or a dashboard node), never on bare <body>.
function isNotBodyClick(e: Event): boolean {
    return e.target !== document.body;
}
