// (C) 2020-2022 GoodData Corporation

export type LocalesItem = {
    value: string;
    comment: string;
    limit: number;
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
                        limit: { type: "number" },
                        translate: { type: "boolean" },
                    },
                    required: ["value", "comment", "limit"],
                    additionalProperties: false,
                },
            ],
        },
    },
    additionalProperties: false,
};
