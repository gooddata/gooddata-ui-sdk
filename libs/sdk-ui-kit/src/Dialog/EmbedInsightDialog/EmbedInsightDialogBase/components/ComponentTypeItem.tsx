// (C) 2022-2023 GoodData Corporation
import React, { ChangeEvent } from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "../../../../Bubble/index.js";
import { InsightCodeType } from "../types.js";

const HEADER_TOOLTIP_ALIGN_POINTS = [{ align: "cr tl" }];

/**
 * @internal
 */
export interface IComponentTypeSelectProps {
    className: string;
    questionMarkMessage: string;
    itemValue: InsightCodeType;
    itemText: string;
    checked: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * @internal
 */
export const ComponentTypeItem = (props: IComponentTypeSelectProps) => {
    const { checked, onChange, questionMarkMessage, itemValue, itemText, className } = props;

    return (
        <label className={cx("input-radio-label bottom-space", className)}>
            <input
                type="radio"
                className="input-radio"
                value={itemValue}
                checked={checked}
                onChange={onChange}
            />
            <span className="input-label-text">{itemText}</span>
            {questionMarkMessage ? (
                <BubbleHoverTrigger>
                    <span className="gd-icon-circle-question embed-component-type-help s-circle_question" />
                    <Bubble className="bubble-primary" alignPoints={HEADER_TOOLTIP_ALIGN_POINTS}>
                        <FormattedMessage id={questionMarkMessage} />
                    </Bubble>
                </BubbleHoverTrigger>
            ) : null}
        </label>
    );
};
