#!/bin/bash
# Installs the `lockin` command on macOS.
#   curl -fsSL https://raw.githubusercontent.com/Jakedapro/Lock-in/main/install.sh | bash
set -e
BIN="$HOME/.local/bin"; mkdir -p "$BIN"
curl -fsSL "https://raw.githubusercontent.com/Jakedapro/Lock-in/main/cli/lockin" -o "$BIN/lockin"
chmod +x "$BIN/lockin"
case ":$PATH:" in *":$BIN:"*) ;; *)
  RC="$HOME/.zshrc"; grep -qs '.local/bin' "$RC" || printf '\nexport PATH="$HOME/.local/bin:$PATH"\n' >> "$RC"
  echo "Added $BIN to your PATH in $RC. Open a new terminal tab." ;;
esac
"$BIN/lockin" update
echo "All set. Type: lockin"
