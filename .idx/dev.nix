{ pkgs }: {
  channel = "stable-24.11";

  packages = [
    pkgs.nodejs_20
    pkgs.firebase-tools
    pkgs.zulu
  ];

  env = {
    NODE_ENV = "development";
    FIREBASE_PROJECT = "rak-sms";
  };

  services.firebase.emulators = {
    detect = true;
    projectId = "rak-sms";
    services = ["auth" "firestore" "storage"];
  };

  idx = {
    extensions = [
      "bradlc.vscode-tailwindcss"
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"
    ];
    workspace = {
      onCreate = {
        default.openFiles = [
          "src/app/page.tsx"
        ];
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}
