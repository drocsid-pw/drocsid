import Config

config :logger, :console,
  format: "$time $metadata[$level] $message\n"

config :grpc, start_server: true
