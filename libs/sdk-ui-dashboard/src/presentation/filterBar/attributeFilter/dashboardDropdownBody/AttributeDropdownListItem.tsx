// (C) 2021 GoodData Corporation
import React from "react";
import isEmpty from "lodash/isEmpty";
import uniqueId from "lodash/uniqueId";
import cx from "classnames";
import { FormattedMessage, injectIntl } from "react-intl";
import { IAttributeDropdownListItemProps } from "@gooddata/sdk-ui-filters";
import { stringUtils } from "@gooddata/util";

const AttributeDropdownListItem: React.FC<IAttributeDropdownListItemProps> = (props) => {
    const { source } = props;
    if (isEmpty(source)) {
        return <div />;
    }

    const className = cx("gd-list-item", "attribute-filter-item", "has-only-visible", {
        "is-selected": props.selected,
        [`s-${stringUtils.simplifyText(props.source.title)}`]: true,
    });

    function handleSelect() {
        props.onSelect?.(props.source);
    }

    function handleMouseOver() {
        props.onMouseOver?.(props.source);
    }

    function handleMouseOut() {
        props.onMouseOut?.(props.source);
    }

    function handleOnly(event: React.MouseEvent) {
        event.stopPropagation();
        props.onOnly?.(props.source);
    }

    const itemId = uniqueId("attr-filter-item-");

    return (
        <div
            className={className}
            onClick={handleSelect}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            title={props.source.title}
        >
            <label className="input-checkbox-label">
                <input
                    id={itemId}
                    type="checkbox"
                    className="input-checkbox"
                    readOnly
                    checked={props.selected}
                />
                <span className="input-label-text">{props.source.title}</span>
            </label>
            <span className="gd-list-item-only" onClick={handleOnly}>
                <FormattedMessage id="gs.list.only" />
            </span>
        </div>
    );
};

export default injectIntl(AttributeDropdownListItem);
