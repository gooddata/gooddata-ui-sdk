// (C) 2026 GoodData Corporation

import { useId, useState } from "react";

import cx from "classnames";
import { type IntlShape, useIntl } from "react-intl";

import { type IColor } from "@gooddata/sdk-model";
import {
    Button,
    Dropdown,
    DropdownButton,
    type IAlignPoint,
    type IUiListboxInteractiveItemProps,
    type IUiListboxItem,
    Input,
    Overlay,
    SingleSelectListItem,
    UiButton,
    UiButtonSegmentedControl,
    UiListbox,
} from "@gooddata/sdk-ui-kit";
import {
    type ConditionalFormattingOperator,
    type ConditionalFormattingTarget,
    type ConditionalFormattingValue,
    type IConditionalFormattingCondition,
    type IConditionalFormattingFormat,
    type IConditionalFormattingRule,
} from "@gooddata/sdk-ui-pivot/next";

import { conditionalFormattingMessages, conditionalFormattingOperatorMessages } from "../../../../locales.js";
import { ColorDropdown } from "../colors/colorDropdown/ColorDropdown.js";

import { CF_COLOR_PALETTE, colorToHex, hexToColor } from "./conditionalFormattingColors.js";
import {
    type ITargetOption,
    findTargetOption,
    isRuleComplete,
    newCondition,
    operatorArity,
    operatorIcon,
    operatorsForKind,
    targetIcon,
} from "./conditionalFormattingModel.js";

interface ISelectItem<T extends string> {
    value: T;
    title: string;
    icon?: string;
}

interface ICfSelectProps<T extends string> {
    value: T | "";
    items: ISelectItem<T>[];
    onSelect: (value: T) => void;
    placeholder?: string;
    width?: number;
}

interface ICfListItemData {
    title: string;
    icon?: string;
}

// One listbox option; the iconRenderer sizes the type (attribute/metric) and wide operator glyphs.
function CfListItem({
    item,
    isSelected,
    isFocused,
    onSelect,
}: IUiListboxInteractiveItemProps<ICfListItemData>) {
    const { title, icon } = item.data;
    return (
        <SingleSelectListItem
            title={title}
            icon={icon}
            iconRenderer={(ic) => {
                if (typeof ic !== "string" || !ic) {
                    return null;
                }
                const isTypeIcon = ic === "gd-icon-attribute" || ic === "gd-icon-metric";
                return (
                    <span
                        aria-hidden="true"
                        className={cx("gd-list-icon", ic, { "gd-cf-type-icon": isTypeIcon })}
                    />
                );
            }}
            isSelected={isSelected}
            isFocused={isFocused}
            onClick={onSelect}
        />
    );
}

function CfSelect<T extends string>({ value, items, onSelect, placeholder, width = 200 }: ICfSelectProps<T>) {
    const listboxId = useId();
    const selected = items.find((item) => item.value === value);
    const listItems: IUiListboxItem<ICfListItemData, null>[] = items.map((item) => ({
        type: "interactive",
        id: item.value,
        stringTitle: item.title,
        data: { title: item.title, icon: item.icon },
    }));
    return (
        <Dropdown
            closeOnParentScroll
            closeOnMouseDrag
            renderButton={({ isOpen, toggleDropdown }) => (
                <DropdownButton
                    value={selected?.title ?? placeholder ?? ""}
                    iconLeft={selected?.icon}
                    isOpen={isOpen}
                    onClick={toggleDropdown}
                />
            )}
            renderBody={({ closeDropdown }) => (
                <UiListbox<ICfListItemData, null>
                    items={listItems}
                    width={width}
                    maxHeight={300}
                    selectedItemId={value}
                    ariaAttributes={{ id: listboxId }}
                    InteractiveItemComponent={CfListItem}
                    onClose={closeDropdown}
                    onSelect={(listItem) => {
                        const original = items.find((candidate) => candidate.value === listItem.id);
                        if (original) {
                            onSelect(original.value);
                        }
                        closeDropdown();
                    }}
                />
            )}
        />
    );
}

const valueForOperator = (
    operator: ConditionalFormattingOperator,
    previous: ConditionalFormattingValue,
): ConditionalFormattingValue => {
    switch (operatorArity(operator)) {
        case "none":
            return { kind: "none" };
        case "range":
            // NaN = a bound not yet entered (rendered blank by rangeText). isRuleComplete blocks Save
            // until both bounds are finite, so NaN stays dialog-local and never persists (it would
            // JSON-serialize to null); the contract type can stay a tight `{ from: number; to: number }`.
            return previous.kind === "literalRange" ? previous : { kind: "literalRange", from: NaN, to: NaN };
        case "single":
            return previous.kind === "literal" ? previous : { kind: "literal", value: "" };
    }
};

const literalText = (value: ConditionalFormattingValue): string =>
    value.kind === "literal" ? String(value.value) : "";

const rangeText = (value: ConditionalFormattingValue, bound: "from" | "to"): string => {
    if (value.kind !== "literalRange") {
        return "";
    }
    const n = value[bound];
    return Number.isFinite(n) ? String(n) : "";
};

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
    intl: IntlShape;
    onChange: (format: IConditionalFormattingFormat) => void;
}

function FormatEditor({ format, intl, onChange }: IFormatEditorProps) {
    return (
        <Dropdown
            closeOnParentScroll
            closeOnMouseDrag
            renderButton={({ toggleDropdown }) => (
                <Button
                    className="gd-button-link gd-button-icon-only gd-icon-pencil gd-cf-condition__edit"
                    accessibilityConfig={{
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

interface IConditionEditorProps {
    condition: IConditionalFormattingCondition;
    kind: ConditionalFormattingTarget["kind"];
    removable: boolean;
    intl: IntlShape;
    onChange: (condition: IConditionalFormattingCondition) => void;
    onRemove: () => void;
}

function ConditionEditor({ condition, kind, removable, intl, onChange, onRemove }: IConditionEditorProps) {
    const operatorItems = operatorsForKind(kind).map((operator) => ({
        value: operator,
        title: intl.formatMessage(conditionalFormattingOperatorMessages[operator]),
        icon: operatorIcon(operator),
    }));
    const arity = operatorArity(condition.operator);

    const setValue = (value: ConditionalFormattingValue) => onChange({ ...condition, value });
    const setFormat = (format: IConditionalFormattingFormat) => onChange({ ...condition, format });

    const parseBound = (v: string | number) => (v === "" ? NaN : Number(v));
    const range = condition.value.kind === "literalRange" ? condition.value : { from: NaN, to: NaN };
    const setRange = (from: number, to: number) => setValue({ kind: "literalRange", from, to });

    const previewStyle = {
        ...(condition.format.color ? { color: condition.format.color } : {}),
        ...(condition.format.backgroundColor ? { backgroundColor: condition.format.backgroundColor } : {}),
    };

    return (
        <div className="gd-cf-condition">
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
                    onChange({ ...condition, operator, value: valueForOperator(operator, condition.value) })
                }
            />
            {arity === "single" ? (
                <Input
                    type={kind === "measure" ? "number" : "text"}
                    value={literalText(condition.value)}
                    placeholder={intl.formatMessage(conditionalFormattingMessages.dialogValuePlaceholder)}
                    onChange={(v) => setValue({ kind: "literal", value: String(v) })}
                />
            ) : null}
            {arity === "range" ? (
                <div className="gd-cf-condition__range">
                    <Input
                        type="number"
                        value={rangeText(condition.value, "from")}
                        placeholder={intl.formatMessage(conditionalFormattingMessages.dialogFromPlaceholder)}
                        onChange={(v) => setRange(parseBound(v), range.to)}
                    />
                    <Input
                        type="number"
                        value={rangeText(condition.value, "to")}
                        placeholder={intl.formatMessage(conditionalFormattingMessages.dialogToPlaceholder)}
                        onChange={(v) => setRange(range.from, parseBound(v))}
                    />
                </div>
            ) : null}
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
                <FormatEditor format={condition.format} intl={intl} onChange={setFormat} />
            </div>
        </div>
    );
}

// The config panel sits on the right edge of the screen, so open the popover to the LEFT of the
// anchor (self's right edge to the anchor's left edge); fall back to the right when there's no room.
const POPOVER_ALIGN_POINTS: IAlignPoint[] = [
    { align: "cl cr", offset: { x: -5, y: 0 } },
    { align: "cr cl", offset: { x: 5, y: 0 } },
];

export interface IConditionalFormattingDialogProps {
    rule: IConditionalFormattingRule;
    isNew: boolean;
    targetOptions: ITargetOption[];
    /** CSS selector of a small, stable element the popover anchors to. */
    alignTo: string;
    onSave: (rule: IConditionalFormattingRule) => void;
    onClose: () => void;
}

export function ConditionalFormattingDialog({
    rule: initialRule,
    isNew,
    targetOptions,
    alignTo,
    onSave,
    onClose,
}: IConditionalFormattingDialogProps) {
    const intl = useIntl();
    const [rule, setRule] = useState(initialRule);

    const updateCondition = (id: string, next: IConditionalFormattingCondition) =>
        setRule((current) => ({
            ...current,
            conditions: current.conditions.map((condition) => (condition.id === id ? next : condition)),
        }));

    const removeCondition = (id: string) =>
        setRule((current) => ({
            ...current,
            conditions: current.conditions.filter((condition) => condition.id !== id),
        }));

    const addCondition = () =>
        setRule((current) => ({ ...current, conditions: [...current.conditions, newCondition()] }));

    const changeTarget = (value: string) => {
        const option = targetOptions.find((candidate) => candidate.value === value);
        if (!option) {
            return;
        }
        setRule((current) =>
            // Switching target kind (measure <-> attribute) invalidates the operators, so reset the
            // conditions; same-kind switches keep the existing conditions.
            option.target.kind === current.target.kind
                ? { ...current, target: option.target }
                : { ...current, target: option.target, conditions: [newCondition()] },
        );
    };

    const selectedTarget = findTargetOption(targetOptions, rule.target);
    const complete = isRuleComplete(rule);
    const title = intl.formatMessage(
        isNew ? conditionalFormattingMessages.dialogAddTitle : conditionalFormattingMessages.dialogEditTitle,
    );

    return (
        <Overlay
            alignTo={alignTo}
            alignPoints={POPOVER_ALIGN_POINTS}
            closeOnParentScroll
            closeOnMouseDrag
            onClose={onClose}
        >
            <div className="gd-cf-dialog" aria-label={title}>
                <div className="gd-cf-dialog__header">
                    <h3 className="gd-cf-dialog__title">{title}</h3>
                    <Button
                        className="gd-button-link gd-button-icon-only gd-icon-cross"
                        accessibilityConfig={{
                            ariaLabel: intl.formatMessage(conditionalFormattingMessages.dialogCancel),
                        }}
                        onClick={onClose}
                    />
                </div>
                <div className="gd-cf-dialog__body">
                    <span className="gd-cf-dialog__label">
                        {intl.formatMessage(conditionalFormattingMessages.dialogTarget)}
                    </span>
                    <CfSelect
                        value={selectedTarget?.value ?? ""}
                        items={targetOptions.map((option) => ({
                            value: option.value,
                            title: option.title,
                            icon: targetIcon(option.target.kind),
                        }))}
                        onSelect={changeTarget}
                        placeholder={intl.formatMessage(conditionalFormattingMessages.dialogSelectTarget)}
                    />
                    {rule.conditions.map((condition) => (
                        <ConditionEditor
                            key={condition.id}
                            condition={condition}
                            kind={rule.target.kind}
                            removable={rule.conditions.length > 1}
                            intl={intl}
                            onChange={(next) => updateCondition(condition.id, next)}
                            onRemove={() => removeCondition(condition.id)}
                        />
                    ))}
                    <Button
                        className="gd-button-secondary gd-cf-dialog__add-condition"
                        iconLeft="gd-icon-plus"
                        value={intl.formatMessage(conditionalFormattingMessages.dialogAddCondition)}
                        onClick={addCondition}
                    />
                </div>
                <div className="gd-cf-dialog__footer">
                    <Button
                        className="gd-button-secondary"
                        value={intl.formatMessage(conditionalFormattingMessages.dialogCancel)}
                        onClick={onClose}
                    />
                    <Button
                        className="gd-button-action"
                        value={intl.formatMessage(conditionalFormattingMessages.dialogSave)}
                        disabled={!complete}
                        onClick={() => onSave(rule)}
                    />
                </div>
            </div>
        </Overlay>
    );
}
