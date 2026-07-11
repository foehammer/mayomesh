# Feeding the Mayo Mesh MQTT Broker

Mayo Mesh runs an MQTT broker at `wss://mqtt.mayomesh.net` that repeater and observer nodes can uplink packet and status data to. This powers tools like live packet analysers and network dashboards, and is separate from the normal mesh traffic — your node keeps relaying LoRa packets as normal, it just *also* publishes what it sees over WiFi.

This page covers how to flash MQTT-capable firmware onto a MeshCore repeater/observer and connect it to the Mayo Mesh broker.

> **This is for repeater/observer nodes only.** Companion firmware (your phone-paired node) doesn't run the MQTT bridge. You'll need a spare LoRa board with WiFi (e.g. Heltec V3/V4) to dedicate to this.

---

## Preloaded images (easiest option)

We publish ready-to-flash images for Heltec V3 and V4 with the Mayo Mesh broker already baked in — Ireland radio settings and the MQTT connection are preconfigured, so you only need to set WiFi credentials and a device name after flashing.

- [Heltec V4 — Mayo Mesh MQTT Observer](firmware/mayomesh-heltec-v4-mqtt-observer.bin)
- [Heltec V3 — Mayo Mesh MQTT Observer](firmware/mayomesh-heltec-v3-mqtt-observer.bin)

What's already set:
- Radio: **EU/UK Narrow** (869.618 MHz / BW62.5 / SF8) — same as the rest of the Mayo Mesh network
- MQTT connection: `wss://mqtt.mayomesh.net:443` (JWT auth, no credentials to enter)

The slot layout differs by board, because **Heltec V3 has no PSRAM and can only run 2 active TLS/WSS MQTT connections at once** (V4 has PSRAM and can run all 6):

| | Slot 1 | Slot 2 | Slot 3 |
|---|---|---|---|
| **V4** | `analyzer-us` (public) | `analyzer-eu` (public) | **`mayomesh`** |
| **V3** | disabled | **`mayomesh`** | disabled |

On V3, both public analyzer presets are disabled by default so mayomesh is guaranteed one of the 2 available slots — otherwise it would land in slot 3 behind the two public presets and silently show as `(inactive)`. Re-enable a public preset on V3 with e.g. `set mqtt1.preset analyzer-eu`, but note doing so may bump mayomesh to inactive since you'd be back at 3 configured slots on a 2-slot board. On V4, tune with `set mqtt1.preset none` / `set mqtt2.preset none` as you like — there's headroom.

### Flash it

Put the board into bootloader mode — hold **BOOT**, press and release **RST**, then release **BOOT** (same as in [Getting Started](getting-started.md)) — then with [esptool](https://github.com/espressif/esptool) installed (`pip install esptool`):

```
esptool.py --chip esp32s3 --port /dev/ttyUSB0 erase_flash
esptool.py --chip esp32s3 --port /dev/ttyUSB0 write_flash 0x0 mayomesh-heltec-v4-mqtt-observer.bin
```

Swap in the V3 filename and your actual serial port (`COMx` on Windows) as needed. Each file is a single **merged** image (bootloader + partition table + app combined), so it flashes in one shot at offset `0x0`.

### First boot — set your device name, Wi-Fi, and admin password

Use the **[Observer Setup tool](wifi-setup.html)** — connect over USB, fill in the fields, click Save. It sends the commands below for you over the browser's Web Serial API (Chrome/Edge only), so there's nothing to type at a terminal.

Prefer to do it by hand? Connect over serial at 115200 baud and run:

```
set name MyObserverNode
set wifi.ssid YourWiFiNetwork
set wifi.pwd YourWiFiPassword
reboot
```

> **Change the default admin password.** These images ship with the fork's default CLI password (`password`) — set your own once connected: `password YourNewPassword` (the setup tool has a field for this too).

Check it connected with `get mqtt.status` — see [Verify the connection](#step-4-verify-the-connection) below for details.

---

## Building it yourself

Want a different board, or to customize the build? The bridge firmware comes from a community fork of MeshCore — [agessaman/MeshCore, `mqtt-bridge-implementation-flex` branch](https://github.com/agessaman/MeshCore/blob/mqtt-bridge-implementation-flex/MQTT_IMPLEMENTATION.md) — and isn't part of the official MeshCore web flasher. It adds up to **6 concurrent MQTT connections ("slots")** per device, so a node can uplink to Mayo Mesh's broker alongside any public MeshCore analyzer services at the same time.

### Step 1: Build and flash the firmware

Since this isn't in the official flasher yet, you'll need [PlatformIO](https://platformio.org/) to build it from source:

```
git clone https://github.com/agessaman/MeshCore.git
cd MeshCore
git checkout mqtt-bridge-implementation-flex
pio run -e heltec_v4_repeater_observer_mqtt -t upload
```

Pick the build target that matches your board:

| Board | Build target |
|---|---|
| Heltec WiFi LoRa 32 V4 | `heltec_v4_repeater_observer_mqtt` |
| Heltec WiFi LoRa 32 V3 | `Heltec_v3_repeater_observer_mqtt` |
| Station G2 | `Station_G2_repeater_observer_mqtt` |
| LilyGo T-Lora V2.1.1.6 | `LilyGo_TLora_V2_1_1_6_repeater_observer_mqtt` |

Once flashed, connect over USB serial (or the MeshCore CLI/web app) to configure it.

---

### Step 2: Basic node setup

Set the radio to the **EU/UK Narrow** preset used across Mayo Mesh (see [Getting Started](getting-started.md)):

```
set radio 869.618,62.5,8,8
```

> Keep transmit power within the Irish ETSI limit for the 869 MHz sub-band — **25 mW / 14 dBm ERP**, adjusted down further if you're running a high-gain antenna.

Give the node an identifiable name and a location code (any 3-letter code that makes sense to you — it's used to namespace this device's MQTT topics, not tied to any specific Mayo Mesh convention):

```
set name MyObserverNode
set mqtt.iata MAY
```

Add your WiFi credentials so the node can reach the broker (no quotes needed, spaces are fine):

```
set wifi.ssid YourWiFiNetwork
set wifi.pwd YourWiFiPassword
```

Reboot and confirm it came up:

```
reboot
get wifi.status
```

---

### Step 3: Point a slot at the Mayo Mesh broker

By default, slots 1 and 2 point at the public `analyzer-us` / `analyzer-eu` presets — you can leave those running or disable them (`set mqtt1.preset none`). Use a free slot (slot 3 in the examples below) for Mayo Mesh:

```
set mqtt3.preset custom
set mqtt3.server wss://mqtt.mayomesh.net:443
set mqtt3.audience mqtt.mayomesh.net
```

> **On non-PSRAM boards (e.g. Heltec V3), only 2 TLS/WSS slots can be active at once.** If you leave both public presets enabled *and* add Mayo Mesh in slot 3, one of the three will silently show as `(inactive)` in `get mqtt.status` — on V3 that'll be slot 3, meaning Mayo Mesh itself. Disable one of the public presets first (`set mqtt1.preset none`) to guarantee Mayo Mesh gets a connection.

This uses JWT (Ed25519) authentication — the same scheme as the public analyzer presets — so there's no username/password to manage. The node signs its own connection using its identity key, keyed to the `audience` you set above.

Topics follow the default MeshCore pattern, so there's no need to set `mqtt3.topic` unless you want a custom layout:

```
meshcore/{iata}/{device_public_key}/status
meshcore/{iata}/{device_public_key}/packets
meshcore/{iata}/{device_public_key}/raw
```

---

### Step 4: Verify the connection

```
get mqtt.status
get mqtt3.diag
```

`get mqtt.status` lists each slot's connection state. If slot 3 isn't connecting, `get mqtt3.diag` reports the last error (TLS handshake, socket, or clock/time issue — MQTT auth depends on the node's clock being correct, so also check `get mqtt.ntp.diag` if you see certificate/time errors).

---

## What gets published

By default, status messages and packet (RX) messages are enabled; raw messages and TX-packet uplink are off. You can tune this per-node:

```
set mqtt.packets on|off      # decoded packet metadata (RSSI, SNR, type, etc.)
set mqtt.raw on|off          # raw packet bytes
set mqtt.rx on|off           # uplink received packets
set mqtt.tx on|off|advert    # uplink transmitted packets (advert = adverts only)
set mqtt.interval <minutes>  # status message interval (default 5)
```

A packet message looks like:

```json
{
  "origin": "MyObserverNode",
  "origin_id": "DEVICE_PUBLIC_KEY",
  "timestamp": "2026-07-11T12:00:00.000000+00:00",
  "type": "PACKET",
  "direction": "rx",
  "SNR": "12.5",
  "RSSI": "-65",
  "packet_type": "4",
  "raw": "F5930103807E5F1E..."
}
```

---

## Notes on hardware

- Boards **with PSRAM** can run all 6 slots at once. Without PSRAM, only 2 TLS/WSS slots can be active simultaneously (each uses ~40 KB of internal heap) — inactive slots show as `(inactive)` in `get mqtt.status`.
- WiFi power saving defaults to `none`; leave it that way for a fixed observer node, since aggressive power saving can cause missed uplinks.

---

## Resources

- [MQTT Implementation doc (agessaman/MeshCore fork)](https://github.com/agessaman/MeshCore/blob/mqtt-bridge-implementation-flex/MQTT_IMPLEMENTATION.md) — full CLI reference and build flags
- [MeshCore GitHub](https://github.com/ripplebiz/MeshCore) — upstream firmware
- [Getting Started with MeshCore](getting-started.md) — base radio configuration for Ireland

> **Note for maintainers:** the built-in `mayomesh` preset used by the preloaded images above is a local patch to `src/helpers/MQTTPresets.h` (adds one entry, mirroring how other community networks like `chimesh`/`bostonmesh`/`nashmesh` are defined) plus two new PlatformIO envs (`heltec_v4_repeater_observer_mqtt_mayomesh`, `Heltec_v3_repeater_observer_mqtt_mayomesh`) — it hasn't been pushed to a public fork yet. If you rebuild from a fresh clone of the upstream branch, use the `custom` broker steps above instead, or re-apply the same patch.
>
> **Rebuilding the preloaded images:** run [`firmware-build/build.sh`](firmware-build/build.sh) from a machine with [PlatformIO](https://platformio.org/) installed. It clones/updates `agessaman/MeshCore` at `mqtt-bridge-implementation-flex` into `firmware-build/MeshCore` (gitignored — it's a build cache, not tracked source), applies [`firmware-build/mayomesh-mqtt-preset.patch`](firmware-build/mayomesh-mqtt-preset.patch), builds both boards, and overwrites the two files in `firmware/` with the fresh output. Run it whenever the upstream branch gets an update worth picking up. If the patch fails to apply (upstream restructured `MQTTPresets.h` or the variant `.ini` files), the script stops and tells you to re-diff manually — regenerate it with `git diff > firmware-build/mayomesh-mqtt-preset.patch` from inside `firmware-build/MeshCore` after re-applying the same three changes by hand.
