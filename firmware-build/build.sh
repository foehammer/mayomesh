#!/usr/bin/env bash
# Rebuilds the preloaded Mayo Mesh MQTT observer images (Heltec V3 + V4).
#
# What it does:
#   1. Clones (or updates) agessaman/MeshCore at mqtt-bridge-implementation-flex
#      into ./MeshCore (gitignored — this is a build cache, not source we own).
#   2. Applies mayomesh-mqtt-preset.patch, which adds a "mayomesh" MQTT preset
#      to src/helpers/MQTTPresets.h and two PlatformIO envs
#      (heltec_v4_repeater_observer_mqtt_mayomesh, Heltec_v3_repeater_observer_mqtt_mayomesh)
#      that default MQTT slot 3 to it. Not upstream — see mqtt.md's maintainer note.
#   3. Builds both envs and merges bootloader+partitions+app into a single
#      flashable .bin per board (PlatformIO's custom "mergebin" target).
#   4. Copies the merged images into ../firmware/, overwriting the published ones.
#
# Requirements: git, PlatformIO (`pio`). Run from anywhere; paths are script-relative.
#
# Usage:
#   ./build.sh              # update to latest upstream branch, patch, build
#   ./build.sh --no-update  # reuse the existing MeshCore checkout as-is (faster iteration)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$SCRIPT_DIR/MeshCore"
PATCH_FILE="$SCRIPT_DIR/mayomesh-mqtt-preset.patch"
FIRMWARE_DIR="$SCRIPT_DIR/../firmware"
UPSTREAM_URL="https://github.com/agessaman/MeshCore.git"
UPSTREAM_BRANCH="mqtt-bridge-implementation-flex"

UPDATE=1
if [[ "${1:-}" == "--no-update" ]]; then
  UPDATE=0
fi

command -v pio >/dev/null || { echo "error: PlatformIO ('pio') not found on PATH" >&2; exit 1; }
command -v git >/dev/null || { echo "error: git not found on PATH" >&2; exit 1; }

if [[ ! -d "$REPO_DIR" ]]; then
  echo "==> Cloning $UPSTREAM_URL ($UPSTREAM_BRANCH)"
  git clone --branch "$UPSTREAM_BRANCH" --depth 1 "$UPSTREAM_URL" "$REPO_DIR"
elif [[ "$UPDATE" -eq 1 ]]; then
  echo "==> Updating existing checkout to latest $UPSTREAM_BRANCH"
  git -C "$REPO_DIR" fetch --depth 1 origin "$UPSTREAM_BRANCH"
  git -C "$REPO_DIR" checkout "$UPSTREAM_BRANCH"
  git -C "$REPO_DIR" reset --hard "origin/$UPSTREAM_BRANCH"
  git -C "$REPO_DIR" clean -fdx --exclude=.pio
else
  echo "==> Reusing existing checkout as-is (--no-update)"
fi

echo "==> Applying mayomesh-mqtt-preset.patch"
if ! git -C "$REPO_DIR" apply --check "$PATCH_FILE" 2>/dev/null; then
  echo "error: patch no longer applies cleanly — upstream likely changed the files it touches." >&2
  echo "       Re-diff manually: cd $REPO_DIR, re-add the mayomesh preset + envs, then:" >&2
  echo "       git diff > $PATCH_FILE" >&2
  exit 1
fi
git -C "$REPO_DIR" apply "$PATCH_FILE"

mkdir -p "$FIRMWARE_DIR"

build_and_copy() {
  local env="$1" out_name="$2"
  echo "==> Building $env"
  (cd "$REPO_DIR" && pio run -e "$env" -t mergebin)
  local merged="$REPO_DIR/.pio/build/$env/firmware-merged.bin"
  [[ -f "$merged" ]] || { echo "error: expected output not found: $merged" >&2; exit 1; }
  cp "$merged" "$FIRMWARE_DIR/$out_name"
  echo "    -> $FIRMWARE_DIR/$out_name ($(du -h "$FIRMWARE_DIR/$out_name" | cut -f1))"
}

build_and_copy heltec_v4_repeater_observer_mqtt_mayomesh mayomesh-heltec-v4-mqtt-observer.bin
build_and_copy Heltec_v3_repeater_observer_mqtt_mayomesh mayomesh-heltec-v3-mqtt-observer.bin

echo "==> Done. Review the diff in ../firmware/ and commit when ready."
