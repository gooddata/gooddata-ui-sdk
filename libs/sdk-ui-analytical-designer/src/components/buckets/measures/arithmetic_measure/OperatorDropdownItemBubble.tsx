// (C) 2007-2026 GoodData Corporation

import { type ReactElement, memo } from "react";

import classNames from "classnames";
import { FormattedMessage, defineMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { type ArithmeticOperatorType } from "../../../../typings/arithmetic_measure.js";

const BUBBLE_ALIGN_POINTS = [{ align: "cr cl" }, { align: "cr bl" }, { align: "cr tl" }];

// offset arrow to solve an issue with a tooltip being hidden when cursor goes to the right part of the icon
const BUBBLE_ARROW_X_OFFSET = 20;
const BUBBLE_ARROW_Y_OFFSET = 13;

const BUBBLE_ARROW_OFFSETS = {
    "cr cl": [BUBBLE_ARROW_X_OFFSET, 0],
    "cr bl": [BUBBLE_ARROW_X_OFFSET, BUBBLE_ARROW_Y_OFFSET],
    "cr tl": [BUBBLE_ARROW_X_OFFSET, -BUBBLE_ARROW_Y_OFFSET],
};

export interface IOperatorDropdownItemBubbleProps {
    type: ArithmeticOperatorType;
}

export const OperatorDropdownItemBubble = memo(function OperatorDropdownItemBubble({
    type,
}: IOperatorDropdownItemBubbleProps): ReactElement {
    const operand = type;

    const operandTitleMessageIds = {
        multiplication: defineMessage({ id: "arithmeticMeasureOperandTooltip.multiplication.title" }).id,
        change: defineMessage({ id: "arithmeticMeasureOperandTooltip.change.title" }).id,
    } as const;
    const operandExampleMessageIds = {
        multiplication: defineMessage({ id: "arithmeticMeasureOperandTooltip.multiplication.example" }).id,
        change: defineMessage({ id: "arithmeticMeasureOperandTooltip.change.example" }).id,
    } as const;
    const operandFormulaMessageIds = {
        multiplication: defineMessage({ id: "arithmeticMeasureOperandTooltip.multiplication.formula" }).id,
        change: defineMessage({ id: "arithmeticMeasureOperandTooltip.change.formula" }).id,
    } as const;

    const bubbleTriggerClassNames = classNames(
        "inlineBubbleHelp",
        "s-adi-arithmetic-measure-operand-bubble-trigger",
        `s-adi-arithmetic-measure-operand-bubble-trigger-${operand}`,
    );
    const bubbleClassNames = classNames(
        "bubble-light",
        "adi-arithmetic-measure-operand-bubble",
        "s-adi-arithmetic-measure-operand-bubble",
    );
    return (
        <span className="gd-bubble-trigger-wrap s-gd-bubble-trigger-wrap">
            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                <span className={bubbleTriggerClassNames} />
                <Bubble
                    className={bubbleClassNames}
                    alignPoints={BUBBLE_ALIGN_POINTS}
                    arrowOffsets={BUBBLE_ARROW_OFFSETS}
                >
                    <h3>
                        <FormattedMessage
                            id={
                                operandTitleMessageIds[operand as keyof typeof operandTitleMessageIds] ??
                                `arithmeticMeasureOperandTooltip.${operand}.title`
                            }
                        />
                    </h3>
                    <h4>
                        <FormattedMessage id={"arithmeticMeasureOperandTooltip.sectionTitle.example"} />
                    </h4>
                    <p>
                        <FormattedMessage
                            id={
                                operandExampleMessageIds[operand as keyof typeof operandExampleMessageIds] ??
                                `arithmeticMeasureOperandTooltip.${operand}.example`
                            }
                        />
                    </p>
                    <h4>
                        <FormattedMessage id={"arithmeticMeasureOperandTooltip.sectionTitle.formula"} />
                    </h4>
                    <p>
                        <FormattedMessage
                            id={
                                operandFormulaMessageIds[operand as keyof typeof operandFormulaMessageIds] ??
                                `arithmeticMeasureOperandTooltip.${operand}.formula`
                            }
                        />
                    </p>
                </Bubble>
            </BubbleHoverTrigger>
        </span>
    );
});
