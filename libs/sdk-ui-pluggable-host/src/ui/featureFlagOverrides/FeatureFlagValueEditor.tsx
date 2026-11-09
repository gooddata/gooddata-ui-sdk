// (C) 2026 GoodData Corporation

import { useId } from "react";

import { useIntl } from "react-intl";

import { type OverridableFeatureFlag } from "@gooddata/sdk-backend-tiger";
import { UiButton, UiCheckbox, UiTextInput } from "@gooddata/sdk-ui-kit";

import { e } from "./featureFlagOverridesBem.js";
import { type OverrideValue, formatDraftText, getFlagType } from "./overrideRules.js";

export interface IFeatureFlagValueHint {
    text: string;
    isError: boolean;
}

export interface IFeatureFlagValueEditorProps {
    flag: OverridableFeatureFlag;
    value: unknown;
    draftText: string | undefined;
    hint: IFeatureFlagValueHint | undefined;
    isDisabled: boolean;
    isExpanded: boolean;
    detailId: string;
    descriptionIds: readonly string[];
    onValueChange: (value: OverrideValue) => void;
    onTextChange: (text: string) => void;
    onExpandedChange: (isExpanded: boolean) => void;
}

export function FeatureFlagValueEditor(props: IFeatureFlagValueEditorProps) {
    const hintId = useId();
    const { hint, descriptionIds } = props;
    const describedBy = [...descriptionIds, ...(hint ? [hintId] : [])].join(" ") || undefined;

    return (
        <>
            <Editor {...props} describedBy={describedBy} />
            {hint ? (
                <span id={hintId} className={e("hint", { error: hint.isError })}>
                    {hint.text}
                </span>
            ) : null}
        </>
    );
}

interface IEditorProps extends IFeatureFlagValueEditorProps {
    describedBy: string | undefined;
}

function Editor(props: IEditorProps) {
    switch (getFlagType(props.flag)) {
        case "BOOLEAN":
            return <BooleanEditor {...props} />;
        case "NUMBER":
            return <NumberEditor {...props} />;
        case "JSON":
            return <JsonButton {...props} />;
    }
}

function BooleanEditor({ flag, value, isDisabled, describedBy, onValueChange }: IEditorProps) {
    const intl = useIntl();
    return (
        <UiCheckbox
            checked={value === true}
            disabled={isDisabled}
            onChange={(event) => onValueChange(event.target.checked)}
            accessibilityConfig={{
                ariaLabel: intl.formatMessage({ id: "featureFlagOverrides.value.label" }, { flag }),
                ariaDescribedBy: describedBy,
            }}
        />
    );
}

function NumberEditor({ flag, value, draftText, hint, isDisabled, describedBy, onTextChange }: IEditorProps) {
    const intl = useIntl();
    return (
        <UiTextInput
            value={draftText ?? formatDraftText(value)}
            size="small"
            disabled={isDisabled}
            isError={hint?.isError === true}
            accessibilityConfig={{
                ariaLabel: intl.formatMessage({ id: "featureFlagOverrides.value.label" }, { flag }),
                ariaDescribedBy: describedBy,
            }}
            onChange={onTextChange}
        />
    );
}

function JsonButton({ flag, isDisabled, isExpanded, detailId, describedBy, onExpandedChange }: IEditorProps) {
    const intl = useIntl();
    return (
        <UiButton
            size="small"
            variant="secondary"
            label={intl.formatMessage({ id: "featureFlagOverrides.value.editJson" })}
            iconAfter={isExpanded ? "navigateUp" : "navigateDown"}
            iconAfterSize={14}
            disableIconAnimation
            isDisabled={isDisabled}
            accessibilityConfig={{
                ariaLabel: intl.formatMessage({ id: "featureFlagOverrides.value.editJson.label" }, { flag }),
                ariaExpanded: isExpanded,
                ariaControls: isExpanded ? detailId : undefined,
                ariaDescribedBy: describedBy,
            }}
            onClick={() => onExpandedChange(!isExpanded)}
        />
    );
}
