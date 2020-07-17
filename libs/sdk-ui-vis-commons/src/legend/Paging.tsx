// (C) 2020 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";

/**
 * @internal
 */
export interface IPagingProps {
    page: number;
    pagesCount: number;
    showNextPage(): void;
    showPrevPage(): void;
}

function renderPagingButton(type: string, handler: () => void, disabled: boolean) {
    const classes = cx("gd-button-link", "gd-button-icon-only", `icon-chevron-${type}`, "paging-button");
    return <button className={classes} onClick={handler} disabled={disabled} />;
}

/**
 * @internal
 */
export const Paging = (props: IPagingProps): React.ReactElement => {
    const { page, pagesCount, showNextPage, showPrevPage } = props;

    return (
        <div className="paging">
            {renderPagingButton("up", showPrevPage, page === 1)}
            <FormattedMessage
                id="visualizations.of"
                tagName="span"
                values={{
                    page: <strong>{page}</strong>,
                    pagesCount,
                }}
            />
            {renderPagingButton("down", showNextPage, page === pagesCount)}
        </div>
    );
};
