// (C) 2020 GoodData Corporation
import React from "react";
import { injectIntl, IntlShape } from "react-intl";
import uniqueId from "lodash/uniqueId";
import cx from "classnames";
import { IHeaderMenuItem } from "./Header";
import { Button } from "../Button";
import { Bubble, BubbleHoverTrigger } from "../Bubble";

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
                "is-active": isActive,
            });

            const clickHandler = onClick ? onClick : () => onMenuItemClick(item);
            return (
                <li key={key}>
                    <BubbleHoverTrigger
                        tagName="abbr"
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
                        {tooltipText && isDisable && (
                            <Bubble
                                alignPoints={[
                                    { align: "bc tc" },
                                    { align: "tc bc" },
                                    { align: "bl tl" },
                                    { align: "br tr" },
                                ]}
                            >
                                {tooltipText}
                            </Bubble>
                        )}
                    </BubbleHoverTrigger>
                </li>
            );
        });
    };

    const dataMenuClassName = cx("gd-data-header-menu-section", className);
    return (
        <div className="gd-data-header-menu-wrapper">
            <ul key={uniqueId("section-")} className={dataMenuClassName}>
                {renderSection(dataMenuItems)}
            </ul>
        </div>
    );
};

/**
 * @internal
 */
export const HeaderDataMenu = injectIntl(CoreHeaderDataMenu);
