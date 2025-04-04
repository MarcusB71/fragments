# Stage 1: Build (includes dev-dependencies)
FROM node:20.11.0-alpine@sha256:bcf90f85634194bc51e92f8add1221c7fdeeff94b7f1ff360aeaa7498086d641 AS build

LABEL maintainer="Marcus Brown mbrown106@myseneca.ca"
LABEL description="Fragments node.js microservice"

# Reduce npm spam when installing within Docker
ENV NPM_CONFIG_LOGLEVEL=warn
# Disable colour when run inside Docker
ENV NPM_CONFIG_COLOR=false

# Ensures all frameworks and libraries know to turn on optimized configuration for production
ENV NODE_ENV=production

# Use /app as our working directory
WORKDIR /app

# Copy package files first utilizing docker layer caching
COPY package*.json ./

# Install all dependencies (including dev) for potential build steps
RUN npm ci

# Copy the rest of the app files
COPY . .

# Stage 2: Production
FROM node:20.11.0-alpine@sha256:bcf90f85634194bc51e92f8add1221c7fdeeff94b7f1ff360aeaa7498086d641

# Ensures all frameworks and libraries know to turn on optimized configuration for production
ENV NODE_ENV=production

# Use /app as our working directory
WORKDIR /app

# Copy only the node_modules and necessary files from the build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/. ./

# Set user to node for security (temp root for ECS)
USER root

# We run our service on port 8080
EXPOSE 8080

# Start the container by running our server
CMD ["node", "src/index.js"]
