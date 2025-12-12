// (C) 2021-2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger, Button, type IAlignPoint } from "@gooddata/sdk-ui-kit";

interface IDeleteButton {
    deleteFilter: () => void;
}

const bubbleAlignPoints: IAlignPoint[] = [{ align: "bc tc", offset: { x: -1, y: 5 } }];

export function DeleteButton({ deleteFilter }: IDeleteButton) {
    return (
        <div className="delete-button-wrapper">
            <BubbleHoverTrigger>
                <Button
                    key="delete-button"
                    className="gd-button-link gd-button-icon-only gd-icon-trash delete-button s-delete-button"
                    disabled={false}
                    onClick={deleteFilter}
                />
                <Bubble className="bubble-primary" alignPoints={bubbleAlignPoints}>
                    <FormattedMessage id="attributesDropdown.removeTooltip" />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
}
