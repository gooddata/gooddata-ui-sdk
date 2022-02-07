// (C) 2022 GoodData Corporation
import { FilterBarRenderingMode, IFilterBarCustomizer } from "../customizer";
import { DashboardCustomizationLogger } from "./customizationLogging";

interface IFilterBarCustomizerState {
    setFilterBarRenderingMode(mode: FilterBarRenderingMode): void;
    getFilterBarRenderingMode(): FilterBarRenderingMode;
}

interface IFilterBarCustomizerResult {
    filterBarRenderingMode: FilterBarRenderingMode;
}

class FilterBarCustomizerState implements IFilterBarCustomizerState {
    private renderingMode: FilterBarRenderingMode | undefined = undefined;

    constructor(private readonly logger: DashboardCustomizationLogger) {}

    getFilterBarRenderingMode = (): FilterBarRenderingMode => {
        return this.renderingMode ?? "default";
    };

    setFilterBarRenderingMode = (renderingMode: FilterBarRenderingMode): void => {
        if (this.renderingMode) {
            this.logger.warn(
                `Redefining filter bar rendering mode to "${renderingMode}". Previous definition will be discarded.`,
            );
        }
        this.renderingMode = renderingMode;
    };
}

class SealedFilterBarCustomizerState implements IFilterBarCustomizerState {
    constructor(
        private readonly state: IFilterBarCustomizerState,
        private readonly logger: DashboardCustomizationLogger,
    ) {}

    getFilterBarRenderingMode = (): FilterBarRenderingMode => {
        return this.state.getFilterBarRenderingMode();
    };

    setFilterBarRenderingMode = (_renderingMode: FilterBarRenderingMode): void => {
        this.logger.warn(
            `Attempting to set filter bar rendering mode outside of plugin registration. Ignoring.`,
        );
    };
}

/**
 * @internal
 */
export class DefaultFilterBarCustomizer implements IFilterBarCustomizer {
    private state: IFilterBarCustomizerState = new FilterBarCustomizerState(this.logger);

    constructor(private readonly logger: DashboardCustomizationLogger) {}

    setFilterBarRenderingMode = (mode: FilterBarRenderingMode): this => {
        this.state.setFilterBarRenderingMode(mode);

        return this;
    };

    getFilterBarCustomizerResult = (): IFilterBarCustomizerResult => {
        return {
            filterBarRenderingMode: this.state.getFilterBarRenderingMode(),
        };
    };

    sealCustomizer = (): this => {
        this.state = new SealedFilterBarCustomizerState(this.state, this.logger);

        return this;
    };
}
