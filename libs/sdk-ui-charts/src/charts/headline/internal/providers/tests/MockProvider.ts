// (C) 2023-2025 GoodData Corporation

import { type ComponentType } from "react";

import { type IHeadlineTransformationProps } from "../../../HeadlineProvider.js";
import { AbstractProvider } from "../AbstractProvider.js";

/**
 * Mock provider for AbstractProvider test purpose
 */
export class MockProvider extends AbstractProvider {
    public getHeadlineTransformationComponent(): ComponentType<IHeadlineTransformationProps> {
        return null as any;
    }
}
