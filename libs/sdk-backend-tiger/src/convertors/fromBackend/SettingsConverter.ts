// (C) 2022-2025 GoodData Corporation
export const isValueSetting = (
    obj: object | null | undefined,
): obj is { value: string | number | boolean | object | null | undefined } => {
    return !!obj && Object.prototype.hasOwnProperty.call(obj, "value");
};

export const unwrapSettingContent = (content: object | undefined | null) => {
    if (isValueSetting(content)) {
        return content.value;
    }
    return content ?? undefined;
};
