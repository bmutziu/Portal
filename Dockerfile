FROM node:12.21.0 AS build
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install && npm run build
RUN npm prune --production
RUN /usr/local/bin/node-prune

FROM node:12.21.0-alpine
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/app ./app
COPY --from=build /usr/src/app/server ./server
COPY --from=build /usr/src/app/data ./data
COPY --from=build /usr/src/app/package*.json /usr/src/app/server.js ./
RUN ls
RUN sed -i 's%<base href="/">%<base href="/portal/">%g' ./app/portal/index.html
RUN cat ./app/portal/index.html
EXPOSE 3000
CMD ["npm", "run", "prod"]
