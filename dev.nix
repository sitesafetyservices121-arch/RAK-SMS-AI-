{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  packages = [
    pkgs.nodejs
    pkgs.firebase-tools
    pkgs.python311
    pkgs.python311Packages.pip

    # Use a fresh OpenAI SDK (≥1.x)
    (pkgs.python311Packages.buildPythonPackage rec {
      pname = "openai";
      version = "1.50.0";
      src = pkgs.fetchPypi {
        inherit pname version;
        sha256 = "sha256-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa=";
      };
    })
  ];
}

