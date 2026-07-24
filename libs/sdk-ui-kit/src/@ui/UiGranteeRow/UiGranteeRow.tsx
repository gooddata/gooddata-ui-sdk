// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { bem } from "../@utils/bem.js";
import { type GranteeAvatarKind, UiGranteeAvatar } from "../UiGranteeAvatar/UiGranteeAvatar.js";

const { b, e } = bem("gd-ui-kit-grantee-row");

/**
 * @internal
 */
export interface IUiGranteeRowProps {
    /** Visual kind — drives the avatar silhouette. */
    kind: GranteeAvatarKind;
    /** Display name shown on the first line. */
    name: string;
    /** Optional email subline shown below the name. */
    email?: string;
    /** When true, the row is visually muted to signal an in-flight save. */
    isPending?: boolean;
    /** Trailing controls slot — typically the `UiGranteeRowControls` trigger pair. */
    controls?: ReactNode;
    /** Test id forwarded to the root element. */
    dataTestId?: string;
}

/**
 * Grantee row used by the OLP share dialog. Renders avatar + name + optional
 * email subline + trailing controls slot.
 *
 * @internal
 */
export function UiGranteeRow({ kind, name, email, isPending, controls, dataTestId }: IUiGranteeRowProps) {
    return (
        <div className={b({ pending: Boolean(isPending) })} data-testid={dataTestId}>
            <UiGranteeAvatar kind={kind} decorative />
            <div className={e("text")}>
                <span className={e("name")} title={name}>
                    {name}
                </span>
                {email ? (
                    <span className={e("email")} title={email}>
                        {email}
                    </span>
                ) : null}
            </div>
            {controls}
        </div>
    );
}
