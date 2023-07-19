// (C) 2023 GoodData Corporation
import React from "react";
import AbstractProvider from "../AbstractProvider.js";
import { IHeadlineTransformationProps } from "../../../HeadlineProvider.js";

/**
 * Mock provider for AbstractProvider test purpose
 */
class MockProvider extends AbstractProvider {
    public getHeadlineTransformationComponent(): React.ComponentType<IHeadlineTransformationProps> {
        return null;
    }
}

export default MockProvider;
