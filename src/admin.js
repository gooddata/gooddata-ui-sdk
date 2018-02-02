// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.

import { createModule as dataProductsFactory } from './admin/dataProducts';
import { createModule as domainDataProductsFactory } from './admin/domainDataProducts';
import { createModule as domainsFactory } from './admin/domains';
import { createModule as domainSegmentsFactory } from './admin/domainSegments';
import { createModule as clientsFactory } from './admin/clients';
import { createModule as segmentsFactory } from './admin/segments';
import { createModule as logsFactory } from './admin/logs';
import { createModule as contractsFactory } from './admin/contracts';

/**
 * Network-UI support methods. Mostly private
 *
 * @module admin
 * @class admin
 *
 */
export function createModule(xhr) {
    return {
        dataProducts: dataProductsFactory(xhr),
        domainDataProducts: domainDataProductsFactory(xhr),
        domains: domainsFactory(xhr),
        domainSegments: domainSegmentsFactory(xhr),
        clients: clientsFactory(xhr),
        logs: logsFactory(xhr),
        contracts: contractsFactory(xhr),
        segments: segmentsFactory(xhr)
    };
}
