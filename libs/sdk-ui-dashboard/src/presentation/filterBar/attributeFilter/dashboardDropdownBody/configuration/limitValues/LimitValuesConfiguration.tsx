// (C) 2024 GoodData Corporation

import React, { useState } from "react";
import { FormattedMessage, useIntl, WrappedComponentProps } from "react-intl";
import { Typography, Button, NoData } from "@gooddata/sdk-ui-kit";
import { isObjRef, serializeObjRef, ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { messages } from "../../../../../../locales.js";
import { ValuesLimitingItem } from "../../../types.js";
import {
    IDashboardAttributeFilterParentItem,
    useDashboardSelector,
    selectEnableAttributeFilterValuesValidation,
    IMetricsAndFacts,
    selectBackendCapabilities,
} from "../../../../../../model/index.js";
import { IntlWrapper } from "../../../../../localization/index.js";

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
    onLimitingItemUpdate: (items: ObjRef[]) => void;
    onParentFilterUpdate: (localId: string, isSelected: boolean, overAttributes?: ObjRef[]) => void;
}

const LimitValuesConfiguration: React.FC<ILimitValuesConfigurationProps> = ({
    attributeTitle,
    parentFilters,
    validParentFilters,
    validateElementsBy,
    metricsAndFacts,
    onLimitingItemUpdate,
    onParentFilterUpdate,
}) => {
    const intl = useIntl();
    const [isDropdownOpened, setIsDropdownOpened] = useState(false);
    const itemsWithTitles = useLimitingItems(
        parentFilters,
        validParentFilters,
        validateElementsBy,
        metricsAndFacts,
    );

    const onAdd = (addedItem: ValuesLimitingItem) => {
        if (isObjRef(addedItem)) {
            onLimitingItemUpdate([...validateElementsBy, addedItem]);
        } else {
            onParentFilterUpdate(addedItem.localIdentifier, true);
        }
    };

    const onDelete = (deletedItem: ValuesLimitingItem) => {
        if (isObjRef(deletedItem)) {
            onLimitingItemUpdate(validateElementsBy.filter((item) => !areObjRefsEqual(deletedItem, item)));
        } else {
            onParentFilterUpdate(deletedItem.localIdentifier, false);
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
                    onClick={() => setIsDropdownOpened(true)}
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
