const proxy = require("http-proxy-middleware");

const domain = "https://secure.gooddata.com";
module.exports = function(app) {
    app.use(
        proxy("/gdc", {
            changeOrigin: true,
            cookieDomainRewrite: "localhost",
            secure: false,
            target: domain,
            headers: {
                host: domain.replace(/https:\/\//, ""),
                origin: null,
            },
            onProxyReq: function(proxyReq, req, res) {
                proxyReq.setHeader("accept-encoding", "identity");
            },
        }),
    );
    app.use(
        proxy("/*.html", {
            changeOrigin: true,
            secure: false,
            target: domain,
        }),
    );
    app.use(
        proxy("/packages/*.{js,css}", {
            changeOrigin: true,
            secure: false,
            target: domain,
        }),
    );
};
