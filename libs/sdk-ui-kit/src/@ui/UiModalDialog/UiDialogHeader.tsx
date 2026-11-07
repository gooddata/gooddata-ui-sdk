// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { useIntl } from "react-intl";

import { commonDialogMessages } from "../../locales.js";
import { bem } from "../@utils/bem.js";
import { UiIconButton } from "../UiIconButton/UiIconButton.js";

import { useUiDialogContext } from "./UiModalDialog.js";

const { b, e } = bem("gd-ui-kit-dialog-header");

/**
 * @internal
 */
export interface IUiDialogHeaderProps {
    /** Title shown in the header. */
    title: string;
    /** Fires when the user clicks the X close button. Omit to hide the X. */
    onClose?: () => void;
    /** Optional leading slot rendered before the title (e.g. a back button). */
    leading?: ReactNode;
}

/**
 * Dialog header: optional leading slot + title + optional close X.
 *
 * @internal
 */
export function UiDialogHeader({ title, onClose, leading }: IUiDialogHeaderProps) {
    const intl = useIntl();
    const dialogContext = useUiDialogContext();
    const size = dialogContext?.size ?? "default";
    return (
        <div className={b({ size })}>
            {leading ? <span className={e("leading")}>{leading}</span> : null}
            <h2 id={dialogContext?.titleId} className={e("title", { size })}>
                {title}
            </h2>
            {onClose ? (
                // Wrapped like the leading slot so the row can be styled around it.
                <span className={e("close")}>
                    <UiIconButton
                        icon="cross"
                        variant="tertiary"
                        // 18px cross, matching the design; the tertiary box has no fill or
                        // border of its own, so only the icon size shows. On "large" size, the cross is 20px.
                        size={size === "large" ? "large" : "medium"}
                        onClick={onClose}
                        accessibilityConfig={{
                            ariaLabel: intl.formatMessage(commonDialogMessages.close),
                        }}
                    />
                </span>
            ) : null}
        </div>
    );
}
