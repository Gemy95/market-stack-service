# Use Node.js base image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies first (better caching)
COPY package*.json yarn.lock* ./ 
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the app
RUN yarn build

# Expose the app port (NestJS default is 3000)
EXPOSE 5000

# Run the app
CMD ["yarn", "start:prod"]
