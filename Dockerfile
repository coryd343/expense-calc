# Step 1: Build the Angular app
FROM node:latest AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Angular app for production
RUN npm run build --prod

# Step 2: Set up the Express.js server
FROM node:alpine

# Set the working directory
WORKDIR /app

# Copy the built Angular app from the previous build step
COPY --from=build /app/dist/expense-calc ./dist/expense-calc

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install production dependencies (for Express.js)
RUN npm install --only=production

# Copy the server.js file
COPY server.js .

# Expose the port the app will run on
EXPOSE 8080

# Run the Express.js server
CMD ["node", "server.js"]