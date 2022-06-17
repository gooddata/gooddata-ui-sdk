// (C) 2022 GoodData Corporation
import React from "react";
import { AttributeFilterButton } from "./AttributeFilterButton";
import { Dropdown } from "@gooddata/sdk-ui-kit";
import { AttributeFilterButtonDefaultDropdownBody } from "./AttributeFilterButtonDefaultDropdownBody";
import { IAttributeDropdownBodyExtendedProps, IAttributeDropdownBodyProps } from "./AttributeDropdownBody";
import noop from "lodash/noop";
import { IListItem } from "../types";

const ALIGN_POINTS = [
    { align: "bl tl" },
    { align: "tr tl" },
    { align: "br tr", offset: { x: -11 } },
    { align: "tr tl", offset: { x: 0, y: -100 } },
    { align: "tr tl", offset: { x: 0, y: -50 } },
];

interface IAttributeFilterButtonDropdownProps {
    isFiltering: boolean;
    isDropdownOpen: boolean;

    isElementsLoading: boolean;
    isOriginalTotalCountLoading: boolean;

    title: string;

    subtitle: string;

    selectedFilterOptions: IListItem[];

    onDropdownOpenStateChanged: (isOpen: boolean) => void;
    onApplyButtonClicked: (closeDropdown: () => void) => void;

    isAllFiltered: boolean;
    hasNoData: boolean;

    getDropdownBodyProps: (
        onApplyButtonClicked: () => void,
        onCloseButtonClicked: () => void,
        isMobile?: boolean,
    ) => IAttributeDropdownBodyProps;

    renderBody?: (props: IAttributeDropdownBodyExtendedProps) => React.ReactNode;
}

const AttributeFilterButtonDropdown: React.FC<IAttributeFilterButtonDropdownProps> = (props) => {
    const {
        isFiltering,
        isDropdownOpen,
        isElementsLoading,
        isOriginalTotalCountLoading,
        title,
        subtitle,
        selectedFilterOptions,
        onDropdownOpenStateChanged,
        isAllFiltered,
        hasNoData,
        onApplyButtonClicked,
        getDropdownBodyProps,
        renderBody,
    } = props;

    return (
        <Dropdown
            closeOnParentScroll={true}
            closeOnMouseDrag={true}
            closeOnOutsideClick={true}
            enableEventPropagation={true}
            alignPoints={ALIGN_POINTS}
            renderButton={({ toggleDropdown }) => (
                <AttributeFilterButton
                    isFiltering={isFiltering}
                    isOpen={isDropdownOpen}
                    title={title}
                    subtitleText={subtitle}
                    subtitleItemCount={selectedFilterOptions.length}
                    isLoaded={!isOriginalTotalCountLoading}
                    onClick={toggleDropdown}
                />
            )}
            onOpenStateChanged={onDropdownOpenStateChanged}
            renderBody={({ closeDropdown }) =>
                renderBody ? (
                    renderBody({
                        ...getDropdownBodyProps(
                            () => {
                                onApplyButtonClicked(closeDropdown);
                            },
                            () => {
                                closeDropdown();
                            },
                        ),
                        isElementsLoading: isElementsLoading,
                        isLoaded: !isOriginalTotalCountLoading,
                        onConfigurationChange: noop,
                        attributeFilterRef: null,
                    })
                ) : (
                    <AttributeFilterButtonDefaultDropdownBody
                        allElementsFiltered={isAllFiltered}
                        onApplyButtonClicked={onApplyButtonClicked}
                        closeDropdown={closeDropdown}
                        hasNoData={hasNoData}
                        bodyProps={getDropdownBodyProps(
                            () => {
                                onApplyButtonClicked(closeDropdown);
                            },
                            () => {
                                closeDropdown();
                            },
                        )}
                    />
                )
            }
        />
    );
};

export default AttributeFilterButtonDropdown;
