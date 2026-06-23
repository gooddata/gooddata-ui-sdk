# Stage 1: Build the Go app
FROM 020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/docker.io/library/golang:1.26.4-alpine@sha256:3ad57304ad93bbec8548a0437ad9e06a455660655d9af011d58b993f6f615648 AS builder
WORKDIR /app

# Copy Go module files and download dependencies
COPY tiny_web_server/go.mod tiny_web_server/go.sum ./
RUN go mod download

# Copy the application source code
COPY tiny_web_server/ .

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux go build -o app .

# Stage 2: Run the app
FROM scratch
WORKDIR /

# Copy the built Go app binary
COPY --from=builder /app/app /usr/bin/app

# Copy static dir (dashboard-test.html)
COPY tiny_web_server/static/ ./static/

# Add web components tgz (packed by package.json script _phase:pack-build)
ADD sdk-ui-web-components.tgz ./static/components/

# Expose port
EXPOSE 3001

# Run the Go app
CMD ["/usr/bin/app"]
