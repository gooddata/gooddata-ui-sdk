// (C) 2024-2025 GoodData Corporation

import { memo, useRef, useState } from "react";

import cx from "classnames";
import { cloneDeep, set } from "lodash-es";
import { useIntl } from "react-intl";

import { IPushData } from "@gooddata/sdk-ui";
import { Button } from "@gooddata/sdk-ui-kit";

import { ConfigEditor } from "./ConfigEditor.js";
import { useOverflow } from "./useOverflow.js";
import { messages } from "../../../../locales.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { ConfigSection } from "../ConfigSection.js";

export interface IAdvancedSectionProps {
    controlsDisabled: boolean;
    properties: IVisualizationProperties;
    propertiesMeta: any;
    pushData: (data: IPushData) => any;
}

export const AdvancedSection = memo(function AdvancedSection({
    properties,
    propertiesMeta,
    pushData,
    controlsDisabled,
}: IAdvancedSectionProps) {
    const intl = useIntl();
    const [showDialog, setShowDialog] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLPreElement>(null);
    const isOverflowing = useOverflow(containerRef.current, contentRef.current);

    const valuePath = "chartConfigOverride";
    const configurationValue = properties?.controls?.["chartConfigOverride"];

    const onChange = (value: string) => {
        const clonedProperties = cloneDeep(properties);
        set(clonedProperties, `controls.${valuePath}`, value);

        pushData({ properties: clonedProperties });
        setShowDialog(false);
    };

    return (
        <>
            {showDialog ? (
                <ConfigEditor
                    value={configurationValue}
                    onSubmit={onChange}
                    onCancel={() => setShowDialog(false)}
                />
            ) : null}
            <ConfigSection
                id="advanced_section"
                className="gd-advanced-section"
                title={messages["advancedSection"].id}
                propertiesMeta={propertiesMeta}
                pushData={pushData}
            >
                {configurationValue === undefined ? (
                    <div className="gd-chart-override-no-value">
                        {intl.formatMessage(messages["chartConfigOverrideNoValueLabel"])}
                    </div>
                ) : (
                    <div
                        ref={containerRef}
                        className={cx("gd-chart-override-value-preview", {
                            "fade-out": isOverflowing,
                        })}
                    >
                        <pre ref={contentRef} className="gd-chart-override-value">
                            {configurationValue}
                        </pre>
                    </div>
                )}
                <Button
                    iconLeft="gd-icon-code"
                    className="gd-button gd-button-small gd-button-secondary"
                    onClick={() => setShowDialog(!showDialog)}
                    disabled={controlsDisabled}
                >
                    {intl.formatMessage(messages["chartConfigOverrideEditorButton"])}
                </Button>
            </ConfigSection>
        </>
    );
});
