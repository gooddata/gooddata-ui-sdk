// (C) 2023 GoodData Corporation
import React from "react";
import { IHeadlineTransformationProps } from "../../HeadlineProvider.js";
import AbstractProvider from "./AbstractProvider.js";

class ComparisonProvider extends AbstractProvider {
    public getHeadlineTransformationComponent(): React.ComponentType<IHeadlineTransformationProps> {
        return null;
    }
}

export default ComparisonProvider;
