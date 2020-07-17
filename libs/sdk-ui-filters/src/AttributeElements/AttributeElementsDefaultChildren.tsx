// (C) 2007-2018 GoodData Corporation
import React from "react";
import { IAttributeElementsChildren } from "./types";

export const AttributeElementsDefaultChildren: React.FC<IAttributeElementsChildren> = ({
    validElements,
    loadMore,
    isLoading,
    error,
}) => {
    if (error) {
        return <div>{error}</div>;
    }

    const { offset, limit } = validElements || {};
    return (
        <div>
            <p>
                Use children function to map {"{"} validElements, loadMore, isLoading, error {"} "}
                to your React components.
            </p>
            <button className="gd-button gd-button-secondary" onClick={loadMore as any} disabled={isLoading}>
                More
            </button>
            <h2>validElements</h2>
            <pre>
                isLoading: {isLoading.toString()}
                offset: {offset}
                limit: {limit}
                validElements:
                {JSON.stringify(validElements, null, "\t")}
            </pre>
        </div>
    );
};
