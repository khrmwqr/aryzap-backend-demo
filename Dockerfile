# Use official Node.js 20 Alpine image for smaller size
FROM node:20-alpine

# Set environment to production
ENV NODE_ENV=production

# Create application directory
WORKDIR /app

# Copy package.json and package-lock.json first for dependency caching
COPY package*.json ./

# Install production dependencies (excludes devDependencies)
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose the application port
EXPOSE 8080

# Start the application
CMD ["node", "app.js"]