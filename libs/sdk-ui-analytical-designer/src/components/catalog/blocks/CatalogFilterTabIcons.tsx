// (C) 2021-2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { getCssClass } from "../../../utils/css_class.js";
import { type ICatalogFilter, TabIcons } from "../model/catalogFilter.js";

export interface ICatalogTabIcon {
    name: string;
    label: string;
    isActive: boolean;
    index: number;
    onSelect: (index: number, group: string) => void;
    group: string;
}

function CatalogTabIcon(props: ICatalogTabIcon) {
    const { name, label, isActive, index, group } = props;

    const classes = cx(
        "gd-filter-tab-icon",
        "s-filter-item",
        getCssClass(name, "s-filter-"),
        { "is-active": isActive },
        { "s-is-active": isActive },
    );
    const bubbleClass = cx("bubble-primary", "catalog-filter", {
        geo: name === (TabIcons.GEO_ATTRIBUTES as string),
    });
    const alignPoints = index === 0 ? [{ align: "bc tl" }] : [{ align: "bc tc" }];
    const handleClick = () => props.onSelect(index, group);

    return (
        <div key={name} className={classes} onClick={handleClick}>
            <BubbleHoverTrigger
                showDelay={1000}
                hideDelay={0}
                eventsOnBubble={false}
                className="vis-bubble-trigger"
            >
                <button className={`${name}-tab-icon tab-icon-type`} />
                <Bubble className={bubbleClass} alignPoints={alignPoints}>
                    <FormattedMessage id={label} />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
}

export interface ICatalogFilterTabIconsProps {
    onSelect: (index: number, group: string) => void;
    availableTabs: ReadonlyArray<ICatalogFilter>;
    activeTabs: ReadonlyArray<boolean>;
}

export function CatalogFilterTabIcons({ availableTabs, activeTabs, onSelect }: ICatalogFilterTabIconsProps) {
    return (
        <div className="adi-catalog-filter tab-icons">
            <div className={`gd-tabs gd-tab-icons count-${availableTabs.length}`}>
                {availableTabs.map((tab, index) => {
                    const isActive = activeTabs[index];
                    return (
                        <CatalogTabIcon
                            key={index}
                            name={tab.name}
                            label={tab.label}
                            group={tab.group}
                            isActive={isActive}
                            index={index}
                            onSelect={onSelect}
                        />
                    );
                })}
            </div>
        </div>
    );
}
