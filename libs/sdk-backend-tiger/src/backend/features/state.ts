// (C) 2020-2022 GoodData Corporation
export const FeatureEnabled = "ENABLED";
export const FeatureDisabled = "DISABLED";

export function convertState(
    type: "STRING" | "BOOLEAN",
    possibleValues: readonly any[],
    state?: string | boolean,
): boolean | string | undefined {
    switch (type) {
        case "BOOLEAN":
            return convertBooleanState(possibleValues.slice(), state);
        case "STRING":
            return convertStringState(possibleValues.slice(), state);
        default:
            return undefined;
    }
}

function convertBooleanState(possibleValues: any[], state?: string | boolean): boolean | undefined {
    const validState = (state ?? "").toString().toLowerCase();

    if (possibleValues.includes(true)) {
        possibleValues.push(FeatureEnabled.toLowerCase());
    }
    if (possibleValues.includes(false)) {
        possibleValues.push(FeatureDisabled.toLowerCase());
    }

    if (possibleValues.includes(validState) && validState === FeatureEnabled.toLowerCase()) {
        return true;
    }
    if (possibleValues.includes(validState) && validState === FeatureDisabled.toLowerCase()) {
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
