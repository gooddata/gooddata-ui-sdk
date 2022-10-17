// (C) 2007-2022 GoodData Corporation
import React, { useCallback, useContext, useState } from "react";
import {
    AttributeFilter,
    IAttributeFilterDropdownActionsProps,
    IAttributeFilterDropdownButtonProps,
    IAttributeFilterElementsActionsProps,
    IAttributeFilterElementsSearchBarProps,
    IAttributeFilterElementsSelectItemProps,
    IAttributeFilterStatusBarProps,
    useAttributeFilterContext,
    useAttributeFilterSearch,
} from "@gooddata/sdk-ui-filters";
import { IAttributeFilter, newNegativeAttributeFilter } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

interface ICustomProps {
    onMyCallback: () => void;
}

const defaultCustomProps: ICustomProps = {
    onMyCallback: () => {}, // noop
};

const CustomPropsContext = React.createContext<ICustomProps>(defaultCustomProps);

const useCustomPropsContext = (): ICustomProps => useContext(CustomPropsContext);

const CustomPropsProvider: React.FC<ICustomProps> = (props) => {
    const { children, ...customProps } = props;

    return <CustomPropsContext.Provider value={customProps}>{children}</CustomPropsContext.Provider>;
};

/**
 * This component is example how to pass custom props into AttributeFilter components via Context
 */
const CustomDropdownActions = (props: IAttributeFilterDropdownActionsProps) => {
    const { onApplyButtonClick, onCancelButtonClick } = props;
    // passing custom props to AttributeFilter components is recommended via Context
    const { onMyCallback } = useCustomPropsContext();
    return (
        <div
            style={{
                display: "flex",
                padding: 10,
                margin: 0,
                justifyContent: "right",
            }}
        >
            <button
                className="gd-button-action gd-button-small"
                style={{ marginRight: 5 }}
                onClick={onMyCallback}
            >
                My button
            </button>

            <button
                className="gd-button-action gd-button-small"
                style={{ marginRight: 5 }}
                onClick={onCancelButtonClick}
            >
                Close
            </button>
            <button className="gd-button-action gd-button-small" onClick={onApplyButtonClick}>
                Apply
            </button>
        </div>
    );
};

/**
 * This component is example how access internal AttributeFilter data via useAttributeFilterContext
 */
const CustomDropdownButton = (props: IAttributeFilterDropdownButtonProps) => {
    const { title, selectedItemsCount, isLoading, onClick } = props;

    // accessing internal data and callbacks of attribute filter component
    // this hook is in @alpha stage interface and behavior could be changed in future
    const { totalElementsCount, isCommittedSelectionInverted } = useAttributeFilterContext();

    const selectedLabel =
        selectedItemsCount === 0
            ? isCommittedSelectionInverted
                ? "ALL"
                : "NONE"
            : `(${selectedItemsCount})`;

    const buttonTitle = isLoading ? "Loading ..." : `${title}  ${selectedLabel}/${totalElementsCount}`;

    return (
        <button className="gd-button-primary gd-button-small" onClick={onClick}>
            {buttonTitle}
        </button>
    );
};

const CustomStatusBar = (props: IAttributeFilterStatusBarProps) => {
    const { selectedItems, isInverted } = props;
    return (
        <div
            style={{
                display: "flex",
                margin: 0,
                justifyContent: "left",
                alignItems: "center",
                padding: 10,
                fontSize: 10,
            }}
        >
            <div>
                {isInverted && selectedItems.length === 0 ? "All" : ""}
                {!isInverted && selectedItems.length === 0 ? "None" : ""}
                {isInverted && selectedItems.length > 0 ? "All except:" : ""}{" "}
                <b>{selectedItems.map((item) => item.title).join(", ")}</b>
            </div>
        </div>
    );
};

const CustomElementsSelectActionsComponent = (props: IAttributeFilterElementsActionsProps) => {
    const { onChange, onToggle, totalItemsCount, isVisible } = props;

    // accessing internal data and callbacks of attribute filter component
    // this hook is in @alpha stage interface and behavior could be changed in future
    const { isWorkingSelectionInverted, workingSelectionElements, onSelect } = useAttributeFilterContext();

    const onInvertClick = useCallback(() => {
        onSelect(workingSelectionElements, !isWorkingSelectionInverted);
    }, [isWorkingSelectionInverted, workingSelectionElements, onSelect]);

    if (!isVisible) {
        return null;
    }

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                paddingLeft: 10,
            }}
        >
            <button
                className="gd-button-link"
                onClick={(e) => {
                    onChange(true);
                    e.preventDefault();
                }}
            >
                all
            </button>
            <button className="gd-button-link" onClick={() => onChange(false)}>
                none
            </button>
            <button className="gd-button-link" onClick={() => onToggle()}>
                toggle
            </button>
            <button className="gd-button-link" onClick={() => onInvertClick()}>
                invert
            </button>
            <span style={{ paddingLeft: 10 }}>({totalItemsCount})</span>
        </div>
    );
};

const CustomElementsSelectItem = (props: IAttributeFilterElementsSelectItemProps) => {
    const { isSelected, item, onDeselect, onSelect } = props;

    return (
        <div
            style={{
                padding: "0 10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                height: "28px",
                margin: "0px 10px",
                cursor: "pointer",
            }}
            onClick={() => {
                if (isSelected) {
                    onDeselect();
                } else {
                    onSelect();
                }
            }}
        >
            <div>{item.title}</div>
            <div>{isSelected ? "✔" : ""}</div>
        </div>
    );
};

const CustomElementsSearchBar = (props: IAttributeFilterElementsSearchBarProps) => {
    const { onSearch, searchString } = props;
    const { search, onSearch: onSearchCallback } = useAttributeFilterSearch({ searchString, onSearch });

    return (
        <div style={{ margin: 10 }}>
            Search attribute values:{" "}
            <input
                className="gd-input-field"
                style={{ width: "100%" }}
                onChange={(e) => onSearchCallback(e.target.value)}
                value={search}
            />
        </div>
    );
};

export const AttributeFilterCustomizationExample: React.FC = () => {
    const [filter, setFilter] = useState<IAttributeFilter>(
        newNegativeAttributeFilter(Md.EmployeeName.Default, { values: ["Abbie Adams"] }),
    );

    const onApply = useCallback((filter: IAttributeFilter, _isInverted: boolean) => {
        setFilter(filter);
    }, []);

    const myCustomCallback = useCallback(() => {
        // eslint-disable-next-line no-console
        console.info("My custom button clicked");
    }, []);

    return (
        <div>
            <div>AttributeFilterButton with custom components</div>
            <CustomPropsProvider onMyCallback={myCustomCallback}>
                <AttributeFilter
                    filter={filter}
                    onApply={onApply}
                    DropdownActionsComponent={CustomDropdownActions}
                    DropdownButtonComponent={CustomDropdownButton}
                    StatusBarComponent={CustomStatusBar}
                    ElementsSelectActionsComponent={CustomElementsSelectActionsComponent}
                    ElementsSelectItemComponent={CustomElementsSelectItem}
                    ElementsSearchBarComponent={CustomElementsSearchBar}
                />
            </CustomPropsProvider>
        </div>
    );
};

export default AttributeFilterCustomizationExample;
