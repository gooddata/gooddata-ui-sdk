// (C) 2020-2025 GoodData Corporation
import React from "react";

/**
 * Utility component for displaying a code snippet of a component with its props.
 *
 * @internal
 */
export function CodeSnippet({
    componentName,
    componentProps,
}: {
    componentName: string;
    componentProps: object;
}) {
    const renderProp = (key: string, value: string | boolean) => {
        if (typeof value === "string") {
            return `${key}="${value}"`;
        }

        return `${key}={${value}}`;
    };

    const propList = Object.entries(componentProps).map(([key, value]) => renderProp(key, value));

    return (
        <div
            style={{
                backgroundColor: "#fefefe",
                borderRadius: 3,
                border: "1px solid #ddd",
                padding: 10,
            }}
        >
            <code
                style={{
                    whiteSpace: "pre",
                    fontSize: 10,
                    width: "100%",
                    display: "block",
                    lineHeight: "18px",
                    overflow: "hidden",
                }}
            >
                {`<${componentName}
    ${propList.join("\n    ")}
/>`}
            </code>
        </div>
    );
}
