// (C) 2021 GoodData Corporation
package org.gooddata.extensions;

import java.util.Set;
import java.util.ArrayList;
import java.util.List;

import com.github.tomakehurst.wiremock.extension.ResponseTransformer;
import com.github.tomakehurst.wiremock.extension.Parameters;
import com.github.tomakehurst.wiremock.http.Request;
import com.github.tomakehurst.wiremock.http.Response;
import com.github.tomakehurst.wiremock.http.HttpHeaders;
import com.github.tomakehurst.wiremock.http.HttpHeader;
import com.github.tomakehurst.wiremock.common.FileSource;

public class ResponseHeadersTransformer extends ResponseTransformer {

        @Override
        public Response transform(Request request, Response response, FileSource files, Parameters parameters) {
            HttpHeaders originalHeaders = response.getHeaders();
            HttpHeaders newHeaders = new HttpHeaders();

            if (request.getUrl().equals("/gdc/account/login")) {
                // get original cookie values
                HttpHeader cookieHeader = originalHeaders.getHeader("Set-Cookie");
                List<String> cookieHeaderValues = cookieHeader.values();

                // create new cookies header without domain field
                List<String> newCookieHeaderValues = new ArrayList<String>();
                String proxyHost = System.getenv().get("PROXY_HOST").replace("https://", "");
                for (String cookieRecord : cookieHeaderValues) {
                    newCookieHeaderValues.add(cookieRecord
                        .replace("; Domain="+proxyHost+"", "")
                        .replace("; Secure", "")
                        .replace("; HTTPOnly", "")
                        .replace("; SameSite=None", "")
                    );
                }
                HttpHeader newCookieHeader = new HttpHeader("Set-Cookie", newCookieHeaderValues);

                newHeaders = newHeaders.plus(newCookieHeader);
            }

            // skip old cookies & X-GDC... & Date headers
            for (String key : originalHeaders.keys()) {
                if (!key.toUpperCase().equals("SET-COOKIE") && !key.startsWith("X-GDC") && !key.toUpperCase().equals("DATE")) {
                    newHeaders = newHeaders.plus(originalHeaders.getHeader(key));
                }
            }

            return Response.Builder.like(response)
                    .but()
                    .headers(newHeaders)
                    .build();
        }

        @Override
        public String getName() {
            return "stub-transformer-with-params";
        }
}