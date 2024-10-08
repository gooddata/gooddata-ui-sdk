// (C) 2020-2024 GoodData Corporation
export const FeatureEnabled = ["ENABLED", "TRUE"];
export const FeatureDisabled = ["DISABLED", "FALSE"];

export function convertState(
    type: "STRING" | "BOOLEAN" | "JSON",
    possibleValues: readonly any[],
    state?: string | boolean,
): boolean | string | object | undefined {
    switch (type) {
        case "BOOLEAN":
            return convertBooleanState(possibleValues.slice(), state);
        case "STRING":
            return convertStringState(possibleValues.slice(), state);
        case "JSON":
            return convertJsonState(possibleValues.slice(), state);
        default:
            return undefined;
    }
}

const enabledValues = FeatureEnabled.map((s) => s.toLowerCase());
const disabledValues = FeatureDisabled.map((s) => s.toLowerCase());

function convertBooleanState(possibleValues: any[], state?: string | boolean): boolean | undefined {
    const validState = (state ?? "").toString().toLowerCase();

    if (possibleValues.includes(true)) {
        possibleValues.push(...enabledValues);
    }
    if (possibleValues.includes(false)) {
        possibleValues.push(...disabledValues);
    }

    if (possibleValues.includes(validState) && enabledValues.includes(validState)) {
        return true;
    }
    if (possibleValues.includes(validState) && disabledValues.includes(validState)) {
        return false;
    }
    if (possibleValues.includes(state) && (state === true || state === false)) {
        return state;
    }
    return undefined;
}

function convertStringState(possibleValues: any[], state?: string | boolean): string | undefined {
    const available = possibleValues.map((item) => (item ?? "").toString().toLowerCase());
    const index = available.indexOf((state ?? "").toString().toLowerCase());
    return possibleValues[index] ?? undefined;
}

function convertJsonState(_: any[], state?: any): object | undefined {
    return state;
}
