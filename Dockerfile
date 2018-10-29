FROM node:10-alpine

# Set the work directory
RUN mkdir -p /var/www/app
WORKDIR /var/www/app

# Add package.json and install dependencies
COPY package.json ./
RUN npm i --production

# Add application files
COPY . /var/www/app

EXPOSE 80

CMD ["npm start"]
