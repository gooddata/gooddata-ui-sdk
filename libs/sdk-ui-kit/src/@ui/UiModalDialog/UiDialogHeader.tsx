// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { useIntl } from "react-intl";

import { commonDialogMessages } from "../../locales.js";
import { bem } from "../@utils/bem.js";
import { UiIconButton } from "../UiIconButton/UiIconButton.js";

import { useUiDialogContext } from "./UiModalDialog.js";

const { b, e } = bem("gd-ui-kit-dialog-header");

/**
 * Title sizing variant.
 *
 * @internal
 */
export type DialogHeaderTitleSize = "default" | "large";

/**
 * @internal
 */
export interface IUiDialogHeaderProps {
    /** Title shown in the header. */
    title: string;
    /** Title size — `"default"` = 18/26, `"large"` = 20/26. */
    titleSize?: DialogHeaderTitleSize;
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
export function UiDialogHeader({ title, titleSize = "default", onClose, leading }: IUiDialogHeaderProps) {
    const intl = useIntl();
    const dialogContext = useUiDialogContext();
    return (
        <div className={b()}>
            {leading ? <span className={e("leading")}>{leading}</span> : null}
            <h2 id={dialogContext?.titleId} className={e("title", { size: titleSize })}>
                {title}
            </h2>
            {onClose ? (
                <UiIconButton
                    icon="cross"
                    variant="tertiary"
                    size="small"
                    onClick={onClose}
                    accessibilityConfig={{
                        ariaLabel: intl.formatMessage(commonDialogMessages.close),
                    }}
                />
            ) : null}
        </div>
    );
}
