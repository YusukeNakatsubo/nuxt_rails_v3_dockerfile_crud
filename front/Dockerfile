FROM node:14.4.0-alpine

ARG WORKDIR
ARG CONTAINER_PORT
# 追加
ARG API_URL

ENV HOME=/${WORKDIR} \
    LANG=C.UTF-8 \
    TZ=Asia/Tokyo \
    # \ 追記
    HOST=0.0.0.0  \
    # 追加
    API_URL=${API_URL}

# ENV check
RUN echo ${HOME}
RUN echo ${CONTAINER_PORT}
# 追加
RUN echo ${API_URL}

WORKDIR ${HOME}

EXPOSE ${CONTAINER_PORT}
