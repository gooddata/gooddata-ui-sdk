// (C) 2024 GoodData Corporation

import React, { useMemo } from "react";
import cx from "classnames";
import { useIntl } from "react-intl";
import { ICatalogDateDataset } from "@gooddata/sdk-model";

import { messages } from "../../../../../../../locales.js";
import { ValuesLimitingItem } from "../../../../types.js";

import { PopupHeader } from "./PopupHeader.js";
import { DropdownList, ShortenedText } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

export interface IDateFiltersPageProps {
    availableDatasets: ICatalogDateDataset[];
    onSelect: (item: ValuesLimitingItem) => void;
    onGoBack: () => void;
    onClose: () => void;
}

interface IAttributeListItemProps {
    item: ICatalogDateDataset;
    onClick: () => void;
}

const TOOLTIP_ALIGN_POINT = [
    { align: "cr cl", offset: { x: 10, y: 0 } },
    { align: "cl cr", offset: { x: -10, y: 0 } },
];

const DateAttributeListItem: React.FC<IAttributeListItemProps> = ({ item, onClick }) => {
    const classNames = useMemo(() => {
        return cx(
            "gd-list-item date-filter__limit__popup__item",
            `s-${stringUtils.simplifyText(item.dataSet.title)}`,
        );
    }, [item]);

    return (
        <div key={item.dataSet.id} className={classNames} onClick={onClick}>
            <ShortenedText tooltipAlignPoints={TOOLTIP_ALIGN_POINT}>{item.dataSet.title}</ShortenedText>
        </div>
    );
};

export default DateAttributeListItem;

export const DateFiltersPage: React.FC<IDateFiltersPageProps> = ({
    availableDatasets,
    onSelect,
    onGoBack,
    onClose,
}) => {
    const intl = useIntl();

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
                    items={availableDatasets}
                    renderItem={({ item }) => (
                        <DateAttributeListItem
                            item={item}
                            onClick={() => {
                                onSelect(item.dataSet.ref);
                                onClose();
                            }}
                        />
                    )}
                />
            </div>
        </>
    );
};
