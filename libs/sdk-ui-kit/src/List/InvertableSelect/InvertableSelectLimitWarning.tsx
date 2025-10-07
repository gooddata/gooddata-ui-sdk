// (C) 2007-2025 GoodData Corporation

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
export function InvertableSelectLimitWarning({
    limit,
    selectedItemsCount,
}: IInvertableSelectLimitWarningProps) {
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
