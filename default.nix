{ pkgs ? (import <nixpkgs> { }).pkgs }:
let
  nodeDependencies = (pkgs.callPackage ({ pkgs, system }:
    let nodePackages = import ./release.nix { inherit pkgs system; };
    in nodePackages // {
      shell = nodePackages.shell.override {
        buildInputs = [
          # pkgs.nodePackages.node-gyp-build
        ];
      };
    }) { }).shell.nodeDependencies;
in {
  melomelon = pkgs.stdenv.mkDerivation rec {
    name = "melomelon";
    src = pkgs.lib.sourceByRegex ./. [
      "^src"
      # Chrome manifest
      "^src/manifest.json"
      # Style files
      "^src/css"
      "^src/css/.*.scss"
      # Html
      "^src/html"
      "^src/html/.*.html"
      # Html
      "^src/images"
      "^src/images/.*.png"
      # Javascript
      "^src/js"
      "^src/js/.*.js"
      # Vue templates
      "^src/templates"
      "^src/templates/.*.vue"
      # Webpack config
      "^webpack.config.js"
      "^webpack.prod.js"
      # npm
      "^package.json"
      "^package-lock.json"
    ];
    buildInputs = [ pkgs.nodejs pkgs.nodePackages.npm pkgs.nodePackages.webpack pkgs.nodePackages.webpack-cli ];

    buildPhase = ''
      ln -s ${nodeDependencies}/lib/node_modules ./node_modules

      export PATH="${nodeDependencies}/bin:$PATH"

      # Build the distribution bundle in "dist"
      npx webpack-cli -c webpack.prod.js
    '';

    installPhase = ''
      mkdir -p $out
      mv build/* $out/
    '';
  };

  shell = pkgs.mkShell {
    buildInputs = [ pkgs.nodePackages.npm pkgs.nodePackages.node2nix pkgs.nodePackages.webpack ];
  };
}
