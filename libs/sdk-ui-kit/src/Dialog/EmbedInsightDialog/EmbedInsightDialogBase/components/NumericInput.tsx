// (C) 2020-2022 GoodData Corporation

import React, { useCallback, useEffect, useState } from "react";
import cx from "classnames";
import isEmpty from "lodash/isEmpty.js";
import { FormattedMessage } from "react-intl";
import { ArrowOffsets, Bubble } from "../../../../Bubble/index.js";
import { IAlignPoint } from "../../../../typings/positioning.js";
import { v4 } from "uuid";

const VALID_INPUT = "^[0-9]+[.,]?[0-9]*$";

const bubbleAlignPoints: IAlignPoint[] = [{ align: "bl tl" }];
const bubbleArrowOffsets: ArrowOffsets = { "bl tl": [0, 10] };

const validHeight = (height: string) => {
    return parseFloat(height) === 0 || height.endsWith(".") ? false : true;
};

/**
 * @internal
 */
export interface INumericInputProps {
    value: string;
    onValueChanged: (height: string) => void;
}

/**
 * @internal
 */
export const NumericInput: React.FC<INumericInputProps> = (props) => {
    const { value, onValueChanged } = props;
    const [validPressedButton, setValidPressedButton] = useState(true);
    const [anchorId] = useState<string>(`numeric-input-id-${v4()}`);

    useEffect(() => {
        if (!validPressedButton) {
            setTimeout(() => setValidPressedButton(true), 2000);
        }
    }, [validPressedButton]);

    const handleHeightInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value.replace(/,/, ".");
            if (val.match(VALID_INPUT)) {
                onValueChanged(val);
            } else if (isEmpty(val)) {
                onValueChanged("");
            }
        },
        [onValueChanged],
    );

    const correctKeyPressed = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/,/, ".");
        setValidPressedButton(
            (value.match(VALID_INPUT) || isEmpty(value)) && value.split(".").length <= 2 ? true : false,
        );
    }, []);

    const onChanged = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            correctKeyPressed(e);
            handleHeightInputChange(e);
        },
        [handleHeightInputChange, correctKeyPressed],
    );

    return (
        <label className="gd-input">
            <div className={cx("gd-input-wrapper", anchorId)}>
                <input
                    className={cx("gd-input-field s-embed-dialog-custom-height", {
                        "gd-embed-input-numeric-invalid": !validHeight(value),
                    })}
                    type="text"
                    value={value}
                    onChange={onChanged}
                />
            </div>
            {!validHeight(value) && (
                <Bubble
                    alignTo={`.${anchorId}`}
                    alignPoints={bubbleAlignPoints}
                    arrowOffsets={bubbleArrowOffsets}
                    className="bubble-negative"
                >
                    <FormattedMessage id="embed.dialog.numeric.input.validation" />
                </Bubble>
            )}
            {!validPressedButton && (
                <Bubble
                    alignTo={`.${anchorId}`}
                    alignPoints={bubbleAlignPoints}
                    arrowOffsets={bubbleArrowOffsets}
                    className="bubble-warning"
                >
                    <FormattedMessage id="embed.dialog.numeric.input.warning" />
                </Bubble>
            )}
        </label>
    );
};
