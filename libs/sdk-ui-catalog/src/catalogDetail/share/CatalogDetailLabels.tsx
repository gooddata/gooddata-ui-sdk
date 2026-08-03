// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { type IObjectShareLabel, sortShareableLabels } from "@gooddata/sdk-ui-ext";
import { type IUiLabelsListItem, UiLabelsList, UiPopover } from "@gooddata/sdk-ui-kit";

import {
    catalogDetailLabels,
    catalogDetailLabelsList,
    catalogDetailLabelsTrigger,
} from "../../automation/testIds.js";

import { labelsMessages } from "./messages.js";

/**
 * @internal
 */
export interface ICatalogDetailLabelsProps {
    /** Labels of the attribute, already in display order (primary first, then alphabetical). */
    labels: IObjectShareLabel[];
}

/**
 * LABELS column value in the detail header: shows the primary label title with a
 * "(+N more)" suffix, and opens a read-only popup listing every label on click.
 * Rendered only for attributes that have labels.
 *
 * @internal
 */
export function CatalogDetailLabels({ labels }: ICatalogDetailLabelsProps) {
    const intl = useIntl();

    // Deterministic display order (primary first, then alphabetical) via the
    // shared helper — the same order the share dialog's label-access checklist
    // uses, so the two lists never disagree. Sorting here as well keeps the
    // component robust to an unsorted input.
    const ordered = useMemo(() => sortShareableLabels(labels), [labels]);

    const items = useMemo<IUiLabelsListItem[]>(
        () =>
            ordered.map((label) => ({
                id: label.id,
                label: label.title,
                // Only the primary (key) and the single default display label carry
                // a qualifier; every other label shows just its name.
                kind: label.isPrimary ? "primary" : label.isDefault ? "default" : undefined,
            })),
        [ordered],
    );

    if (ordered.length === 0) {
        return null;
    }

    const remaining = ordered.length - 1;

    return (
        <UiPopover
            title={intl.formatMessage(labelsMessages.popupTitle)}
            closeVisible
            closeText={intl.formatMessage(labelsMessages.popupClose)}
            // Always drop down from the link (left-aligned), like Figma — don't
            // flip up over the cursor when the panel is near the viewport edge.
            optimalPlacement={false}
            // The labels list rows carry their own inset and sit flush.
            contentPadding="none"
            anchor={
                <button
                    type="button"
                    className="gd-analytics-catalog-detail__labels"
                    data-testid={catalogDetailLabelsTrigger}
                    aria-label={intl.formatMessage(labelsMessages.triggerAriaLabel)}
                >
                    {ordered[0].title}
                    {remaining > 0 ? (
                        <>
                            {" ("}
                            <span className="gd-analytics-catalog-detail__labels__more">
                                {intl.formatMessage(labelsMessages.more, { remaining })}
                            </span>
                            {")"}
                        </>
                    ) : null}
                </button>
            }
            content={<UiLabelsList items={items} showHeading={false} dataTestId={catalogDetailLabelsList} />}
            accessibilityConfig={{ ariaLabel: intl.formatMessage(labelsMessages.popupTitle) }}
            data-testid={catalogDetailLabels}
        />
    );
}
