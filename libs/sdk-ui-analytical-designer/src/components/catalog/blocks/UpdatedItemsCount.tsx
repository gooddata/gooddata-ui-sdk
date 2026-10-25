// (C) 2020-2026 GoodData Corporation

import classNames from "classnames";
import { FormattedMessage, defineMessage } from "react-intl";

export interface IUpdatedItemsCountOwnProps {
    count: number;
}

export function UpdatedItemsCount({ count }: IUpdatedItemsCountOwnProps) {
    const messageId =
        count === 0
            ? defineMessage({ id: "catalog.refresh.no_items_updated" }).id
            : defineMessage({ id: "catalog.refresh.n_items_updated" }).id;

    return (
        <div className="adi-catalog-info-panel-wrapper">
            <div
                className={classNames("adi-catalog-info-panel s-catalog-info-panel", {
                    "is-visible": count !== null,
                })}
            >
                <div className="adi-catalog-info-panel-inner">
                    <span className="adi-catalog-info-panel-text adi-catalog-updated-items s-catalog-updated-items">
                        <FormattedMessage id={messageId} values={{ count }} />
                    </span>
                </div>
            </div>
        </div>
    );
}
