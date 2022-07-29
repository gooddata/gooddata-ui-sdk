// (C) 2021-2022 GoodData Corporation
import { IFiltersCustomizer } from "../customizer";
import { IDashboardCustomizationLogger } from "./customizationLogging";
import { DefaultAttributeFiltersCustomizer } from "./attributeFiltersCustomizer";
import { DefaultDateFiltersCustomizer } from "./dateFiltersCustomizer";

export class DefaultFiltersCustomizer implements IFiltersCustomizer {
    private readonly attributeFiltersCustomizer: DefaultAttributeFiltersCustomizer =
        new DefaultAttributeFiltersCustomizer(this.logger);
    private readonly dateFiltersCustomizer: DefaultDateFiltersCustomizer = new DefaultDateFiltersCustomizer(
        this.logger,
    );

    constructor(private readonly logger: IDashboardCustomizationLogger) {}

    public attribute(): DefaultAttributeFiltersCustomizer {
        return this.attributeFiltersCustomizer;
    }

    public date(): DefaultDateFiltersCustomizer {
        return this.dateFiltersCustomizer;
    }

    public sealCustomizer = (): IFiltersCustomizer => {
        this.attributeFiltersCustomizer.sealCustomizer();
        this.dateFiltersCustomizer.sealCustomizer();

        return this;
    };
}
