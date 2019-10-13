FROM alpine:latest

ARG BUILD_DATE
ARG VCS_REF

LABEL org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.description="Chrome running in headless mode in a tiny Alpine image" \
      org.label-schema.name="alpine-chrome" \
      org.label-schema.schema-version="1.0.0-rc1" \
      org.label-schema.usage="https://github.com/Zenika/alpine-chrome/blob/master/README.md" \
      org.label-schema.vcs-url="https://github.com/Zenika/alpine-chrome" \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.vendor="Zenika" \
      org.label-schema.version="latest"

# Installs latest Chromium package.
RUN echo @edge http://nl.alpinelinux.org/alpine/edge/community > /etc/apk/repositories \
    && echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories \
    && apk add --no-cache \
    libstdc++@edge \
    chromium@edge \
    harfbuzz@edge \
    nss@edge \
    freetype@edge \
    ttf-freefont@edge \
    && rm -rf /var/cache/* \
    && mkdir /var/cache/apk

RUN apk add --no-cache curl@edge make@edge gcc@edge g++@edge
RUN apk add --no-cache linux-headers@edge binutils-gold@edge gnupg@edge libstdc++@edge
RUN apk add --no-cache zip@edge imagemagick@edge
RUN apk add --update nodejs@edge nodejs-npm@edge && npm install npm@latest -g

#RUN apk add --no-cache \
      #chromium \
      #nss \
      #freetype \
      #freetype-dev \
      #harfbuzz \
      #ca-certificates \
      #ttf-freefont \

#RUN apk add --no-cache curl make gcc g++
#RUN apk add --no-cache linux-headers binutils-gold gnupg libstdc++
#RUN apk add --no-cache zip imagemagick
#RUN apk add --update nodejs nodejs-npm && npm install npm@latest -g

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# specify a certain version of Chromium you'd like Puppeteer to use. See puppeteer.launch([options]) on how executable path is inferred. BEWARE: Puppeteer is only guaranteed to work with the bundled Chromium, use at your own risk.
# ENV PUPPETEER_CHROMIUM_REVISION /usr/bin/chromium-browser

# specify an executable path to be used in puppeteer.launch. See puppeteer.launch([options]) on how the executable path is inferred. BEWARE: Puppeteer is only guaranteed to work with the bundled Chromium, use at your own risk.
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

RUN mkdir /app
WORKDIR /app

COPY package.json /app/
ADD . /app

RUN npm install pm2 -g

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
# RUN npm install puppeteer@1.17.0

EXPOSE 3000

# CMD ["node", "server.js"]
# CMD ["pm2-runtime", "server.js"]
CMD ["pm2-runtime", "pm2.yaml"]
