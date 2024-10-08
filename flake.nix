{
  description = "WebApp";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable"; # ou outra versão
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }: flake-utils.lib.eachDefaultSystem (system: {
    packages.default = with nixpkgs.legacyPackages.${system}; [
      python3
      python3Packages.flask
      python3Packages.sqlalchemy
      python312Packages.flask-sqlalchemy
      python312Packages.werkzeug
      python312Packages.flask-cors
      sqlitebrowser
      kate
      nodejs
    ];

    devShell = with nixpkgs.legacyPackages.${system}; mkShell {
      buildInputs = [
        python3
        python3Packages.flask
        python3Packages.sqlalchemy
        python312Packages.flask-sqlalchemy
        python312Packages.werkzeug
        python312Packages.flask-cors
        sqlitebrowser
        kate
        nodejs
      ];

      shellHook = ''
        echo "dev-shell"
      '';
    };
  });
}
