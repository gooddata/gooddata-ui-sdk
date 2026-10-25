// (C) 2020-2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage, defineMessages } from "react-intl";

import { type RankingFilterOperator } from "../../../utils/drilling/types.js";

const messages = defineMessages({
    titleTopLong: { id: "ranking_filter.button.title_top_long" },
    titleBottomLong: { id: "ranking_filter.button.title_bottom_long" },
    titleTopShort: { id: "ranking_filter.button.title_top_short" },
    titleBottomShort: { id: "ranking_filter.button.title_bottom_short" },
    configuration: { id: "ranking_filter.button.configuration" },
    configurationWithoutAttribute: { id: "ranking_filter.button.configuration_without_attribute" },
});

export interface IRankingFilterButtonModel {
    operator: RankingFilterOperator;
    value: number;
    measureTitle: string;
    measureSequence?: string;
    attributeTitle?: string;
}

export interface IRankingFilterButtonProps {
    model: IRankingFilterButtonModel;
    onClick: () => void;
    isActive: boolean;
    className?: string;
}

export function RankingFilterButton({ model, onClick, isActive, className }: IRankingFilterButtonProps) {
    const buttonClassName = cx(
        "dropdown-button",
        "toggle-menu",
        "adi-filter-button",
        "s-filter-button",
        "adi-ranking-filter-button",
        "gd-button",
        "button-dropdown",
        "gd-icon-right",
        className,
        {
            "is-active": isActive,
        },
    );

    const configurationClassName = cx(
        "adi-filter-selection",
        "adi-filter-button-bottom-line",
        "gd-rf-configuration",
        "s-rf-configuration",
    );

    const { attributeTitle, measureTitle, measureSequence, operator, value } = model;

    return (
        <div className={buttonClassName} onClick={onClick}>
            <div className="gd-button-text">
                <div className="adi-filter-title s-attribute-filter-button-title adi-rf-attribute-title s-rf-title">
                    <span className="adi-filter-title-long">
                        {attributeTitle ? (
                            <span title={attributeTitle}>
                                <FormattedMessage
                                    id={
                                        operator === "TOP"
                                            ? messages.titleTopLong.id
                                            : messages.titleBottomLong.id
                                    }
                                    values={{
                                        value,
                                        attribute: attributeTitle,
                                        strong: (chunks) => <strong>{chunks}</strong>,
                                    }}
                                />
                            </span>
                        ) : (
                            <FormattedMessage
                                id={
                                    operator === "TOP"
                                        ? messages.titleTopShort.id
                                        : messages.titleBottomShort.id
                                }
                                values={{
                                    value,
                                    strong: (chunks) => <strong>{chunks}</strong>,
                                }}
                            />
                        )}
                    </span>
                </div>
                <div className={configurationClassName}>
                    <span className="adi-filter-title-long" title={measureTitle}>
                        <FormattedMessage
                            id={
                                attributeTitle
                                    ? messages.configuration.id
                                    : messages.configurationWithoutAttribute.id
                            }
                            values={{ measure: measureTitle }}
                        />
                    </span>
                    {measureSequence ? <>&nbsp;({measureSequence})</> : null}
                </div>
            </div>
        </div>
    );
}
