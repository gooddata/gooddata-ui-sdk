// (C) 2024-2025 GoodData Corporation

import { ReactNode, useMemo } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { ICatalogDateDataset, IDashboardDateFilter, serializeObjRef } from "@gooddata/sdk-model";
import { DropdownList, ShortenedText } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { PopupHeader } from "./PopupHeader.js";
import { WithDisabledParentFilterTooltip } from "./WithDisabledParentFilterTooltip.js";
import { messages } from "../../../../../../../locales.js";
import {
    IDashboardDependentDateFilter,
    isDashboardDependentDateFilter,
    useDashboardUserInteraction,
} from "../../../../../../../model/index.js";
import { ValuesLimitingItem } from "../../../../types.js";
import { UnknownItemTitle } from "../shared/LimitingItem.js";
import {
    IValuesLimitingItemWithTitle,
    useCommonDateItems,
    useDependentDateFilterTitle,
} from "../shared/limitingItemsHook.js";

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
    dependentDateFilters: IDashboardDependentDateFilter[];
    onSelect: (item: ValuesLimitingItem) => void;
    onClose: () => void;
}

export function DateAttributeListItem({
    item: { item, isDisabled, title },
    dependentDateFilters,
    onSelect,
    onClose,
}: IAttributeListItemProps) {
    const { attributeFilterInteraction } = useDashboardUserInteraction();
    const classNames = useMemo(() => {
        return cx(
            "gd-list-item date-filter__limit__popup__item",
            `s-${stringUtils.simplifyText(title ?? "unknown")}`,
            {
                "is-disabled": isDisabled,
            },
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item]);

    const dataSet = isDashboardDependentDateFilter(item) ? item.dataSet : undefined;
    const dependentDateFilterTitle = useDependentDateFilterTitle(dataSet, dependentDateFilters);

    const onClick = () => {
        if (!isDisabled) {
            onSelect(item);
            onClose();
            attributeFilterInteraction("attributeFilterLimitDependentDateFilterClicked");
        }
    };

    return (
        <WithDisabledParentFilterTooltip
            formattedMessage={
                <FormattedMessage
                    id="attributesDropdown.valuesLimiting.disableDataSet"
                    values={{
                        dateFilterTitle: dependentDateFilterTitle ?? <UnknownItemTitle />,
                        strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                    }}
                />
            }
            isDisabled={!!isDisabled}
        >
            <div key={serializeObjRef(item)} className={classNames} onClick={onClick}>
                <ShortenedText>{title!}</ShortenedText>
            </div>
        </WithDisabledParentFilterTooltip>
    );
}

export function DateFiltersPage({
    availableDatasets,
    dependentCommonDateFilter,
    dependentDateFilters,
    onSelect,
    onGoBack,
    onClose,
}: IDateFiltersPageProps) {
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
                        <DateAttributeListItem
                            dependentDateFilters={dependentDateFilters}
                            item={item}
                            onSelect={onSelect}
                            onClose={onClose}
                        />
                    )}
                />
            </div>
        </>
    );
}
