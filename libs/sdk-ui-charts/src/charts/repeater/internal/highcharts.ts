// (C) 2023-2024 GoodData Corporation
export function getTooltipHtml({
    sliceValue,
    metricValue,
    sliceTitle,
    metricTitle,
    pointColor = "#14B2E2",
}: {
    metricTitle: string;
    metricValue: string;
    sliceTitle?: string;
    sliceValue?: string;
    pointColor?: string;
}) {
    const strokeStyle = pointColor ? `border-top-color: ${pointColor};` : "";
    const sliceContent =
        sliceTitle && sliceValue
            ? `
<div class="gd-viz-tooltip-item">
    <div class="gd-viz-tooltip-title">${sliceTitle}</div>
    <div class="gd-viz-tooltip-value-wraper">
        <div class="gd-viz-tooltip-value">${sliceValue}</div>
    </div>
</div>`
            : "";

    return `
<div class="hc-tooltip gd-viz-tooltip">
    <span class="gd-viz-tooltip-stroke" style="${strokeStyle}"></span>
    <div class="gd-viz-tooltip-content">
        ${sliceContent}
        <div class="gd-viz-tooltip-item">
            <div class="gd-viz-tooltip-title">${metricTitle}</div>
            <div class="gd-viz-tooltip-value-wraper">
                <div class="gd-viz-tooltip-value">${metricValue}</div>
            </div>
        </div>
    </div>
</div>`;
}
