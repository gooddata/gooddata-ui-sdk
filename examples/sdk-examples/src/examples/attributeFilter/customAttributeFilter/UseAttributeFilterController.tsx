// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { IUseAttributeFilterControllerProps, useAttributeFilterController } from "@gooddata/sdk-ui-filters";
import { IAttributeElement, IAttributeFilter, newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import * as Md from "../../../md/full";

interface IAttributeFilterItemProps {
    title: string;
    isSelected: boolean;
    onChange: (checked: boolean) => void;
}

function AttributeFilterItem(props: IAttributeFilterItemProps) {
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

interface IErrorComponentProps {
    error: GoodDataSdkError;
}

function ErrorComponent(props: IErrorComponentProps) {
    const { error } = props;
    return <div>{error.message}</div>;
}

function LoadingComponent() {
    return <div>Initializing...</div>;
}

interface ISelectionOverviewProps {
    elements: IAttributeElement[];
}

function SelectionOverview(props: ISelectionOverviewProps) {
    const { elements } = props;
    return <>{elements.length ? elements.map((e) => e.title).join(",") : "No selection"}</>;
}

interface ISearchFieldProps {
    onSearch: (search: string) => void;
}

function SearchField(props: ISearchFieldProps) {
    const { onSearch } = props;
    return <input onChange={(e) => onSearch(e.target.value)} placeholder="Search elements..." />;
}

export function CustomAttributeFilter(props: IUseAttributeFilterControllerProps) {
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
        ...props,
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
                <LoadingComponent />
            ) : error ? (
                <ErrorComponent error={error} />
            ) : (
                <div>
                    <h4>{attribute?.title}</h4>
                    <h5>
                        Committed Selection: <SelectionOverview elements={committedSelectionElements} />
                    </h5>
                    <h5>
                        Working Selection: <SelectionOverview elements={workingSelectionElements} />
                    </h5>
                    <div style={{ margin: 10 }}>
                        <SearchField onSearch={onSearch} />
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
                        className={`gd-button gd-button-small gd-button-action`}
                        onClick={onLoadNextElementsPage}
                        disabled={isLoading || elements.length === totalElementsCount}
                        style={{ margin: 10 }}
                    >
                        {isLoading ? "Loading..." : "Load More..."}
                    </button>
                    <button className="gd-button gd-button-small gd-button-secondary" onClick={onApply}>
                        Apply
                    </button>
                    <button className="gd-button gd-button-small gd-button-secondary" onClick={onReset}>
                        Reset
                    </button>
                    <button
                        className="gd-button gd-button-small gd-button-secondary"
                        onClick={() => onSelect([], isWorkingSelectionInverted)}
                    >
                        Clear
                    </button>
                </div>
            )}
        </div>
    );
}

const UseAttributeFilterController = () => {
    const [filter, setFilter] = useState<IAttributeFilter>(
        newNegativeAttributeFilter(Md.EmployeeName.Default, []),
    );

    return <CustomAttributeFilter filter={filter} onApply={setFilter} />;
};

export default UseAttributeFilterController;
