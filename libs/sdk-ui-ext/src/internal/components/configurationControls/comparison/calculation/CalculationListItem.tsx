// (C) 2023-2025 GoodData Corporation

import cx from "classnames";

import { CalculationType } from "@gooddata/sdk-ui-charts";
import { Bubble, BubbleHoverTrigger, ISingleSelectListItemProps } from "@gooddata/sdk-ui-kit";

import CalculationListItemInfo from "./CalculationListItemInfo.js";
import { HIDE_DELAY_DEFAULT, SHOW_DELAY_DEFAULT } from "../../../../constants/bubble.js";

const BUBBLE_INFO_ALIGN_POINTS = [{ align: "cr cl" }];
const BUBBLE_INFO_ARROW_OFFSETS = { "cr cl": [15, 0] };

function CalculationListItem({ title, icon, info, isSelected, onClick }: ISingleSelectListItemProps) {
    const classNames = cx(
        ["gd-list-item", "calculation-list-item", "s-calculation-list-item", `s-${title}`],
        {
            "is-selected": isSelected,
        },
    );

    return (
        <div className={classNames} onClick={onClick}>
            <span role="icon" className={`gd-list-icon ${icon}`} />
            <span>{title}</span>
            <div role="item-info" className="gd-list-item-bubble s-list-item-info">
                <BubbleHoverTrigger
                    tagName="div"
                    showDelay={SHOW_DELAY_DEFAULT}
                    hideDelay={HIDE_DELAY_DEFAULT}
                >
                    <div className="inlineBubbleHelp" />
                    <Bubble
                        className="bubble-light adi-arithmetic-measure-operand-bubble calculation-list-item-bubble s-calculation-list-item-bubble"
                        alignPoints={BUBBLE_INFO_ALIGN_POINTS}
                        arrowOffsets={BUBBLE_INFO_ARROW_OFFSETS}
                    >
                        <CalculationListItemInfo title={title} calculationType={info as CalculationType} />
                    </Bubble>
                </BubbleHoverTrigger>
            </div>
        </div>
    );
}

export default CalculationListItem;
