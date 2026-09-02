// (C) 2026 GoodData Corporation

import {
    type IParameterDefinition,
    type ParameterValue,
    getParameterAllowedValues,
    throwUnexpected,
} from "@gooddata/sdk-model";

import { type IDropdownBodyRenderProps } from "../Dropdown/Dropdown.js";

import { AllowedValuesParameterControlDropdown } from "./AllowedValuesParameterControlDropdown.js";
import { NumberParameterControlDropdown } from "./NumberParameterControlDropdown.js";
import { StringParameterControlDropdown } from "./StringParameterControlDropdown.js";
import { type ParameterSubmitModeProps } from "./submitMode.js";

/**
 * @internal
 */
export type IParameterControlProps = {
    name: string;
    definition: IParameterDefinition;
    value: ParameterValue;
    resetValue?: ParameterValue;
    inputId?: string;
    ariaAttributes?: IDropdownBodyRenderProps["ariaAttributes"];
    /**
     * The control calls this itself after a commit-mode Apply, and after the user selects an
     * allowed value. The footer Cancel or Close button also calls this. Close does not remove the
     * staged value.
     */
    onClose: () => void;
} & ParameterSubmitModeProps<ParameterValue>;

/**
 * Controls the full parameter edit session. It selects the control variant from `definition.type`
 * and the constraint shape, then gives the commit or staged mode to that variant. To add a
 * variant, add a sibling control and a new case here.
 *
 * @internal
 */
export function ParameterControl(props: IParameterControlProps) {
    const { name, definition, value, resetValue, inputId, ariaAttributes, onClose } = props;

    function submitAndClose(nextValue: ParameterValue) {
        if (props.mode === "staged") {
            props.onStage(nextValue);
        } else {
            props.onCommit(nextValue);
        }
        onClose();
    }

    const scalarSubmitProps: ParameterSubmitModeProps<ParameterValue> =
        props.mode === "staged"
            ? { mode: "staged", onStage: props.onStage }
            : { mode: "commit", onCommit: submitAndClose };

    switch (definition.type) {
        case "NUMBER":
            return (
                <NumberParameterControlDropdown
                    name={name}
                    value={Number(value)}
                    resetValue={resetValue === undefined ? undefined : Number(resetValue)}
                    constraints={definition.constraints}
                    inputId={inputId}
                    ariaAttributes={ariaAttributes}
                    {...scalarSubmitProps}
                    onClose={onClose}
                />
            );
        case "STRING": {
            const allowedValues = getParameterAllowedValues(definition);
            return allowedValues ? (
                <AllowedValuesParameterControlDropdown
                    name={name}
                    value={String(value)}
                    defaultValue={resetValue === undefined ? definition.defaultValue : String(resetValue)}
                    allowedValues={allowedValues}
                    ariaAttributes={ariaAttributes}
                    onSelect={submitAndClose}
                    onClose={onClose}
                />
            ) : (
                <StringParameterControlDropdown
                    name={name}
                    value={String(value)}
                    resetValue={resetValue === undefined ? undefined : String(resetValue)}
                    constraints={definition.constraints}
                    inputId={inputId}
                    ariaAttributes={ariaAttributes}
                    {...scalarSubmitProps}
                    onClose={onClose}
                />
            );
        }
        default:
            return throwUnexpected(definition);
    }
}
