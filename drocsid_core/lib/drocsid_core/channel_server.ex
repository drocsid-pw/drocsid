defmodule DrocsidCore.ChannelServer do
  use GRPC.Server, service: Channel.ChannelService.Service
  require Logger

  alias DrocsidCore.GuildProcess

  def get_channel(%{caller_id: caller_id, channel_id: channel_id}, _stream) do
    Logger.info("GetChannel: #{channel_id}")
    cid =
      case Integer.parse(caller_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "caller_id must be an integer"
      end
    chid =
      case Integer.parse(channel_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "channel_id must be an integer"
      end
    gid  =
      case get_guild_id(chid) do
        {:ok, i} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "channel id incorrect"
      end
    with {:ok, name } <- GuildProcess.get_channel(gid, chid, cid) do
      %Channel.Channel{
        name: name,
        guild_id: Integer.to_string(gid),
        channel_id: channel_id
      }
    else
      _ -> raise GRPC.RPCError,
        status: :invalid_argument,
        message: "Invalid username"
    end
  end

  def update_channel(request, _stream) do
    Logger.info("UpdateChannel: #{inspect(request)}")
    %Channel.Channel{}
  end

  def delete_channel(request, _stream) do
    Logger.info("DeleteChannel: #{inspect(request)}")
    %Common.ResponseMessage{text: "not implemented yet"}
  end

  # messages
  def get_messages(%{req: %{caller_id: caller_id, channel_id: channel_id}, offset: offset, count: count}, _stream) do
    Logger.info("GetMessages: #{channel_id}")
    cid =
      case Integer.parse(caller_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "caller_id must be an integer"
      end
    chid =
      case Integer.parse(channel_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "channel_id must be an integer"
      end
    gid  =
      case get_guild_id(chid) do
        {:ok, i} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "channel id incorrect"
      end
   with {:ok, message_dtos } <- GuildProcess.list_messages(gid, cid, chid, count, offset) do
      messages = Enum.map(message_dtos, fn dto ->
        author = if dto.author do
          %GuildUser.GuildUser{
            guild_user_id: to_string(dto.author.guild_user_id || ""),
            nick: dto.author.nick || ""
          }
        else
          nil
        end

        %Dmessage.Message{
          message_id: to_string(dto.message_id),
          author: author,
          content: dto.content || ""
        }
      end)

      %Dmessage.MessageList{messages: messages}
   else
    _ -> raise GRPC.RPCError,
        status: :invalid_argument,
        message: "Invalid something"
   end
  end

  def create_message(%{req: %{caller_id: caller_id, channel_id: channel_id}, message: %{content: content}}, _stream) do
    Logger.info("UpdateMessage: #{channel_id}")
    cid =
      case Integer.parse(caller_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "caller_id must be an integer"
      end
    chid =
      case Integer.parse(channel_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "channel_id must be an integer"
      end
    gid  =
      case get_guild_id(chid) do
        {:ok, i} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "channel id incorrect"
      end
    with {:ok, message_id } <- GuildProcess.send_message(gid, cid, chid, content) do
      %Dmessage.Message{
        message_id: Integer.to_string(message_id),
        content: content,
      }
    else
      _ -> raise GRPC.RPCError,
        status: :invalid_argument,
        message: "Invalid message"
    end
  end

  def delete_message(request, _stream) do
    Logger.info("DeleteMessage: #{inspect(request)}")
    %Common.ResponseMessage{text: "not implemented yet"}
  end

  defp get_guild_id(channel_id) do
    x = DrocsidCore.DB.get_guild_by_channel(channel_id)
    Logger.info("#{inspect(x)}")
    with {:ok, %{ guild_id: guild_id }} <- x do
      {:ok, guild_id}
    else
      _ -> :error
    end
  end
end
