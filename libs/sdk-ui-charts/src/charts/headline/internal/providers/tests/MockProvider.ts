// (C) 2023-2025 GoodData Corporation
import { ComponentType } from "react";
import AbstractProvider from "../AbstractProvider.js";
import { IHeadlineTransformationProps } from "../../../HeadlineProvider.js";

/**
 * Mock provider for AbstractProvider test purpose
 */
export default class MockProvider extends AbstractProvider {
    public getHeadlineTransformationComponent(): ComponentType<IHeadlineTransformationProps> {
        return null;
    }
}
