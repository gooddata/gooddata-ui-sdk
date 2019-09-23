const proxy = require("http-proxy-middleware");

const domain = "http://localhost:3000";
module.exports = function(app) {
    app.use(
        proxy("/api", {
            changeOrigin: true,
            cookieDomainRewrite: "localhost",
            secure: false,
            target: domain,
            headers: {
                host: domain.replace(/http:\/\//, ""),
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
