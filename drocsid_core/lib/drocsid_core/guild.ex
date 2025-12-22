defmodule DrocsidCore.GuildProcess do
  use GenServer

  alias DrocsidCore.DB

  ## ========== PUBLIC API ==========

  def call(guild_id, request) do
    ensure_started(guild_id)
    GenServer.call(via(guild_id), request)
  end

  def get_channels(guild_id, caller_id) do
    call(guild_id, :get_channels)
  end

  def add_channel(guild_id, caller_id, name) do
    call(guild_id, {:add_channel, caller_id, name})
  end

  def add_guild_user(guild_id, caller_id) do
    call(guild_id, {:add_guild_user, caller_id})
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
  def handle_call(:get_channels, _from, %{guild_id: guild_id} = state) do
    reply = DB.get_channels_for_guild(guild_id)
    {:reply, reply, state}
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

  def handle_call({:list_messages, channel_id, opts}, _from, %{guild_id: _guild_id} = state) do
    # guild_id masz w state, ale do zapytania wystarczy channel_id/bucket
    reply = DB.list_messages(channel_id, opts)
    {:reply, reply, state}
  end

  # fallback, gdybyś dodał inne typy wiadomości
  def handle_call(other, _from, state) do
    {:reply, {:error, {:unknown_request, other}}, state}
  end
end
