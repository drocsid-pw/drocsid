FROM elixir:1.16-slim AS build

RUN apt-get update && apt-get install -y \
    build-essential \
    git \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV MIX_ENV=prod

RUN mix local.hex --force && mix local.rebar --force

COPY mix.exs mix.lock ./
COPY config config

RUN mix deps.get --only prod
RUN mix deps.compile

COPY . .

RUN mix compile
RUN mix release

FROM elixir:1.16-slim AS runtime

RUN apt-get update && apt-get install -y \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV LANG=C.UTF-8
WORKDIR /app

RUN useradd --create-home app
USER app

COPY --from=build /app/_build/prod/rel/drocsid_core ./

EXPOSE 50051

CMD ["bin/drocsid_core", "start"]
