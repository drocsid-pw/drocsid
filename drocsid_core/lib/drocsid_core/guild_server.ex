defmodule DrocsidCore.GuildServer do
  use GRPC.Server, service: Guild.GuildService.Service
  require Logger

  alias DrocsidCore.GuildProcess

  # basic managment
  def create_guild(%{caller_id: caller_id, name: name}, _stream) do
    Logger.info("CreateGuild called: #{name}")
    cid =
      case Integer.parse(caller_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "caller_id must be an integer"
      end
    with {:ok, guild_id} <- internal_create_guild(name, cid),
          {:ok, guild_user_id } <- GuildProcess.add_guild_user(guild_id, cid),
          {:ok, channel_id } <- GuildProcess.add_channel(guild_id, cid, "general") do
      %Guild.Guild{
        name: name,
        owner_id: caller_id,
        guild_id: Integer.to_string(guild_id)
      }
    else
      _ -> raise GRPC.RPCError,
        status: :invalid_argument,
        message: "Invalid username"
    end

  end

  def get_guild(%{guild_id: guild_id, caller_id: caller_id}, _stream) do
    Logger.info("GetGuild called: #{guild_id}")
    cid =
      case Integer.parse(caller_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "caller_id must be an integer"
      end
    gid =
      case Integer.parse(guild_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "guild_id must be an integer"
      end
    %Guild.Guild{}
  end

  def update_guild(request, _stream) do
    Logger.info("UpdateGuild called: #{inspect(request)}")
    %Guild.Guild{}
  end

  def delete_guild(request, _stream) do
    Logger.info("DeleteGuild called: #{inspect(request)}")
    %Common.ResponseMessage{text: "not implemented yet"}
  end

  def get_all_guilds(%{user_id: user_id}, _stream) do
    Logger.info("GetAllGuilds called: #{user_id}")
    uid =
      case Integer.parse(user_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "user_id must be an integer"
      end
    %Guild.GuildList{}
  end

  def get_all_channels(%{guild_id: guild_id, caller_id: caller_id}, _stream) do
    Logger.info("GetAllChannels called: #{guild_id}")
    cid =
      case Integer.parse(caller_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "caller_id must be an integer"
      end
    gid =
      case Integer.parse(guild_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "guild_id must be an integer"
      end
    %Channel.ChannelList{}
  end

  # role managment
  def get_role(request, _stream) do
    Logger.info("GetRole called: #{inspect(request)}")
    %Role.Role{}
  end

  def create_role(request, _stream) do
    Logger.info("CreateRole called: #{inspect(request)}")
    %Role.Role{}
  end

  def get_roles(request, _stream) do
    Logger.info("GetRoles called: #{inspect(request)}")
    %Role.RoleList{}
  end

  def update_role(request, _stream) do
    Logger.info("UpdateRole called: #{inspect(request)}")
    %Role.Role{}
  end

  # channel creation
  def create_channel(%{caller_id: caller_id, name: name, guild_id: guild_id}, _stream) do
    Logger.info("CreateChannel called: #{name}")
    cid =
      case Integer.parse(caller_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "caller_id must be an integer"
      end
    gid =
      case Integer.parse(guild_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "guild_id must be an integer"
      end
    with {:ok, channel_id } <- GuildProcess.add_channel(gid, cid, name) do
      %Channel.Channel{
        name: name,
        channel_id: Integer.to_string(channel_id),
        guild_id: guild_id
      }
    else
      _ -> raise GRPC.RPCError,
        status: :invalid_argument,
        message: "Invalid username"
    end
  end

  # guild user managment
  def add_user(%{caller_id: caller_id, guild_id: guild_id}, _stream) do
    Logger.info("AddUser called: #{guild_id} #{caller_id}")
    cid =
      case Integer.parse(caller_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "caller_id must be an integer"
      end
    gid =
      case Integer.parse(guild_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "guild_id must be an integer"
      end
    with {:ok, guild_user_id } <- GuildProcess.add_guild_user(gid, cid) do
      %GuildUser.GuildUser{
        guild_user_id: Integer.to_string(guild_user_id),
      }
    else
      _ -> raise GRPC.RPCError,
        status: :invalid_argument,
        message: "Invalid username"
    end
  end

  def update_user(request, _stream) do
    Logger.info("UpdateUser called: #{inspect(request)}")
    %GuildUser.GuildUser{}
  end

  def get_user(%{caller_id: caller_id, guild_id: guild_id, guild_user_id: guild_user_id}, _stream) do
    Logger.info("GetUser called: #{guild_id} #{guild_user_id}")
    cid =
      case Integer.parse(caller_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "caller_id must be an integer"
      end
    gid =
      case Integer.parse(guild_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "guild_id must be an integer"
      end
    guid =
      case Integer.parse(guild_user_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "guild_user_id must be an integer"
      end
    %GuildUser.GuildUser{}
  end

  def get_users(%{guild_id: guild_id, caller_id: caller_id}, _stream) do
    Logger.info("GetUsers called: #{guild_id}")
    cid =
      case Integer.parse(caller_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "caller_id must be an integer"
      end
    gid =
      case Integer.parse(guild_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "guild_id must be an integer"
      end
    %GuildUser.GuildUserList{}
  end

  def delete_user(request, _stream) do
    Logger.info("DeleteUser called: #{inspect(request)}")
    %Common.ResponseMessage{text: "not implemented yet"}
  end

  # PRIV

  defp internal_create_guild(name, owner_id) do
    try do
      id = DrocsidCore.DB.insert_guild(owner_id, name)
      {:ok, id}
    rescue
      e ->
        require Logger
        Logger.error("internal_create_guild failed: #{Exception.message(e)}")
        {:error, :db_error}
    end
  end
end
