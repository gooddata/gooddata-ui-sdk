// (C) 2007-2022 GoodData Corporation
import React from "react";
import { Message } from "../../Messages";
import { FormattedMessage } from "react-intl";

interface IInvertableSelectLimitWarningProps {
    limit: number;
    selectedItemsCount: number;
}

export function InvertableSelectLimitWarning(props: IInvertableSelectLimitWarningProps) {
    const { limit, selectedItemsCount } = props;

    return (
        <Message type="warning" className="gd-list-limitExceeded animation-fadeIn">
            {selectedItemsCount === limit && (
                <FormattedMessage id="gs.list.limitReached" values={{ limit }} />
            )}
            {selectedItemsCount > limit && (
                <FormattedMessage id="gs.list.cannotSelectMoreValues" values={{ limit }} />
            )}
        </Message>
    );
}
