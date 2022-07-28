// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { IWidget } from "@gooddata/sdk-model";
import { ArrowDirections, ArrowOffsets, Bubble, IAlignPoint } from "@gooddata/sdk-ui-kit";

interface IConfigurationBubbleProps {
    widget: IWidget;
    classNames?: string;
    onClose?: () => void;
}

const alignPoints: IAlignPoint[] = [
    { align: "tr tl" },
    { align: "br bl" },
    { align: "tl tr" },
    { align: "tr tr" },
    { align: "br br" },
];

const arrowOffsets: ArrowOffsets = {
    "tr tl": [7, 28],
    "br bl": [7, -28],
    "tl tr": [-7, 28],
    "tr tr": [-76, 28],
    "br br": [-76, -28],
};

const arrowDirections: ArrowDirections = {
    "tr tr": "right",
    "br br": "right",
};

export const ConfigurationBubble: React.FC<IConfigurationBubbleProps> = (props) => {
    const { children, classNames, onClose } = props;
    // const [configMenuDisplay, setConfigMenuDisplay] = useState(false);

    return (
        <Bubble
            className={cx(
                "bubble-light gd-configuration-bubble s-gd-configuration-bubble",
                classNames,
                // getEditInsightClassNames(widget, !configMenuDisplay),
                {
                    // "is-sticky": props.isSticky,
                },
            )}
            overlayClassName={cx("gd-configuration-bubble-wrapper", {
                // "is-sticky": props.isSticky,
            })}
            alignTo={".s-dash-item.is-selected"}
            alignPoints={alignPoints}
            arrowOffsets={arrowOffsets}
            arrowDirections={arrowDirections}
            onClose={onClose}
        >
            {children}
        </Bubble>
    );
};
