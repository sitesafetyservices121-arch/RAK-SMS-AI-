{ pkgs }: {
  # Choose which nixpkgs channel to use
  channel = "stable-24.11"; # or "unstable"

  # Packages available in your environment
  packages = [
    pkgs.nodejs_20
    pkgs.zulu
  ];

  # Environment variables
  env = { };

  # Firebase emulators configuration
  services.firebase.emulators = {
    detect = false;        # Disable auto-detection
    projectId = "demo-app";
    services = [ "auth" "firestore" ];
  };

  # IDX configuration
  idx = {
    # Extensions (search for them on https://open-vsx.org/)
    extensions = [
      # "vscodevim.vim"
    ];

    workspace = {
      onCreate = {
        default.openFiles = [
          "src/app/page.tsx"
        ];
      };
    };

    # Enable previews for your dev server
    previews = {
      enable = true;
      previews = {
        web = {
          command = [ "npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0" ];
          manager = "web";
        };
      };
    };
  };
}
