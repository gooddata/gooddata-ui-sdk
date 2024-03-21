// (C) 2024 GoodData Corporation

import React, { ReactNode } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import cx from "classnames";
import { ICatalogDateDataset, IDashboardDateFilter, ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { Bubble, DropdownList, NoData, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { ValuesLimitingItem } from "../../../../types.js";
import {
    IDashboardAttributeFilterParentItem,
    IDashboardDependentDateFilter,
    selectEnableKDAttributeFilterDatesValidation,
    useDashboardSelector,
    useDashboardUserInteraction,
} from "../../../../../../../model/index.js";
import { messages } from "../../../../../../../locales.js";
import { LimitingItemTitle, UnknownItemTitle } from "../shared/LimitingItem.js";
import { useFilterItems, IValuesLimitingItemWithTitle } from "../shared/limitingItemsHook.js";

import { PopupHeader } from "./PopupHeader.js";

const ALIGN_POINTS = [{ align: "bc tl" }, { align: "tc bl" }];

const ARROW_OFFSET = {
    "bc tl": [-60, 10],
    "tc bl": [-60, -10],
};

export interface IParentFiltersPageProps {
    attributeTitle?: string;
    parentFilters: IDashboardAttributeFilterParentItem[];
    validParentFilters: ObjRef[];
    dependentDateFilters: IDashboardDependentDateFilter[];
    availableDatasets: ICatalogDateDataset[];
    dependentCommonDateFilter: IDashboardDateFilter;
    onSelect: (item: ValuesLimitingItem) => void;
    onGoBack: () => void;
    onClose: () => void;
    onCommonDateSelect: () => void;
}

interface IWithDisabledFilterTooltipProps {
    children: React.ReactNode;
    attributeFilterTitle: React.ReactNode;
    parentFilterTitle: React.ReactNode;
    isDisabled: boolean;
}

// TODO: LX-160
const WithDisabledParentFilterTooltip: React.FC<IWithDisabledFilterTooltipProps> = ({
    children,
    isDisabled,
    attributeFilterTitle,
    parentFilterTitle,
}) => {
    if (!isDisabled) {
        return <>{children}</>;
    }
    return (
        <BubbleHoverTrigger>
            {children}
            <Bubble
                className="bubble-primary gd-attribute-filter-dropdown-bubble s-attribute-filter-dropdown-bubble"
                alignPoints={ALIGN_POINTS}
                arrowOffsets={ARROW_OFFSET}
            >
                <FormattedMessage
                    id="attributesDropdown.noConnectionMessage"
                    values={{
                        childTitle: attributeFilterTitle,
                        parentTitle: parentFilterTitle,
                        // eslint-disable-next-line react/display-name
                        strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                    }}
                />
            </Bubble>
        </BubbleHoverTrigger>
    );
};

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
    onSelect: (item: ValuesLimitingItem) => void;
    onClose: () => void;
    onCommonDateSelect: () => void;
}

const ParentFilter: React.FC<IParentFilterProps> = ({
    item: { title, item, isDisabled, type },
    attributeTitle,
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
            attributeFilterInteraction("attributeFilterLimitParentFilterClicked");
        }
    };

    return (
        <div key={serializeObjRef(item)} className={classNames} onClick={onClick}>
            <WithDisabledParentFilterTooltip
                attributeFilterTitle={attributeTitle ?? <UnknownItemTitle />}
                parentFilterTitle={title ?? <UnknownItemTitle />}
                isDisabled={!!isDisabled}
            >
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
