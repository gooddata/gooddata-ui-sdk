// (C) 2019-2022 GoodData Corporation
import { IThemeDefinition } from "@gooddata/sdk-model";
import { JsonApiThemeIn } from "@gooddata/api-client-tiger";

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
