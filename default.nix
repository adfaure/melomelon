{ pkgs ? (import <nixpkgs> {}).pkgs }:
{
  shell = pkgs.mkShell {
    buildInputs = [
      pkgs.nodePackages.npm
    ];
  };
}