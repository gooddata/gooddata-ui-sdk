# Stage 1: Build the Go app
FROM 020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/docker.io/library/golang:1.25.2-bookworm AS builder
WORKDIR /app

# Copy Go module files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the application source code
COPY . .

# Declare the TARGETARCH argument (automatically set by Docker BuildKit)
ARG TARGETARCH

# Build the Go application
RUN CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=${TARGETARCH} \
    go build -o bin .

# Stage 2: Run the app
FROM 020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/docker.io/library/debian:bookworm-slim
WORKDIR /

# Install CA certs & dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libexpat1 \
    libatspi2.0-0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libxcb1 \
    libxkbcommon0 \
    libasound2 \
    fonts-liberation \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libgtk-3-0 \
    && update-ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy the built Go app binary and the html_report_assets which are needed at runtime
RUN mkdir -p /usr/neobackstop/app
COPY --from=builder /app/bin /usr/neobackstop/app/bin
COPY --from=builder /app/html_report_assets /usr/neobackstop/app/html_report_assets

ENV ENVIRONMENT=PROD

WORKDIR /usr/neobackstop/app

# Use entrypoint to allow argument passing
ENTRYPOINT ["/usr/neobackstop/app/bin"]
# CMD will be default command if none provided
CMD ["test"]
