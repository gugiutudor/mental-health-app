FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy server source code
COPY . .

# Expose the port the server runs on
EXPOSE 4000

# Command to run the server
CMD ["node", "src/index.js"]