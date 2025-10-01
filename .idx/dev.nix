{ pkgs }: {
  channel = "stable-24.05";

  packages = [
    pkgs.nodejs_20
    pkgs.firebase-tools
    pkgs.zulu
    # Playwright dependencies
    pkgs.at-spi2-atk
    pkgs.cairo
    pkgs.cups
    pkgs.dbus
    pkgs.expat
    pkgs.gdk-pixbuf
    pkgs.glib
    pkgs.gtk3
    pkgs.libGL
    pkgs.libX11
    pkgs.libXScrnSaver
    pkgs.libXcomposite
    pkgs.libXcursor
    pkgs.libXdamage
    pkgs.libXext
    pkgs.libXfixes
    pkgs.libXi
    pkgs.libXrandr
    pkgs.libXrender
    pkgs.libXtst
    pkgs.libdrm
    pkgs.libepoxy
    pkgs.libxkbcommon
    pkgs.mesa
    pkgs.nss
    pkgs.pango
    pkgs.pipewire
    pkgs.udev
    pkgs.alsa-lib
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
