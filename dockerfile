FROM nginx:alpine
COPY ./src/*.html /usr/share/nginx/html
COPY ./src/dist /usr/share/nginx/html/dist