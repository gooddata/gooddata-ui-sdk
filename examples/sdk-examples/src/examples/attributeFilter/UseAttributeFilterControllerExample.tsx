// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { useAttributeFilterController } from "@gooddata/sdk-ui-filters";
import { IAttributeFilter, newNegativeAttributeFilter } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

export interface IAttributeFilterItemProps {
    title: string;
    isSelected: boolean;
    onChange: (checked: boolean) => void;
}

export function AttributeFilterItem(props: IAttributeFilterItemProps) {
    const { title, isSelected, onChange } = props;
    return (
        <label className="gd-list-item s-attribute-filter-list-item" style={{ display: "inline-flex" }}>
            <input
                type="checkbox"
                className="gd-input-checkbox"
                checked={isSelected}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span>{title}</span>
        </label>
    );
}

export function UseAttributeFilterControllerExample() {
    const [filter, setFilter] = useState<IAttributeFilter>(
        newNegativeAttributeFilter(Md.EmployeeName.Default, []),
    );

    const {
        attribute,
        elements,
        totalElementsCount,
        initError,
        initialElementsPageError,
        nextElementsPageError,
        isInitializing,
        isLoadingInitialElementsPage,
        isLoadingNextElementsPage,
        onLoadNextElementsPage,
        isWorkingSelectionInverted,
        workingSelectionElements,
        onSelect,
        onApply,
        committedSelectionElements,
        onSearch,
        searchString,
        onReset,
    } = useAttributeFilterController({
        filter,
        onApply: (newFilter) => setFilter(newFilter),
        elementsOptions: {
            limit: 20,
        },
    });

    const error = initError ?? initialElementsPageError ?? nextElementsPageError;
    const isLoading = isInitializing || isLoadingInitialElementsPage || isLoadingNextElementsPage;

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div style={{ minHeight: 500 }}>
            {isInitializing ? (
                <div>Initializing...</div>
            ) : error ? (
                <div>{error}</div>
            ) : (
                <div>
                    <h4>{attribute?.title}</h4>
                    <h5>
                        Commited Selection:{" "}
                        {committedSelectionElements.length
                            ? committedSelectionElements.map((e) => e.title).join(",")
                            : "No selection"}
                    </h5>
                    <h5>
                        Working Selection:{" "}
                        {workingSelectionElements.length
                            ? workingSelectionElements.map((e) => e.title).join(",")
                            : "No selection"}
                    </h5>
                    <div style={{ margin: 10 }}>
                        <input onChange={(e) => onSearch(e.target.value)} placeholder="Search elements..." />
                    </div>
                    <div>
                        {isLoadingInitialElementsPage ? (
                            <div style={{ margin: 10 }}>Searching elements...</div>
                        ) : null}
                        {searchString && !isLoadingInitialElementsPage && !elements.length ? (
                            <div style={{ margin: 10 }}>No search results.</div>
                        ) : null}
                        {elements.map((element) => (
                            <AttributeFilterItem
                                key={element.uri}
                                isSelected={workingSelectionElements.some((e) => e === element)}
                                title={element.title}
                                onChange={(isSelected) => {
                                    const newSelection = isSelected
                                        ? workingSelectionElements.concat([element])
                                        : workingSelectionElements.filter((e) => e !== element);
                                    onSelect(newSelection, isWorkingSelectionInverted);
                                }}
                            />
                        ))}
                    </div>
                    <button
                        className="gd-button gd-button-small gd-button-action s-show-more-filters-button"
                        onClick={onLoadNextElementsPage}
                        disabled={isLoading || elements.length === totalElementsCount}
                        style={{ margin: 10 }}
                    >
                        {isLoading ? "Loading Elements..." : "Load More Elements..."}
                    </button>
                    <button
                        className="gd-button gd-button-small gd-button-secondary s-show-more-filters-button"
                        onClick={onApply}
                    >
                        Apply selected elements
                    </button>
                    <button
                        className="gd-button gd-button-small gd-button-secondary s-show-more-filters-button"
                        onClick={onReset}
                    >
                        Reset working selection
                    </button>
                    <button
                        className="gd-button gd-button-small gd-button-secondary s-show-more-filters-button"
                        onClick={() => onSelect([], isWorkingSelectionInverted)}
                    >
                        Clear
                    </button>
                </div>
            )}
        </div>
    );
}

export default UseAttributeFilterControllerExample;
