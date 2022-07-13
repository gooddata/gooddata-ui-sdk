// (C) 2020-2022 GoodData Corporation
import React from "react";
import { Button, Typography } from "@gooddata/sdk-ui-kit";

import { IInsightWidget } from "@gooddata/sdk-model";
import { selectInsightByRef, useDashboardSelector } from "../../../../model";

export interface InsightConfigurationWrapperProps {
    selectedWidget: IInsightWidget;
    canEditInsight: boolean;
    isLocked?: boolean;
    // projectId: string;
    // insightId: string;
    // exploreMode?: boolean;
    onCloseButtonClick: () => void;
    // theme?: ITheme;
    children?: React.ReactNode;
}

export default function InsightConfigurationWrapper(props: InsightConfigurationWrapperProps) {
    const renderTitle = (title: string | undefined) => {
        // const {
        //     canEditInsight,
        //     isLocked,
        //     // canOpenInsightUrl,
        //     // projectId,
        //     // insightId,
        //     // exploreMode,
        //     // theme,
        // } = this.props;

        // if (canEditInsight && canOpenInsightUrl && !exploreMode) {
        //     const insightDirectUrl = `/analyze/#/${projectId}/${insightId}/edit`;
        //     const goToInsight = () => {
        //         window.open(insightDirectUrl, "_blank");
        //     };
        //
        //     return (
        //         <Typography
        //             tagName="p"
        //             className="insight-title s-insight-title s-insight-title-clickable"
        //             onClick={goToInsight}
        //         >
        //             {isLocked && (
        //                 <BubbleHoverTrigger
        //                     eventsOnBubble={true}
        //                     className="gd-bubble-locked s-locked-insight-bubble-trigger"
        //                 >
        //                     <Icon.Lock
        //                         className="gd-icon-locked"
        //                         width={14}
        //                         height={14}
        //                         color={theme?.palette?.complementary?.c5 ?? "#8A99A5"}
        //                     />
        //                     {
        //                         <Bubble alignPoints={[{ align: "tc bc", offset: { x: -2, y: -10 } }]}>
        //                             <FormattedMessage
        //                                 // TODO: TIGER-HACK - inherited insights are locked and cannot be edited; we need to give slightly different tooltip.
        //                                 id={
        //                                     isTigerBackend()
        //                                         ? "configurationPanel.title.inheritedInsight"
        //                                         : "configurationPanel.title.lockedInsight"
        //                                 }
        //                             />
        //                         </Bubble>
        //                     }
        //                 </BubbleHoverTrigger>
        //             )}
        //             <span className="original-insight-title" title={title}>
        //                 {title}
        //             </span>
        //             <Icon.ExternalLink
        //                 className="gd-icon-link"
        //                 width={14}
        //                 height={14}
        //                 color={theme?.palette?.complementary?.c5 ?? "#8A99A5"}
        //             />
        //         </Typography>
        //     );
        // }

        return (
            <span title={title} className="insight-title s-insight-title s-insight-title-simple">
                {title}
            </span>
        );
    };

    const { selectedWidget } = props;
    const insight = useDashboardSelector(selectInsightByRef(selectedWidget?.insight));

    const renderHeader = () => {
        const widgetTitle = selectedWidget.title;
        const widgetOriginalTitle = insight?.insight.title;
        const originalTitleComponent = renderTitle(widgetOriginalTitle);

        if (!widgetTitle || widgetTitle === widgetOriginalTitle) {
            return (
                <Typography tagName="h3" className="widget-title s-widget-title">
                    {originalTitleComponent}
                </Typography>
            );
        }

        return (
            <React.Fragment>
                <Typography tagName="h3" className="widget-title s-widget-title">
                    <span
                        title={widgetTitle}
                        className="insight-title s-insight-title s-insight-title-simple"
                    >
                        {widgetTitle}
                    </span>
                </Typography>
                {originalTitleComponent}
            </React.Fragment>
        );
    };

    const { onCloseButtonClick } = props;
    return (
        <div className="insight-configuration">
            <div className="insight-configuration-panel-header">
                {renderHeader()}
                <Button
                    className="gd-button-link gd-button-icon-only gd-icon-cross configuration-panel-header-close-button s-configuration-panel-header-close-button"
                    onClick={onCloseButtonClick}
                />
            </div>
            {props.children}
        </div>
    );
}
