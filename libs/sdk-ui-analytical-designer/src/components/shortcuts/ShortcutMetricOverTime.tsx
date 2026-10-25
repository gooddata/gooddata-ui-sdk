// (C) 2007-2026 GoodData Corporation

import { defineMessages } from "react-intl";
import { useSelector } from "react-redux";

import { shortcutMetricOverTimeSelector } from "../../selectors/shortcut_metric_over_time_selector.js";

import { Shortcut } from "./Shortcut.js";
import { ShortcutTitle } from "./ShortcutTitle.js";

const shortcutMessages = defineMessages({
    computingRecommendation: { id: "shortcut.computing_recommendation" },
    measureCantBeTrended: { id: "shortcut.measure_cant_be_trended" },
    metricOverTime: { id: "shortcut.metric_over_time" },
});

interface IShortcutMetricOverTimeOwnProps {
    itemType: string;
    title: string;
}

export function ShortcutMetricOverTime({ title, itemType }: IShortcutMetricOverTimeOwnProps) {
    const { areDateDatasetsLoaded, availableDateDatasets } = useSelector(shortcutMetricOverTimeSelector);

    const renderComputing = () => {
        if (!areDateDatasetsLoaded) {
            return (
                <div className="adi-shortcut-inner">
                    <div className="adi-shortcut-type adi-shortcut-computing s-loading" />
                    <ShortcutTitle translationKey={shortcutMessages.computingRecommendation.id} />
                </div>
            );
        }
        return null;
    };

    const renderCantBeTrended = () => {
        if (areDateDatasetsLoaded && !availableDateDatasets.length) {
            return (
                <div className="adi-shortcut-inner">
                    <div className="adi-shortcut-type adi-shortcut-info s-cant-be-trended" />
                    <ShortcutTitle translationKey={shortcutMessages.measureCantBeTrended.id} />
                </div>
            );
        }
        return null;
    };

    const renderShortcutReady = () => {
        if (areDateDatasetsLoaded && availableDateDatasets.length) {
            return (
                <div className="adi-shortcut-inner">
                    <div className="adi-shortcut-metric-quarters adi-shortcut-type" />
                    <ShortcutTitle
                        translationKey={shortcutMessages.metricOverTime.id}
                        title={title}
                        itemType={itemType}
                    />
                </div>
            );
        }
        return null;
    };

    return (
        <Shortcut secondary>
            <div className="s-recommendation-metric-canvas s-recommendation-metric-over-time-canvas">
                {renderComputing()}
                {renderCantBeTrended()}
                {renderShortcutReady()}
            </div>
        </Shortcut>
    );
}
