// (C) 2007-2025 GoodData Corporation

export interface ILegendLabel {
    label?: string;
}

export function LegendLabelItem({ label }: ILegendLabel) {
    if (!label) {
        return null;
    }
    return (
        <div className="series-item">
            <div className="series-name">{`${label}:`}</div>
        </div>
    );
}
