// (C) 2024-2025 GoodData Corporation

import React from "react";

import { Bubble, BubbleHoverTrigger, IAlignPoint, Icon } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { IChartConfigurationItemSnippet, IChartConfigurationSnippet } from "./snippets.js";

const TOOLTIP_ALIGN_POINTS: IAlignPoint[] = [{ align: "cr cl", offset: { x: 10, y: 0 } }];

const DescriptionIconWithTooltip: React.FC<{ snippet: IChartConfigurationItemSnippet }> = ({ snippet }) => {
    const theme = useTheme();
    return (
        <span>
            <span className="gd-bubble-trigger-wrapper">
                <BubbleHoverTrigger>
                    <Icon.QuestionMark
                        color={theme?.palette?.complementary?.c7 ?? "#B0BECA"}
                        width={16}
                        height={16}
                        className="gd-advanced-customization-dialog__snippet__tooltip__trigger"
                    />
                    <Bubble alignPoints={TOOLTIP_ALIGN_POINTS} className="bubble-light">
                        <div className="gd-advanced-customization-dialog__snippet__tooltip">
                            <div className="gd-advanced-customization-dialog__snippet__tooltip__header">
                                {snippet.name}
                            </div>
                            <div className="gd-advanced-customization-dialog__snippet__tooltip__body">
                                {snippet.description}
                            </div>
                        </div>
                    </Bubble>
                </BubbleHoverTrigger>
            </span>
        </span>
    );
};

export const SnippetHeader: React.FC<{ snippet: IChartConfigurationSnippet }> = ({ snippet }) => (
    <div className="gd-advanced-customization-dialog__snippet--header">{snippet.name}</div>
);

export interface ISnippetItemProps {
    snippet: IChartConfigurationItemSnippet;
    onClick: (snippet: IChartConfigurationItemSnippet) => void;
}

export const SnippetItem: React.FC<ISnippetItemProps> = ({ snippet, onClick }) => (
    <div onClick={() => onClick(snippet)} className="gd-advanced-customization-dialog__snippet">
        <span>{snippet.name}</span>
        <DescriptionIconWithTooltip snippet={snippet} />
    </div>
);
