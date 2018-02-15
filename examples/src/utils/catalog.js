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

export const catalog = (() => {
    if (typeof window !== 'undefined') {
        const { hostname } = window.location;
        let key = hostname.split('.')[0];
        const isLocalhost = key === 'localhost' || /127\.0\.0\.1/.test(hostname);
        if (isLocalhost) {
            const gdc = GDC; // eslint-disable-line no-undef
            const gdcHostname = /https?:\/\/([\w]+)/.exec(gdc)[1];
            if (!(gdcHostname in catalogs)) {
                return null;
            }
            key = gdcHostname;
        }

        return catalogs[key];
    }
    return null;
})();
