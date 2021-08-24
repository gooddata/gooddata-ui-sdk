// (C) 2021 GoodData Corporation
import React from "react";
import { Bubble, BubbleHoverTrigger, Button } from "@gooddata/sdk-ui-kit";
import { FormattedHTMLMessage } from "react-intl";

interface IDeleteButton {
    deleteFilter: () => void;
}

export const DeleteButton: React.FC<IDeleteButton> = ({ deleteFilter }) => {
    return (
        <div className="delete-button-wrapper">
            <BubbleHoverTrigger>
                <Button
                    key="delete-button"
                    className="gd-button-link gd-button-icon-only gd-icon-trash delete-button s-delete-button"
                    disabled={false}
                    onClick={deleteFilter}
                />
                <Bubble
                    className={`bubble-primary`}
                    alignPoints={[{ align: "bc tc", offset: { x: -1, y: 5 } }]}
                >
                    <FormattedHTMLMessage id="attributesDropdown.removeTooltip" />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
