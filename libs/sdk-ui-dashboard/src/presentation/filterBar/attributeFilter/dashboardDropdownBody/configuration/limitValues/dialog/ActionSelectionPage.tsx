// (C) 2024 GoodData Corporation

import React, { ReactNode } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { Typography, Separator } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { messages } from "../../../../../../../locales.js";

import { PopupHeader } from "./PopupHeader.js";
import {
    useDashboardUserInteraction,
    selectIsWhiteLabeled,
    useDashboardSelector,
} from "../../../../../../../model/index.js";

interface IActionProps {
    title: string;
    description: React.ReactNode;
    onClick: () => void;
}

const Action: React.FC<IActionProps> = ({ title, description, onClick }) => {
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
};

export interface IActionSelectionPageProps {
    onAddFilters: () => void;
    onAddLimitingItems: () => void;
    onClose: () => void;
}

export const ActionSelectionPage: React.FC<IActionSelectionPageProps> = ({
    onAddFilters,
    onAddLimitingItems,
    onClose,
}) => {
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
};
