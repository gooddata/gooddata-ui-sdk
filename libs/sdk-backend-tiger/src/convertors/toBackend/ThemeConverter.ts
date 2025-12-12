// (C) 2019-2025 GoodData Corporation
import { type JsonApiThemeIn } from "@gooddata/api-client-tiger";
import { type IThemeDefinition } from "@gooddata/sdk-model";

export const convertTheme = (id: string, theme: IThemeDefinition): JsonApiThemeIn => {
    return {
        type: "theme",
        id,
        attributes: {
            name: theme.title || "",
            content: theme.theme,
        },
    };
};
