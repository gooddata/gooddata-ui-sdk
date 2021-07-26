// (C) 2021 GoodData Corporation
package org.gooddata.extensions;

import java.util.List;

import com.github.tomakehurst.wiremock.extension.requestfilter.StubRequestFilter;
import com.github.tomakehurst.wiremock.extension.requestfilter.RequestWrapper;
import com.github.tomakehurst.wiremock.extension.requestfilter.RequestFilterAction;
import com.github.tomakehurst.wiremock.http.Request;

import org.gooddata.extensions.OriginTransformer;
import org.gooddata.extensions.RefererTransformer;

public class RequestHeadersTransformer extends StubRequestFilter {

    @Override
    public RequestFilterAction filter(Request request) {
        Request wrappedRequest = RequestWrapper.create()
                .transformHeader("Origin", new OriginTransformer())
                .transformHeader("Referer", new RefererTransformer())
                .wrap(request);

        return RequestFilterAction.continueWith(wrappedRequest);
    }

    @Override
    public String getName() {
        return "url-and-header-modifier";
    }
}
