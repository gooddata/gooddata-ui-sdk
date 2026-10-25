// (C) 2007-2026 GoodData Corporation

import { defineMessage } from "react-intl";

import { Shortcut } from "./Shortcut.js";
import { ShortcutTitle } from "./ShortcutTitle.js";

const singleMetricMessage = defineMessage({ id: "shortcut.single_metric" });

interface IShortcutSingleMetricProps {
    itemType: string;
    title: string;
}

export function ShortcutSingleMetric({ itemType, title }: IShortcutSingleMetricProps) {
    return (
        <Shortcut primary>
            <div className="adi-shortcut-inner s-recommendation-metric-canvas">
                <div className="adi-shortcut-bar-metric adi-shortcut-type" />
                <ShortcutTitle translationKey={singleMetricMessage.id} title={title} itemType={itemType} />
            </div>
        </Shortcut>
    );
}
