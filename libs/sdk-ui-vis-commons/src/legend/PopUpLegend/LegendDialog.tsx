// (C) 2007-2025 GoodData Corporation

import { FocusEventHandler, MouseEventHandler, ReactElement, ReactNode, useCallback, useRef } from "react";

import cx from "classnames";

import {
    DialogCloseButton,
    UiAutofocus,
    UiFocusTrap,
    ZOOM_THRESHOLD,
    ZoomAwareOverlay,
    useIdPrefixed,
    useIsZoomed,
    useMediaQuery,
} from "@gooddata/sdk-ui-kit";

import { legendDialogAlignPoints, legendMobileDialogAlignPoints } from "./alignPoints.js";

const LegendDialogWrapper = ({ children }: { children: (isMobile: boolean) => ReactElement }) => {
    const isMobile = useMediaQuery("<sm");
    return children(isMobile);
};

interface ILegendDialogContent {
    title: string;
    onCloseDialog: () => void;
    children?: ReactNode;
    id: string;
}

function LegendDialogContent({ title, onCloseDialog, children, id }: ILegendDialogContent) {
    const isZoomed = useIsZoomed(ZOOM_THRESHOLD);

    const dialogRef = useRef<HTMLDivElement>(null);

    const handleClose = useCallback<MouseEventHandler>(
        (e) => {
            e.preventDefault();
            onCloseDialog();
        },
        [onCloseDialog],
    );

    const handleBlur = useCallback<FocusEventHandler>(
        (e) => {
            // e.relatedTarget is the element receiving focus after the blur
            if (!dialogRef.current || dialogRef.current.contains(e.relatedTarget)) {
                return;
            }

            onCloseDialog();
        },
        [onCloseDialog],
    );

    const className = cx("legend-popup-dialog", "legend-popup-dialog-content", {
        zoomed: isZoomed,
    });

    const titleId = useIdPrefixed("legendDialogContentTitle");

    return (
        <div
            className={className}
            id={id}
            role={"dialog"}
            aria-modal={false}
            aria-labelledby={titleId}
            onBlur={handleBlur}
            ref={dialogRef}
        >
            <UiFocusTrap>
                <div className="legend-header">
                    <div className="legend-header-title" id={titleId}>
                        {title}
                    </div>
                    <DialogCloseButton
                        className={
                            "s-legend-close legend-close gd-icon-cross gd-button-link gd-button-icon-only"
                        }
                        onClose={handleClose}
                    />
                </div>
                <UiAutofocus>
                    <div className="legend-content">{children}</div>
                </UiAutofocus>
            </UiFocusTrap>
        </div>
    );
}

export interface ILegendDialogProps {
    name: string;
    isOpen: boolean;
    alignTo: string;
    onCloseDialog: () => void;
    children?: ReactNode;
    id: string;
}

export function LegendDialog({ name, children, isOpen, alignTo, onCloseDialog, id }: ILegendDialogProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <LegendDialogWrapper>
            {(isMobile) => {
                return (
                    <ZoomAwareOverlay
                        alignTo={alignTo}
                        alignPoints={isMobile ? legendMobileDialogAlignPoints : legendDialogAlignPoints}
                        closeOnOutsideClick={!isMobile}
                        onClose={onCloseDialog}
                        className="kpi-alert-dialog-overlay"
                        ensureVisibility={true}
                        closeOnEscape
                    >
                        <LegendDialogContent title={name} onCloseDialog={onCloseDialog} id={id}>
                            {children}
                        </LegendDialogContent>
                    </ZoomAwareOverlay>
                );
            }}
        </LegendDialogWrapper>
    );
}
