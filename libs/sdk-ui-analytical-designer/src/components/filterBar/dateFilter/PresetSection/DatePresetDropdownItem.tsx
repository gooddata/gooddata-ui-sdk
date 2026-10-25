// (C) 2022-2026 GoodData Corporation

import { kebabCase } from "lodash-es";
import { useIntl } from "react-intl";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { type DateFilterOption } from "@gooddata/sdk-ui-filters";
import { ListItem, ListItemTooltip } from "@gooddata/sdk-ui-filters/internal";

export interface IDatePresetDropdownItemProps {
    item: DateFilterOption;
    titleIntlKey: string;
    selectedItem: DateFilterOption;
    onChange: (filter: DateFilterOption) => void;
    tooltipSdkIntlKey?: string;
}

export function DatePresetDropdownItem({
    item,
    titleIntlKey,
    selectedItem,
    onChange,
    tooltipSdkIntlKey,
}: IDatePresetDropdownItemProps) {
    const intl = useIntl();
    return (
        <ListItem
            key={item.localIdentifier}
            isSelected={item.localIdentifier === selectedItem.localIdentifier}
            onClick={() => onChange(item)}
            className={`s-preset-${kebabCase(item.localIdentifier)}`}
        >
            {intl.formatMessage({ id: titleIntlKey })}
            {tooltipSdkIntlKey ? (
                <ListItemTooltip bubbleAlignPoints={[{ align: "cr cl" }]}>
                    <IntlWrapper locale={intl.locale}>
                        {intl.formatMessage({ id: tooltipSdkIntlKey })}
                    </IntlWrapper>
                </ListItemTooltip>
            ) : null}
        </ListItem>
    );
}
