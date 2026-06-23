// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import type { IObjectShareLabel } from "@gooddata/sdk-ui-ext";
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
    /** Labels of the attribute, primary first is not required — sorted here. */
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

    // Primary label leads the summary and the list; the rest follow in source order.
    const ordered = useMemo(
        () => [...labels].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary)),
        [labels],
    );

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
