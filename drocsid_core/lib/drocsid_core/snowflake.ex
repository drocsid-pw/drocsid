defmodule DrocsidCore.Snowflake do
  use GenServer

  @discord_epoch 1_420_070_400_000 # 2015-01-01T00:00:00Z

  @timestamp_bits 41
  @worker_id_bits 5
  @process_id_bits 5
  @sequence_bits 12

  @max_worker_id Bitwise.<<<(1, @worker_id_bits) - 1
  @max_process_id Bitwise.<<<(1, @process_id_bits) - 1
  @max_sequence Bitwise.<<<(1, @sequence_bits) - 1
  @max_timestamp Bitwise.<<<(1, @timestamp_bits) - 1

  def start_link(opts) do
    name = Keyword.get(opts, :name, __MODULE__)
    GenServer.start_link(__MODULE__, opts, name: name)
  end

  @type t :: non_neg_integer()

  @spec new(server :: GenServer.server()) :: t()
  def new(server \\ __MODULE__) do
    GenServer.call(server, :next)
  end

  ## GenServer callbacks

  @impl true
  def init(opts) do
    worker_id = Keyword.get(opts, :worker_id, 0)
    process_id = Keyword.get(opts, :process_id, 0)

    if worker_id < 0 or worker_id > @max_worker_id do
      raise ArgumentError, "worker_id must be between 0 and #{@max_worker_id}"
    end

    if process_id < 0 or process_id > @max_process_id do
      raise ArgumentError, "process_id must be between 0 and #{@max_process_id}"
    end

    state = %{
      worker_id: worker_id,
      process_id: process_id,
      last_ts: -1,
      sequence: 0
    }

    {:ok, state}
  end

  @impl true
  def handle_call(:next, _from, state) do
    now = timestamp()

    {ts, seq, state} =
      cond do
        # ta sama ms -> zwiększamy sekwencję
        now == state.last_ts and state.sequence < @max_sequence ->
          {now, state.sequence + 1, %{state | sequence: state.sequence + 1}}

        # nowa ms -> sekwencja od zera
        now > state.last_ts ->
          {now, 0, %{state | last_ts: now, sequence: 0}}

        # sekwencja przepełniona w tej samej ms -> czekamy na następną ms
        now == state.last_ts and state.sequence >= @max_sequence ->
          next_ts = wait_next_ms(state.last_ts)
          {next_ts, 0, %{state | last_ts: next_ts, sequence: 0}}

        # zegar się cofnął – traktujemy jak tę samą ms i inkrementujemy sekwencję
        now < state.last_ts ->
          {state.last_ts, state.sequence + 1, %{state | sequence: state.sequence + 1}}
      end

    id = build_id(ts, state.worker_id, state.process_id, seq)
    {:reply, id, state}
  end

  ## Helpers

  defp timestamp do
    System.system_time(:millisecond) - @discord_epoch
  end

  defp wait_next_ms(last_ts) do
    now = timestamp()

    if now <= last_ts do
      Process.sleep(1)
      wait_next_ms(last_ts)
    else
      now
    end
  end

  defp build_id(ts, worker_id, process_id, seq) do
    import Bitwise

    ts = ts &&& @max_timestamp
    worker_id = worker_id &&& @max_worker_id
    process_id = process_id &&& @max_process_id
    seq = seq &&& @max_sequence

    # [timestamp][worker_id][process_id][sequence]
    (ts <<< (@worker_id_bits + @process_id_bits + @sequence_bits)) |||
      (worker_id <<< (@process_id_bits + @sequence_bits)) |||
      (process_id <<< @sequence_bits) |||
      seq
  end

  def from_datetime(%DateTime{} = dt) do
    import Bitwise

    unix_ms = DateTime.to_unix(dt, :millisecond)
    ts = unix_ms - @discord_epoch

    shift = @worker_id_bits + @process_id_bits + @sequence_bits

    # [timestamp][worker_id=0][process_id=0][sequence=0]
    (ts &&& @max_timestamp) <<< shift
  end
end
