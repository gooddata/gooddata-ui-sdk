# Stage 1: Build the Go app
FROM 020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/docker.io/library/golang:1.26.3-alpine@sha256:91eda9776261207ea25fd06b5b7fed8d397dd2c0a283e77f2ab6e91bfa71079d AS builder
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
