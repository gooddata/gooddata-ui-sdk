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
    /** When true, the row is visually muted to signal an in-flight save. */
    isPending?: boolean;
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
    /** Disables the + Add action — e.g. while the object's labels are still loading. */
    isAddDisabled?: boolean;

    /** Selected general-access option. */
    generalAccess: GeneralAccessValue;
    /** Fires when the user picks a different general-access option. */
    onGeneralAccessChange: (value: GeneralAccessValue) => void;
    /** Disables the general-access radio — e.g. while the access list is still loading. */
    isGeneralAccessDisabled?: boolean;
    /**
     * When true, workspace-wide access is inherited from a parent workspace and
     * cannot be revoked here: the Restricted option is disabled and explains why.
     */
    workspaceAccessInherited?: boolean;
    /**
     * Optional slot rendered next to the "All workspace members" row — typically a
     * `UiGranteeRowControls` pair for the workspace-wide labels picker
     * and permission level.
     */
    workspaceControls?: ReactNode;
    /**
     * Workspace-wide permission level, so the "All workspace members" description
     * matches the level picked in `workspaceControls`. Defaults to `view`.
     */
    workspaceLevel?: "VIEW" | "SHARE";

    /**
     * Optional error notice. When set, it replaces the grantee list and
     * general-access sections (which can't reflect a real policy on a failed
     * load), so the dialog shows why it's empty instead of a misleading
     * "restricted, no one has access".
     */
    error?: ReactNode;

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
    isAddDisabled,
    generalAccess,
    onGeneralAccessChange,
    isGeneralAccessDisabled,
    workspaceAccessInherited,
    workspaceControls,
    workspaceLevel,
    error,
    dataTestId,
}: IUiObjectShareDialogCardProps) {
    const intl = useIntl();
    const dialogTitle = intl.formatMessage(olpObjectShareDialogMessages.title, { title: objectTitle });
    return (
        <div className={b()} data-testid={dataTestId}>
            <UiDialogHeader title={dialogTitle} onClose={onClose} />

            {error ? (
                <div className={e("error")} role="alert">
                    {error}
                </div>
            ) : (
                <>
                    <UiSectionHeading
                        label={intl.formatMessage(olpObjectShareDialogMessages.sharedWith)}
                        action={
                            <UiButton
                                label={intl.formatMessage(olpObjectShareDialogMessages.add)}
                                variant="popout"
                                size="small"
                                iconBefore="plus"
                                isDisabled={isAddDisabled}
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
                                isPending={grantee.isPending}
                                controls={grantee.controls}
                            />
                        ))}
                    </div>

                    <UiSectionHeading
                        label={intl.formatMessage(olpObjectShareDialogMessages.generalAccess)}
                    />
                    <UiGeneralAccessRadio
                        value={generalAccess}
                        onChange={onGeneralAccessChange}
                        disabled={isGeneralAccessDisabled}
                        workspaceAccessInherited={workspaceAccessInherited}
                        workspaceControls={workspaceControls}
                        workspaceLevel={workspaceLevel}
                    />
                </>
            )}

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
