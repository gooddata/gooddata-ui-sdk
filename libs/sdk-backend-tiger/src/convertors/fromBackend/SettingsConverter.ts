// (C) 2022-2024 GoodData Corporation
export const isValueSetting = (obj: object | null | undefined): obj is { value: string } => {
    if (!obj || Object.keys(obj).length !== 1) {
        return false;
    }
    return ["string", "boolean"].includes(typeof (obj as { value: any }).value);
};

export const unwrapSettingContent = (content: object | undefined | null) => {
    if (isValueSetting(content)) {
        return content.value;
    }
    return content ?? undefined;
};
