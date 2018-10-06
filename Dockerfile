FROM node:8
WORKDIR /usr/src/sportal
COPY . /usr/src/sportal
# Backend includes platform specific libraries 
# So we're cleaning out host's install
RUN rm -rf backend/node_modules/
RUN rm -rf client/node_modules/
RUN cd client && npm install && npm run build
RUN cd backend && npm install && npm run build
EXPOSE 3000
CMD ["npm", "start", "backend/"]