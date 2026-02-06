// (C) 2025-2026 GoodData Corporation

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
    onToggle: () => void;
}

function KdaDialogActionButtonsView(props: IKdaDialogActionButtonsViewProps) {
    const {
        size,
        status,
        isMinimized,
        expandLabel,
        titleElementId,
        shrinkLabel,
        closeLabel,
        onToggle,
        onClose,
        className,
    } = props;
    const intl = useIntl();
    const text = status && buttonMessages[status] ? intl.formatMessage(buttonMessages[status]) : "";
    const isFinished = status === "done" || status === "error";

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
                            label={text}
                            accessibilityConfig={{
                                ariaDescribedBy: titleElementId,
                            }}
                            variant="tooltip"
                            size="medium"
                            onClick={onToggle}
                        />
                    </div>
                ) : (
                    <UiIconButton
                        label={isMinimized ? expandLabel : shrinkLabel}
                        icon={isMinimized ? "expand" : "shrink"}
                        accessibilityConfig={{
                            ariaDescribedBy: titleElementId,
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
                    iconColor={isFinished ? "complementary-0" : "complementary-7"}
                />
            </div>
        </div>
    );
}
