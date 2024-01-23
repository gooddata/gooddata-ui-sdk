// (C) 2024 GoodData Corporation

import React, { useState } from "react";
import { FormattedMessage, useIntl, WrappedComponentProps } from "react-intl";
import { Typography, Bubble, BubbleHoverTrigger, Button, NoData } from "@gooddata/sdk-ui-kit";
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

import { LimitingItem } from "./LimitingItem.js";
import { useLimitingItems } from "./limitingItemsHook.js";
import { AddLimitingItemDialog } from "./AddLimitingItemDialog.js";

const TOOLTIP_ALIGN_POINTS = [{ align: "cr cl" }, { align: "cl cr" }];

const WithExplanationTooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <BubbleHoverTrigger tagName="abbr">
            {children}
            <Bubble alignPoints={TOOLTIP_ALIGN_POINTS}>
                <FormattedMessage
                    id="attributesDropdown.valuesLimiting.mainTooltip"
                    values={{ br: <br /> }}
                />
            </Bubble>
        </BubbleHoverTrigger>
    );
};

const UnknownItemTitle: React.FC = () => {
    return (
        <em>
            <FormattedMessage id="attributesDropdown.valuesLimiting.unknownItem" />
        </em>
    );
};

const extractKey = (item: ValuesLimitingItem) =>
    isObjRef(item) ? serializeObjRef(item) : item.localIdentifier;

interface ILimitValuesConfigurationProps {
    parentFilters: IDashboardAttributeFilterParentItem[];
    validParentFilters: ObjRef[];
    validateElementsBy: ObjRef[];
    metricsAndFacts: IMetricsAndFacts;
    onLimitingItemUpdate: (items: ObjRef[]) => void;
    onParentFilterUpdate: (localId: string, isSelected: boolean, overAttributes?: ObjRef[]) => void;
}

const LimitValuesConfiguration: React.FC<ILimitValuesConfigurationProps> = ({
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
                    <WithExplanationTooltip>
                        <i className="gd-icon-circle-question" />
                    </WithExplanationTooltip>
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
                    <WithExplanationTooltip>
                        <NoData
                            className="attribute-filter__limit__no-data"
                            noDataLabel={intl.formatMessage(messages.filterAddValuesLimitNoData)}
                        />
                    </WithExplanationTooltip>
                ) : (
                    <>
                        {itemsWithTitles.map(({ title, item }) => (
                            <LimitingItem
                                key={extractKey(item)}
                                title={title ?? <UnknownItemTitle />}
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
