{ pkgs ? (import <nixpkgs> {}).pkgs }:
{

  sequence-diagram = pkgs.stdenv.mkDerivation rec {
    name = "sequence-diagram";
    src = pkgs.lib.sourceByRegex ./. [
      "^docs"
      "^docs/seq.txt"
    ];
    buildInputs = [ pkgs.plantuml ];
    buildPhase = "(cd docs && plantuml seq.txt)";
    installPhase = ''
      mkdir -p $out
      mv docs/* $out/
    '';
  };

  shell = pkgs.mkShell {
    buildInputs = [
      pkgs.nodePackages.npm
    ];
  };
}