// (C) 2019-2024 GoodData Corporation
import React from "react";
import { Dropdown, Button, List, SingleSelectListItem } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { useIntl } from "react-intl";

import { getMeasureTitle } from "./utils.js";
import { DROPDOWN_ITEM_HEIGHT } from "./constants.js";
import { AlertMetric } from "../../types.js";

export interface IAlertMetricSelectProps {
    selectedMeasure: AlertMetric | undefined;
    onMeasureChange: (measure: AlertMetric) => void;
    measures: AlertMetric[];
}

const measureIcon = <div className="gd-alert-measure-select__icon gd-icon-metric" />;

export const AlertMeasureSelect = ({
    selectedMeasure,
    onMeasureChange,
    measures,
}: IAlertMetricSelectProps) => {
    const intl = useIntl();
    const selectedMeasureTitle = selectedMeasure
        ? getMeasureTitle(selectedMeasure.measure)
        : intl.formatMessage({ id: "insightAlert.config.selectMetric" });

    return (
        <div className="gd-alert-measure-select">
            <Dropdown
                renderButton={({ isOpen, toggleDropdown }) => {
                    return (
                        <Button
                            className={cx("gd-alert-measure-select__button s-alert-measure-select", {
                                "is-active": isOpen,
                            })}
                            size="small"
                            variant="secondary"
                            iconLeft={selectedMeasure ? "gd-icon-metric" : undefined}
                            iconRight={`gd-icon-navigate${isOpen ? "up" : "down"}`}
                            onClick={toggleDropdown}
                        >
                            {selectedMeasureTitle}
                        </Button>
                    );
                }}
                renderBody={({ closeDropdown }) => {
                    return (
                        <List
                            className="gd-alert-measure-select__list s-alert-measure-select-list"
                            items={measures}
                            itemHeight={DROPDOWN_ITEM_HEIGHT}
                            renderItem={(i) => (
                                <SingleSelectListItem
                                    key={i.rowIndex}
                                    icon={measureIcon}
                                    title={getMeasureTitle(i.item.measure)}
                                    isSelected={i.item.measure === selectedMeasure?.measure}
                                    onClick={() => {
                                        onMeasureChange(i.item);
                                        closeDropdown();
                                    }}
                                />
                            )}
                        />
                    );
                }}
            />
        </div>
    );
};
