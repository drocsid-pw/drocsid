defmodule DrocsidCore.GuildServer do
  use GRPC.Server, service: Guild.GuildService.Service
  require Logger

  def create_guild(request, _stream) do
    Logger.info("CreateGuild called: #{inspect(request)}")
    Guild.Guild.new()
  end

  def get_guild(request, _stream) do
    Logger.info("GetGuild called: #{inspect(request)}")
    Guild.Guild.new()
  end

  def update_guild(request, _stream) do
    Logger.info("UpdateGuild called: #{inspect(request)}")
    Guild.Guild.new()
  end
end
