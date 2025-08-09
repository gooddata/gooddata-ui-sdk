// (C) 2023-2025 GoodData Corporation
import React from "react";
import { AbstractProvider } from "../AbstractProvider.js";
import { IHeadlineTransformationProps } from "../../../HeadlineProvider.js";

/**
 * Mock provider for AbstractProvider test purpose
 */
export class MockProvider extends AbstractProvider {
    public getHeadlineTransformationComponent(): React.ComponentType<IHeadlineTransformationProps> {
        return null;
    }
}
