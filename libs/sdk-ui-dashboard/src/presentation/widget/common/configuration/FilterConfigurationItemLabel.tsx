// (C) 2026 GoodData Corporation

import { type IAlignPoint, ShortenedText } from "@gooddata/sdk-ui-kit";

const tooltipAlignPoints: IAlignPoint[] = [{ align: "cl cr", offset: { x: -20, y: 0 } }];

interface IFilterConfigurationItemLabelProps {
    className: string;
    uniqueKey: string;
    title: string;
    isApplied: boolean;
    isLoading: boolean;
    disabled?: boolean;
    dataTestId?: string;
    onChange: (isApplied: boolean) => void;
}

export function FilterConfigurationItemLabel({
    className,
    uniqueKey,
    title,
    isApplied,
    isLoading,
    disabled,
    dataTestId,
    onChange,
}: IFilterConfigurationItemLabelProps) {
    return (
        <label data-testid={dataTestId} className={className} htmlFor={uniqueKey}>
            <input
                id={uniqueKey}
                type="checkbox"
                className="input-checkbox"
                checked={isApplied}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="input-label-text">
                <ShortenedText tooltipAlignPoints={tooltipAlignPoints} tagName="span" className="title">
                    {title}
                </ShortenedText>
            </span>
            {isLoading ? <div className="gd-spinner small" /> : null}
        </label>
    );
}
