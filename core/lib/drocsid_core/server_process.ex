defmodule DrocsidCore.ServerProcess do
  @moduledoc """
  GenServer that represents guild
  """

  use GenServer

  @type server_id :: term()

  def start_link(server_id) do
    GenServer.start_link(__MODULE__, server_id, name: via_tuple(server_id))
  end

  def via_tuple(server_id) do
    {:via, Registry, {DrocsidCore.ServerRegistry, server_id}}
  end

  @impl true
  def init(server_id) do
    state = %{
      server_id: server_id,
      meta: %{}
    }

    {:ok, state}
  end

  @impl true
  def handle_call({:user_command, user_id, {command, data}}, _from, state) do
    # Implement routing
    reply = {:ok, %{handled_by: state.server_id, user_id: user_id, command: command, data: data}}
    {:reply, reply, state}
  end

  @impl true
  def handle_cast(_msg, state) do
    {:noreply, state}
  end

  @impl true
  def handle_info(_msg, state) do
    {:noreply, state}
  end
end
