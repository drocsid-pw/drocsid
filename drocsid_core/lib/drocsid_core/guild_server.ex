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
    with {:ok, name, owner_id } <- GuildProcess.get_guild(gid, cid) do
      %Guild.Guild{
        name: name,
        owner_id: Integer.to_string(owner_id),
        guild_id: guild_id
      }
    else
      _ -> raise GRPC.RPCError,
        status: :invalid_argument,
        message: "Invalid username"
    end
  end

  def update_guild(request, _stream) do
    Logger.info("UpdateGuild called: #{inspect(request)}")
    %Guild.Guild{}
  end

  def delete_guild(%{guild_id: guild_id, caller_id: caller_id}, _stream) do
    Logger.info("DeleteGuild called: #{guild_id}")
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
    with :ok <- GuildProcess.delete_guild(gid, cid) do
      %Common.ResponseMessage{text: "Guild deleted successfully"}
    else
      _ -> raise GRPC.RPCError,
        status: :internal,
        message: "Failed to delete guild"
    end
  end

  def get_all_guilds(%{user_id: user_id}, _stream) do
    Logger.info("GetAllGuilds called: #{user_id}")
    uid =
      case Integer.parse(user_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "user_id must be an integer"
      end
    with {:ok, guild_ids} <- DrocsidCore.DB.get_guild_ids_for_user(uid) do
      guilds =
        guild_ids
        |> Enum.map(fn gid ->
          case GuildProcess.get_guild(gid, uid) do
            {:ok, name, owner_id} ->
              %Guild.Guild{
                guild_id: Integer.to_string(gid),
                name: name,
                owner_id: Integer.to_string(owner_id)
              }
          end
        end)
      %Guild.GuildList{guilds: guilds}
    else
      _ -> raise GRPC.RPCError,
        status: :invalid_argument,
        message: "Invalid username"
    end
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
    with {:ok, channels } <- GuildProcess.get_channels(gid, cid) do
      %Channel.ChannelList{
        channels: channels
      }
    else
      _ -> raise GRPC.RPCError,
        status: :invalid_argument,
        message: "Invalid username"
    end
  end

  # role managment
  def get_role(%{guild_id: guild_id, guild_role_id: guild_role_id, caller_id: caller_id}, _stream) do
    Logger.info("GetRole called: #{guild_id} #{guild_role_id}")
    _cid =
      case Integer.parse(caller_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "caller_id must be an integer"
      end
    _gid =
      case Integer.parse(guild_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "guild_id must be an integer"
      end
    rid =
      case Integer.parse(guild_role_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "guild_role_id must be an integer"
      end
    with {:ok, role} <- DrocsidCore.DB.get_role(rid) do
      %Role.Role{
        guild_role_id: guild_role_id,
        role_name: role.name,
        permissions: encode_permissions(role)
      }
    else
      :not_found -> raise GRPC.RPCError, status: :not_found, message: "Role not found"
      _ -> raise GRPC.RPCError, status: :internal, message: "Failed to get role"
    end
  end

  def create_role(%{guild_id: guild_id, caller_id: caller_id, role_name: role_name, permissions: permissions_str}, _stream) do
    Logger.info("CreateRole called: #{guild_id} #{role_name}")
    _cid =
      case Integer.parse(caller_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "caller_id must be an integer"
      end
    permissions = decode_permissions(permissions_str)
    gid =
      case Integer.parse(guild_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "guild_id must be an integer"
      end
    role_id = DrocsidCore.DB.insert_role(
      gid,
      role_name,
      0,
      permissions.read_permission,
      permissions.write_perm,
      permissions.guild_edit_perm,
      permissions.channel_edit_perm,
      permissions.user_edit_perm,
      permissions.message_del_perm
    )
    case role_id do
      {:error, _} -> raise GRPC.RPCError, status: :internal, message: "Failed to create role"
      id ->
        %Role.Role{
          guild_role_id: Integer.to_string(id),
          role_name: role_name,
          permissions: permissions_str
        }
    end
  end

  def get_roles(%{guild_id: guild_id, caller_id: caller_id}, _stream) do
    Logger.info("GetRoles called: #{guild_id}")
    _cid =
      case Integer.parse(caller_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "caller_id must be an integer"
      end
    gid =
      case Integer.parse(guild_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "guild_id must be an integer"
      end
    with {:ok, roles} <- DrocsidCore.DB.get_roles_for_guild(gid) do
      role_list = Enum.map(roles, fn role ->
        %Role.Role{
          guild_role_id: Integer.to_string(role.role_id),
          role_name: role.name,
          permissions: encode_permissions(role)
        }
      end)
      %Role.RoleList{roles: role_list}
    else
      _ -> raise GRPC.RPCError, status: :internal, message: "Failed to get roles"
    end
  end

  def update_role(request, _stream) do
    Logger.info("UpdateRole called: #{inspect(request)}")
    %Role.Role{}
  end

  def delete_role(%{guild_id: guild_id, caller_id: caller_id, guild_role_id: guild_role_id}, _stream) do
    Logger.info("DeleteRole called: #{guild_id} #{guild_role_id}")
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
    rid =
      case Integer.parse(guild_role_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "guild_role_id must be an integer"
      end
    with :ok <- GuildProcess.delete_role(gid, cid, rid) do
      %Common.ResponseMessage{text: "Role deleted successfully"}
    else
      _ -> raise GRPC.RPCError,
        status: :internal,
        message: "Failed to delete role"
    end
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

    Logger.info("raw caller_id=#{inspect(caller_id)} guild_id=#{inspect(guild_id)}")

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

    Logger.info("cid, gid: #{cid} #{gid}")

    case DrocsidCore.DB.get_guild_user_by_uid(gid, cid) do
      {:ok, row} ->
        # already in guild -> return existing membership
        %GuildUser.GuildUser{
          guild_user_id: Integer.to_string(row.guild_user_id)
        }

      :not_found ->
        with {:ok, guild_user_id} <- GuildProcess.add_guild_user(gid, cid) do
          %GuildUser.GuildUser{
            guild_user_id: Integer.to_string(guild_user_id)
          }
        else
          _ ->
            raise GRPC.RPCError,
              status: :internal,
              message: "Failed to add user to guild"
        end

      {:error, err} ->
        Logger.error("get_guild_user_by_uid failed: #{inspect(err)}")

        raise GRPC.RPCError,
          status: :internal,
          message: "Failed to check guild membership"
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
    with {:ok, nick } <- GuildProcess.get_user(gid, guid, cid) do
      %GuildUser.GuildUser{
        nick: nick,
        guild_user_id: guild_user_id
      }
    else
      _ -> raise GRPC.RPCError,
        status: :invalid_argument,
        message: "Invalid username"
    end
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
    with {:ok, users } <- GuildProcess.get_users(gid, cid) do
      %GuildUser.GuildUserList{
        guild_users: users
      }
    else
      _ -> raise GRPC.RPCError,
        status: :invalid_argument,
        message: "Invalid username"
    end
  end

  def delete_user(%{guild_id: guild_id, caller_id: caller_id, guild_user_id: guild_user_id}, _stream) do
    Logger.info("DeleteUser called: #{guild_id} #{guild_user_id}")
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
    with :ok <- GuildProcess.delete_guild_user(gid, cid, guid) do
      %Common.ResponseMessage{text: "User removed from guild successfully"}
    else
      _ -> raise GRPC.RPCError,
        status: :internal,
        message: "Failed to remove user from guild"
    end
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

  defp decode_permissions(permissions_str) when is_binary(permissions_str) do
    # permissions string format: "read,write,guild_edit,channel_edit,user_edit,message_del"
    perms = String.split(permissions_str, ",") |> Enum.map(&String.trim/1)
    %{
      read_permission: "read" in perms,
      write_perm: "write" in perms,
      guild_edit_perm: "guild_edit" in perms,
      channel_edit_perm: "channel_edit" in perms,
      user_edit_perm: "user_edit" in perms,
      message_del_perm: "message_del" in perms
    }
  end

  defp decode_permissions(_), do: %{
    read_permission: false,
    write_perm: false,
    guild_edit_perm: false,
    channel_edit_perm: false,
    user_edit_perm: false,
    message_del_perm: false
  }

  defp encode_permissions(role) do
    perms = []
    perms = if role.read_permission, do: ["read" | perms], else: perms
    perms = if role.write_perm, do: ["write" | perms], else: perms
    perms = if role.guild_edit_perm, do: ["guild_edit" | perms], else: perms
    perms = if role.channel_edit_perm, do: ["channel_edit" | perms], else: perms
    perms = if role.user_edit_perm, do: ["user_edit" | perms], else: perms
    perms = if role.message_del_perm, do: ["message_del" | perms], else: perms
    Enum.join(Enum.reverse(perms), ",")
  end
end
