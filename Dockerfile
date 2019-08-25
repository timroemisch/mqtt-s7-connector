FROM node:slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install --only=production

# Bundle app source
COPY . .

# Add Config Volume File
VOLUME ["/usr/src/app/config.json"]

# Start CMD
CMD [ "npm", "start" ]
