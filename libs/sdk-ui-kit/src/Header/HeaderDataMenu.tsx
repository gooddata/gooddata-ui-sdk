// (C) 2020-2025 GoodData Corporation

import cx from "classnames";
import { type IntlShape, injectIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { type IHeaderMenuItem } from "./typings.js";
import { Bubble, BubbleHoverTrigger } from "../Bubble/index.js";
import { Button } from "../Button/index.js";

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

function CoreHeaderDataMenu({ intl, onMenuItemClick, dataMenuItems, className }: IHeaderDataMenuProps) {
    const renderSection = (items: IHeaderDataMenuItem[]) => {
        return items.map((item: IHeaderDataMenuItem) => {
            const { isDisable, tooltipText, isActive, className, key, onClick } = item;
            const classNames = cx(`gd-button-primary ${className}`, {
                "is-active": !isDisable && isActive,
                "is-normal": !isDisable && !isActive,
            });

            const clickHandler = onClick || (() => onMenuItemClick(item));
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
                            iconLeft={item.iconName}
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
}

/**
 * @internal
 */
export const HeaderDataMenu = injectIntl(CoreHeaderDataMenu);
