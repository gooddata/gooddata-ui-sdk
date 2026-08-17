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

/**
 * @internal
 */
export interface IParameterControlProps {
    name: string;
    definition: IParameterDefinition;
    value: ParameterValue;
    resetValue?: ParameterValue;
    inputId?: string;
    ariaAttributes?: IDropdownBodyRenderProps["ariaAttributes"];
    onApply: (value: ParameterValue) => void;
    onCancel: () => void;
}

/**
 * Selects the parameter editing control by `definition.type` and constraint shape — the single
 * seam where control variants are dispatched. New variants get a sibling control and a new arm
 * here.
 *
 * @internal
 */
export function ParameterControl({
    name,
    definition,
    value,
    resetValue,
    inputId,
    ariaAttributes,
    onApply,
    onCancel,
}: IParameterControlProps) {
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
                    onApply={onApply}
                    onCancel={onCancel}
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
                    onApply={onApply}
                    onCancel={onCancel}
                />
            ) : (
                <StringParameterControlDropdown
                    name={name}
                    value={String(value)}
                    resetValue={resetValue === undefined ? undefined : String(resetValue)}
                    constraints={definition.constraints}
                    inputId={inputId}
                    ariaAttributes={ariaAttributes}
                    onApply={onApply}
                    onCancel={onCancel}
                />
            );
        }
        default:
            return throwUnexpected(definition);
    }
}
