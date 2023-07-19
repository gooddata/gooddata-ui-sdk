// (C) 2023 GoodData Corporation
import React from "react";
import AbstractProvider from "./AbstractProvider.js";
import { IHeadlineTransformationProps } from "../../HeadlineProvider.js";

class MultiMeasuresProvider extends AbstractProvider {
    public getHeadlineTransformationComponent(): React.ComponentType<IHeadlineTransformationProps> {
        return null;
    }
}

export default MultiMeasuresProvider;
