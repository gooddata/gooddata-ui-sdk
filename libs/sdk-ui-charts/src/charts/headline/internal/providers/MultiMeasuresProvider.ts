// (C) 2023-2025 GoodData Corporation
import { ComponentType } from "react";
import AbstractProvider from "./AbstractProvider.js";
import { IHeadlineTransformationProps } from "../../HeadlineProvider.js";
import MultiMeasuresTransformation from "../transformations/MultiMeasuresTransformation.js";

export default class MultiMeasuresProvider extends AbstractProvider {
    public getHeadlineTransformationComponent(): ComponentType<IHeadlineTransformationProps> {
        return MultiMeasuresTransformation;
    }
}
