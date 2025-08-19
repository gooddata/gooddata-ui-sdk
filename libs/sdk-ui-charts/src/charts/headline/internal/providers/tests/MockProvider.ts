// (C) 2023-2025 GoodData Corporation
import React from "react";

import { IHeadlineTransformationProps } from "../../../HeadlineProvider.js";
import { AbstractProvider } from "../AbstractProvider.js";

/**
 * Mock provider for AbstractProvider test purpose
 */
export class MockProvider extends AbstractProvider {
    public getHeadlineTransformationComponent(): React.ComponentType<IHeadlineTransformationProps> {
        return null;
    }
}
