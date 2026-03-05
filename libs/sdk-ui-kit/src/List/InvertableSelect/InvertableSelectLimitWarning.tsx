// (C) 2007-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { Message } from "../../Messages/Message.js";

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
        <Message
            type={selectedItemsCount > limit ? "error" : "warning"}
            className="gd-invertable-list-limitExceeded"
        >
            {selectedItemsCount === limit && (
                <FormattedMessage id="gs.list.limitReached" values={{ limit }} />
            )}
            {selectedItemsCount > limit && (
                <FormattedMessage id="gs.list.cannotSelectMoreValues" values={{ limit }} />
            )}
        </Message>
    );
}
