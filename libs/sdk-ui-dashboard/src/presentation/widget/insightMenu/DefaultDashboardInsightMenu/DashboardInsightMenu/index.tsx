// (C) 2021-2022 GoodData Corporation
import React, { useState } from "react";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";

import { IDashboardInsightMenuProps, IInsightMenuSubmenu, IInsightMenuItem } from "../../types";
import { objRefToString, widgetRef } from "@gooddata/sdk-model";
import { ArrowDirections, ArrowOffsets, Bubble, IAlignPoint, Separator } from "@gooddata/sdk-ui-kit";
import { DashboardInsightMenuContainer } from "./DashboardInsightMenuContainer";
import { DashboardInsightMenuItemButton } from "./DashboardInsightMenuItemButton";
import { DashboardInsightSubmenuContainer } from "./DashboardInsightSubmenuContainer";

const alignPoints: IAlignPoint[] = [
    { align: "tr tl" },
    { align: "br bl" },
    { align: "tl tr" },
    { align: "tr tr" },
    { align: "br br" },
];

const arrowDirections: ArrowDirections = {
    "tr tr": "right",
    "br br": "right",
};

const arrowOffsets: ArrowOffsets = {
    "tr tl": [20, 0],
    "tl tr": [-20, 0],
};

export const DashboardInsightMenu: React.FC<IDashboardInsightMenuProps> = (props) => {
    const { items, widget, onClose } = props;
    const widgetRefAsString = objRefToString(widgetRef(widget));
    const [submenu, setSubmenu] = useState<IInsightMenuSubmenu | null>(null);

    return (
        <Bubble
            alignTo={`.dash-item-action-widget-options-${stringUtils.simplifyText(widgetRefAsString)}`}
            alignPoints={alignPoints}
            arrowDirections={arrowDirections}
            arrowOffsets={arrowOffsets}
            className={cx(
                "bubble-light",
                "gd-configuration-bubble",
                "edit-insight-config",
                "s-edit-insight-config",
                "edit-insight-config-arrow-color",
                "edit-insight-config-title-1-line",
            )}
            closeOnOutsideClick
            onClose={onClose}
            overlayClassName="gd-configuration-bubble-wrapper"
        >
            {submenu ? (
                <DashboardInsightSubmenuContainer
                    onClose={onClose}
                    title={submenu.itemName}
                    onBack={() => setSubmenu(null)}
                >
                    <DashboardInsightMenuSubmenu submenu={submenu} setSubmenu={setSubmenu} />
                </DashboardInsightSubmenuContainer>
            ) : (
                <DashboardInsightMenuContainer onClose={onClose} widget={widget}>
                    <DashboardInsightMenuRoot items={items} setSubmenu={setSubmenu} />
                </DashboardInsightMenuContainer>
            )}
        </Bubble>
    );
};

type DashboardInsightMenuRootProps = {
    items: IInsightMenuItem[];
    setSubmenu: React.Dispatch<React.SetStateAction<IInsightMenuSubmenu | null>>;
};
const DashboardInsightMenuRoot: React.FC<DashboardInsightMenuRootProps> = ({ items, setSubmenu }) => {
    return (
        <>
            {items.map((item) => {
                if (item.type === "separator") {
                    return <Separator key={item.itemId} />;
                }
                if (item.type === "submenu") {
                    return (
                        <DashboardInsightMenuItemButton
                            key={item.itemId}
                            {...item}
                            onClick={() => setSubmenu(item)}
                            submenu={true}
                        />
                    );
                }
                return <DashboardInsightMenuItemButton key={item.itemId} {...item} />;
            })}
        </>
    );
};

type DashboardInsightMenuSubmenuProps = {
    submenu: IInsightMenuSubmenu;
    setSubmenu: React.Dispatch<React.SetStateAction<IInsightMenuSubmenu | null>>;
};
const DashboardInsightMenuSubmenu: React.FC<DashboardInsightMenuSubmenuProps> = ({ submenu }) => {
    return <>{submenu.renderSubmenu()}</>;
};
