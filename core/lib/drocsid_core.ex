defmodule DrocsidCore do
  @moduledoc """
  Public core API
  """

  alias DrocsidCore.ServerRouter

  @type user_id :: term()
  @type command :: String.t()
  @type data :: map()
  @type result :: {:ok, any()} | {:error, term()}

  @spec handle_command(user_id(), command(), data()) :: result()
  def handle_command(user_id, command, data)

  def handle_command(user_id, "create_server", %{"server_id" => server_id} = _data) do
    ServerRouter.start_server(server_id, owner_id: user_id)
  end

  def handle_command(_user_id, "delete_server", %{"server_id" => server_id}) do
    ServerRouter.stop_server(server_id)
  end

  def handle_command(user_id, command, %{"server_id" => server_id} = data) do
    ServerRouter.route_to_server(user_id, server_id, {command, data})
  end

  def handle_command(_user_id, _command, _data) do
    {:error, :unknown_command}
  end
end
