// (C) 2020 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";

/**
 * @internal
 */
export type ButtonsOrientationType = "upDown" | "leftRight";

/**
 * @internal
 */
export interface IPagingProps {
    page: number;
    pagesCount: number;
    showNextPage(): void;
    showPrevPage(): void;
    buttonsOrientation?: ButtonsOrientationType;
}

export type PagingButtonType = "prev" | "next";

function getbuttonIcoStyle(
    type: PagingButtonType,
    buttonsOrientation: ButtonsOrientationType,
): "up" | "down" | "left" | "right" | undefined {
    if (type === "prev") {
        if (buttonsOrientation === "upDown") {
            return "up";
        }
        return "left";
    }

    if (type === "next") {
        if (buttonsOrientation === "upDown") {
            return "down";
        }
        return "right";
    }

    return undefined;
}

function renderPagingButton(
    type: PagingButtonType,
    buttonsOrientation: ButtonsOrientationType,
    handler: () => void,
    disabled: boolean,
) {
    const classes = cx(
        "gd-button-link",
        "gd-button-icon-only",
        `icon-chevron-${getbuttonIcoStyle(type, buttonsOrientation)}`,
        "paging-button",
    );

    const onClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handler();
    };

    return <button className={classes} onClick={onClick} disabled={disabled} />;
}

/**
 * @internal
 */
export const Paging = (props: IPagingProps): React.ReactElement => {
    const { page, pagesCount, buttonsOrientation = "upDown", showNextPage, showPrevPage } = props;

    return (
        <div className="paging">
            {renderPagingButton("prev", buttonsOrientation, showPrevPage, page === 1)}
            <FormattedMessage
                id="visualizations.of"
                tagName="span"
                values={{
                    page: <strong>{page}</strong>,
                    pagesCount,
                }}
            />
            {renderPagingButton("next", buttonsOrientation, showNextPage, page === pagesCount)}
        </div>
    );
};
