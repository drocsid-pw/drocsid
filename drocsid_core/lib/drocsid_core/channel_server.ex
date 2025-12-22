defmodule DrocsidCore.ChannelServer do
  use GRPC.Server, service: Channel.ChannelService.Service
  require Logger

  def get_channel(%{caller_id: caller_id, channel_id: channel_id}, _stream) do
    Logger.info("GetChannel: #{channel_id}")
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

  # messages
  def get_messages(%{req: %{caller_id: caller_id, channel_id: channel_id}, offset: offset, count: count}, _stream) do
    Logger.info("GetMessages: #{channel_id}")
    Dmessage.MessageList.new()
  end

  def create_message(%{req: %{caller_id: caller_id, channel_id: channel_id}, message: %{content: content}}, _stream) do
    Logger.info("UpdateMessage: #{channel_id}")
    Dmessage.Message.new()
  end

  def delete_message(request, _stream) do
    Logger.info("DeleteMessage: #{inspect(request)}")
    Common.ResponseMessage.new(text: "not implemented yet")
  end

  defp get_guild_id(channel_id) do
    with {:ok, %{ guild_id: guild_id }} <- DrocsidCore.DB.get_guild_by_channel(channel_id) do
      {:ok, guild_id: guild_id}
    else
      _ -> :error
    end
  end
end
