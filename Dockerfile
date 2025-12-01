# Stage 1: Build the Next.js frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first to leverage Docker layer caching
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the frontend application code
COPY app ./app
COPY components ./components
COPY hooks ./hooks
COPY lib ./lib
COPY public ./public
COPY styles ./styles
COPY components.json .
COPY next.config.mjs .
COPY postcss.config.mjs .
COPY tsconfig.json .

# Build the Next.js application
RUN npm run build

# Stage 2: Final image with Python, Node.js, and both services
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install supervisor, but not Node.js/npm (will be copied from builder)
RUN apt-get update && apt-get install -y supervisor

# Copy Node.js runtime from the builder stage for consistency
COPY --from=builder /usr/local/ /usr/local/

# --- Temporary debugging lines for nextjs exit status 127 ---
RUN which npm || echo "npm not found in PATH"
RUN ls -l /usr/local/bin/npm /usr/local/bin/node || echo "Could not list npm/node in /usr/local/bin"
# --- End temporary debugging lines ---

# Copy the supervisord configuration file
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the built Next.js app from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Copy the backend code
COPY backend ./backend

# Expose ports for Next.js and FastAPI
EXPOSE 3000
EXPOSE 10000

# Create log directories for supervisor
RUN mkdir -p /var/log

# Start supervisord
CMD ["/usr/bin/supervisord"]
