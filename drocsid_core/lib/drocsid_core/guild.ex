defmodule DrocsidCore.GuildProcess do
  use GenServer

  alias DrocsidCore.DB

  ## ========== PUBLIC API ==========

  def call(guild_id, request) do
    ensure_started(guild_id)
    GenServer.call(via(guild_id), request)
  end

  def get_guild(guild_id, caller_id) do
    call(guild_id, {:get_guild, caller_id})
  end

  def get_user(guild_id, user_id, caller_id) do
    call(guild_id, {:get_user, user_id, caller_id})
  end

  def get_users(guild_id, caller_id) do
    call(guild_id, {:get_users, caller_id})
  end

  def get_channel(guild_id, channel_id, caller_id) do
    call(guild_id, {:get_channel, channel_id, caller_id})
  end

  def get_channels(guild_id, caller_id) do
    call(guild_id, {:get_channels, caller_id})
  end

  def add_channel(guild_id, caller_id, name) do
    call(guild_id, {:add_channel, caller_id, name})
  end

  def add_guild_user(guild_id, caller_id) do
    call(guild_id, {:add_guild_user, caller_id})
  end

  def send_message(guild_id, caller_id, channel_id, text) do
    call(guild_id, {:send_message, caller_id, channel_id, text})
  end

  def list_messages(guild_id, channel_id, opts \\ []) do
    call(guild_id, {:list_messages, channel_id, opts})
  end

  ## ========== GenServer start/link ==========

  def start_link(guild_id) do
    GenServer.start_link(__MODULE__, guild_id, name: via(guild_id))
  end

  defp via(guild_id),
    do: {:via, Registry, {DrocsidCore.GuildRegistry, guild_id}}

  defp ensure_started(guild_id) do
    case Registry.lookup(DrocsidCore.GuildRegistry, guild_id) do
      [{pid, _}] when is_pid(pid) ->
        {:ok, pid}

      [] ->
        DynamicSupervisor.start_child(
          DrocsidCore.GuildSupervisor,
          {__MODULE__, guild_id}
        )
    end
  end

  ## ========== GenServer callbacks ==========

  @impl true
  def init(guild_id) do
    state = %{
      guild_id: guild_id
    }

    {:ok, state}
  end

  @impl true
  def handle_call({:get_channels, caller_id}, _from, %{guild_id: guild_id} = state) do
    try do
      {:ok, rows } = DrocsidCore.DB.get_channels_for_guild(guild_id)
      channels =
        rows
        |> Enum.map(fn %{name: name, channel_id: channel_id} ->
          %{
            name: name,
            channel_id: Integer.to_string(channel_id),
            guild_id: Integer.to_string(guild_id)
          }
        end)
      {:reply, {:ok, channels}, state}
    rescue
      e ->
        require Logger
        Logger.error("get_channels failed: #{Exception.message(e)}")
        {:reply, {:error, :db_error}, state}
    end
  end

  def handle_call({:get_channel, channel_id, caller_id}, _from, %{guild_id: guild_id} = state) do
    try do
      {:ok, %{name: name} } = DrocsidCore.DB.get_channel(guild_id, channel_id)
      {:reply, {:ok, name}, state}
    rescue
      e ->
        require Logger
        Logger.error("get_channel failed: #{Exception.message(e)}")
        {:reply, {:error, :db_error}, state}
    end
  end

  def handle_call({:get_users, caller_id}, _from, %{guild_id: guild_id} = state) do
    try do
      {:ok, rows } = DrocsidCore.DB.get_users_for_guild(guild_id)
      users =
        rows
        |> Enum.map(fn %{nick: nick, guild_user_id: guild_user_id} ->
          %{
            nick: nick,
            guild_user_id: Integer.to_string(guild_user_id)
          }
        end)
      {:reply, {:ok, users}, state}
    rescue
      e ->
        require Logger
        Logger.error("get_users failed: #{Exception.message(e)}")
        {:reply, {:error, :db_error}, state}
    end
  end

  def handle_call({:get_user, user_id, caller_id}, _from, %{guild_id: guild_id} = state) do
    try do
      {:ok, %{nick: nick} } = DrocsidCore.DB.get_guild_user(guild_id, user_id)
      {:reply, {:ok, nick}, state}
    rescue
      e ->
        require Logger
        Logger.error("get_user failed: #{Exception.message(e)}")
        {:reply, {:error, :db_error}, state}
    end
  end

  def handle_call({:add_channel, caller_id, name}, _from, %{guild_id: guild_id} = state) do
    try do
      id = DrocsidCore.DB.insert_channel(guild_id, name)
      {:reply, {:ok, id}, state}
    rescue
      e ->
        require Logger
        Logger.error("add_channel failed: #{Exception.message(e)}")
        {:reply, {:error, :db_error}, state}
    end
  end

  def handle_call({:add_guild_user, user_id}, _from, %{guild_id: guild_id} = state) do
    {:ok, %{name: nick}} = DB.get_user(user_id)
    try do
      id = DrocsidCore.DB.insert_guild_user(guild_id, user_id, nick)
      {:reply, {:ok, id}, state}
    rescue
      e ->
        require Logger
        Logger.error("add_guild_user failed: #{Exception.message(e)}")
        {:reply, {:error, :db_error}, state}
    end
  end

  def handle_call({:list_messages, channel_id, opts}, _from, %{guild_id: guild_id} = state) do
    reply = DB.list_messages(channel_id, opts)
    {:reply, reply, state}
  end

  def handle_call({:send_message, channel_id, caller_id, text}, _from, %{guild_id: guild_id} = state) do
    try do
      id = DrocsidCore.DB.insert_message(channel_id, guild_id, caller_id, text)
      {:reply, {:ok, id}, state}
    rescue
      e ->
        require Logger
        Logger.error("send_message failed: #{Exception.message(e)}")
        {:reply, {:error, :db_error}, state}
    end
  end

  def handle_call({:get_guild, caller_id}, _from, %{guild_id: guild_id} = state) do
    try do
      {:ok, %{name: name, owner_id: owner_id}} = DrocsidCore.DB.get_guild(guild_id)
      {:reply, {:ok, name, owner_id}, state}
    rescue
      e ->
        require Logger
        Logger.error("get_guild failed: #{Exception.message(e)}")
        {:reply, {:error, :db_error}, state}
    end
  end

  def handle_call(other, _from, state) do
    {:reply, {:error, {:unknown_request, other}}, state}
  end
end
