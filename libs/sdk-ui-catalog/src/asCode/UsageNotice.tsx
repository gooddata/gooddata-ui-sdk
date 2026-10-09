// (C) 2026 GoodData Corporation

import { type MouseEvent, useState } from "react";

import { FormattedMessage, type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import { type ObjectType, serializeObjRef } from "@gooddata/sdk-model";
import { Message, UiButton } from "@gooddata/sdk-ui-kit";

import type { ICatalogItem, ICatalogItemRef } from "../catalogItem/types.js";
import { FILTER_GROUPS, type FilterableObjectType, isCatalogObjectType } from "../objectType/constants.js";

import type { AsCodeUsageCheck, IAsCodeReference } from "./descriptor.js";

const messages = defineMessages({
    usageUnknown: { id: "analyticsCatalog.asCode.dialog.delete.usageUnknown" },
    tryAgain: { id: "analyticsCatalog.asCode.dialog.delete.tryAgain" },
    showMore: { id: "analyticsCatalog.asCode.dialog.delete.showMore" },
    showLess: { id: "analyticsCatalog.asCode.dialog.delete.showLess" },
    visualizations: { id: "analyticsCatalog.asCode.dialog.delete.usageGroup.visualizations" },
    dashboards: { id: "analyticsCatalog.asCode.dialog.delete.usageGroup.dashboards" },
    metrics: { id: "analyticsCatalog.asCode.dialog.delete.usageGroup.metrics" },
    attributes: { id: "analyticsCatalog.asCode.dialog.delete.usageGroup.attributes" },
    otherObjects: { id: "analyticsCatalog.asCode.dialog.delete.usageGroup.otherObjects" },
});

const usageGroupLabels: Partial<Record<FilterableObjectType, MessageDescriptor>> = {
    analyticalDashboard: messages.dashboards,
    insight: messages.visualizations,
    measure: messages.metrics,
    attribute: messages.attributes,
};

// The usage groups and their order follow the catalog filter bar on purpose.
const usageGroupLabelByType = new Map(
    FILTER_GROUPS.flatMap(({ id, types }) => {
        const label = usageGroupLabels[id];
        return label ? types.map((type): [ObjectType, MessageDescriptor] => [type, label]) : [];
    }),
);

const usageGroupOrder = [...new Set(usageGroupLabelByType.values()), messages.otherObjects];

interface IUsageErrorProps {
    onRetry: () => void;
}

/** @internal */
export function UsageError({ onRetry }: IUsageErrorProps) {
    const intl = useIntl();
    return (
        <Message type="error">
            <span role="alert">
                {intl.formatMessage(messages.usageUnknown)}{" "}
                <UiButton variant="link" label={intl.formatMessage(messages.tryAgain)} onClick={onRetry} />
            </span>
        </Message>
    );
}

interface IUsageWarningProps {
    usageCheck: AsCodeUsageCheck<ICatalogItem>;
    references: IAsCodeReference[];
    onCatalogItemNavigation?: (event: MouseEvent, ref: ICatalogItemRef) => void;
}

/** @internal */
export function UsageWarning({ usageCheck, references, onCatalogItemNavigation }: IUsageWarningProps) {
    const intl = useIntl();
    const [areReferencesShown, setAreReferencesShown] = useState(false);

    return (
        <Message type="warning">
            <span role="status">
                <FormattedMessage
                    {...usageCheck.warningMessage}
                    values={{
                        count: references.length,
                        b: (chunks) => <b>{chunks}</b>,
                    }}
                />
            </span>
            {usageCheck.mode === "block" ? (
                <>
                    {" "}
                    <UiButton
                        variant="link"
                        label={intl.formatMessage(areReferencesShown ? messages.showLess : messages.showMore)}
                        onClick={() => setAreReferencesShown(!areReferencesShown)}
                        accessibilityConfig={{ ariaExpanded: areReferencesShown }}
                    />
                </>
            ) : null}
            {usageCheck.mode === "block" && areReferencesShown ? (
                <UsageGroups references={references} onCatalogItemNavigation={onCatalogItemNavigation} />
            ) : null}
        </Message>
    );
}

interface IUsageGroupsProps {
    references: IAsCodeReference[];
    onCatalogItemNavigation?: (event: MouseEvent, ref: ICatalogItemRef) => void;
}

function UsageGroups({ references, onCatalogItemNavigation }: IUsageGroupsProps) {
    return (
        <div className="gd-analytics-catalog__as-code-dialog__usage-groups">
            {groupReferences(references).map((group) => (
                <div key={group.label.id} className="gd-analytics-catalog__as-code-dialog__usage-group">
                    <b>
                        <FormattedMessage {...group.label} values={{ count: group.references.length }} />
                    </b>
                    <ul className="gd-analytics-catalog__as-code-dialog__usage-list">
                        {group.references.map((reference) => (
                            <li key={serializeObjRef(reference)}>
                                <UsageReference
                                    reference={reference}
                                    onCatalogItemNavigation={onCatalogItemNavigation}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

interface IUsageReferenceProps {
    reference: IAsCodeReference;
    onCatalogItemNavigation?: (event: MouseEvent, ref: ICatalogItemRef) => void;
}

function UsageReference({ reference, onCatalogItemNavigation }: IUsageReferenceProps) {
    const { identifier, type, title } = reference;
    if (!onCatalogItemNavigation || !isCatalogObjectType(type)) {
        return title;
    }
    return (
        <UiButton
            variant="link"
            label={title}
            onClick={(event) => onCatalogItemNavigation(event, { identifier, type })}
        />
    );
}

function groupReferences(references: IAsCodeReference[]) {
    const referencesByLabel = new Map<MessageDescriptor, IAsCodeReference[]>();
    for (const reference of references) {
        const label = (reference.type && usageGroupLabelByType.get(reference.type)) ?? messages.otherObjects;
        const labelReferences = referencesByLabel.get(label) ?? [];
        labelReferences.push(reference);
        referencesByLabel.set(label, labelReferences);
    }
    return usageGroupOrder.flatMap((label) => {
        const labelReferences = referencesByLabel.get(label);
        return labelReferences ? [{ label, references: labelReferences }] : [];
    });
}
