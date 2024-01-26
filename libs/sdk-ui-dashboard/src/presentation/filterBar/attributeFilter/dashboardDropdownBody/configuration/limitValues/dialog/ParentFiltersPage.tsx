// (C) 2024 GoodData Corporation

import React, { ReactNode } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import cx from "classnames";
import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { Bubble, DropdownList, NoData, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { ValuesLimitingItem } from "../../../../types.js";
import { IDashboardAttributeFilterParentItem } from "../../../../../../../model/index.js";
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
    onSelect: (item: ValuesLimitingItem) => void;
    onGoBack: () => void;
    onClose: () => void;
}

interface IWithDisabledFilterTooltipProps {
    children: React.ReactNode;
    attributeFilterTitle: React.ReactNode;
    parentFilterTitle: React.ReactNode;
    isDisabled: boolean;
}

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
}

const ParentFilter: React.FC<IParentFilterProps> = ({
    item: { title, item, isDisabled },
    attributeTitle,
    onSelect,
    onClose,
}) => {
    const classNames = cx("gd-list-item attribute-filter__limit__popup__item", {
        "is-disabled": isDisabled,
    });
    const onClick = () => {
        if (!isDisabled) {
            onSelect(item);
            onClose();
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
    onSelect,
    onGoBack,
    onClose,
}) => {
    const intl = useIntl();
    const items = useFilterItems(parentFilters, validParentFilters);
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
                        />
                    )}
                />
            </div>
        </>
    );
};
