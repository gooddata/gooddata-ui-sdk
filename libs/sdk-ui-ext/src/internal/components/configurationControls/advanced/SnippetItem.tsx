// (C) 2024-2025 GoodData Corporation

import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { BubbleHoverTrigger, Icon, Bubble, IAlignPoint } from "@gooddata/sdk-ui-kit";

import { IChartConfigurationItemSnippet, IChartConfigurationSnippet } from "./snippets.js";

const TOOLTIP_ALIGN_POINTS: IAlignPoint[] = [{ align: "cr cl", offset: { x: 10, y: 0 } }];

function DescriptionIconWithTooltip({ snippet }: { snippet: IChartConfigurationItemSnippet }) {
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
}

export function SnippetHeader({ snippet }: { snippet: IChartConfigurationSnippet }) {
    return <div className="gd-advanced-customization-dialog__snippet--header">{snippet.name}</div>;
}

export interface ISnippetItemProps {
    snippet: IChartConfigurationItemSnippet;
    onClick: (snippet: IChartConfigurationItemSnippet) => void;
}

export function SnippetItem({ snippet, onClick }: ISnippetItemProps) {
    return (
        <div onClick={() => onClick(snippet)} className="gd-advanced-customization-dialog__snippet">
            <span>{snippet.name}</span>
            <DescriptionIconWithTooltip snippet={snippet} />
        </div>
    );
}
