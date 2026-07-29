// (C) 2026 GoodData Corporation

import { useId } from "react";

import cx from "classnames";
import { type MessageDescriptor, useIntl } from "react-intl";

import { type IColor, type ISeparators } from "@gooddata/sdk-model";
import { type IDateFilterOptionsByType } from "@gooddata/sdk-ui-filters";
import {
    Button,
    Dropdown,
    type IInputPureProps,
    type IUiComboboxOption,
    Input,
    InputWithNumberFormat,
    UiButton,
    UiButtonSegmentedControl,
    UiCombobox,
    UiComboboxInput,
    UiComboboxList,
    UiComboboxListItem,
    UiComboboxListItemLabel,
    UiComboboxPopup,
} from "@gooddata/sdk-ui-kit";
import {
    type ConditionalFormattingTarget,
    type ConditionalFormattingValue,
    type IConditionalFormattingCondition,
    type IConditionalFormattingFormat,
} from "@gooddata/sdk-ui-pivot/next";

import {
    conditionalFormattingDateOperatorMessages,
    conditionalFormattingMessages,
    conditionalFormattingOperatorMessages,
} from "../../../../locales.js";
import { ColorDropdown } from "../colors/colorDropdown/ColorDropdown.js";

import { CfDateValueDropdown } from "./CfDateValueDropdown.js";
import { CfSelect } from "./CfSelect.js";
import { CF_COLOR_PALETTE, colorToHex, hexToColor } from "./conditionalFormattingColors.js";
import {
    type ConditionalFormattingFieldError,
    type ICfDateMeta,
    type ICfDateSettings,
    displayToRawNumber,
    literalRaw,
    literalText,
    operatorIcon,
    operatorsForTarget,
    rangeRaw,
    rawToDisplayNumber,
    validateCondition,
    valueEditorKind,
    valueForOperator,
} from "./conditionalFormattingModel.js";
import { type IReorderSlot } from "./ReorderList.js";

interface ICfMeasureValueInputProps extends Pick<IInputPureProps, "hasError" | "accessibilityConfig"> {
    raw: number | null;
    isPercent: boolean;
    separators: ISeparators | undefined;
    placeholder: string;
    onChangeRaw: (raw: number | null) => void;
}

function CfMeasureValueInput({
    raw,
    isPercent,
    separators,
    placeholder,
    onChangeRaw,
    hasError,
    accessibilityConfig,
}: ICfMeasureValueInputProps) {
    const intl = useIntl();
    return (
        <InputWithNumberFormat
            value={raw === null ? undefined : rawToDisplayNumber(raw, isPercent)}
            suffix={isPercent ? "%" : undefined}
            separators={separators}
            placeholder={placeholder}
            onChange={(display) =>
                onChangeRaw(display === null ? null : displayToRawNumber(display, isPercent))
            }
            hasError={hasError}
            accessibilityConfig={{
                // InputPure renders the suffix aria-hidden; this is its accessible name.
                ...(isPercent
                    ? {
                          suffixAriaLabel: intl.formatMessage(
                              conditionalFormattingMessages.dialogUnitPercent,
                          ),
                      }
                    : {}),
                ...accessibilityConfig,
            }}
        />
    );
}

interface ICfValueComboboxProps {
    value: string;
    suggestions: readonly string[];
    placeholder: string;
    onChangeText: (value: string) => void;
}

// Free-text combobox suggesting current-result element values; `creatable` = typed text is a valid value.
function CfValueCombobox({ value, suggestions, placeholder, onChangeText }: ICfValueComboboxProps) {
    const idPrefix = useId();
    const options: IUiComboboxOption[] = suggestions.map((suggestion, index) => ({
        // aria-activedescendant needs a valid, document-unique DOM id (element values aren't); matching is by label.
        id: `${idPrefix}-${index}`,
        label: suggestion,
    }));
    return (
        <UiCombobox options={options} value={value} creatable onValueChange={onChangeText}>
            <UiComboboxInput placeholder={placeholder} accessibilityConfig={{ ariaLabel: placeholder }} />
            <UiComboboxPopup>
                <UiComboboxList>
                    {(option, index) => (
                        <UiComboboxListItem option={option} index={index}>
                            <UiComboboxListItemLabel>{option.label}</UiComboboxListItemLabel>
                        </UiComboboxListItem>
                    )}
                </UiComboboxList>
            </UiComboboxPopup>
        </UiCombobox>
    );
}

const FIELD_ERROR_MESSAGE: Record<ConditionalFormattingFieldError, MessageDescriptor> = {
    rangeOrder: conditionalFormattingMessages.dialogErrorRangeOrder,
    dateUnresolvable: conditionalFormattingMessages.dialogErrorDateUnresolvable,
};

function CfFieldError({ id, error }: { id: string; error: ConditionalFormattingFieldError | undefined }) {
    const intl = useIntl();
    if (!error) {
        return null;
    }
    return (
        <span id={id} role="alert" className="gd-cf-condition__error">
            {intl.formatMessage(FIELD_ERROR_MESSAGE[error])}
        </span>
    );
}

interface IConditionValueInputProps {
    condition: IConditionalFormattingCondition;
    kind: ConditionalFormattingTarget["kind"];
    isPercent: boolean;
    separators: ISeparators | undefined;
    suggestions: readonly string[];
    date: ICfDateMeta | undefined;
    dateFilterOptions: IDateFilterOptionsByType | undefined;
    dateSettings: ICfDateSettings | undefined;
    onChange: (condition: IConditionalFormattingCondition) => void;
}

function ConditionValueInput({
    condition,
    kind,
    isPercent,
    separators,
    suggestions,
    date,
    dateFilterOptions,
    dateSettings,
    onChange,
}: IConditionValueInputProps) {
    const intl = useIntl();
    const errorId = useId();
    const setValue = (value: ConditionalFormattingValue) => onChange({ ...condition, value });

    switch (valueEditorKind(condition, kind, suggestions.length > 0, date !== undefined)) {
        case "none":
            return null;
        case "date": {
            if (!date) {
                return null;
            }
            const { errors } = validateCondition(condition, kind, date);
            return (
                <>
                    <CfDateValueDropdown
                        value={condition.value}
                        date={date}
                        catalogOptions={dateFilterOptions}
                        dateSettings={dateSettings}
                        errorId={errors.date ? errorId : undefined}
                        onChange={setValue}
                    />
                    <CfFieldError id={errorId} error={errors.date} />
                </>
            );
        }
        case "number":
            return (
                <CfMeasureValueInput
                    raw={literalRaw(condition.value)}
                    isPercent={isPercent}
                    separators={separators}
                    placeholder={intl.formatMessage(conditionalFormattingMessages.dialogValuePlaceholder)}
                    onChangeRaw={(raw) => setValue({ kind: "literal", value: raw ?? "" })}
                />
            );
        case "combobox":
            return (
                <CfValueCombobox
                    value={literalText(condition.value)}
                    suggestions={suggestions}
                    placeholder={intl.formatMessage(conditionalFormattingMessages.dialogValuePlaceholder)}
                    onChangeText={(v) => setValue({ kind: "literal", value: v })}
                />
            );
        case "text":
            return (
                <Input
                    type="text"
                    value={literalText(condition.value)}
                    placeholder={intl.formatMessage(conditionalFormattingMessages.dialogValuePlaceholder)}
                    onChange={(v) => setValue({ kind: "literal", value: String(v) })}
                />
            );
        case "range": {
            const range = condition.value.kind === "literalRange" ? condition.value : { from: NaN, to: NaN };
            const setRange = (from: number, to: number) => setValue({ kind: "literalRange", from, to });
            const { errors } = validateCondition(condition, kind);
            const invalidInputProps = (error: ConditionalFormattingFieldError | undefined) =>
                error
                    ? { hasError: true, accessibilityConfig: { ariaDescribedBy: errorId, ariaInvalid: true } }
                    : {};
            return (
                <>
                    <div className="gd-cf-condition__range">
                        <CfMeasureValueInput
                            raw={rangeRaw(condition.value, "from")}
                            isPercent={isPercent}
                            separators={separators}
                            placeholder={intl.formatMessage(
                                conditionalFormattingMessages.dialogFromPlaceholder,
                            )}
                            onChangeRaw={(raw) => setRange(raw ?? NaN, range.to)}
                            {...invalidInputProps(errors.range)}
                        />
                        <CfMeasureValueInput
                            raw={rangeRaw(condition.value, "to")}
                            isPercent={isPercent}
                            separators={separators}
                            placeholder={intl.formatMessage(
                                conditionalFormattingMessages.dialogToPlaceholder,
                            )}
                            onChangeRaw={(raw) => setRange(range.from, raw ?? NaN)}
                            {...invalidInputProps(errors.range)}
                        />
                    </div>
                    <CfFieldError id={errorId} error={errors.range} />
                </>
            );
        }
    }
}

// The ColorDropdown trigger swatch. ColorDropdown clones it with selectable-child props the swatch
// ignores. No color renders a "none" slash rather than a misleading white.
function CfSwatch({ hex }: { hex: string | undefined }) {
    return (
        <span
            className={`gd-cf-swatch${hex ? "" : " gd-cf-swatch--none"}`}
            style={hex ? { backgroundColor: hex } : undefined}
        />
    );
}

interface IColorPickProps {
    hex: string | undefined;
    noneColorLabel: string;
    onChange: (hex: string | undefined) => void;
}

function CfColorPick({ hex, noneColorLabel, onChange }: IColorPickProps) {
    return (
        <ColorDropdown
            colorPalette={CF_COLOR_PALETTE}
            selectedColorItem={hexToColor(hex)}
            onColorSelected={(color: IColor) => onChange(colorToHex(color))}
            onClear={() => onChange(undefined)}
            noneColorAriaLabel={noneColorLabel}
        >
            <CfSwatch hex={hex} />
        </ColorDropdown>
    );
}

const PREVIEW_SAMPLE: Record<ConditionalFormattingTarget["kind"], string> = {
    measure: "1,234.56",
    attribute: "Abc",
};

// Row scope shows two sample cells to convey that the whole row is formatted.
const ROW_PREVIEW_SAMPLE = ["Abc", "123"];

interface IFormatEditorProps {
    format: IConditionalFormattingFormat;
    onChange: (format: IConditionalFormattingFormat) => void;
}

function FormatEditor({ format, onChange }: IFormatEditorProps) {
    const intl = useIntl();
    return (
        <Dropdown
            closeOnParentScroll
            closeOnMouseDrag
            closeOnEscape
            renderButton={({ toggleDropdown, accessibilityConfig }) => (
                <Button
                    className="gd-button-link gd-button-icon-only gd-icon-pencil gd-cf-condition__edit"
                    accessibilityConfig={{
                        ...accessibilityConfig,
                        ariaLabel: intl.formatMessage(conditionalFormattingMessages.dialogFormat),
                    }}
                    onClick={toggleDropdown}
                />
            )}
            renderBody={() => (
                <div className="gd-cf-format">
                    <span className="gd-cf-format__label">
                        {intl.formatMessage(conditionalFormattingMessages.dialogTextColor)}
                    </span>
                    <CfColorPick
                        hex={format.color}
                        noneColorLabel={intl.formatMessage(conditionalFormattingMessages.dialogNoColor)}
                        onChange={(color) => onChange({ ...format, color })}
                    />
                    <span className="gd-cf-format__label">
                        {intl.formatMessage(conditionalFormattingMessages.dialogFillColor)}
                    </span>
                    <CfColorPick
                        hex={format.backgroundColor}
                        noneColorLabel={intl.formatMessage(conditionalFormattingMessages.dialogNoColor)}
                        onChange={(backgroundColor) => onChange({ ...format, backgroundColor })}
                    />
                    <UiButtonSegmentedControl>
                        <UiButton
                            size="small"
                            variant="secondary"
                            label={intl.formatMessage(conditionalFormattingMessages.dialogScopeCell)}
                            isSelected={format.scope === "cell"}
                            onClick={() => onChange({ ...format, scope: "cell" })}
                        />
                        <UiButton
                            size="small"
                            variant="secondary"
                            label={intl.formatMessage(conditionalFormattingMessages.dialogScopeRow)}
                            isSelected={format.scope === "row"}
                            onClick={() => onChange({ ...format, scope: "row" })}
                        />
                    </UiButtonSegmentedControl>
                </div>
            )}
        />
    );
}

export interface IConditionEditorProps {
    condition: IConditionalFormattingCondition;
    kind: ConditionalFormattingTarget["kind"];
    isPercent: boolean;
    separators: ISeparators | undefined;
    suggestions: readonly string[];
    date: ICfDateMeta | undefined;
    dateFilterOptions: IDateFilterOptionsByType | undefined;
    dateSettings: ICfDateSettings | undefined;
    removable: boolean;
    slot: IReorderSlot;
    onChange: (condition: IConditionalFormattingCondition) => void;
    onRemove: () => void;
}

export function ConditionEditor({
    condition,
    kind,
    isPercent,
    separators,
    suggestions,
    date,
    dateFilterOptions,
    dateSettings,
    removable,
    slot,
    onChange,
    onRemove,
}: IConditionEditorProps) {
    const intl = useIntl();
    const isDate = date !== undefined;
    // Date operators render label-only (per design), so no icon lookup on that path.
    const operatorItems = operatorsForTarget(kind, isDate).map((operator) => ({
        value: operator,
        title: intl.formatMessage(
            (isDate ? conditionalFormattingDateOperatorMessages[operator] : undefined) ??
                conditionalFormattingOperatorMessages[operator],
        ),
        icon: isDate ? undefined : operatorIcon(operator),
    }));
    const setFormat = (format: IConditionalFormattingFormat) => onChange({ ...condition, format });

    const previewStyle = {
        ...(condition.format.color ? { color: condition.format.color } : {}),
        ...(condition.format.backgroundColor ? { backgroundColor: condition.format.backgroundColor } : {}),
    };

    return (
        <div className={cx("gd-cf-condition", slot.className)} {...slot.rootProps}>
            {slot.handle}
            <div className="gd-cf-condition__header">
                <span className="gd-cf-condition__title">
                    {intl.formatMessage(conditionalFormattingMessages.dialogCondition)}
                </span>
                {removable ? (
                    <Button
                        className="gd-button-link gd-button-icon-only gd-icon-cross"
                        accessibilityConfig={{
                            ariaLabel: intl.formatMessage(
                                conditionalFormattingMessages.dialogRemoveCondition,
                            ),
                        }}
                        onClick={onRemove}
                    />
                ) : null}
            </div>
            <CfSelect
                value={condition.operator}
                items={operatorItems}
                onSelect={(operator) =>
                    onChange({
                        ...condition,
                        operator,
                        value: valueForOperator(operator, condition.value, isDate),
                    })
                }
            />
            <ConditionValueInput
                condition={condition}
                kind={kind}
                isPercent={isPercent}
                separators={separators}
                suggestions={suggestions}
                date={date}
                dateFilterOptions={dateFilterOptions}
                dateSettings={dateSettings}
                onChange={onChange}
            />
            <div className="gd-cf-condition__format-row">
                <span className="gd-cf-dialog__label">
                    {intl.formatMessage(conditionalFormattingMessages.dialogFormat)}
                </span>
                <div className="gd-cf-preview">
                    {condition.format.scope === "row" ? (
                        ROW_PREVIEW_SAMPLE.map((sample, index) => (
                            <span key={index} className="gd-cf-preview__cell" style={previewStyle}>
                                {sample}
                            </span>
                        ))
                    ) : (
                        <span className="gd-cf-preview__cell" style={previewStyle}>
                            {PREVIEW_SAMPLE[kind]}
                        </span>
                    )}
                </div>
                <FormatEditor format={condition.format} onChange={setFormat} />
            </div>
        </div>
    );
}
