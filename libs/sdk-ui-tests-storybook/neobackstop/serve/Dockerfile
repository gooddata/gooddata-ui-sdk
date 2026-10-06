# Stage 1: Build the Go app
FROM 020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/docker.io/library/golang:1.27.1-alpine@sha256:8a5910f31396cd4d89662f56c68b3ae31d374308270a1c3bd96672ee5ed43414 AS builder
WORKDIR /app

# Copy Go module files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the application source code
COPY . .

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux go build -o app .

# Stage 2: Run the app
FROM scratch
WORKDIR /

# Copy the built Go app binary
COPY --from=builder /app/app /usr/bin/app
COPY dist /srv/storybook

ENV ENVIRONMENT=PROD

# Expose port

# Go app will listen on 8080
EXPOSE 8080

# Run the Go app
CMD ["/usr/bin/app", "/srv/storybook"]