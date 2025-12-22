defmodule DrocsidCore.UserServer do
  use GRPC.Server, service: User.UserService.Service
  require Logger

  def create_user(%User.CreateUserRequest{name: name}, _stream) do
    Logger.info("CreateUser for username=#{name}")

    with :ok <- verify_username(name),
        {:ok, id} <- save_user(name) do
      %User.User{
        id: Integer.to_string(id),
        name: name
      }
    else
      {:error, :too_short} ->
        raise GRPC.RPCError,
          status: :invalid_argument,
          message: "Username too short"

      {:error, :invalid_chars} ->
        raise GRPC.RPCError,
          status: :invalid_argument,
          message: "Username contains invalid characters"

      {:error, :db_error} ->
        raise GRPC.RPCError,
          status: :internal,
          message: "Could not create user (db error)"

      {:error, reason} ->
        raise GRPC.RPCError,
          status: :internal,
          message: "Unknown error: #{inspect(reason)}"

      :error ->
        raise GRPC.RPCError,
          status: :invalid_argument,
          message: "Invalid username"
    end
  end

  def get_user(%User.UserId{user_id: user_id}, _stream) do
    Logger.info("GetUser: #{user_id}")
    uid =
      case Integer.parse(user_id) do
        {i, ""} -> i
        _ -> raise GRPC.RPCError, status: :invalid_argument, message: "user_id must be an integer"
      end
    with {:ok, %{user_id: user_id, name: name}} <- DrocsidCore.DB.get_user(uid) do
      %User.User{id: Integer.to_string(user_id), name: name}
    else
      {:error, reason} ->
        raise GRPC.RPCError,
          status: :invalid_argument,
          message: reason
      :not_found -> %User.User{}
      other -> raise GRPC.RPCError,
        status: :not_found,
        message: "500"
    end
  end

  def update_user(request, _stream) do
    Logger.info("UpdateUser: #{inspect(request)}")
    %User.User{}
  end

  def delete_user(request, _stream) do
    Logger.info("DeleteUser: #{inspect(request)}")
    %Common.ResponseMessage{text: "not implemented yet"}
  end

  def verify_username(username) do
    len = String.length(username)
    with :ok <- verify_username_len(len),
          :ok <- verify_username_exists(username) do
      :ok
    else
      {:error, reason} -> {:error, reason}
      other -> {:error, other}
    end
  end

  def verify_username_len(l) when l in 1..40, do: :ok

  def verify_username_len(_), do: :error

  def verify_username_exists(username) do
    case DrocsidCore.DB.get_user_by_username(username) do
      :not_found ->
        :ok

      {:ok, _user} ->
        {:error, :username_taken}

      {:error, reason} ->
        {:error, reason}
    end
  end

  def save_user(name) do
  try do
      id = DrocsidCore.DB.insert_user(name)
      {:ok, id}
    rescue
      e ->
        require Logger
        Logger.error("save_user failed: #{Exception.message(e)}")
        {:error, :db_error}
    end
  end
end
