// (C) 2026 GoodData Corporation

import { useState } from "react";

import cx from "classnames";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import {
    type ISemanticConditionalFormatting,
    type ISeparators,
    isSemanticConditionalFormattingEnabled,
} from "@gooddata/sdk-model";
import {
    ConditionalFormattingDialog,
    type ITargetOption,
    isPercentFormat,
    newRule,
    semanticRuleFor,
} from "@gooddata/sdk-ui-ext";
import { UiButton } from "@gooddata/sdk-ui-kit";

import { CatalogDetailContentRow } from "./CatalogDetailContentRow.js";

const messages = defineMessages({
    toggleAriaLabel: { id: "analyticsCatalog.conditionalFormatting.toggleAriaLabel" },
    edit: { id: "analyticsCatalog.conditionalFormatting.edit" },
    add: { id: "analyticsCatalog.conditionalFormatting.add" },
});

export interface ICatalogDetailConditionalFormattingProps {
    identifier: string;
    title: string;
    format?: string | null;
    conditionalFormatting?: ISemanticConditionalFormatting;
    canEdit: boolean;
    onConditionalFormattingChange: (
        conditionalFormatting: ISemanticConditionalFormatting | undefined,
    ) => void;
    separators?: ISeparators;
}

export function CatalogDetailConditionalFormatting({
    identifier,
    title,
    format,
    conditionalFormatting,
    canEdit,
    onConditionalFormattingChange,
    separators,
}: ICatalogDetailConditionalFormattingProps) {
    const intl = useIntl();
    const [isOpen, setIsOpen] = useState(false);

    const targetOption: ITargetOption = {
        value: `measure:${identifier}`,
        title,
        target: { kind: "measure", measureIdentifier: identifier },
        isPercent: isPercentFormat(format ?? undefined),
    };
    // A stored value with no conditions counts as no rule.
    const authored = conditionalFormatting?.conditions.length ? conditionalFormatting : undefined;
    const isEnabled = authored !== undefined && isSemanticConditionalFormattingEnabled(authored);
    const rule = authored ? semanticRuleFor(targetOption, authored) : newRule(targetOption);

    return (
        <CatalogDetailContentRow
            title={<FormattedMessage id="analyticsCatalog.column.title.conditionalFormatting" />}
            content={
                <>
                    {authored ? (
                        <label className="input-checkbox-toggle s-cf-catalog-toggle-label">
                            <input
                                type="checkbox"
                                checked={isEnabled}
                                disabled={!canEdit}
                                aria-label={intl.formatMessage(messages.toggleAriaLabel, { title })}
                                onChange={(event) => {
                                    onConditionalFormattingChange({
                                        ...authored,
                                        enabled: event.target.checked,
                                    });
                                }}
                                className={cx("s-checkbox-toggle", canEdit ? "s-enabled" : "s-disabled")}
                            />
                            <span className="input-label-text" />
                        </label>
                    ) : null}
                    <UiButton
                        dataTestId="cf-catalog-open"
                        size="small"
                        variant="tertiary"
                        iconBefore={authored ? undefined : "plus"}
                        label={intl.formatMessage(authored ? messages.edit : messages.add)}
                        isDisabled={!canEdit}
                        onClick={() => setIsOpen(true)}
                    />
                    <span className="s-cf-catalog-popover-anchor" />
                    {isOpen ? (
                        <ConditionalFormattingDialog
                            rule={rule}
                            isNew={!authored}
                            fixedTarget
                            targetOptions={[targetOption]}
                            separators={separators}
                            alignTo=".s-cf-catalog-popover-anchor"
                            onDelete={
                                authored
                                    ? () => {
                                          onConditionalFormattingChange(undefined);
                                          setIsOpen(false);
                                      }
                                    : undefined
                            }
                            onSubmit={(intent) => {
                                // "inherited" needs the semanticByTarget fallback, which this usage never passes.
                                if (intent.mode !== "custom") {
                                    return;
                                }
                                onConditionalFormattingChange({
                                    ...(conditionalFormatting?.version
                                        ? { version: conditionalFormatting.version }
                                        : {}),
                                    conditions: intent.rule.conditions,
                                    // A new rule takes effect immediately; an edit keeps the row's toggle state.
                                    enabled: authored ? isEnabled : true,
                                });
                            }}
                            onClose={() => setIsOpen(false)}
                        />
                    ) : null}
                </>
            }
        />
    );
}
