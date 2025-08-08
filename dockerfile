# Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app files
COPY . .

# Expose port (used in backend, e.g., 4000)
EXPOSE 4000

# Run the app
CMD ["node", "app.js"]
