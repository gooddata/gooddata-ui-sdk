// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { useIntl } from "react-intl";

import { commonDialogMessages, olpObjectShareDialogMessages } from "../../locales.js";
import { bem } from "../@utils/bem.js";
import { UiButton } from "../UiButton/UiButton.js";
import {
    type GeneralAccessValue,
    UiGeneralAccessRadio,
} from "../UiGeneralAccessRadio/UiGeneralAccessRadio.js";
import { type GranteeAvatarKind } from "../UiGranteeAvatar/UiGranteeAvatar.js";
import { UiGranteeRow } from "../UiGranteeRow/UiGranteeRow.js";
import { UiDialogFooter } from "../UiModalDialog/UiDialogFooter.js";
import { UiDialogHeader } from "../UiModalDialog/UiDialogHeader.js";
import { UiSectionHeading } from "../UiSectionHeading/UiSectionHeading.js";

const { b, e } = bem("gd-ui-kit-object-share-dialog");

/**
 * Visual data for a single grantee row inside the dialog. The `controls`
 * slot lets the caller plug in the per-row controls (typically
 * `UiGranteeRowControls`).
 *
 * @internal
 */
export interface IUiObjectShareDialogGrantee {
    /** Stable identifier — used as the React key for the row. */
    id: string;
    /** Avatar variant. */
    kind: GranteeAvatarKind;
    /** Display name. */
    name: string;
    /** Optional email subline. */
    email?: string;
    /** When true, the row is rendered with the "Owner" tag instead of controls. */
    isOwner?: boolean;
    /** Per-row controls — usually `UiGranteeRowControls`. Owner rows leave this empty. */
    controls?: ReactNode;
}

/**
 * @internal
 */
export interface IUiObjectShareDialogCardProps {
    /** Object title shown in the header — wrapped into `Share "\{title\}"`. */
    objectTitle: string;
    /** Fires when the user clicks the header X button OR the footer Close button. */
    onClose: () => void;

    /** Grantee rows shown inside the SHARED WITH section, in render order. */
    grantees: IUiObjectShareDialogGrantee[];
    /** Fires when the user clicks the + Add link in the SHARED WITH heading. */
    onAddClick: () => void;

    /** Selected general-access option. */
    generalAccess: GeneralAccessValue;
    /** Fires when the user picks a different general-access option. */
    onGeneralAccessChange: (value: GeneralAccessValue) => void;
    /**
     * Optional slot rendered next to the "All workspace members" row — typically a
     * `UiGranteeRowControls` pair for the workspace-wide labels picker
     * and permission level.
     */
    workspaceControls?: ReactNode;

    /** Test id forwarded to the root element. */
    dataTestId?: string;
}

/**
 * Object share dialog card — header, grantee list, general-access radio,
 * footer Close button. Renders inline as a plain card. For modal behavior
 * (portal, backdrop, focus trap, dismiss), use `UiObjectShareDialog`
 * which wraps this in `UiModalDialog`.
 *
 * @internal
 */
export function UiObjectShareDialogCard({
    objectTitle,
    onClose,
    grantees,
    onAddClick,
    generalAccess,
    onGeneralAccessChange,
    workspaceControls,
    dataTestId,
}: IUiObjectShareDialogCardProps) {
    const intl = useIntl();
    const dialogTitle = intl.formatMessage(olpObjectShareDialogMessages.title, { title: objectTitle });
    return (
        <div className={b()} data-testid={dataTestId}>
            <UiDialogHeader title={dialogTitle} onClose={onClose} />

            <UiSectionHeading
                label={intl.formatMessage(olpObjectShareDialogMessages.sharedWith)}
                action={
                    <UiButton
                        label={intl.formatMessage(olpObjectShareDialogMessages.add)}
                        variant="popout"
                        size="small"
                        iconBefore="plus"
                        onClick={onAddClick}
                    />
                }
            />
            <div className={e("grantees")}>
                {grantees.map((grantee) => (
                    <UiGranteeRow
                        key={grantee.id}
                        kind={grantee.kind}
                        name={grantee.name}
                        email={grantee.email}
                        isOwner={grantee.isOwner}
                        controls={grantee.controls}
                    />
                ))}
            </div>

            <UiSectionHeading label={intl.formatMessage(olpObjectShareDialogMessages.generalAccess)} />
            <UiGeneralAccessRadio
                value={generalAccess}
                onChange={onGeneralAccessChange}
                workspaceControls={workspaceControls}
            />

            <UiDialogFooter divider>
                <UiButton
                    label={intl.formatMessage(commonDialogMessages.close)}
                    variant="secondary"
                    size="medium"
                    onClick={onClose}
                />
            </UiDialogFooter>
        </div>
    );
}
