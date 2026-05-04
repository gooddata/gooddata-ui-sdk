package main

import (
	"bufio"
	"crypto/rand"
	"crypto/rsa"
	"crypto/tls"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"log"
	"math/big"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/valyala/fasthttp"
)

type envConfig struct {
	Host        string `json:"host"`
	WorkspaceId string `json:"workspaceId"`
	DashboardId string `json:"dashboardId"`
	Auth        string `json:"auth"`
}

func loadEnvConfig() envConfig {
	config := map[string]string{}

	if file, err := os.Open(".env"); err == nil {
		defer file.Close()
		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			parts := strings.SplitN(line, "=", 2)
			if len(parts) != 2 {
				continue
			}
			key := strings.TrimSpace(parts[0])
			value := strings.TrimSpace(parts[1])
			value = strings.Trim(value, `"'`)
			config[key] = value
		}
	}

	pick := func(envFileKey, defaultValue string) string {
		if v, ok := config[envFileKey]; ok && v != "" {
			return v
		}
		if v := os.Getenv(envFileKey); v != "" {
			return v
		}
		return defaultValue
	}

	return envConfig{
		Host:        pick("HOST", "https://localhost:8443"),
		WorkspaceId: pick("TEST_WORKSPACE_ID", ""),
		DashboardId: pick("TEST_DASHBOARD_ID", "601c81ae-0582-42f0-9f35-a4ec2a6a8497"),
		Auth:        "sso",
	}
}

func generateConfigFile(staticDir string) {
	cfg := loadEnvConfig()
	configDir := filepath.Join(staticDir, "web-components")
	configFile := filepath.Join(configDir, "config.js")

	if err := os.MkdirAll(configDir, 0755); err != nil {
		log.Fatalf("Failed to create config dir: %v", err)
	}

	cfgJSON, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		log.Fatalf("Failed to marshal config: %v", err)
	}

	content := fmt.Sprintf("// Auto-generated config from .env file\n// This file is regenerated when the server starts\nwindow.__WC_TEST_CONFIG__ = %s;\n", string(cfgJSON))

	if err := os.WriteFile(configFile, []byte(content), 0644); err != nil {
		log.Fatalf("Failed to write config file: %v", err)
	}

	fmt.Printf("Generated config.js from .env: %s\n", string(cfgJSON))
}

func generateSelfSignedCert() ([]byte, []byte, error) {
	priv, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return nil, nil, err
	}

	template := x509.Certificate{
		SerialNumber: big.NewInt(1),
		Subject: pkix.Name{
			Organization: []string{"sdk-ui-web-components"},
		},
		NotBefore:             time.Now(),
		NotAfter:              time.Now().Add(365 * 24 * time.Hour),
		KeyUsage:              x509.KeyUsageDigitalSignature | x509.KeyUsageKeyEncipherment,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
		DNSNames:              []string{"localhost", "sdk-ui-web-components"},
	}

	derBytes, err := x509.CreateCertificate(rand.Reader, &template, &template, &priv.PublicKey, priv)
	if err != nil {
		return nil, nil, err
	}

	certPEM := pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: derBytes})
	keyPEM := pem.EncodeToMemory(&pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(priv)})

	return certPEM, keyPEM, nil
}

func setCORSHeaders(ctx *fasthttp.RequestCtx) {
	ctx.Response.Header.Set("Access-Control-Allow-Origin", "*")
	ctx.Response.Header.Set("Access-Control-Allow-Private-Network", "true")
	ctx.Response.Header.Set("Access-Control-Allow-Headers", "*")
}

func main() {
	port := 3001

	absFolder, err := filepath.Abs("./static/")
	if err != nil {
		log.Fatalf("Failed to get absolute path: %v", err)
	}

	generateConfigFile(absFolder)

	certPEM, keyPEM, err := generateSelfSignedCert()
	if err != nil {
		log.Fatalf("Failed to generate self-signed cert: %v", err)
	}

	proxyHost := strings.TrimRight(os.Getenv("PROXY_HOST"), "/")
	var proxyClient *fasthttp.Client
	var proxyHostHeader string
	if proxyHost != "" {
		u, err := url.Parse(proxyHost)
		if err != nil || u.Host == "" {
			log.Fatalf("Invalid PROXY_HOST %q: %v", proxyHost, err)
		}
		proxyHostHeader = u.Host
		proxyClient = &fasthttp.Client{
			TLSConfig: &tls.Config{InsecureSkipVerify: true},
		}
		fmt.Printf("Proxying /components/* -> %s\n", proxyHost)
	} else {
		fmt.Printf("Serving /components/* from local static dir\n")
	}

	fmt.Printf("Serving sdk-ui-web-components from: %s on port %d (HTTPS, self-signed)\n", absFolder, port)

	fs := &fasthttp.FS{
		Root:               absFolder,
		IndexNames:         []string{"index.html"},
		GenerateIndexPages: false,
		AcceptByteRange:    true,
	}
	fsHandler := fs.NewRequestHandler()

	requestHandler := func(ctx *fasthttp.RequestCtx) {
		setCORSHeaders(ctx)

		if proxyClient != nil && strings.HasPrefix(string(ctx.Path()), "/components") {
			req := fasthttp.AcquireRequest()
			resp := fasthttp.AcquireResponse()
			defer fasthttp.ReleaseRequest(req)
			defer fasthttp.ReleaseResponse(resp)

			ctx.Request.CopyTo(req)
			req.SetRequestURI(proxyHost + string(ctx.RequestURI()))
			req.Header.SetHost(proxyHostHeader)

			if err := proxyClient.Do(req, resp); err != nil {
				ctx.SetStatusCode(fasthttp.StatusBadGateway)
				ctx.SetBodyString(fmt.Sprintf("proxy error: %v", err))
				return
			}
			resp.CopyTo(&ctx.Response)
			setCORSHeaders(ctx)
			return
		}

		fsHandler(ctx)
	}

	log.Fatal(fasthttp.ListenAndServeTLSEmbed(fmt.Sprintf(":%d", port), certPEM, keyPEM, requestHandler))
}
