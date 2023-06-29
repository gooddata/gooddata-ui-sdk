// (C) 2020-2022 GoodData Corporation
import React from "react";
import { injectIntl, IntlShape } from "react-intl";
import { v4 as uuid } from "uuid";
import cx from "classnames";

import { Button } from "../Button/index.js";
import { Bubble, BubbleHoverTrigger } from "../Bubble/index.js";

import { IHeaderMenuItem } from "./typings.js";

/**
 * @internal
 */
export interface IHeaderDataMenuItem extends IHeaderMenuItem {
    isDisable?: boolean;
    tooltipText?: string;
}

/**
 * @internal
 */
export interface IHeaderDataMenuProps {
    intl: IntlShape;
    className?: string;
    onMenuItemClick: (item: IHeaderDataMenuItem) => void;
    dataMenuItems: IHeaderDataMenuItem[];
}

export const CoreHeaderDataMenu: React.FC<IHeaderDataMenuProps> = ({
    intl,
    onMenuItemClick,
    dataMenuItems,
    className,
}) => {
    const renderSection = (items: IHeaderDataMenuItem[]) => {
        return items.map((item: IHeaderDataMenuItem) => {
            const { isDisable, tooltipText, isActive, className, key, onClick } = item;
            const classNames = cx(`gd-button-primary ${className}`, {
                "is-active": !isDisable && isActive,
                "is-normal": !isDisable && !isActive,
            });

            const clickHandler = onClick ? onClick : () => onMenuItemClick(item);
            return (
                <li key={key}>
                    <BubbleHoverTrigger
                        tagName="div"
                        hideDelay={100}
                        showDelay={100}
                        className="gd-bubble-trigger-data-menu"
                    >
                        <Button
                            onClick={clickHandler}
                            className={classNames}
                            value={intl.formatMessage({ id: `${key}` })}
                            disabled={isDisable}
                        />
                        {tooltipText && isDisable ? (
                            <Bubble
                                alignPoints={[{ align: "bc tc" }, { align: "bc tl" }, { align: "bc tr" }]}
                            >
                                {tooltipText}
                            </Bubble>
                        ) : null}
                    </BubbleHoverTrigger>
                </li>
            );
        });
    };

    const dataMenuClassName = cx("gd-data-header-menu-section", className);
    return (
        <div className="gd-data-header-menu-wrapper">
            <ul key={`section-${uuid()}`} className={dataMenuClassName}>
                {renderSection(dataMenuItems)}
            </ul>
        </div>
    );
};

/**
 * @internal
 */
export const HeaderDataMenu = injectIntl(CoreHeaderDataMenu);
