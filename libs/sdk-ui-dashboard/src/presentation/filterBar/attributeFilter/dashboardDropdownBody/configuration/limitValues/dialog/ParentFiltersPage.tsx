// (C) 2024-2025 GoodData Corporation

import React, { ReactNode } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { ICatalogDateDataset, IDashboardDateFilter, ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { DropdownList, NoData } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { PopupHeader } from "./PopupHeader.js";
import { WithDisabledParentFilterTooltip } from "./WithDisabledParentFilterTooltip.js";
import { messages } from "../../../../../../../locales.js";
import {
    IDashboardAttributeFilterParentItem,
    IDashboardDependentDateFilter,
    isDashboardDependentDateFilter,
    selectEnableKDAttributeFilterDatesValidation,
    useDashboardSelector,
    useDashboardUserInteraction,
} from "../../../../../../../model/index.js";
import { ValuesLimitingItem } from "../../../../types.js";
import { LimitingItemTitle, UnknownItemTitle } from "../shared/LimitingItem.js";
import { IValuesLimitingItemWithTitle, useFilterItems } from "../shared/limitingItemsHook.js";

export interface IParentFiltersPageProps {
    attributeTitle?: string;
    parentFilters: IDashboardAttributeFilterParentItem[];
    validParentFilters: ObjRef[];
    dependentDateFilters: IDashboardDependentDateFilter[];
    availableDatasets: ICatalogDateDataset[];
    dependentCommonDateFilter: IDashboardDateFilter;
    commonDateFilterTitle: string;
    onSelect: (item: ValuesLimitingItem) => void;
    onGoBack: () => void;
    onClose: () => void;
    onCommonDateSelect: () => void;
}

const NoParentFilterFound: React.FC<{ hasNoMatchingData: boolean }> = ({ hasNoMatchingData }) => {
    const intl = useIntl();
    return (
        <NoData
            className="attribute-filter__limit__popup__no-data"
            hasNoMatchingData={hasNoMatchingData}
            notFoundLabel={intl.formatMessage(messages.filterAddValuesLimitPopupSearchNoMatch)}
            noDataLabel={intl.formatMessage(messages.filterAddValuesLimitPopupNoFilters)}
        />
    );
};

interface IParentFilterProps {
    attributeTitle?: string;
    item: IValuesLimitingItemWithTitle;
    commonDateFilterTitle: string;
    onSelect: (item: ValuesLimitingItem) => void;
    onClose: () => void;
    onCommonDateSelect: () => void;
}

const getFormattedMessage = (
    commonDateFilterTitle: string,
    attributeTitle?: string,
    parentFilterTitle?: string,
    isDisabledDateFilterTooltip?: boolean,
): React.ReactNode => {
    if (isDisabledDateFilterTooltip) {
        return (
            <FormattedMessage
                id="attributesDropdown.valuesLimiting.disableDateFilter"
                values={{
                    dateFilterTitle: commonDateFilterTitle,
                    // eslint-disable-next-line react/display-name
                    strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                }}
            />
        );
    } else {
        return (
            <FormattedMessage
                id="attributesDropdown.noConnectionMessage"
                values={{
                    childTitle: attributeTitle ?? <UnknownItemTitle />,
                    parentTitle: parentFilterTitle ?? <UnknownItemTitle />,
                    // eslint-disable-next-line react/display-name
                    strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                }}
            />
        );
    }
};

const ParentFilter: React.FC<IParentFilterProps> = ({
    item: { title, item, type, isDisabled, isDisabledDateFilterTooltip },
    attributeTitle,
    commonDateFilterTitle,
    onSelect,
    onClose,
    onCommonDateSelect,
}) => {
    const { attributeFilterInteraction } = useDashboardUserInteraction();
    const classNames = cx(
        "gd-list-item attribute-filter__limit__popup__item",
        `s-dashboard-filter-${stringUtils.simplifyText(title ?? "unknown")}`,
        {
            "is-disabled": isDisabled,
        },
    );
    const onClick = () => {
        if (type === "commonDate") {
            onCommonDateSelect();
            return;
        }

        if (!isDisabled) {
            onSelect(item);
            onClose();

            if (isDashboardDependentDateFilter(item)) {
                attributeFilterInteraction("attributeFilterLimitDependentDateFilterClicked");
            } else {
                attributeFilterInteraction("attributeFilterLimitParentFilterClicked");
            }
        }
    };

    const formattedMessage = getFormattedMessage(
        commonDateFilterTitle,
        attributeTitle,
        title,
        isDisabledDateFilterTooltip,
    );

    return (
        <div key={serializeObjRef(item)} className={classNames} onClick={onClick}>
            <WithDisabledParentFilterTooltip formattedMessage={formattedMessage} isDisabled={!!isDisabled}>
                <LimitingItemTitle item={item} title={title} />
            </WithDisabledParentFilterTooltip>
        </div>
    );
};

export const ParentFiltersPage: React.FC<IParentFiltersPageProps> = ({
    attributeTitle,
    parentFilters,
    validParentFilters,
    dependentDateFilters,
    dependentCommonDateFilter,
    availableDatasets,
    commonDateFilterTitle,
    onSelect,
    onGoBack,
    onClose,
    onCommonDateSelect,
}) => {
    const intl = useIntl();
    const isEnabledKDAttributeFilterDatesValidation = useDashboardSelector(
        selectEnableKDAttributeFilterDatesValidation,
    );

    const items = useFilterItems(
        parentFilters,
        validParentFilters,
        dependentDateFilters,
        availableDatasets,
        dependentCommonDateFilter,
        isEnabledKDAttributeFilterDatesValidation,
        false,
        intl,
    );

    return (
        <>
            <PopupHeader
                title={intl.formatMessage(messages.filterAddFilterTitle)}
                onGoBack={onGoBack}
                onClose={onClose}
            />
            <div className="attribute-filter__limit__popup__list">
                <DropdownList
                    width={250}
                    isMobile={false}
                    showSearch={false}
                    renderNoData={(props) => <NoParentFilterFound {...props} />}
                    items={items}
                    renderItem={({ item }) => (
                        <ParentFilter
                            attributeTitle={attributeTitle}
                            commonDateFilterTitle={commonDateFilterTitle}
                            item={item}
                            onSelect={onSelect}
                            onClose={onClose}
                            onCommonDateSelect={onCommonDateSelect}
                        />
                    )}
                />
            </div>
        </>
    );
};
