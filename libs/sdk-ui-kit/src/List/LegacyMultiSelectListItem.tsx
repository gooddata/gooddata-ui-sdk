// (C) 2007-2025 GoodData Corporation

import { MouseEvent, ReactElement, memo, useCallback, useMemo } from "react";

import cx from "classnames";
import { FormattedMessage, IntlShape, injectIntl } from "react-intl";

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
    onMouseOver = () => {},
    onMouseOut = () => {},
    onOnly = () => {},
    onSelect = () => {},
    selected = false,
    source = {},
}: ILegacyMultiSelectListItemProps) {
    const classNames = useMemo(
        () =>
            cx({
                "gd-list-item": true,
                [`s-${stringUtils.simplifyText(source.title)}`]: true,
                "has-only-visible": true,
                "is-selected": selected,
            }),
        [source.title, selected],
    );

    const handleSelect = useCallback((): void => {
        onSelect(source);
    }, [onSelect, source]);

    const handleMouseOver = useCallback((): void => {
        onMouseOver(source);
    }, [onMouseOver, source]);

    const handleMouseOut = useCallback((): void => {
        onMouseOut(source);
    }, [onMouseOut, source]);

    const handleOnly = useCallback(
        (ev: MouseEvent) => {
            ev.stopPropagation();
            onOnly(source);
        },
        [onOnly, source],
    );

    const renderOnly = useCallback((): ReactElement => {
        return (
            <span className="gd-list-item-only" onClick={handleOnly}>
                <FormattedMessage id="gs.list.only" />
            </span>
        );
    }, [handleOnly]);

    return (
        <div
            className={classNames}
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
