defmodule DrocsidCore.ChannelServer do
  use GRPC.Server, service: Channel.ChannelService.Service
  require Logger

  def create_channel(request, _stream) do
    Logger.info("CreateChannel: #{inspect(request)}")
    Channel.Channel.new()
  end

  def get_channel(request, _stream) do
    Logger.info("GetChannel: #{inspect(request)}")
    Channel.Channel.new()
  end

  def update_channel(request, _stream) do
    Logger.info("UpdateChannel: #{inspect(request)}")
    Channel.Channel.new()
  end

  def delete_channel(request, _stream) do
    Logger.info("DeleteChannel: #{inspect(request)}")
    Common.ResponseMessage.new(text: "not implemented yet")
  end
end
