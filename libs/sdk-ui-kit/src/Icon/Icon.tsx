// (C) 2021 GoodData Corporation
import React from "react";
/* eslint import/namespace: ['error', { allowComputed: true }] */
import * as Icons from "./icons";
import { IIconProps } from "./typings";

function iconNotFoundCheck(_param: never): never {
    throw new Error("Icon not found");
}

/**
 * @internal
 */
export const Icon: React.FC<IIconProps> = (props) => {
    const { name, color, colorPalette } = props;

    switch (name) {
        case "Refresh":
        case "DrillDown":
        case "DrillToDashboard":
        case "DrillToInsight":
        case "Date":
        case "Explore":
        case "Logout":
        case "Pdf":
        case "ExternalLink":
        case "Hyperlink":
        case "Undo":
        case "Home":
        case "BurgerMenu":
        case "Rows": {
            const IconComponent = Icons[name];
            return <IconComponent name={name} color={color} colorPalette={colorPalette} />;
        }
        default: {
            iconNotFoundCheck(name);
        }
    }
};
