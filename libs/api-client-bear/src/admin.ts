// (C) 2007-2014 GoodData Corporation
import { DataProductsModule } from "./admin/dataProducts";
import { DomainDataProductModule } from "./admin/domainDataProducts";
import { DomainsModule } from "./admin/domains";
import { DomainSegmentsModule } from "./admin/domainSegments";
import { ClientsModule } from "./admin/clients";
import { SegmentsModule } from "./admin/segments";
import { LogsModule } from "./admin/logs";
import { ContractsModule } from "./admin/contracts";
import { XhrModule } from "./xhr";

/**
 * Network-UI support methods. Mostly private
 *
 * @module admin
 * @class admin
 *
 */
export class AdminModule {
    public dataProducts: DataProductsModule;
    public domainDataProducts: DomainDataProductModule;
    public domains: DomainsModule;
    public domainSegments: DomainSegmentsModule;
    public clients: ClientsModule;
    public logs: LogsModule;
    public contracts: ContractsModule;
    public segments: SegmentsModule;

    constructor(private xhr: XhrModule) {
        this.dataProducts = new DataProductsModule(this.xhr);
        this.domainDataProducts = new DomainDataProductModule(this.xhr);
        this.domains = new DomainsModule(this.xhr);
        this.domainSegments = new DomainSegmentsModule(this.xhr);
        this.clients = new ClientsModule(this.xhr);
        this.logs = new LogsModule(this.xhr);
        this.contracts = new ContractsModule(this.xhr);
        this.segments = new SegmentsModule(this.xhr);
    }
}
