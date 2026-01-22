// (C) 2024-2026 GoodData Corporation

import { type ReactNode } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { Separator, Typography } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { PopupHeader } from "./PopupHeader.js";
import { messages } from "../../../../../../../locales.js";
import { useDashboardSelector } from "../../../../../../../model/react/DashboardStoreProvider.js";
import { useDashboardUserInteraction } from "../../../../../../../model/react/useDashboardUserInteraction.js";
import { selectIsWhiteLabeled } from "../../../../../../../model/store/config/configSelectors.js";

interface IActionProps {
    title: string;
    description: ReactNode;
    onClick: () => void;
}

function Action({ title, description, onClick }: IActionProps) {
    const classNames = cx(
        "attribute-filter__limit__popup__action-select__option",
        `s-add-limit-${stringUtils.simplifyText(title)}`,
    );
    return (
        <div className={classNames} onClick={onClick}>
            <div>
                <Typography tagName="h3" className="attribute-filter__limit__popup__action-select__title">
                    {title}
                </Typography>
                <p className="attribute-filter__limit__popup__action-select__description">{description}</p>
            </div>
            <div className="gd-icon-chevron-right attribute-filter__limit__popup__action-select__icon" />
        </div>
    );
}

export interface IActionSelectionPageProps {
    onAddFilters: () => void;
    onAddLimitingItems: () => void;
    onClose: () => void;
}

export function ActionSelectionPage({
    onAddFilters,
    onAddLimitingItems,
    onClose,
}: IActionSelectionPageProps) {
    const intl = useIntl();
    const { attributeFilterInteraction } = useDashboardUserInteraction();
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);

    const onChooseParentFilters = () => {
        onAddFilters();
        attributeFilterInteraction("attributeFilterLimitAddParentFilterOptionClicked");
    };

    const onChooseMetrics = () => {
        onAddLimitingItems();
        attributeFilterInteraction("attributeFilterLimitAddMetricOptionClicked");
    };

    return (
        <>
            <PopupHeader title={intl.formatMessage(messages.filterAddItemTitle)} onClose={onClose} />
            <div className="attribute-filter__limit__popup__content">
                <Action
                    onClick={onChooseParentFilters}
                    title={intl.formatMessage({ id: "attributesDropdown.valuesLimiting.addFilters.title" })}
                    description={intl.formatMessage({
                        id: "attributesDropdown.valuesLimiting.addFilters.description",
                    })}
                />
                <Separator />
                <Action
                    onClick={onChooseMetrics}
                    title={intl.formatMessage({
                        id: "attributesDropdown.valuesLimiting.addLimitingItem.title",
                    })}
                    description={intl.formatMessage(
                        { id: "attributesDropdown.valuesLimiting.addLimitingItem.description" },
                        {
                            a: (chunk: ReactNode) =>
                                isWhiteLabeled ? (
                                    <span />
                                ) : (
                                    <a
                                        href="https://help.gooddata.com/doc/growth/en/dashboards-and-insights/dashboards/filters-in-dashboards/"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                        className="attribute-filter__limit__popup__action-select__option__link"
                                    >
                                        {chunk}
                                    </a>
                                ),
                        },
                    )}
                />
            </div>
        </>
    );
}
