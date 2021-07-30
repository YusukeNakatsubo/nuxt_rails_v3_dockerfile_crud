# Rails API + Nuxt.js on Docker
Reference by [this](https://qiita.com/at-946/items/08de3c9d7611f62b1894) page.

## 1. Directory
Set for Docker image. Create directorys & files.

```
$ touch {docker-compose.yml,.env,.gitignore}
$ mkdir {front,back}
$ cd front
$ touch Dockerfile
$ cd ../back
$ touch {Dockerfile,Gemfile,Gemfile.lock}
```

### front/Dockerfile

```
FROM node:14.4.0-alpine

ARG WORKDIR
ARG CONTAINER_PORT

ENV HOME=/${WORKDIR} \
    LANG=C.UTF-8 \
    TZ=Asia/Tokyo \
    HOST=0.0.0.0

# ENV check
RUN echo ${HOME}
RUN echo ${CONTAINER_PORT}

WORKDIR ${HOME}

EXPOSE ${CONTAINER_PORT}
```

### back/Dockerfile

```
FROM ruby:2.7.1-alpine

ARG WORKDIR

ENV RUNTIME_PACKAGES="linux-headers libxml2-dev make gcc libc-dev nodejs tzdata postgresql-dev postgresql git" \
    DEV_PACKAGES="build-base curl-dev" \
    HOME=/${WORKDIR} \
    LANG=C.UTF-8 \
    TZ=Asia/Tokyo

# ENV test
RUN echo ${HOME}

WORKDIR ${HOME}

COPY Gemfile* ./

RUN apk update && \
    apk upgrade && \
    apk add --no-cache ${RUNTIME_PACKAGES} && \
    apk add --virtual build-dependencies --no-cache ${DEV_PACKAGES} && \
    bundle install -j4 && \
    apk del build-dependencies

COPY . .

CMD ["rails", "server", "-b", "0.0.0.0"]
```

### .env

```
# commons
WORKDIR=app
CONTAINER_PORT=3000
API_PORT=3000
FRONT_PORT=8080

# db
POSTGRES_PASSWORD=password
```

### .gitignore

```
/.env
```

### docker-compose.yml

```
version: '3.8'

services:
  db:
    image: postgres:12.3-alpine
    environment:
      TZ: UTC
      PGTZ: UTC
      POSTGRES_PASSWORD: $POSTGRES_PASSWORD
    volumes:
      - ./back/tmp/db:/var/lib/postgresql/data

  back:
    build:
      context: ./back
      args:
        WORKDIR: $WORKDIR
    environment:
      POSTGRES_PASSWORD: $POSTGRES_PASSWORD
    volumes:
      - ./back:/$WORKDIR
    depends_on:
      - db
    ports:
      - "$API_PORT:$CONTAINER_PORT"

  front:
    build:
      context: ./front
      args:
        WORKDIR: $WORKDIR
        CONTAINER_PORT: $CONTAINER_PORT
    command: yarn run dev
    volumes:
      - ./front:/$WORKDIR
    ports:
      - "$FRONT_PORT:$CONTAINER_PORT"
    depends_on:
      - back 
```

## 2. Docker image
Launch the Docker app. Create Docker image.

```
$ docker-compose build
$ docker images
```

## 3. Rails App
Create new Rails App.

### 3-1. Create new Rails App

```
$ docker-compose run --rm back rails new . -f -B -d postgresql --api

# Rebuilding api directory for update Gemfile
root $ docker-compose build back 
```

### 3-2. set Rails DB

```
$ vi back/config/database.yml
```

```yml
default: &default
   adapter: postgresql
   encoding: unicode
   host: db # add
   username: postgres # add
   password: <%= ENV["POSTGRES_PASSWORD"] %> # add
    ...
```

### 3-3. create Rail DB

```
$ docker-compose run --rm back rails db:create
```

#### check Rails App

```
# start Rails
$ docker-compose up back 

# access this url
http://localhost:3000

# stop Rails
control + c
$ docker-compose ps

# delete container
$ docker-compose rm -f
$ docker-compose ps

# or this command
$ docker-compose down
$ docker-compose ps

Name   Command   State   Ports
------------------------------
```

#### set DB passcode

```
$ docker-compose up -d db
$ docker-compose exec -u username db psql
```

```
postgres=# ALTER USER username WITH PASSWORD 'new passcode';

# check
postgres=# SELECT * FROM pg_shadow;

# quit
postgres=# \q
```

```
$ docker-compose down
```

```yml:back/config/database.yml
default: &default
  adapter: postgresql
  encoding: unicode
  host: db
  username: postgres
  password: new passcode # replace
  ...
```

## 4. Nuxt.js App
Create new Nuxt.js App.

```
$ docker-compose run --rm front yarn create nuxt-app app
```

```
create-nuxt-app v3.7.1
✨  Generating Nuxt.js project in app
? Project name: app
? Programming language: JavaScript
? Package manager: Yarn
? UI framework: None
? Nuxt.js modules: (Press <space> to select, <a> to toggle all, <i> to invert se
lection)
? Linting tools: (Press <space> to select, <a> to toggle all, <i> to invert sele
ction)
? Testing framework: None
? Rendering mode: Single Page App
? Deployment target: Server (Node.js hosting)
? Development tools: (Press <space> to select, <a> to toggle all, <i> to invert 
selection)
? What is your GitHub username? 
? Version control system: Git
```

```
$ mv front/app/{*,.*} front
$ rm -rf front/app
```

### check Nuxt.js app

```
# start Nuxt
root $ docker-compose up front

# access this url
http://localhost:8080

# stop Nuxt
control + c
$ docker-compose ps

# delete container
$ docker-compose stop
$ docker-compose rm -f
$ docker-compose ps

# or this command
$ docker-compose down
$ docker-compose ps

Name   Command   State   Ports
------------------------------
```

##### push Github repository

