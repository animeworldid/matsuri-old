FROM ghcr.io/hazmi35/node:18-dev-alpine as build-stage

# Prepare pnpm with corepack (experimental feature)
RUN corepack enable && corepack prepare pnpm@latest-7

# Copy package.json, lockfile and npm config files
COPY package.json pnpm-lock.yaml *.npmrc  ./

# Copy husky folder
COPY .husky/ ./.husky

# Install dependencies
RUN apk add --no-cache gcc g++ cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev

# Fetch dependencies to virtual store
RUN pnpm fetch

# Install dependencies
RUN pnpm install --offline --frozen-lockfile

# Copy Project files
COPY . .

# Build TypeScript Project
RUN pnpm run build

# Prune devDependencies
RUN DOCKER=true pnpm prune --production

# Get ready for production
FROM ghcr.io/hazmi35/node:18-alpine

LABEL name "matsuri"
LABEL maintainer "Anime World Indonesia <dev@animeworld.moe>"

# Install dependencies
RUN apk add --no-cache tzdata fontconfig

# Copy needed files
COPY --from=build-stage /tmp/build/package.json .
COPY --from=build-stage /tmp/build/node_modules ./node_modules
COPY --from=build-stage /tmp/build/dist ./dist
COPY --from=build-stage /tmp/build/assets ./assets

# Start the app
CMD ["npm", "start"]
