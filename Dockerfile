# BASE CONTAINER IMAGE
FROM node:8

# INSTALL LINUX DEPS
RUN apt-get update -y && \
    apt-get install -y \
    alsa-utils \
    lame \
    python-pyaudio \
    python3-pyaudio \
    sox \
    libatlas-base-dev \
    # HERE FOR DEBUGGING WORK
    nano \    
    libsox-fmt-all

#  SETUP REQUIRED ENV VARIABLES
ENV AUDIODRIVER alsa
ENV AUDIODEV hw:1,0

# INSTALL NODE DEPS
RUN mkdir -p /opt/app/node_modules
WORKDIR /opt/app
COPY package*.json ./
RUN npm i && npm cache clean --force
ENV PATH /opt/app/node_modules/.bin:$PATH

# COPY SOURCE
COPY . .

# DEFAULT RUN CMD
CMD [ "npm", "start"]
