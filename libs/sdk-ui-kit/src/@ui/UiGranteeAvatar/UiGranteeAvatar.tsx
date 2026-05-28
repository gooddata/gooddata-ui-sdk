// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { olpGranteeAvatarMessages } from "../../locales.js";
import { UiAvatar } from "../UiAvatar/UiAvatar.js";

/**
 * Visual variant of a grantee avatar.
 *
 * @internal
 */
export type GranteeAvatarKind = "user" | "group";

/**
 * @internal
 */
export interface IUiGranteeAvatarProps {
    /** Visual kind — drives which silhouette is rendered. */
    kind: GranteeAvatarKind;
    /**
     * When true, the avatar is hidden from assistive tech. Use when the
     * avatar sits next to a visible name and would only duplicate that name
     * for screen-reader users (e.g. inside `UiGranteeRow`).
     */
    decorative?: boolean;
    /** Test id forwarded to the root element. */
    dataTestId?: string;
}

const ICON_BY_KIND = {
    user: "user",
    group: "users",
} as const;

/**
 * 32×32 circle avatar used by the OLP share-dialog grantee list. Thin wrapper
 * over `UiAvatar` that picks the right silhouette and i18n
 * accessibility label per grantee kind. Pass `decorative` when
 * the avatar is paired with a visible name in the same row.
 *
 * @internal
 */
export function UiGranteeAvatar({ kind, decorative, dataTestId }: IUiGranteeAvatarProps) {
    const intl = useIntl();
    if (decorative) {
        return (
            <UiAvatar
                icon={ICON_BY_KIND[kind]}
                accessibilityConfig={{ ariaHidden: true }}
                dataTestId={dataTestId}
            />
        );
    }
    const ariaLabel = intl.formatMessage(
        kind === "group" ? olpGranteeAvatarMessages.group : olpGranteeAvatarMessages.user,
    );
    return <UiAvatar icon={ICON_BY_KIND[kind]} accessibilityConfig={{ ariaLabel }} dataTestId={dataTestId} />;
}
