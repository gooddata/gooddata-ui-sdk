// (C) 2025-2026 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import { UiIconButton } from "@gooddata/sdk-ui-kit";

import { useKdaState } from "../providers/KdaState.js";

export type KdaDialogActionButtonsSize = "small" | "medium";

export interface IKdaDialogActionButtonsProps {
    size: KdaDialogActionButtonsSize;
    onClose?: () => void;
    className?: string;
}

/**
 * Renders the KDA dialog actions (expand/minimize toggle + divider + close).
 *
 * @internal
 */
export function KdaDialogActionButtons({ size, onClose, className }: IKdaDialogActionButtonsProps) {
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
            size={size}
            isMinimized={isMinimized}
            expandLabel={expandLabel}
            shrinkLabel={shrinkLabel}
            closeLabel={closeLabel}
            onToggle={handleToggle}
            onClose={onClose}
        />
    );
}

interface IKdaDialogActionButtonsViewProps extends IKdaDialogActionButtonsProps {
    isMinimized: boolean;
    expandLabel: string;
    shrinkLabel: string;
    closeLabel: string;
    onToggle: () => void;
}

function KdaDialogActionButtonsView(props: IKdaDialogActionButtonsViewProps) {
    const { size, isMinimized, expandLabel, shrinkLabel, closeLabel, onToggle, onClose, className } = props;
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
                )}
            >
                <UiIconButton
                    label={isMinimized ? expandLabel : shrinkLabel}
                    icon={isMinimized ? "expand" : "shrink"}
                    iconColor="complementary-7"
                    variant="tertiary"
                    size={size}
                    onClick={onToggle}
                />
            </div>
            <div className="gd-kda-dialog-action-buttons__divider" />
            <div
                className={cx(
                    "gd-kda-dialog-action-buttons__button",
                    "s-dialog-close-button",
                    "s-kda-dialog-close-button",
                )}
            >
                <UiIconButton
                    label={closeLabel}
                    icon="cross"
                    iconColor="complementary-7"
                    variant="tertiary"
                    size={size}
                    onClick={onClose}
                />
            </div>
        </div>
    );
}
