// (C) 2021-2022 GoodData Corporation
import React from "react";
import { BackendProvider, IntlWrapper, WorkspaceProvider } from "@gooddata/sdk-ui";
import { AttributeFilterComponentsProvider } from "./Context/AttributeFilterComponentsContext";
import { AttributeFilterDefaultComponents } from "./Context/AttributeFilterDefaultComponents";
import { IAttributeFilterBaseProps } from "./types";
import { AttributeFilterRenderer } from "./Components/AttributeFilterRenderer";
import { AttributeFilterContextProvider } from "./Context/AttributeFilterContext";

/**
 * @internal
 */
export const AttributeFilterBase: React.FC<IAttributeFilterBaseProps> = (props) => {
    const {
        backend,
        workspace,
        locale,
        FilterError,
        FilterButton,
        FilterDropdownButtons,
        FilterDropdownBody,
        FilterDropdownContent,
        FilterList,
        FilterListLoading,
        FilterListItem,
        MessageListError,
        MessageNoData,
        MessageNoMatchingData,
        MessageParentItemsFiltered,
    } = props;
    return (
        <IntlWrapper locale={locale}>
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={workspace}>
                    <AttributeFilterComponentsProvider
                        AttributeFilterError={
                            FilterError ?? AttributeFilterDefaultComponents.AttributeFilterError
                        }
                        AttributeFilterButton={
                            FilterButton ?? AttributeFilterDefaultComponents.AttributeFilterButton
                        }
                        AttributeFilterDropdownButtons={
                            FilterDropdownButtons ??
                            AttributeFilterDefaultComponents.AttributeFilterDropdownButtons
                        }
                        AttributeFilterDropdownBody={
                            FilterDropdownBody ?? AttributeFilterDefaultComponents.AttributeFilterDropdownBody
                        }
                        AttributeFilterDropdownContent={
                            FilterDropdownContent ??
                            AttributeFilterDefaultComponents.AttributeFilterDropdownContent
                        }
                        AttributeFilterList={
                            FilterList ?? AttributeFilterDefaultComponents.AttributeFilterList
                        }
                        AttributeFilterListItem={
                            FilterListItem ?? AttributeFilterDefaultComponents.AttributeFilterListItem
                        }
                        AttributeFilterListLoading={
                            FilterListLoading ?? AttributeFilterDefaultComponents.AttributeFilterListLoading
                        }
                        MessageListError={
                            MessageListError ?? AttributeFilterDefaultComponents.MessageListError
                        }
                        MessageNoData={MessageNoData ?? AttributeFilterDefaultComponents.MessageNoData}
                        MessageNoMatchingData={
                            MessageNoMatchingData ?? AttributeFilterDefaultComponents.MessageNoMatchingData
                        }
                        MessageParentItemsFiltered={
                            MessageParentItemsFiltered ??
                            AttributeFilterDefaultComponents.MessageParentItemsFiltered
                        }
                    >
                        <AttributeFilterContextProvider {...props}>
                            <AttributeFilterRenderer {...props} />
                        </AttributeFilterContextProvider>
                    </AttributeFilterComponentsProvider>
                </WorkspaceProvider>
            </BackendProvider>
        </IntlWrapper>
    );
};
