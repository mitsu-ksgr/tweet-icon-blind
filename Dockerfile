FROM node:23-bookworm-slim

RUN npm install -g npm@8.12.1

WORKDIR /app

COPY package*.json ./
RUN yarn set version stable
RUN yarn install

#USER node
CMD ["/bin/bash"]

