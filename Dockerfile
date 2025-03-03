# Set node sha to ensure using same version each time
FROM node:20.11.0-alpine@sha256:bcf90f85634194bc51e92f8add1221c7fdeeff94b7f1ff360aeaa7498086d641

LABEL maintainer="Marcus Brown mbrown106@myseneca.ca"
LABEL description="Fragments node.js microservice"

ENV PORT=8080

# Reduce npm spam when installing within Docker
ENV NPM_CONFIG_LOGLEVEL=warn
# Disable colour when run inside Docker
ENV NPM_CONFIG_COLOR=false

# Ensures all frameworks and libraries know to turn on optimized configuration for production
ENV NODE_ENV production

# Use /app as our working directory
WORKDIR /app

# Copy package files first utilizing docker layer caching
COPY --chown=node:node .package*.json ./

# Install node dependencies defined in package-lock.json excluding dev-dependencies 
# which arent needed in production
RUN npm ci --only=production

# Copy the rest of the app files
COPY --chown=node:node . .

# Set user to node for security
USER node

# We run our service on port 8080
EXPOSE 8080

# Start the container by running our server
CMD npm start

