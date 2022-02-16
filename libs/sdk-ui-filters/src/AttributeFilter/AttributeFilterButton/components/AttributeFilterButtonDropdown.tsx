// (C) 2022 GoodData Corporation
import React from "react";
import { MediaQueries } from "../../../constants";
import AttributeFilterButtonDropdownButton from "./AttributeFilterButtonDropdownButton";
import { getLoadingTitleIntl } from "../../utils/AttributeFilterUtils";
import { Dropdown } from "@gooddata/sdk-ui-kit";
import MediaQuery from "react-responsive";
import { IAttributeElement, IAttributeMetadataObject } from "@gooddata/sdk-backend-spi";
import { useIntl } from "react-intl";
import AttributeFilterButtonDefaultDropdownBody from "./AttributeFilterButtonDefaultDropdownBody";
import {
    IAttributeDropdownBodyExtendedProps,
    IAttributeDropdownBodyProps,
} from "../../AttributeDropdown/AttributeDropdownBody";
import noop from "lodash/noop";
import { IElementQueryResultWithEmptyItems } from "../../AttributeDropdown/types";

interface IAttributeFilterButtonDropdownProps {
    isFiltering: boolean;
    isDropdownOpen: boolean;

    isElementsLoading: boolean;
    isAttributeStatusLoading: boolean;
    isOriginalTotalCountLoading: boolean;

    parentFilterTitles: string[];

    attribute: IAttributeMetadataObject;
    validOptions: IElementQueryResultWithEmptyItems;
    title: string;

    subtitle: string;

    selectedFilterOptions: IAttributeElement[];

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
        isAttributeStatusLoading,
        isOriginalTotalCountLoading,
        attribute,
        validOptions,
        title,
        subtitle,
        selectedFilterOptions,
        onDropdownOpenStateChanged,
        isAllFiltered,
        hasNoData,
        parentFilterTitles,
        onApplyButtonClicked,
        getDropdownBodyProps,
        renderBody,
    } = props;

    const intl = useIntl();

    return (
        <Dropdown
            closeOnParentScroll={true}
            closeOnMouseDrag={true}
            closeOnOutsideClick={true}
            enableEventPropagation={true}
            alignPoints={[
                { align: "bl tl" },
                { align: "tr tl" },
                { align: "br tr", offset: { x: -11 } },
                { align: "tr tl", offset: { x: 0, y: -100 } },
                { align: "tr tl", offset: { x: 0, y: -50 } },
            ]}
            renderButton={({ toggleDropdown }) => (
                <MediaQuery query={MediaQueries.IS_MOBILE_DEVICE}>
                    {(isMobile) => (
                        <span onClick={toggleDropdown}>
                            <AttributeFilterButtonDropdownButton
                                isFiltering={isFiltering}
                                isOpen={isDropdownOpen}
                                isMobile={isMobile}
                                title={
                                    title ||
                                    // (attributeStatus !== "loading" && attributeStatus !== "pending")
                                    isAttributeStatusLoading
                                        ? attribute.title
                                        : getLoadingTitleIntl(intl)
                                }
                                subtitleText={subtitle}
                                subtitleItemCount={selectedFilterOptions.length}
                                isLoaded={!isOriginalTotalCountLoading}
                            />
                        </span>
                    )}
                </MediaQuery>
            )}
            onOpenStateChanged={onDropdownOpenStateChanged}
            renderBody={({ closeDropdown }) => (
                <MediaQuery query={MediaQueries.IS_MOBILE_DEVICE}>
                    {(isMobile) =>
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
                                isElementsLoading: !validOptions?.items && isElementsLoading,
                                isLoaded: !isOriginalTotalCountLoading,
                                onConfigurationChange: noop,
                                attributeFilterRef: null,
                                isMobile,
                            })
                        ) : (
                            <AttributeFilterButtonDefaultDropdownBody
                                allElementsFiltered={isAllFiltered}
                                parentFilterTitles={parentFilterTitles}
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
                                    isMobile,
                                )}
                            />
                        )
                    }
                </MediaQuery>
            )}
        />
    );
};

export default AttributeFilterButtonDropdown;
