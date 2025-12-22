defmodule DrocsidCore.DB do
  @moduledoc false

  @conn :drocsid_cassandra


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

  def get_guilds_for_user(user_id) do
    memberships_query = """
    SELECT guild_id, user_id, nick
    FROM guild_users
    WHERE user_id = :user_id
    ALLOW FILTERING
    """

    params = %{user_id: user_id}

    with {:ok, %Xandra.Page{} = page} <- Xandra.execute(@conn, memberships_query, params) do
      memberships = Enum.to_list(page)

      guilds =
        memberships
        |> Enum.map(fn %{guild_id: guild_id, nick: nick} ->
          case get_guild(guild_id) do
            {:ok, guild} ->
              # guild to np. %{guild_id: ..., owner_id: ..., name: ...}
              Map.put(guild, :nick, nick)

            :not_found ->
              nil
          end
        end)
        |> Enum.reject(&is_nil/1)

      {:ok, guilds}
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

  def get_channel(channel_id) do
    query = """
    SELECT channel_id, guild_id, name
    FROM channels
    WHERE channel_id = :channel_id
    """

    params = %{channel_id: channel_id}

    with {:ok, %Xandra.Page{} = page} <- Xandra.execute(@conn, query, params) do
      case Enum.to_list(page) do
        [row] -> {:ok, row}
        [] -> :not_found
      end
    end
  end

  def get_channels_for_guild(guild_id) do
    query = """
    SELECT channel_id, guild_id, name
    FROM channels
    WHERE guild_id = :guild_id
    ALLOW FILTERING
    """

    params = %{guild_id: guild_id}

    with {:ok, %Xandra.Page{} = page} <- Xandra.execute(@conn, query, params) do
      {:ok, Enum.to_list(page)}
    end
  end

  ## ========== MESSAGES ==========

  def insert_message(%{
        channel_id: channel_id,
        guild_id: guild_id,
        author_id: author_id,
        content: content
      }) do
    query = """
    INSERT INTO messages (
      channel_id, bucket, message_id, guild_id, author_id, content
    ) VALUES (
      :channel_id, :bucket, :message_id, :guild_id, :author_id, :content
    )
    """
    id = DrocsidCore.Snowflake.new()
    params = %{
      channel_id: channel_id,
      bucket: 1,
      message_id: id,
      guild_id: guild_id,
      author_id: author_id,
      content: content
    }

    Xandra.execute(@conn, query, params)
  end

  def list_messages(channel_id) do
    query = """
    SELECT channel_id, bucket, message_id, guild_id, author_id, content
    FROM messages
    WHERE channel_id = :channel_id
    """

    params = %{channel_id: channel_id}

    with {:ok, %Xandra.Page{} = page} <- Xandra.execute(@conn, query, params) do
      {:ok, Enum.to_list(page)}
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
end
