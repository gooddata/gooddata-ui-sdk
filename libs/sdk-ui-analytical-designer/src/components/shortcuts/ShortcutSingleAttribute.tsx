// (C) 2007-2026 GoodData Corporation

import { defineMessage } from "react-intl";

import { Shortcut } from "./Shortcut.js";
import { ShortcutTitle } from "./ShortcutTitle.js";

const singleAttributeMessage = defineMessage({ id: "shortcut.single_attribute" });

interface IShortcutSingleAttributeProps {
    title: string;
}

export function ShortcutSingleAttribute({ title }: IShortcutSingleAttributeProps) {
    return (
        <Shortcut primary>
            <div className="adi-shortcut-inner s-recommendation-attribute-canvas">
                <div className="adi-shortcut-attribute-table adi-shortcut-type" />
                <ShortcutTitle translationKey={singleAttributeMessage.id} title={title} />
            </div>
        </Shortcut>
    );
}
