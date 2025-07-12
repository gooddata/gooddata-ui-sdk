// (C) 2023-2025 GoodData Corporation
import { ComponentType } from "react";
import { IHeadlineTransformationProps } from "../../HeadlineProvider.js";
import AbstractProvider from "./AbstractProvider.js";
import LegacyHeadlineTransformation from "../transformations/LegacyHeadlineTransformation.js";

export default class LegacyProvider extends AbstractProvider {
    public getHeadlineTransformationComponent(): ComponentType<IHeadlineTransformationProps> {
        return LegacyHeadlineTransformation;
    }
}
