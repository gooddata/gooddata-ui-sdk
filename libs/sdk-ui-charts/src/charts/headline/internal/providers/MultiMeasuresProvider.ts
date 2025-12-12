// (C) 2023-2025 GoodData Corporation

import { type ComponentType } from "react";

import { AbstractProvider } from "./AbstractProvider.js";
import { type IHeadlineTransformationProps } from "../../HeadlineProvider.js";
import { MultiMeasuresTransformation } from "../transformations/MultiMeasuresTransformation.js";

export class MultiMeasuresProvider extends AbstractProvider {
    public getHeadlineTransformationComponent(): ComponentType<IHeadlineTransformationProps> {
        return MultiMeasuresTransformation;
    }
}
