defmodule DrocsidCore.Endpoint do
  use GRPC.Endpoint

  run DrocsidCore.GuildServer
  run DrocsidCore.UserServer
  run DrocsidCore.ChannelServer
end
