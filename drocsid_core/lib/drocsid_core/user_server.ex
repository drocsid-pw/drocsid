defmodule DrocsidCore.UserServer do
  use GRPC.Server, service: User.UserService.Service
  require Logger

  def create_user(request, _stream) do
    Logger.info("CreateUser: #{inspect(request)}")
    User.User.new()
  end

  def get_user(request, _stream) do
    Logger.info("GetUser: #{inspect(request)}")
    User.User.new()
  end

  def update_user(request, _stream) do
    Logger.info("UpdateUser: #{inspect(request)}")
    User.User.new()
  end

  def delete_user(request, _stream) do
    Logger.info("DeleteUser: #{inspect(request)}")
    # zakładam, że delete zwraca np. Common.ResponseMessage
    Common.ResponseMessage.new(text: "not implemented yet")
  end
end
