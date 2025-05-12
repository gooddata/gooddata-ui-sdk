// (C) 2019-2025 GoodData Corporation
import React, { useRef } from "react";
import { Dropdown, Button, List, SingleSelectListItem, OverlayPositionType } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { useIntl } from "react-intl";

import { AlertMetric } from "../../types.js";

import { getMeasureTitle } from "../utils/getters.js";
import { DROPDOWN_ITEM_HEIGHT } from "../constants.js";

export interface IAlertMetricSelectProps {
    id?: string;
    selectedMeasure: AlertMetric | undefined;
    onMeasureChange: (measure: AlertMetric) => void;
    measures: AlertMetric[];
    overlayPositionType?: OverlayPositionType;
}

const measureIcon = <div className="gd-alert-measure-select__icon gd-icon-metric" />;

export const AlertMeasureSelect = ({
    id,
    selectedMeasure,
    onMeasureChange,
    measures,
    overlayPositionType,
}: IAlertMetricSelectProps) => {
    const intl = useIntl();
    const ref = useRef<HTMLElement | null>(null);
    const selectedMeasureTitle = selectedMeasure
        ? getMeasureTitle(selectedMeasure.measure)
        : intl.formatMessage({ id: "insightAlert.config.selectMetric" });

    return (
        <Dropdown
            overlayPositionType={overlayPositionType}
            renderButton={({ isOpen, toggleDropdown }) => {
                return (
                    <div
                        ref={(item) => {
                            ref.current = item;
                        }}
                    >
                        <Button
                            id={id}
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
                    </div>
                );
            }}
            renderBody={({ closeDropdown }) => {
                return (
                    <List
                        width={ref.current?.offsetWidth}
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
    );
};
