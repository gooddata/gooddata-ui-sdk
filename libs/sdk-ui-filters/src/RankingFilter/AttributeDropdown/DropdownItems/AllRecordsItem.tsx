// (C) 2020-2025 GoodData Corporation
import cx from "classnames";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

const BUBBLE_OFFSET_X = 16;

interface IAllRecordsItemProps {
    isSelected: boolean;
    onSelect: () => void;
}

export function AllRecordsItem({ isSelected, onSelect }: IAllRecordsItemProps) {
    const className = cx(
        "gd-list-item",
        "gd-list-item-shortened",
        {
            "is-selected": isSelected,
        },
        "gd-button-link",
        "s-rf-attribute-all-records",
    );

    return (
        <button className={className} onClick={() => onSelect()}>
            <FormattedMessage id="rankingFilter.allRecords" />
            <div>
                <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                    <span className="gd-icon-circle-question gd-rf-attribute-all-records-icon s-rf-attribute-all-records-icon" />
                    <Bubble
                        className={`bubble-primary gd-rf-tooltip-bubble s-rf-attribute-all-records-bubble`}
                        arrowOffsets={{ "cr cl": [BUBBLE_OFFSET_X, 0], "cl cr": [-BUBBLE_OFFSET_X, 0] }}
                        alignPoints={[{ align: "cr cl" }, { align: "cl cr" }]}
                    >
                        <FormattedMessage id="rankingFilter.allRecords.tooltip" />
                    </Bubble>
                </BubbleHoverTrigger>
            </div>
        </button>
    );
}
