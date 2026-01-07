// (C) 2020-2025 GoodData Corporation

export type LocalesItem = {
    text: string;
    crowdinContext: string;
    translate?: boolean;
};
export type LocalesStructure = Record<string, LocalesItem | string>;

export const LocalizationSchema = {
    type: "object",
    patternProperties: {
        "^.*$": {
            anyOf: [
                { type: "string" },
                {
                    type: "object",
                    properties: {
                        text: { type: "string" },
                        crowdinContext: { type: "string" },
                        translate: { type: "boolean" },
                    },
                    required: ["text", "crowdinContext"],
                    additionalProperties: false,
                },
            ],
        },
    },
    additionalProperties: false,
};
