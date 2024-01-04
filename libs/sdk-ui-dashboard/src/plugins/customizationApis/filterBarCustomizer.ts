// (C) 2022 GoodData Corporation
import { CustomFilterBarComponent, HiddenFilterBar } from "../../presentation/index.js";
import { FilterBarRenderingMode, IFilterBarCustomizer } from "../customizer.js";
import { IDashboardCustomizationLogger } from "./customizationLogging.js";

interface IFilterBarCustomizerState {
    setRenderingMode(mode: FilterBarRenderingMode): void;
    getRenderingMode(): FilterBarRenderingMode;
}

interface IFilterBarCustomizerResult {
    FilterBarComponent: CustomFilterBarComponent | undefined;
}

class FilterBarCustomizerState implements IFilterBarCustomizerState {
    private renderingMode: FilterBarRenderingMode | undefined = undefined;

    constructor(private readonly logger: IDashboardCustomizationLogger) {}

    getRenderingMode = (): FilterBarRenderingMode => {
        return this.renderingMode ?? "default";
    };

    setRenderingMode = (renderingMode: FilterBarRenderingMode): void => {
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
        private readonly logger: IDashboardCustomizationLogger,
    ) {}

    getRenderingMode = (): FilterBarRenderingMode => {
        return this.state.getRenderingMode();
    };

    setRenderingMode = (_renderingMode: FilterBarRenderingMode): void => {
        this.logger.warn(
            `Attempting to set filter bar rendering mode outside of plugin registration. Ignoring.`,
        );
    };
}

/**
 * @internal
 */
export class DefaultFilterBarCustomizer implements IFilterBarCustomizer {
    private state: IFilterBarCustomizerState;

    constructor(private readonly logger: IDashboardCustomizationLogger) {
        this.state = new FilterBarCustomizerState(this.logger);
    }

    setRenderingMode = (mode: FilterBarRenderingMode): this => {
        this.state.setRenderingMode(mode);

        return this;
    };

    getCustomizerResult = (): IFilterBarCustomizerResult => {
        return {
            // if rendering mode is "hidden", explicitly replace the component with HiddenFilterBar,
            // otherwise do nothing to allow the default or any custom component provided by the embedding application
            // to kick in
            FilterBarComponent: this.state.getRenderingMode() === "hidden" ? HiddenFilterBar : undefined,
        };
    };

    sealCustomizer = (): this => {
        this.state = new SealedFilterBarCustomizerState(this.state, this.logger);

        return this;
    };
}
