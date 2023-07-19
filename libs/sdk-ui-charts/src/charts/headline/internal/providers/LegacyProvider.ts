// (C) 2023 GoodData Corporation
import React from "react";
import { IHeadlineTransformationProps } from "../../HeadlineProvider.js";
import AbstractProvider from "./AbstractProvider.js";
import LegacyHeadlineTransformation from "../transformations/LegacyHeadlineTransformation.js";

class LegacyProvider extends AbstractProvider {
    public getHeadlineTransformationComponent(): React.ComponentType<IHeadlineTransformationProps> {
        return LegacyHeadlineTransformation;
    }
}

export default LegacyProvider;
