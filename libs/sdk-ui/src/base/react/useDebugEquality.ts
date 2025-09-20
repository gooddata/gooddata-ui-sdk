// (C) 2025 GoodData Corporation

import { isEqual } from "lodash-es";

import { usePrevious } from "@gooddata/sdk-ui";

/**
 * Debug hook that outputs a formatted table showing prop equality checks.
 * Compares current props with previous props using both strict equality and deep equality.
 * This is useful if you want to check why and when some hook with multiple dependencies was re-triggered.
 *
 * @param props - The props object to debug
 * @param render - When to print the table: "eachRender" prints on every render, "changeOnly" prints only when equality results change
 * @internal
 */
export const useDebugEquality = <T extends object>(
    props: T,
    render: "eachRender" | "changeOnly" = "eachRender",
): void => {
    const previousProps = usePrevious(props);

    const results = Object.keys(props).map((key) => {
        const currentValue = props[key as keyof typeof props];
        const previousValue = previousProps[key as keyof typeof previousProps];

        const strictEquality = currentValue === previousValue;
        const deepEquality = isEqual(currentValue, previousValue);

        return {
            Property: key,
            "Strict (===)": strictEquality ? "✅" : "❌",
            "Deep (isEqual)": deepEquality ? "✅" : "❌",
        };
    });

    const previousResults = usePrevious(results);

    const shouldPrint = render === "eachRender" || !previousResults || !isEqual(results, previousResults);

    if (shouldPrint) {
        // eslint-disable-next-line no-console
        console.table(results);
        // eslint-disable-next-line no-console
        console.log("Previous props:", previousProps);
        // eslint-disable-next-line no-console
        console.log("Current props:", props);
    }
};
