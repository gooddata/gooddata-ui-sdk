// (C) 2024-2025 GoodData Corporation

import { useState } from "react";

import { FormattedMessage, type WrappedComponentProps, useIntl } from "react-intl";

import {
    type ICatalogDateDataset,
    type IDashboardDateFilter,
    type ObjRef,
    areObjRefsEqual,
    isObjRef,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { Button, NoData, Typography } from "@gooddata/sdk-ui-kit";

import { AddLimitingItemDialog } from "./dialog/AddLimitingItemDialog.js";
import { LimitingItem } from "./shared/LimitingItem.js";
import { useLimitingItems } from "./shared/limitingItemsHook.js";
import { useCommonDateFilterTitle } from "../../../../../../_staging/sharedHooks/useCommonDateFilterTitle.js";
import { messages } from "../../../../../../locales.js";
import {
    type IDashboardAttributeFilterParentItem,
    type IDashboardDependentDateFilter,
    type IMetricsAndFacts,
    isDashboardDependentDateFilter,
    selectBackendCapabilities,
    selectEnableKDAttributeFilterDatesValidation,
    useDashboardSelector,
    useDashboardUserInteraction,
} from "../../../../../../model/index.js";
import { IntlWrapper } from "../../../../../localization/index.js";
import { type ValuesLimitingItem } from "../../../types.js";

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

function LimitValuesConfiguration({
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
}: ILimitValuesConfigurationProps) {
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
}

export type LocalizedLimitValuesConfigurationProps = ILimitValuesConfigurationProps & WrappedComponentProps;

export function LocalizedLimitValuesConfiguration(props: LocalizedLimitValuesConfigurationProps) {
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    if (!capabilities.supportsAttributeFilterElementsLimiting) {
        return null;
    }
    return (
        <IntlWrapper locale={props.intl.locale}>
            <LimitValuesConfiguration {...props} />
        </IntlWrapper>
    );
}
