// (C) 2021 GoodData Corporation
package org.gooddata.extensions;

import java.util.List;
import java.util.ArrayList;

import com.github.tomakehurst.wiremock.extension.requestfilter.FieldTransformer;

// used by RequestHeadersTransformer
public class OriginTransformer implements FieldTransformer<List<String>> {
    @Override
    public List<String> transform(List<String> source) {
        String proxyHost = System.getenv().get("PROXY_HOST");
        List<String> result = new ArrayList<String>();
        result.add(proxyHost);
        return result;
    }
}
