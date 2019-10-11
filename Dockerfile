FROM alpine:latest

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      freetype-dev \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      yarn 

RUN apk add --no-cache curl make gcc g++
RUN apk add --no-cache linux-headers binutils-gold gnupg libstdc++
RUN apk add --no-cache zip imagemagick
RUN apk add --update nodejs nodejs-npm && npm install npm@latest -g

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# specify a certain version of Chromium you'd like Puppeteer to use. See puppeteer.launch([options]) on how executable path is inferred. BEWARE: Puppeteer is only guaranteed to work with the bundled Chromium, use at your own risk.
#ENV PUPPETEER_CHROMIUM_REVISION /usr/bin/chromium-browser

# specify an executable path to be used in puppeteer.launch. See puppeteer.launch([options]) on how the executable path is inferred. BEWARE: Puppeteer is only guaranteed to work with the bundled Chromium, use at your own risk.
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

RUN mkdir /app
WORKDIR /app

COPY package.json /app/
ADD . /app


# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
    #&& mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
USER pptruser


RUN npm install
# RUN yarn install

# Puppeteer v1.17.0 works with Chromium 76.
# RUN yarn add puppeteer@1.17.0
#RUN npm install puppeteer@1.17.0

EXPOSE 3000
CMD ["node", "server.js"]
