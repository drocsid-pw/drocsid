defmodule DrocsidCoreTest do
  use ExUnit.Case
  doctest DrocsidCore

  test "greets the world" do
    assert DrocsidCore.hello() == :world
  end
end
