// (C) 2024 GoodData Corporation

import React, { useState } from "react";
import { FormattedMessage, useIntl, WrappedComponentProps } from "react-intl";
import { Typography, Button, NoData } from "@gooddata/sdk-ui-kit";
import {
    isObjRef,
    serializeObjRef,
    ObjRef,
    areObjRefsEqual,
    ICatalogDateDataset,
    IDashboardDateFilter,
} from "@gooddata/sdk-model";

import { messages } from "../../../../../../locales.js";
import { ValuesLimitingItem } from "../../../types.js";
import {
    IDashboardAttributeFilterParentItem,
    useDashboardSelector,
    selectEnableAttributeFilterValuesValidation,
    IMetricsAndFacts,
    selectBackendCapabilities,
    useDashboardUserInteraction,
    IDashboardDependentDateFilter,
    selectEnableKDAttributeFilterDatesValidation,
    isDashboardDependentDateFilter,
} from "../../../../../../model/index.js";
import { IntlWrapper } from "../../../../../localization/index.js";
import { useCommonDateFilterTitle } from "../../../../dateFilter/useCommonDateFilterTitle.js";

import { LimitingItem } from "./shared/LimitingItem.js";
import { useLimitingItems } from "./shared/limitingItemsHook.js";
import { AddLimitingItemDialog } from "./dialog/AddLimitingItemDialog.js";

const extractKey = (item: ValuesLimitingItem) =>
    isObjRef(item) ? serializeObjRef(item) : item.localIdentifier;

interface ILimitValuesConfigurationProps {
    attributeTitle?: string;
    parentFilters: IDashboardAttributeFilterParentItem[];
    validParentFilters: ObjRef[];
    validateElementsBy: ObjRef[];
    metricsAndFacts: IMetricsAndFacts;
    availableDatasets: ICatalogDateDataset[];
    dependentDateFilters: IDashboardDependentDateFilter[];
    dependentCommonDateFilter: IDashboardDateFilter;
    onLimitingItemUpdate: (items: ObjRef[]) => void;
    onParentFilterUpdate: (localId: string, isSelected: boolean, overAttributes?: ObjRef[]) => void;
    onDependentDateFilterUpdate: (
        item: IDashboardDependentDateFilter,
        isSelected: boolean,
        isCommonDate: boolean,
    ) => void;
}

const LimitValuesConfiguration: React.FC<ILimitValuesConfigurationProps> = ({
    attributeTitle,
    parentFilters,
    validParentFilters,
    validateElementsBy,
    metricsAndFacts,
    availableDatasets,
    dependentDateFilters,
    dependentCommonDateFilter,
    onLimitingItemUpdate,
    onParentFilterUpdate,
    onDependentDateFilterUpdate,
}) => {
    const intl = useIntl();
    const isEnabledKDAttributeFilterDatesValidation = useDashboardSelector(
        selectEnableKDAttributeFilterDatesValidation,
    );
    const { attributeFilterInteraction } = useDashboardUserInteraction();
    const [isDropdownOpened, setIsDropdownOpened] = useState(false);
    const itemsWithTitles = useLimitingItems(
        parentFilters,
        validParentFilters,
        validateElementsBy,
        metricsAndFacts,
        dependentDateFilters,
        availableDatasets,
        isEnabledKDAttributeFilterDatesValidation,
        true,
        intl,
    );
    const commonDateFilterTitle = useCommonDateFilterTitle(intl);

    const onOpenAddDialog = () => {
        setIsDropdownOpened(true);
        attributeFilterInteraction("attributeFilterLimitAddButtonClicked");
    };

    const onAdd = (addedItem: ValuesLimitingItem) => {
        if (isDashboardDependentDateFilter(addedItem)) {
            onDependentDateFilterUpdate(addedItem, true, addedItem.isCommonDate);
        } else if (isObjRef(addedItem)) {
            onLimitingItemUpdate([...validateElementsBy, addedItem]);
        } else {
            onParentFilterUpdate(addedItem.localIdentifier, true);
        }
    };

    const onDelete = (deletedItem: ValuesLimitingItem) => {
        if (isDashboardDependentDateFilter(deletedItem)) {
            onDependentDateFilterUpdate(deletedItem, false, deletedItem.isCommonDate);
            attributeFilterInteraction("attributeFilterLimitRemoveDependentDateFilterClicked");
        } else if (isObjRef(deletedItem)) {
            onLimitingItemUpdate(validateElementsBy.filter((item) => !areObjRefsEqual(deletedItem, item)));
            attributeFilterInteraction("attributeFilterLimitRemoveMetricClicked");
        } else {
            onParentFilterUpdate(deletedItem.localIdentifier, false);
            attributeFilterInteraction("attributeFilterLimitRemoveParentFilterClicked");
        }
    };

    return (
        <div>
            {isDropdownOpened ? (
                <AddLimitingItemDialog
                    attributeTitle={attributeTitle}
                    currentlySelectedItems={validateElementsBy}
                    parentFilters={parentFilters}
                    validParentFilters={validParentFilters}
                    dependentDateFilters={dependentDateFilters}
                    dependentCommonDateFilter={dependentCommonDateFilter}
                    availableDatasets={availableDatasets}
                    commonDateFilterTitle={commonDateFilterTitle}
                    onSelect={onAdd}
                    onClose={() => setIsDropdownOpened(false)}
                />
            ) : null}
            <div className="configuration-category attribute-filter__limit__title">
                <Typography tagName="h3">
                    <FormattedMessage id="attributesDropdown.valuesLimiting.title" />
                </Typography>
                <Button
                    className="gd-button-small gd-button-link attribute-filter__limit__add-button"
                    iconLeft="gd-icon-plus"
                    onClick={onOpenAddDialog}
                    value={intl.formatMessage(messages.filterAddValuesLimit)}
                />
            </div>
            <div>
                {itemsWithTitles.length === 0 ? (
                    <NoData
                        className="attribute-filter__limit__no-data"
                        noDataLabel={intl.formatMessage(messages.filterAddValuesLimitNoData)}
                    />
                ) : (
                    <>
                        {itemsWithTitles.map(({ title, item }) => (
                            <LimitingItem
                                key={extractKey(item)}
                                title={title}
                                item={item}
                                onDelete={() => onDelete(item)}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export type LocalizedLimitValuesConfigurationProps = ILimitValuesConfigurationProps & WrappedComponentProps;

export const LocalizedLimitValuesConfiguration: React.FC<LocalizedLimitValuesConfigurationProps> = (
    props,
) => {
    const isAttributeFilterValuesValidationEnabled = useDashboardSelector(
        selectEnableAttributeFilterValuesValidation,
    );
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    if (!isAttributeFilterValuesValidationEnabled || !capabilities.supportsAttributeFilterElementsLimiting) {
        return null;
    }
    return (
        <IntlWrapper locale={props.intl.locale}>
            <LimitValuesConfiguration {...props} />
        </IntlWrapper>
    );
};
