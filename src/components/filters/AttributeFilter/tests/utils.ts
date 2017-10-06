import { IElement } from 'gooddata';

// tslint:disable-next-line:max-line-length
const COUNTRIES = ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burma (Myanmar)', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo, Democratic Republic of the', 'Congo, Republic of', 'Costa Rica', 'Côte d\'Ivoire', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Nigeria', 'Northern Ireland', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestinian State (proposed)', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Samoa', 'San Marino', 'São Tomé and Príncipe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'Spain', 'Sri Lanka', 'St. Kitts and Nevis', 'St. Lucia', 'St. Vincent and the Grenadines', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City (Holy See)', 'Venezuela', 'Vietnam', 'Western Sahara (proposed state)', 'Yemen', 'Zaire', 'Zambia', 'Zimbabwe'];

export const ATTRIBUTE_DISPLAY_FORM_URI_3 = '/gdc/md/projectId/obj/333';
export const ATTRIBUTE_DISPLAY_FORM_URI = '/gdc/md/projectId/obj/666';
export const ATTRIBUTE_DISPLAY_FORM_URI_2 = '/gdc/md/projectId/obj/999';
export const ATTRIBUTE_DISPLAY_FORM_IDENTIFIER = 'foo';
export const ATTRIBUTE_DISPLAY_FORM_IDENTIFIER_2 = 'baz';

export function createMetadataMock() {
    return {
        // tslint:disable-next-line:variable-name
        getValidElements: jest.fn((_projectId, objectId, options) => {
            const items: IElement[] = COUNTRIES.slice(0, options.limit).map((item, index) => ({
                element: {
                    uri: `/gdc/md/projectId/object/${objectId}?id=${index}`,
                    title: item
                }
            }));

            return Promise.resolve({
                validElements: {
                    items,
                    paging: {
                        total: COUNTRIES.length
                    }
                }
            });
        }),
        getObjectUri: jest.fn((_projectId, identifier) => { // tslint:disable-line:variable-name
            if (identifier === ATTRIBUTE_DISPLAY_FORM_IDENTIFIER) {
                return Promise.resolve(ATTRIBUTE_DISPLAY_FORM_URI);
            }
            if (identifier === ATTRIBUTE_DISPLAY_FORM_IDENTIFIER_2) {
                return Promise.resolve(ATTRIBUTE_DISPLAY_FORM_URI_2);
            }
            return Promise.resolve(ATTRIBUTE_DISPLAY_FORM_URI_3);
        }),
        getObjectDetails: jest.fn((uri) => {
            if (uri === ATTRIBUTE_DISPLAY_FORM_URI) {
                return Promise.resolve({
                    attributeDisplayForm: {
                        meta: {
                            title: 'Attribute',
                            uri
                        }
                    }
                });
            }
            if (uri === ATTRIBUTE_DISPLAY_FORM_URI_2) {
                return Promise.resolve({
                    attributeDisplayForm: {
                        meta: {
                            title: 'Attribute 2',
                            uri
                        }
                    }
                });
            }
            return Promise.resolve({
                attributeDisplayForm: {
                    meta: {
                        title: 'Country',
                        uri
                    }
                }
            });
        })
    };
}

// Runs supplied 'test' function after 'delayOffset' ms every 'increment' ms
// until it returns truthy and resolves returned promise
// or until it reaches maxDelay and rejects the promise
export function waitFor(test: Function, maxDelay = 1000, delayOffset = 0, increment = 100) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const intervalRef = setInterval(() => {
                const testResult = test();
                if (testResult) {
                    clearInterval(intervalRef);
                    return resolve(testResult);
                }
                if (Date.now() - start >= maxDelay) {
                    clearInterval(intervalRef);
                    reject(testResult);
                }
            }, increment);
        }, delayOffset);
    });
}
