// (C) 2021-2026 GoodData Corporation

import classNames from "classnames";
import { FormattedMessage } from "react-intl";

import { Item } from "@gooddata/sdk-ui-kit";
import { simplifyText } from "@gooddata/util";

import { type Granularity, type IGranularityOption } from "../../../models/granularity.js";

export interface IDateGranularityListItemOwnProps {
    item: IGranularityOption;
    selectedGranularity: Granularity;
    onGranularityChange: (granularity: Granularity) => void;
}

export function DateGranularityMenuItem({
    item,
    selectedGranularity,
    onGranularityChange,
}: IDateGranularityListItemOwnProps) {
    const { dateType, label, valuesPreview } = item;

    const isSelected = selectedGranularity === dateType;

    const itemClassNames = classNames("adi-granularity-item s-granularity-item", `s-${simplifyText(label)}`, {
        "is-selected": isSelected,
    });

    return (
        <Item className={itemClassNames} onClick={() => onGranularityChange(dateType)}>
            <span>
                <FormattedMessage id={label} />
            </span>
            {valuesPreview ? (
                <span className="adi-granularity-preview s-granularity-preview">
                    <FormattedMessage id={valuesPreview} />
                </span>
            ) : null}
        </Item>
    );
}
