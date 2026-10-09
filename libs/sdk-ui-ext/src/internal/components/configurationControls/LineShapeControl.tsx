// (C) 2026 GoodData Corporation

import { useId } from "react";

import { cloneDeep, merge } from "lodash-es";
import { FormattedMessage, useIntl } from "react-intl";

import { type LineShape } from "@gooddata/sdk-ui-charts";
import { type IconType, UiButtonSegmentedControl, UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../locales.js";
import { type IVisualizationProperties } from "../../interfaces/Visualization.js";

interface ILineShapeProperties {
    lineShape?: LineShape;
}

export interface ILineShapeControlProps {
    disabled: boolean;
    properties?: IVisualizationProperties<ILineShapeProperties>;
    pushData: (data: { properties: NonNullable<ILineShapeControlProps["properties"]> }) => void;
}

export function LineShapeControl({ disabled, properties, pushData }: ILineShapeControlProps) {
    const labelId = useId();
    const intl = useIntl();
    const lineShapes: { value: LineShape; label: string; icon: IconType }[] = [
        { value: "linear", label: intl.formatMessage(messages.lineShapeLinear), icon: "linear" },
        { value: "spline", label: intl.formatMessage(messages.lineShapeSpline), icon: "spline" },
        { value: "stepped", label: intl.formatMessage(messages.lineShapeStepped), icon: "stepped" },
    ];
    const activeLineShape = properties?.controls?.lineShape ?? "linear";

    return (
        <UiTooltip
            anchorWrapperStyles={{ width: "100%" }}
            anchor={
                <div className="adi-properties-control-container">
                    <span id={labelId} className="input-label-text">
                        <FormattedMessage {...messages.lineShape} />
                    </span>
                    <div className="adi-bucket-control">
                        <UiButtonSegmentedControl aria-labelledby={labelId} layout="fill" role="group">
                            {lineShapes.map(({ value, label, icon }) => {
                                const isActive = value === activeLineShape;

                                return (
                                    <UiTooltip
                                        accessibilityHidden
                                        anchor={
                                            <UiIconButton
                                                accessibilityConfig={{
                                                    ariaLabel: label,
                                                    ariaPressed: isActive,
                                                }}
                                                icon={icon}
                                                isActive={isActive}
                                                isDisabled={disabled}
                                                size="small"
                                                onClick={() => {
                                                    if (isActive) {
                                                        return;
                                                    }

                                                    pushData({
                                                        properties: merge(cloneDeep(properties), {
                                                            controls: { lineShape: value },
                                                        }),
                                                    });
                                                }}
                                            />
                                        }
                                        content={label}
                                        disabled={disabled}
                                        key={value}
                                        optimalPlacement
                                        triggerBy={["hover", "focus"]}
                                    />
                                );
                            })}
                        </UiButtonSegmentedControl>
                    </div>
                </div>
            }
            arrowPlacement="left"
            content={<FormattedMessage {...messages.notApplicable} />}
            disabled={!disabled} // Show a disabled message tooltip (property not applicable)
            offset={10}
            triggerBy={["hover", "focus"]}
        />
    );
}
