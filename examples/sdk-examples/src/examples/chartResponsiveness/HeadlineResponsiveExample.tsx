// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { Headline } from "@gooddata/sdk-ui-charts";
import { LdmExt } from "../../md";

const config = {
    enableCompactSize: true,
};

interface SizeButtonProps {
    callback: (size: [number, number]) => void;
    height: number;
    width: number;
    currentHeight: number | null;
    currentWidth: number | null;
}

const SizeButton: React.FC<SizeButtonProps> = (props) => {
    const { callback, width, height, currentWidth, currentHeight } = props;
    return (
        <button
            onClick={() => callback([width, height])}
            className={`gd-button gd-button-secondary ${
                width === currentWidth && height === currentHeight ? "is-active" : ""
            }`}
        >
            {width}x{height}
        </button>
    );
};

export const HeadlineResponsiveExample: React.FC = () => {
    const primaryMeasure = LdmExt.FranchiseFees;
    const secondaryMeasure = LdmExt.FranchiseFeesAdRoyalty;

    const [[width, height], setSize] = useState<[number, number]>([150, 120]);
    const resize = (size: [number, number]) => {
        setSize(size);
    };

    const divStyle: React.CSSProperties = {
        width,
        height,
    };

    return (
        <>
            <div className="s-headline">
                <SizeButton
                    callback={resize}
                    width={150}
                    height={120}
                    currentWidth={width}
                    currentHeight={height}
                />
                <SizeButton
                    callback={resize}
                    width={150}
                    height={220}
                    currentWidth={width}
                    currentHeight={height}
                />
                <SizeButton
                    callback={resize}
                    width={180}
                    height={220}
                    currentWidth={width}
                    currentHeight={height}
                />
                <hr className="separator" />
                <div style={divStyle}>
                    <Headline
                        primaryMeasure={primaryMeasure}
                        secondaryMeasure={secondaryMeasure}
                        config={config}
                    />
                </div>
            </div>
        </>
    );
};
