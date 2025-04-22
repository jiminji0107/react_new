# 1단계: React 앱 빌드 (Node.js 사용)
FROM node:16-alpine AS build
WORKDIR /app

ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}


COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# 2단계: Nginx를 사용하여 빌드 결과물을 서빙
FROM nginx:alpine

# 기본 default.conf 파일 제거
RUN rm /etc/nginx/conf.d/default.conf

# 빌드된 정적 파일들을 Nginx가 제공하는 디렉토리로 복사
COPY --from=build /app/build /usr/share/nginx/html

# Docker 빌드 컨텍스트(즉, frontend 폴더) 내의 nginx/default.conf를 Nginx 설정 위치로 복사
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["sh", "-c", "envsubst '$$REACT_APP_BACKEND_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
