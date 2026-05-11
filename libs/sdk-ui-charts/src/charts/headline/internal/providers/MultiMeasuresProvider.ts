// (C) 2023-2026 GoodData Corporation

import { type ComponentType } from "react";

import { type IHeadlineTransformationProps } from "../../HeadlineProvider.js";
import { MultiMeasuresTransformation } from "../transformations/MultiMeasuresTransformation.js";

import { AbstractProvider } from "./AbstractProvider.js";

export class MultiMeasuresProvider extends AbstractProvider {
    public getHeadlineTransformationComponent(): ComponentType<IHeadlineTransformationProps> {
        return MultiMeasuresTransformation;
    }
}
