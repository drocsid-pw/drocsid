defmodule DrocsidCore.DB do
  @moduledoc false

  @conn :drocsid_cassandra

  defmodule AuthorDTO do
    defstruct [:guild_user_id, :nick]
  end

  defmodule MessageDTO do
    defstruct [:message_id, :content, :author]
  end


  ## ========= GUSERS ==========

  def insert_guild_user(
    guild_id,
    user_id,
    nick
  ) do
    query = """
    INSERT INTO guild_users (guild_user_id, guild_id, user_id, nick)
    VALUES (:guild_user_id, :guild_id, :user_id, :nick)
    """
    prepared = Xandra.prepare!(@conn, query)
    guild_user_id = DrocsidCore.Snowflake.new()

    params = [guild_user_id, guild_id, user_id, nick]

    case Xandra.execute(@conn, prepared, params) do
      {:ok, %Xandra.Void{}} ->
        guild_user_id

      {:error, error} ->
        require Logger
        Logger.error("insert_user failed: #{inspect(error)}")
        {:error, error}
    end
  end

  def get_guild_user(guild_id, user_id) do
    query = """
    SELECT guild_user_id, guild_id, user_id, nick
    FROM guild_users
    WHERE guild_id = ?
      AND guild_user_id = ?
    ALLOW FILTERING
    """

    prepared = Xandra.prepare!(@conn, query)
    params = [guild_id, user_id]

    with {:ok, %Xandra.Page{} = page} <- Xandra.execute(@conn, prepared, params) do
      case Enum.to_list(page) do
        [row] -> {:ok, row}
        [] -> :not_found
      end
    end
  end


  def get_guild_user_by_uid(guild_id, user_id) do
    query = """
    SELECT guild_user_id, guild_id, user_id, nick
    FROM guild_users
    WHERE guild_id = ?
      AND user_id = ?
    ALLOW FILTERING
    """

    prepared = Xandra.prepare!(@conn, query)
    params = [guild_id, user_id]

    with {:ok, %Xandra.Page{} = page} <- Xandra.execute(@conn, prepared, params) do
      case Enum.to_list(page) do
        [row] -> {:ok, row}
        [] -> :not_found
      end
    end
  end

  def get_users_for_guild(guild_id) do
    query = """
    SELECT guild_user_id, guild_id, user_id, nick
    FROM guild_users
    WHERE guild_id = ?
    ALLOW FILTERING
    """

    prepared = Xandra.prepare!(@conn, query)
    params = [guild_id]

    with {:ok, %Xandra.Page{} = page} <- Xandra.execute(@conn, prepared, params) do
      {:ok, Enum.to_list(page)}
    end
  end

  def get_channel(guild_id, channel_id) do
    query = """
    SELECT channel_id, guild_id, name
    FROM channels
    WHERE channel_id = ?
    """

    prepared = Xandra.prepare!(@conn, query)
    params = [channel_id]

    with {:ok, %Xandra.Page{} = page} <- Xandra.execute(@conn, prepared, params) do
      case Enum.to_list(page) do
        [%{guild_id: row_guild_id} = row] when row_guild_id == guild_id ->
          {:ok, row}

        [_row] ->
          :not_found

        [] ->
          :not_found
      end
    end
  end

  def get_channels_for_guild(guild_id) do
    query = """
    SELECT channel_id, guild_id, name
    FROM channels
    WHERE guild_id = ?
    ALLOW FILTERING
    """

    prepared = Xandra.prepare!(@conn, query)
    params = [guild_id]

    with {:ok, %Xandra.Page{} = page} <- Xandra.execute(@conn, prepared, params) do
      {:ok, Enum.to_list(page)}
    end
  end

  ## ========== USERS ==========

  def insert_user(name) do
    query = """
    INSERT INTO users (user_id, email, name)
    VALUES (:user_id, :email, :name)
    """

    id = DrocsidCore.Snowflake.new()

    params = %{
      "user_id" => {"bigint", id},
      "email"   => {"text", ""},
      "name"    => {"text", name}
    }

    case Xandra.execute(@conn, query, params) do
      {:ok, %Xandra.Void{}} ->
        id

      {:error, error} ->
        require Logger
        Logger.error("insert_user failed: #{inspect(error)}")
        {:error, error}
    end
  end


  def get_user(user_id) do
    query = """
    SELECT user_id, email, name
    FROM users
    WHERE user_id = :user_id
    """
    prepared = Xandra.prepare!(@conn, query)
    params = [user_id]

    with {:ok, %Xandra.Page{} = page} <- Xandra.execute(@conn, prepared, params) do
      case Enum.to_list(page) do
        [row] ->
          {:ok, row}

        [] ->
          :not_found
      end
    end
  end

  def get_user_by_username(name) do
    query = """
    SELECT user_id, email, name
    FROM users
    WHERE name = :name
    ALLOW FILTERING
    """
    prepared = Xandra.prepare!(@conn, query)

    params = [name]

    with {:ok, %Xandra.Page{} = page} <- Xandra.execute(@conn, prepared, params) do
      case Enum.to_list(page) do
        [row] ->
          {:ok, row}

        [] ->
          :not_found
      end
    end
  end

  ## ========== GUILDS ==========

  def insert_guild(owner_id, name) do
    query = """
    INSERT INTO guilds (guild_id, owner_id, name)
    VALUES (:guild_id, :owner_id, :name)
    """
    id = DrocsidCore.Snowflake.new()
    prepared = Xandra.prepare!(@conn, query)
    params = [id, owner_id, name]

    case Xandra.execute(@conn, prepared, params) do
      {:ok, %Xandra.Void{}} ->
        id

      {:error, error} ->
        require Logger
        Logger.error("insert_guild failed: #{inspect(error)}")
        {:error, error}
    end
  end

  def get_guild(guild_id) do
    query = """
    SELECT guild_id, owner_id, name
    FROM guilds
    WHERE guild_id = :guild_id
    """
    prepared = Xandra.prepare!(@conn, query)
    params = [guild_id]

    with {:ok, %Xandra.Page{} = page} <- Xandra.execute(@conn, prepared, params) do
      case Enum.to_list(page) do
        [row] -> {:ok, row}
        [] -> :not_found
      end
    end
  end

  def get_guild_ids_for_user(user_id) do
    query = """
    SELECT guild_id
    FROM guild_users
    WHERE user_id = ?
    ALLOW FILTERING
    """

    prepared = Xandra.prepare!(@conn, query)
    params = [user_id]

    with {:ok, %Xandra.Page{} = page} <- Xandra.execute(@conn, prepared, params) do
      rows = Enum.to_list(page)
      guild_ids = Enum.map(rows, & &1.guild_id)
      {:ok, guild_ids}
    end
  end

  ## ========== CHANNELS ==========

  def insert_channel(guild_id, name) do
    query = """
    INSERT INTO channels (channel_id, guild_id, name)
    VALUES (:channel_id, :guild_id, :name)
    """
    prepared = Xandra.prepare!(@conn, query)
    id = DrocsidCore.Snowflake.new()
    params = [id, guild_id, name]

   case Xandra.execute(@conn, prepared, params) do
      {:ok, %Xandra.Void{}} ->
        id

      {:error, error} ->
        require Logger
        Logger.error("insert_channel failed: #{inspect(error)}")
        {:error, error}
    end
  end

  ## ========== MESSAGES ==========

  def insert_message(
        channel_id,
        guild_id,
        author_id,
        content
      ) do
    query = """
    INSERT INTO messages (
      channel_id, bucket, message_id, guild_id, author_id, content
    ) VALUES (
      :channel_id, :bucket, :message_id, :guild_id, :author_id, :content
    )
    """
    prepared = Xandra.prepare!(@conn, query)
    id = DrocsidCore.Snowflake.new()
    params = [
      channel_id,
      0,
      id,
      guild_id,
      author_id,
      content
    ]

    case Xandra.execute(@conn, prepared, params) do
      {:ok, %Xandra.Void{}} ->
        id

      {:error, error} ->
        require Logger
        Logger.error("insert_channel failed: #{inspect(error)}")
        {:error, error}
    end
  end

  def list_messages(channel_id, offset, limit) when offset >= 0 and limit > 0 do
    query = """
    SELECT channel_id, bucket, message_id, guild_id, author_id, content
    FROM messages
    WHERE channel_id = ?
    ORDER BY message_id DESC
    LIMIT ?
    """

    prepared = Xandra.prepare!(@conn, query)

    fetch_size = limit + offset
    params = [channel_id, fetch_size]

    with {:ok, %Xandra.Page{} = page} <- Xandra.execute(@conn, prepared, params) do
      rows =
        page
        |> Enum.to_list()
        |> Enum.drop(offset)

      keys =
        rows
        |> Enum.map(&{&1.guild_id, &1.author_id})
        |> Enum.uniq()

      author_cache =
        Enum.reduce(keys, %{}, fn {guild_id, user_id}, acc ->
          author =
            case get_guild_user_by_uid(guild_id, user_id) do
              {:ok, gu} ->
                %AuthorDTO{guild_user_id: gu.guild_user_id, nick: gu.nick}

              :not_found ->
                %AuthorDTO{guild_user_id: nil, nick: nil}

              {:error, err} ->
                Logger.error(
                  "get_guild_user_by_uid failed for guild_id=#{inspect(guild_id)} user_id=#{inspect(user_id)}: #{inspect(err)}"
                )

                %AuthorDTO{guild_user_id: nil, nick: nil}
            end

          Map.put(acc, {guild_id, user_id}, author)
        end)

      result =
        Enum.map(rows, fn row ->
          %MessageDTO{
            message_id: row.message_id,
            content: row.content,
            author: Map.get(author_cache, {row.guild_id, row.author_id})
          }
        end)

      {:ok, result}
    else
      {:error, error} ->
        Logger.error("list_messages failed: #{inspect(error)}")
        {:error, error}
    end
  end

  def get_guild_by_channel(channel_id) do
    query = """
    SELECT guild_id
    FROM channels
    WHERE channel_id = :channel_id
    """
    prepared = Xandra.prepare!(@conn, query)

    params = [channel_id]

    with {:ok, %Xandra.Page{} = page} <- Xandra.execute(@conn, prepared, params) do
      case Enum.to_list(page) do
        [row] ->
          {:ok, row}

        [] ->
          :not_found
      end
    end
  end

  ## ========== ROLES ==========

  def insert_role(
        guild_id,
        name,
        position,
        read_permission,
        write_perm,
        guild_edit_perm,
        channel_edit_perm,
        user_edit_perm,
        message_del_perm
      ) do
    query = """
    INSERT INTO roles (
      role_id, guild_id, name, position, read_permission, write_perm,
      guild_edit_perm, channel_edit_perm, user_edit_perm, message_del_perm
    ) VALUES (
      :role_id, :guild_id, :name, :position, :read_permission, :write_perm,
      :guild_edit_perm, :channel_edit_perm, :user_edit_perm, :message_del_perm
    )
    """

    prepared = Xandra.prepare!(@conn, query)
    role_id = DrocsidCore.Snowflake.new()

    params = [
      role_id,
      guild_id,
      name,
      position,
      read_permission,
      write_perm,
      guild_edit_perm,
      channel_edit_perm,
      user_edit_perm,
      message_del_perm
    ]

    case Xandra.execute(@conn, prepared, params) do
      {:ok, %Xandra.Void{}} ->
        role_id

      {:error, error} ->
        require Logger
        Logger.error("insert_role failed: #{inspect(error)}")
        {:error, error}
    end
  end

  def get_role(role_id) do
    query = """
    SELECT role_id, guild_id, name, position, read_permission, write_perm,
           guild_edit_perm, channel_edit_perm, user_edit_perm, message_del_perm
    FROM roles
    WHERE role_id = ?
    """

    prepared = Xandra.prepare!(@conn, query)
    params = [role_id]

    with {:ok, %Xandra.Page{} = page} <- Xandra.execute(@conn, prepared, params) do
      case Enum.to_list(page) do
        [row] -> {:ok, row}
        [] -> :not_found
      end
    end
  end

  def get_roles_by_ids(role_ids) when is_list(role_ids) do
    if Enum.empty?(role_ids) do
      {:ok, []}
    else
      placeholders = Enum.map_join(role_ids, ", ", fn _ -> "?" end)
      query = """
      SELECT role_id, guild_id, name, position, read_permission, write_perm,
             guild_edit_perm, channel_edit_perm, user_edit_perm, message_del_perm
      FROM roles
      WHERE role_id IN (#{placeholders})
      """

      prepared = Xandra.prepare!(@conn, query)

      with {:ok, %Xandra.Page{} = page} <- Xandra.execute(@conn, prepared, role_ids) do
        {:ok, Enum.to_list(page)}
      end
    end
  end

  def get_roles_for_guild_user(guild_user_id) do
    query = """
    SELECT guild_user_role_id, guild_user_id, role_id
    FROM guild_user_roles
    WHERE guild_user_id = ?
    ALLOW FILTERING
    """

    prepared = Xandra.prepare!(@conn, query)
    params = [guild_user_id]

    with {:ok, %Xandra.Page{} = page} <- Xandra.execute(@conn, prepared, params) do
      role_ids = Enum.map(Enum.to_list(page), & &1.role_id)
      get_roles_by_ids(role_ids)
    end
  end

  def get_roles_for_guild(guild_id) do
    query = """
    SELECT role_id, guild_id, name, position, read_permission, write_perm,
           guild_edit_perm, channel_edit_perm, user_edit_perm, message_del_perm
    FROM roles
    WHERE guild_id = ?
    ALLOW FILTERING
    """

    prepared = Xandra.prepare!(@conn, query)
    params = [guild_id]

    with {:ok, %Xandra.Page{} = page} <- Xandra.execute(@conn, prepared, params) do
      {:ok, Enum.to_list(page)}
    end
  end

  def insert_guild_user_role(guild_user_id, role_id) do
    query = """
    INSERT INTO guild_user_roles (guild_user_role_id, guild_user_id, role_id)
    VALUES (:guild_user_role_id, :guild_user_id, :role_id)
    """

    prepared = Xandra.prepare!(@conn, query)
    id = DrocsidCore.Snowflake.new()
    params = [id, guild_user_id, role_id]

    case Xandra.execute(@conn, prepared, params) do
      {:ok, %Xandra.Void{}} ->
        id

      {:error, error} ->
        require Logger
        Logger.error("insert_guild_user_role failed: #{inspect(error)}")
        {:error, error}
    end
  end

  def delete_guild_user_role(guild_user_role_id) do
    query = """
    DELETE FROM guild_user_roles
    WHERE guild_user_role_id = ?
    """

    prepared = Xandra.prepare!(@conn, query)
    params = [guild_user_role_id]

    case Xandra.execute(@conn, prepared, params) do
      {:ok, %Xandra.Void{}} ->
        :ok

      {:error, error} ->
        require Logger
        Logger.error("delete_guild_user_role failed: #{inspect(error)}")
        {:error, error}
    end
  end

  ## ========== DELETE OPERATIONS ==========

  def delete_channel(channel_id) do
    query = """
    DELETE FROM channels
    WHERE channel_id = ?
    """

    prepared = Xandra.prepare!(@conn, query)
    params = [channel_id]

    case Xandra.execute(@conn, prepared, params) do
      {:ok, %Xandra.Void{}} ->
        :ok

      {:error, error} ->
        require Logger
        Logger.error("delete_channel failed: #{inspect(error)}")
        {:error, error}
    end
  end

  def delete_guild_user(guild_user_id) do
    query = """
    DELETE FROM guild_users
    WHERE guild_user_id = ?
    """

    prepared = Xandra.prepare!(@conn, query)
    params = [guild_user_id]

    case Xandra.execute(@conn, prepared, params) do
      {:ok, %Xandra.Void{}} ->
        :ok

      {:error, error} ->
        require Logger
        Logger.error("delete_guild_user failed: #{inspect(error)}")
        {:error, error}
    end
  end

  def delete_guild(guild_id) do
    query = """
    DELETE FROM guilds
    WHERE guild_id = ?
    """

    prepared = Xandra.prepare!(@conn, query)
    params = [guild_id]

    case Xandra.execute(@conn, prepared, params) do
      {:ok, %Xandra.Void{}} ->
        :ok

      {:error, error} ->
        require Logger
        Logger.error("delete_guild failed: #{inspect(error)}")
        {:error, error}
    end
  end

  def delete_role(role_id) do
    query = """
    DELETE FROM roles
    WHERE role_id = ?
    """

    prepared = Xandra.prepare!(@conn, query)
    params = [role_id]

    case Xandra.execute(@conn, prepared, params) do
      {:ok, %Xandra.Void{}} ->
        :ok

      {:error, error} ->
        require Logger
        Logger.error("delete_role failed: #{inspect(error)}")
        {:error, error}
    end
  end
end
