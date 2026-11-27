// (C) 2025-2026 GoodData Corporation

import { useCallback, useRef } from "react";

import cx from "classnames";
import { type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import { UiButton, UiIconButton } from "@gooddata/sdk-ui-kit";

import { useKdaState } from "../providers/KdaState.js";

export type KdaDialogActionButtonsSize = "small" | "medium";

export interface IKdaDialogActionButtonsProps {
    size: KdaDialogActionButtonsSize;
    // oxlint-disable-next-line typescript-eslint/no-redundant-type-constituents
    status?: "done" | "error" | string;
    titleElementId?: string;
    toggleAriaDescribedBy?: string;
    /**
     * Id of the expand / minimize toggle button.
     */
    toggleButtonId?: string;
    onClose?: () => void;
    className?: string;
}

/**
 * Renders the KDA dialog actions (expand/minimize toggle + divider + close).
 *
 * @internal
 */
export function KdaDialogActionButtons({
    size,
    onClose,
    className,
    status,
    titleElementId,
    toggleAriaDescribedBy,
    toggleButtonId,
}: IKdaDialogActionButtonsProps) {
    const intl = useIntl();
    const { state, setState } = useKdaState();
    const { isMinimized } = state;

    const expandLabel = intl.formatMessage({ id: "kdaDialog.floatingStatus.expand" });
    const shrinkLabel = intl.formatMessage({ id: "kdaDialog.floatingStatus.minimize" });
    const closeLabel = intl.formatMessage({ id: "kdaDialog.dialog.closeLabel" });

    const handleToggle = () => {
        setState({ isMinimized: !isMinimized });
    };

    return (
        <KdaDialogActionButtonsView
            className={className}
            status={status}
            size={size}
            titleElementId={titleElementId}
            toggleAriaDescribedBy={toggleAriaDescribedBy}
            toggleButtonId={toggleButtonId}
            isMinimized={isMinimized}
            expandLabel={expandLabel}
            shrinkLabel={shrinkLabel}
            closeLabel={closeLabel}
            onToggle={handleToggle}
            onClose={onClose}
        />
    );
}

// oxlint-disable-next-line typescript-eslint/no-redundant-type-constituents
const buttonMessages: Record<"done" | "error" | string, MessageDescriptor> = defineMessages({
    done: { id: "kdaDialog.floatingStatus.done.opener" },
    error: { id: "kdaDialog.floatingStatus.error.opener" },
});

interface IKdaDialogActionButtonsViewProps extends IKdaDialogActionButtonsProps {
    isMinimized: boolean;
    expandLabel: string;
    shrinkLabel: string;
    closeLabel: string;
    titleElementId?: string;
    toggleAriaDescribedBy?: string;
    onToggle: () => void;
}

/**
 * When the analysis finishes while the dialog is minimized, the toggle button is replaced
 * (the expand icon button becomes the Open button). If the replaced button had focus, move
 * focus to its replacement so keyboard users do not lose their place. Focus elsewhere is left alone.
 *
 * Focus is handed over in the same commit, as the replacement mounts. The shared autofocus
 * (`useUiAutofocusConnectors`) cannot be used here: it focuses in a later animation frame, so focus
 * would drop to the page body in between and screen readers would re-enter and re-announce the dialog.
 */
function useToggleFocusKeeper() {
    const elementRef = useRef<HTMLButtonElement | null>(null);
    const hadFocusRef = useRef(false);

    return useCallback((element: HTMLButtonElement | null) => {
        if (element) {
            elementRef.current = element;
            if (hadFocusRef.current) {
                hadFocusRef.current = false;
                element.focus();
            }
            return;
        }
        // React detaches the ref before it removes the button from the DOM, so it still has focus here.
        hadFocusRef.current = !!elementRef.current && elementRef.current === document.activeElement;
        elementRef.current = null;
    }, []);
}

function KdaDialogActionButtonsView(props: IKdaDialogActionButtonsViewProps) {
    const {
        size,
        status,
        isMinimized,
        expandLabel,
        titleElementId,
        toggleAriaDescribedBy,
        toggleButtonId,
        shrinkLabel,
        closeLabel,
        onToggle,
        onClose,
        className,
    } = props;
    const intl = useIntl();
    const text = status && buttonMessages[status] ? intl.formatMessage(buttonMessages[status]) : "";
    const isFinished = status === "done" || status === "error";
    const toggleRef = useToggleFocusKeeper();
    const toggleDescribedBy = toggleAriaDescribedBy ?? titleElementId;
    const expandedHeaderDescribedBy = isMinimized ? undefined : toggleDescribedBy;

    return (
        <div
            className={cx(
                "gd-kda-dialog-action-buttons",
                `gd-kda-dialog-action-buttons--size-${size}`,
                className,
            )}
        >
            <div
                className={cx(
                    "gd-kda-dialog-action-buttons__button",
                    isMinimized ? "s-kda-dialog-expand-button" : "s-kda-dialog-minimize-button",
                    status,
                )}
            >
                {isMinimized && isFinished ? (
                    <div className="gd-kda-dialog-action-buttons__button__open">
                        <UiButton
                            ref={toggleRef}
                            id={toggleButtonId}
                            label={text}
                            accessibilityConfig={{
                                ariaDescribedBy: toggleDescribedBy,
                            }}
                            variant="tooltip"
                            size="medium"
                            onClick={onToggle}
                        />
                    </div>
                ) : (
                    <UiIconButton
                        ref={toggleRef}
                        id={toggleButtonId}
                        label={isMinimized ? expandLabel : shrinkLabel}
                        icon={isMinimized ? "expand" : "shrink"}
                        accessibilityConfig={{
                            ariaDescribedBy: toggleDescribedBy,
                            ariaLabel: isMinimized ? expandLabel : shrinkLabel,
                        }}
                        iconColor="complementary-7"
                        variant="tertiary"
                        size={size}
                        onClick={onToggle}
                    />
                )}
            </div>
            <div className={cx("gd-kda-dialog-action-buttons__divider", status)} />
            <div
                className={cx(
                    "gd-kda-dialog-action-buttons__button",
                    "s-dialog-close-button",
                    "s-kda-dialog-close-button",
                    status,
                )}
            >
                <UiIconButton
                    label={closeLabel}
                    icon="cross"
                    variant="tertiary"
                    size={size}
                    onClick={onClose}
                    accessibilityConfig={
                        expandedHeaderDescribedBy ? { ariaDescribedBy: expandedHeaderDescribedBy } : undefined
                    }
                    iconColor={isFinished ? "complementary-0" : "complementary-7"}
                />
            </div>
        </div>
    );
}
