// (C) 2021-2025 GoodData Corporation
import React, { useState } from "react";
import { Separator } from "@gooddata/sdk-ui-kit";

import { DashboardInsightSubmenuContainer } from "../../../insightMenu/DefaultDashboardInsightMenu/DashboardInsightMenu/DashboardInsightSubmenuContainer.js";
import { DashboardInsightMenuItemButton } from "../../../insightMenu/DefaultDashboardInsightMenu/DashboardInsightMenu/DashboardInsightMenuItemButton.js";
import { DashboardInsightEditMenuBubble } from "../../../insightMenu/DefaultDashboardInsightMenu/DashboardInsightMenu/DashboardInsightEditMenuBubble.js";
import { DashboardInsightMenuBubble } from "../../../insightMenu/DefaultDashboardInsightMenu/DashboardInsightMenu/DashboardInsightMenuBubble.js";

import { IDashboardRichTextMenuProps, IRichTextMenuItem, IRichTextMenuSubmenu } from "../../types.js";
import { selectRenderMode, useDashboardSelector } from "../../../../../model/index.js";
import { RenderMode } from "../../../../../types.js";

import { DashboardRichTextMenuContainer } from "./DashboardRichTextMenuContainer.js";

export const DashboardRichTextMenuBody: React.FC<
    IDashboardRichTextMenuProps & {
        submenu: IRichTextMenuSubmenu | null;
        setSubmenu: React.Dispatch<React.SetStateAction<IRichTextMenuSubmenu | null>>;
        renderMode: RenderMode;
    }
> = (props) => {
    const { items, widget, submenu, setSubmenu, onClose, renderMode } = props;

    const renderSubmenuComponent = submenu ? (
        <submenu.SubmenuComponent widget={widget} onClose={onClose} onGoBack={() => setSubmenu(null)} />
    ) : null;

    return submenu ? (
        submenu.renderSubmenuComponentOnly ? (
            renderSubmenuComponent
        ) : (
            <DashboardInsightSubmenuContainer
                onClose={onClose}
                title={submenu.itemName}
                onBack={() => setSubmenu(null)}
            >
                {renderSubmenuComponent}
            </DashboardInsightSubmenuContainer>
        )
    ) : (
        <DashboardRichTextMenuContainer onClose={onClose} widget={widget} renderMode={renderMode}>
            <DashboardRichTextMenuRoot items={items} setSubmenu={setSubmenu} />
        </DashboardRichTextMenuContainer>
    );
};

export const DashboardRichTextMenu: React.FC<IDashboardRichTextMenuProps> = (props) => {
    const { widget, onClose } = props;
    const renderMode = useDashboardSelector(selectRenderMode);
    const [submenu, setSubmenu] = useState<IRichTextMenuSubmenu | null>(null);

    return renderMode === "edit" ? (
        <DashboardInsightEditMenuBubble onClose={onClose} isSubmenu={!!submenu}>
            <DashboardRichTextMenuBody
                {...props}
                submenu={submenu}
                setSubmenu={setSubmenu}
                renderMode={renderMode}
            />
        </DashboardInsightEditMenuBubble>
    ) : (
        <DashboardInsightMenuBubble onClose={onClose} widget={widget} isSubmenu={!!submenu}>
            <DashboardRichTextMenuBody
                {...props}
                submenu={submenu}
                setSubmenu={setSubmenu}
                renderMode={renderMode}
            />
        </DashboardInsightMenuBubble>
    );
};

type DashboardRichTextMenuRootProps = {
    items: IRichTextMenuItem[];
    setSubmenu: React.Dispatch<React.SetStateAction<IRichTextMenuSubmenu | null>>;
};
const DashboardRichTextMenuRoot: React.FC<DashboardRichTextMenuRootProps> = ({ items, setSubmenu }) => {
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
                            onClick={(event) => {
                                if (item.onClick) {
                                    item.onClick(event);
                                }

                                setSubmenu(item);
                            }}
                            submenu={true}
                        />
                    );
                }
                return <DashboardInsightMenuItemButton key={item.itemId} {...item} />;
            })}
        </>
    );
};
