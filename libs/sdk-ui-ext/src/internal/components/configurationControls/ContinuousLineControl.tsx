// (C) 2023 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { getTranslation } from "../../utils/translations.js";
import { messages } from "../../../locales.js";

export interface IContinuousLineControlProps {
    properties: IVisualizationProperties;
    valuePath?: string;
    checked?: boolean;
    disabled?: boolean;
    pushData(data: any): void;
}

class ContinuousLineControl extends React.Component<IContinuousLineControlProps & WrappedComponentProps> {
    public static defaultProps = {
        valuePath: "continuousLine.enabled",
        checked: false,
        disabled: false,
    };

    constructor(props: IContinuousLineControlProps & WrappedComponentProps) {
        super(props);

        this.onValueChanged = this.onValueChanged.bind(this);
    }

    public render() {
        const { checked, disabled, intl, valuePath } = this.props;
        return (
            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                <label className="input-checkbox-label">
                    <input
                        aria-label={valuePath}
                        checked={checked}
                        disabled={disabled}
                        type="checkbox"
                        className="input-checkbox s-continuous-line"
                        onChange={this.onValueChanged}
                    />
                    <span className="input-label-text">
                        {getTranslation(messages.canvasContinuousLineLabel.id, intl)}
                    </span>
                </label>
                {!disabled && (
                    <Bubble
                        className="bubble-primary continuous-line-tooltip"
                        alignPoints={[{ align: "cr cl" }]}
                        arrowOffsets={{ "cr cl": [-75, 0] }}
                    >
                        {getTranslation(messages.canvasContinuousLineTooltip.id, intl)}
                    </Bubble>
                )}
            </BubbleHoverTrigger>
        );
    }

    private onValueChanged(event: React.ChangeEvent<HTMLInputElement>) {
        const { valuePath, properties, pushData } = this.props;

        const clonedProperties = cloneDeep(properties);
        set(clonedProperties, `controls.${valuePath}`, event.target.checked);

        pushData({ properties: clonedProperties });
    }
}

export default injectIntl(ContinuousLineControl);
