// (C) 2023-2025 GoodData Corporation
import React from "react";
import { AbstractProvider } from "./AbstractProvider.js";
import { IHeadlineTransformationProps } from "../../HeadlineProvider.js";
import { MultiMeasuresTransformation } from "../transformations/MultiMeasuresTransformation.js";

export class MultiMeasuresProvider extends AbstractProvider {
    public getHeadlineTransformationComponent(): React.ComponentType<IHeadlineTransformationProps> {
        return MultiMeasuresTransformation;
    }
}
