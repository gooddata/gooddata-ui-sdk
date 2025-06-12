// (C) 2007-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";

import { Message } from "../../Messages/index.js";

/**
 * @internal
 */
export interface IInvertableSelectLimitWarningProps {
    limit: number;
    selectedItemsCount: number;
}

/**
 * @internal
 */
export function InvertableSelectLimitWarning(props: IInvertableSelectLimitWarningProps) {
    const { limit, selectedItemsCount } = props;

    return (
        <Message type="warning" className="gd-invertable-list-limitExceeded">
            {selectedItemsCount === limit && (
                <FormattedMessage id="gs.list.limitReached" values={{ limit }} />
            )}
            {selectedItemsCount > limit && (
                <FormattedMessage id="gs.list.cannotSelectMoreValues" values={{ limit }} />
            )}
        </Message>
    );
}
