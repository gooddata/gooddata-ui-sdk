// (C) 2024 GoodData Corporation

import React, { useMemo } from "react";
import cx from "classnames";
import { useIntl } from "react-intl";
import { ICatalogDateDataset, IDashboardDateFilter, serializeObjRef } from "@gooddata/sdk-model";
import { DropdownList, ShortenedText } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { messages } from "../../../../../../../locales.js";
import { ValuesLimitingItem } from "../../../../types.js";

import { PopupHeader } from "./PopupHeader.js";
import { IValuesLimitingItemWithTitle, useCommonDateItems } from "../shared/limitingItemsHook.js";
import { IDashboardDependentDateFilter } from "../../../../../../../model/index.js";

export interface IDateFiltersPageProps {
    availableDatasets: ICatalogDateDataset[];
    dependentCommonDateFilter: IDashboardDateFilter;
    dependentDateFilters: IDashboardDependentDateFilter[];
    onSelect: (item: ValuesLimitingItem) => void;
    onGoBack: () => void;
    onClose: () => void;
}

interface IAttributeListItemProps {
    item: IValuesLimitingItemWithTitle;
    onSelect: (item: ValuesLimitingItem) => void;
    onClose: () => void;
}

const TOOLTIP_ALIGN_POINT = [
    { align: "cr cl", offset: { x: 10, y: 0 } },
    { align: "cl cr", offset: { x: -10, y: 0 } },
];

// TODO: LX-160
const DateAttributeListItem: React.FC<IAttributeListItemProps> = ({ item, onSelect, onClose }) => {
    const classNames = useMemo(() => {
        return cx(
            "gd-list-item date-filter__limit__popup__item",
            `s-${stringUtils.simplifyText(item.title ?? "unknown")}`,
        );
    }, [item]);

    const onClick = () => {
        onSelect(item.item);
        onClose();
    };

    return (
        <div key={serializeObjRef(item.item)} className={classNames} onClick={onClick}>
            <ShortenedText tooltipAlignPoints={TOOLTIP_ALIGN_POINT}>{item.title!}</ShortenedText>
        </div>
    );
};

export default DateAttributeListItem;

export const DateFiltersPage: React.FC<IDateFiltersPageProps> = ({
    availableDatasets,
    dependentCommonDateFilter,
    dependentDateFilters,
    onSelect,
    onGoBack,
    onClose,
}) => {
    const intl = useIntl();

    const commonDateItems = useCommonDateItems(
        availableDatasets,
        dependentCommonDateFilter,
        dependentDateFilters,
    );

    return (
        <>
            <PopupHeader
                title={intl.formatMessage(messages.filterAddDateTitle)}
                onGoBack={onGoBack}
                onClose={onClose}
            />
            <div className="attribute-filter__limit__popup__list--dates">
                <DropdownList
                    width={250}
                    isMobile={false}
                    showSearch={false}
                    items={commonDateItems}
                    renderItem={({ item }) => (
                        <DateAttributeListItem item={item} onSelect={onSelect} onClose={onClose} />
                    )}
                />
            </div>
        </>
    );
};
