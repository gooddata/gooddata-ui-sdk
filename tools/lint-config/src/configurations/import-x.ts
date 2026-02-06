// (C) 2025-2026 GoodData Corporation

const importXRulesCommon = {
    named: "error",
    namespace: "error",
    default: "error",
    export: "error",
    "no-named-as-default": "warn",
    "no-named-as-default-member": "warn",
    "no-duplicates": "warn",
    "no-unassigned-import": "error",
};

export const importXRulesNativeSupported = {
    ...importXRulesCommon,
};

// todo: https://github.com/oxc-project/oxc/issues/1117
export const importXRulesNativeNotSupported = {
    order: [
        "error",
        {
            pathGroups: [
                {
                    pattern: "react",
                    group: "external",
                    position: "before",
                },
                {
                    pattern: "@gooddata/**",
                    group: "external",
                    position: "after",
                },
            ],
            groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
            pathGroupsExcludedImportTypes: ["react"],
            alphabetize: {
                order: "asc",
                caseInsensitive: true,
            },
            "newlines-between": "always",
        },
    ],
};

export const importXRules = {
    ...importXRulesNativeSupported,
    ...importXRulesNativeNotSupported,
};
