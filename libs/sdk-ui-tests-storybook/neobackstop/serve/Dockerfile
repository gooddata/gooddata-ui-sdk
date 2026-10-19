# Stage 1: Build the Go app
FROM 020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/docker.io/library/golang:1.27.2-alpine@sha256:f92b6ef800e499660581efdabdf25d9d817a9d124eaf900924f0504e7e27e12d AS builder
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