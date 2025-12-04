defmodule DrocsidCore.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      {Registry, keys: :unique, name: DrocsidCore.ServerRegistry},
      {DynamicSupervisor, strategy: :one_for_one, name: DrocsidCore.ServerSupervisor}
    ]

    opts = [strategy: :one_for_one, name: DrocsidCore.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
