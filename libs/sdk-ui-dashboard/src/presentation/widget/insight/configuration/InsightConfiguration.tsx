// (C) 2022 GoodData Corporation
import React from "react";
import { InsightConfigurationHeader } from "./InsightConfigurationHeader";
import { IInsightWidget, isInsightWidget, objRefToString } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";
import cx from "classnames";
import debounce from "lodash/debounce";
import { InsightTitleConfig } from "./InsightTitleConfig";
import InsightFilters from "./InsightFilters";
import { ScrollablePanel } from "../../common/configuration/ScrollablePanel";
import { SelectedItemType } from "../../common/configuration/types";

interface IInsightConfigurationProps {
    widget: IInsightWidget;
    selectedItemType: SelectedItemType;
    handleConfigurationHeaderClick: () => void;
    onCloseButtonClick: () => void;
}

export const InsightConfiguration: React.FC<IInsightConfigurationProps> = ({
    widget,
    selectedItemType,
    handleConfigurationHeaderClick,
    onCloseButtonClick,
}) => {
    const widgetRefSuffix = isInsightWidget(widget)
        ? stringUtils.simplifyText(objRefToString(widget.ref))
        : "";

    const classes = cx("configuration-panel", `s-visualization-${widgetRefSuffix}`);
    const node = React.createRef<HTMLDivElement>();

    const isNotOnInput = (event: React.UIEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        return target.tagName !== "INPUT";
    };

    const onScroll = debounce(() => {
        if (node?.current) {
            // fireGoodstrapScrollEvent(node.current, window); // TODO: what should this do?
        }
    }, 20);

    const onPanelScroll = (event: React.UIEvent<HTMLDivElement>) => {
        if (isNotOnInput(event)) {
            onScroll();
        }
    };

    return (
        <>
            <InsightConfigurationHeader
                selectedItemType={selectedItemType}
                handleConfigurationHeaderClick={handleConfigurationHeaderClick}
                onCloseButtonClick={onCloseButtonClick}
            />
            <ScrollablePanel className={classes} ref={node} onScroll={onPanelScroll}>
                {selectedItemType === "configuration" && (
                    <>
                        <InsightTitleConfig
                            isHidingOfWidgetTitleEnabled={true} // TODO
                            hideTitle={false}
                            // resetTitle={() => handleResetTitle(widgetOriginalTitle)} // TODO
                        />
                        <InsightFilters widget={widget} />
                    </>
                )}
                {/*{selectedItemType === INTERACTIONS && TODO}*/}
            </ScrollablePanel>
        </>
    );
};
