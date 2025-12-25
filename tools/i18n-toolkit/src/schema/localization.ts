// (C) 2020-2025 GoodData Corporation

export type LocalesItem = {
    value: string;
    comment: string;
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
                        value: { type: "string" },
                        comment: { type: "string" },
                        translate: { type: "boolean" },
                    },
                    required: ["value", "comment"],
                    additionalProperties: false,
                },
            ],
        },
    },
    additionalProperties: false,
};
