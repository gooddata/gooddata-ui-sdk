// (C) 2007-2025 GoodData Corporation
import React, { memo } from "react";
import { FormattedMessage, injectIntl, IntlShape } from "react-intl";
import cx from "classnames";
import noop from "lodash/noop.js";

import { stringUtils } from "@gooddata/util";

/**
 * @internal
 */
export interface ILegacyMultiSelectListItemProps {
    intl: IntlShape;
    isLoading?: boolean;
    onMouseOut?: (source: any) => void;
    onMouseOver?: (source: any) => void;
    onOnly?: (source: any) => void;
    onSelect?: (source: any) => void;
    selected?: boolean;
    source?: any;
}

/**
 * @internal
 * @deprecated This component is deprecated use MultiSelectListItem instead
 */
export const LegacyMultiSelectListItem = memo(function LegacyMultiSelectListItem({
    onMouseOver = noop,
    onMouseOut = noop,
    onOnly = noop,
    onSelect = noop,
    selected = false,
    source = {},
}: ILegacyMultiSelectListItemProps) {
    const getClassNames = (): string => {
        return cx({
            "gd-list-item": true,
            [`s-${stringUtils.simplifyText(source.title)}`]: true,
            "has-only-visible": true,
            "is-selected": selected,
        });
    };

    const handleSelect = (): void => {
        onSelect(source);
    };

    const handleMouseOver = (): void => {
        onMouseOver(source);
    };

    const handleMouseOut = (): void => {
        onMouseOut(source);
    };

    const handleOnly = (ev: React.MouseEvent) => {
        ev.stopPropagation();
        onOnly(source);
    };

    const renderOnly = (): JSX.Element => {
        return (
            <span className="gd-list-item-only" onClick={handleOnly}>
                <FormattedMessage id="gs.list.only" />
            </span>
        );
    };

    return (
        <div
            className={getClassNames()}
            onClick={handleSelect}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
        >
            <label className="input-checkbox-label">
                <input type="checkbox" className="input-checkbox" readOnly checked={selected} />
                <span className="input-label-text">{source.title}</span>
            </label>
            {renderOnly()}
        </div>
    );
});

export default injectIntl(LegacyMultiSelectListItem);
