defmodule DrocsidCore.ServerRouter do
  @moduledoc """
  Command router
  """

  alias DrocsidCore.ServerProcess

  @type server_id :: term()
  @type user_id :: term()
  @type payload :: term()

  @spec start_server(server_id(), keyword()) :: DynamicSupervisor.on_start_child()
  def start_server(server_id, _opts \\ []) do
    DynamicSupervisor.start_child(
      DrocsidCore.ServerSupervisor,
      {ServerProcess, server_id}
    )
  end

  @spec stop_server(server_id()) :: :ok | {:error, :not_found}
  def stop_server(server_id) do
    case Registry.lookup(DrocsidCore.ServerRegistry, server_id) do
      [{pid, _}] ->
        GenServer.stop(pid, :normal)
        :ok

      [] ->
        {:error, :not_found}
    end
  end

  @spec route_to_server(user_id(), server_id(), payload()) ::
          {:ok, any()} | {:error, term()}
  def route_to_server(user_id, server_id, payload) do
    case Registry.lookup(DrocsidCore.ServerRegistry, server_id) do
      [{pid, _}] ->
        GenServer.call(pid, {:user_command, user_id, payload})

      [] ->
        {:error, :server_not_found}
    end
  end
end
