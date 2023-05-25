// (C) 2021-2022 GoodData Corporation
import React, { useState } from "react";
import { Separator } from "@gooddata/sdk-ui-kit";

import { IDashboardInsightMenuProps, IInsightMenuSubmenu, IInsightMenuItem } from "../../types.js";
import { DashboardInsightMenuContainer } from "./DashboardInsightMenuContainer.js";
import { DashboardInsightMenuItemButton } from "./DashboardInsightMenuItemButton.js";
import { DashboardInsightSubmenuContainer } from "./DashboardInsightSubmenuContainer.js";
import { selectRenderMode, useDashboardSelector } from "../../../../../model/index.js";
import { DashboardInsightMenuBubble } from "./DashboardInsightMenuBubble.js";
import { DashboardInsightEditMenuBubble } from "./DashboardInsightEditMenuBubble.js";
import { RenderMode } from "../../../../../types.js";

const DashboardInsightMenuBody: React.FC<
    IDashboardInsightMenuProps & {
        submenu: IInsightMenuSubmenu | null;
        setSubmenu: React.Dispatch<React.SetStateAction<IInsightMenuSubmenu | null>>;
        renderMode: RenderMode;
    }
> = (props) => {
    const { items, widget, insight, submenu, setSubmenu, onClose, renderMode } = props;

    return submenu ? (
        <DashboardInsightSubmenuContainer
            onClose={onClose}
            title={submenu.itemName}
            onBack={() => setSubmenu(null)}
        >
            <submenu.SubmenuComponent widget={widget} />
        </DashboardInsightSubmenuContainer>
    ) : (
        <DashboardInsightMenuContainer
            onClose={onClose}
            widget={widget}
            insight={insight}
            renderMode={renderMode}
        >
            <DashboardInsightMenuRoot items={items} setSubmenu={setSubmenu} />
        </DashboardInsightMenuContainer>
    );
};

export const DashboardInsightMenu: React.FC<IDashboardInsightMenuProps> = (props) => {
    const { widget, onClose } = props;
    const renderMode = useDashboardSelector(selectRenderMode);
    const [submenu, setSubmenu] = useState<IInsightMenuSubmenu | null>(null);

    return renderMode === "edit" ? (
        <DashboardInsightEditMenuBubble onClose={onClose} isSubmenu={!!submenu}>
            <DashboardInsightMenuBody
                {...props}
                submenu={submenu}
                setSubmenu={setSubmenu}
                renderMode={renderMode}
            />
        </DashboardInsightEditMenuBubble>
    ) : (
        <DashboardInsightMenuBubble onClose={onClose} widget={widget} isSubmenu={!!submenu}>
            <DashboardInsightMenuBody
                {...props}
                submenu={submenu}
                setSubmenu={setSubmenu}
                renderMode={renderMode}
            />
        </DashboardInsightMenuBubble>
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
