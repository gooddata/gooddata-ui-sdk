// (C) 2026 GoodData Corporation

import { type CSSProperties, useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import { areObjRefsEqual } from "@gooddata/sdk-model";
import { UiConfirmDialog, collectReferences, replaceReferences } from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectRestrictedRichTextReferences } from "../../../model/store/unavailableObjects/unavailableObjectsSelectors.js";

/**
 * Put in the text in place of a reference the editor may not read, as the design has it. It is
 * stored as the text itself, and thus is the same for every reader and not localised.
 */
const RESTRICTED_REFERENCE_REPLACEMENT = "???";

/** The wrapper is there to catch events, and must not take part in the layout it is dropped into. */
const noBoxOfItsOwn: CSSProperties = { display: "contents" };

/**
 * Whether the text references an object the current user is not allowed to read. A surface that
 * edits text asks this to know which of its two states it is in, rather than keeping a flag that
 * says the same thing a moment later.
 */
export function useHasRestrictedReferences(value: string): boolean {
    const restrictedReferences = useDashboardSelector(selectRestrictedRichTextReferences);

    return useMemo(() => {
        if (restrictedReferences.length === 0) {
            return false;
        }
        return Object.values(collectReferences(value)).some((reference) =>
            restrictedReferences.some((restricted) => areObjRefsEqual(restricted, reference.ref)),
        );
    }, [value, restrictedReferences]);
}

interface IRestrictedReferencesDialogProps {
    /** The text as it stands. */
    value: string;
    /** Stores the sanitized text. The caller edits it once it no longer holds such a reference. */
    onSanitized: (sanitized: string) => void;
    /** The editor kept the references, and is not editing after all. */
    onCancel: () => void;
}

/**
 * Asks before a text that references objects the user cannot read is edited: those references have
 * to go first, and that is destructive. The caller mounts it while it is the answer it is waiting
 * for - confirming rewrites the text, which is what ends the question.
 */
export function RestrictedReferencesDialog({
    value,
    onSanitized,
    onCancel,
}: IRestrictedReferencesDialogProps) {
    const intl = useIntl();
    const restrictedReferences = useDashboardSelector(selectRestrictedRichTextReferences);

    const onConfirm = useCallback(() => {
        onSanitized(replaceReferences(value, restrictedReferences, RESTRICTED_REFERENCE_REPLACEMENT));
    }, [value, restrictedReferences, onSanitized]);

    return (
        // the dialog renders in a portal, but React still sends its clicks up this tree, where a
        // widget would take them as "select me" and undo the release the cancel performs
        <span style={noBoxOfItsOwn} onClick={(event) => event.stopPropagation()}>
            <UiConfirmDialog
                isOpen
                dataTestId="rich-text-sanitize-references-dialog"
                title={intl.formatMessage({ id: "richText.restrictedReferences.dialog.header" })}
                description={intl.formatMessage({ id: "richText.restrictedReferences.dialog.message" })}
                confirmLabel={intl.formatMessage({ id: "richText.restrictedReferences.dialog.submit" })}
                confirmVariant="danger"
                onConfirm={onConfirm}
                onCancel={onCancel}
                onClose={onCancel}
            />
        </span>
    );
}
