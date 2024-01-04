// (C) 2022 GoodData Corporation
export const isValueSetting = (obj: object | undefined): obj is { value: string } => {
    if (!obj || Object.keys(obj).length !== 1) {
        return false;
    }
    return ["string", "boolean"].includes(typeof (obj as { value: any }).value);
};

export const unwrapSettingContent = (content: object | undefined) => {
    if (isValueSetting(content)) {
        return content.value;
    }
    return content;
};
