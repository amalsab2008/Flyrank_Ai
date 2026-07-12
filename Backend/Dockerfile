FROM node:18-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package configurations
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy application source code
COPY . .

# Expose port
EXPOSE 3000

# Run the server
CMD ["node", "server.js"]
