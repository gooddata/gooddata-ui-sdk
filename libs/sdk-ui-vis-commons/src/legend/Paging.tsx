// (C) 2020-2025 GoodData Corporation

import { type ReactElement } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";

import { messages } from "../locales.js";

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

interface IPagingButtonProps {
    type: PagingButtonType;
    buttonsOrientation: ButtonsOrientationType;
    handler: () => void;
    disabled: boolean;
}

function PagingButton({ type, buttonsOrientation, handler, disabled }: IPagingButtonProps) {
    const intl = useIntl();
    const classes = cx(
        "gd-button-link",
        "gd-button-icon-only",
        `gd-icon-chevron-${getbuttonIcoStyle(type, buttonsOrientation)}`,
        "paging-button",
    );

    const buttonLabel =
        type === "prev" ? intl.formatMessage(messages.previous) : intl.formatMessage(messages.next);

    return (
        <Button
            className={classes}
            onClick={handler}
            disabled={disabled}
            accessibilityConfig={{ ariaLabel: buttonLabel }}
        />
    );
}

/**
 * @internal
 */
export function Paging({
    page,
    pagesCount,
    buttonsOrientation = "upDown",
    showNextPage,
    showPrevPage,
}: IPagingProps): ReactElement {
    return (
        <div className="paging" data-testid={"Paging"}>
            <PagingButton
                type="prev"
                buttonsOrientation={buttonsOrientation}
                handler={showPrevPage}
                disabled={page === 1}
            />
            <FormattedMessage
                id="visualizations.of"
                tagName="span"
                values={{
                    page: <strong>{page}</strong>,
                    pagesCount,
                }}
            />
            <PagingButton
                type="next"
                buttonsOrientation={buttonsOrientation}
                handler={showNextPage}
                disabled={page === pagesCount}
            />
        </div>
    );
}
