// (C) 2007-2018 GoodData Corporation
const catalogSecure = require('../../catalogs/catalog-secure.json');
const catalogStaging2 = require('../../catalogs/catalog-staging2.json');
const catalogStaging3 = require('../../catalogs/catalog-staging3.json');
const catalogClientDemoBe = require('../../catalogs/catalog-client-demo-be.json');

const catalogs = {
    secure: catalogSecure,
    staging2: catalogStaging2,
    staging3: catalogStaging3,
    'client-demo-be': catalogClientDemoBe
};

export const key = (() => {
    if (typeof window !== 'undefined') {
        const { hostname } = window.location;
        const gdc = typeof GDC !== 'undefined' ? GDC : null; // eslint-disable-line no-undef
        // get catalog key from GDC uri or from hostname
        const catalogKey = gdc ? /https?:\/\/([\w]+)/.exec(gdc)[1] : hostname.split('.')[0];
        return catalogKey;
    }
    return null;
})();

export const catalog = key in catalogs ? catalogs[key] : null;
