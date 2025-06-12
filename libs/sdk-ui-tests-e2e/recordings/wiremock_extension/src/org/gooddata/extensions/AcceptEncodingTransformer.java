// (C) 2021 GoodData Corporation
package org.gooddata.extensions;

import java.util.List;
import static java.util.Arrays.asList;

import com.github.tomakehurst.wiremock.extension.requestfilter.FieldTransformer;

// used by RequestHeadersTransformer
public class AcceptEncodingTransformer implements FieldTransformer<List<String>> {
    @Override
    public List<String> transform(List<String> acceptEncodingHeaders) {
        return asList("gzip");
    }
}
