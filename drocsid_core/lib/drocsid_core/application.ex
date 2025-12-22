defmodule DrocsidCore.Application do
  use Application

  @impl true
  def start(_type, _args) do
    port = System.get_env("PORT", "50051") |> String.to_integer()

    children = [
      {
        GRPC.Server.Supervisor,
        endpoint: DrocsidCore.Endpoint,
        port: port,
        start_server: true,
        adapter_opts: [ip: {0, 0, 0, 0}]
      },
      {
        Xandra,
        name: :drocsid_cassandra,
        nodes: ["cassandra:9042"],
        keyspace: "drocsid",
        atom_keys: true
      },
      {
        DrocsidCore.Snowflake,
        worker_id: 1,
        process_id: 1
      },
      {Registry, keys: :unique, name: DrocsidCore.GuildRegistry},
      {DynamicSupervisor, strategy: :one_for_one, name: DrocsidCore.GuildSupervisor}
    ]

    Supervisor.start_link(children, strategy: :one_for_one, name: DrocsidCore.Supervisor)
  end
end
