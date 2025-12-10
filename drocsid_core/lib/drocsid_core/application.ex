defmodule DrocsidCore.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      {GRPC.Server.Supervisor, {DrocsidCore.Endpoint, 50051}}
    ]

    opts = [strategy: :one_for_one, name: DrocsidCore.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
