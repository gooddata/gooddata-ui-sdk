// (C) 2021 GoodData Corporation
import { ShareStatus } from "@gooddata/sdk-backend-spi";
import { ComponentType } from "react";

/**
 * @alpha
 */
export interface IShareButtonProps {
    onShareButtonClick: (newShareStatus: ShareStatus) => void;
}

/**
 * @alpha
 */
export type CustomShareButtonComponent = ComponentType;
