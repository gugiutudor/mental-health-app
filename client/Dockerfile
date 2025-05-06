FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy client source code
COPY . .

# Expose the port the React app runs on
EXPOSE 3000

# Command to run the React app
CMD ["npm", "start"]