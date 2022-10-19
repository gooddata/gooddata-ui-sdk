// (C) 2020 GoodData Corporation
module.exports = {
    extends: ["./.eslintrc.js"],
    settings: {
        react: {
            version: "detect",
        },
    },
    rules: {
        "react/prop-types": "off",
        /**
         * jsx-no-leaked-render is set to warning only because it's not working properly for the AND operator
         * within component's properties.
         */
        "react/jsx-no-leaked-render": ["error", { validStrategies: ["ternary", "coerce"] }],
    },
};
