FROM elixir:1.17-alpine AS build

RUN apk add --no-cache build-base git protobuf

WORKDIR /app
RUN mix local.hex --force && mix local.rebar --force

RUN mix escript.install hex protobuf --force
ENV PATH="/root/.mix/escripts:${PATH}"

COPY mix.exs mix.lock ./
COPY config config

ENV MIX_ENV=prod
RUN mix deps.get --only prod

COPY lib lib
COPY priv priv

RUN protoc \
  --elixir_out=plugins=grpc:./lib \
  -I ./priv/protos \
  priv/protos/common.proto \
  priv/protos/guild_user.proto \
  priv/protos/role.proto \
  priv/protos/message.proto \
  priv/protos/user.proto \
  priv/protos/channel.proto \
  priv/protos/guild.proto

RUN mix compile
RUN mix release

FROM debian:bookworm-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    libstdc++6 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/_build/prod/rel/drocsid_core ./

ENV MIX_ENV=prod \
    PORT=50051

EXPOSE 50051

CMD ["bin/drocsid_core", "start"]
