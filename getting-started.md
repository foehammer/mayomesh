# Getting Started with MeshCore in Ireland

MeshCore is an open-source, off-grid mesh radio network built on LoRa technology. It lets you send encrypted messages across kilometres of countryside — no mobile signal, no internet, no subscription. Nodes relay messages through each other, so the more people who join, the further the network reaches.

This guide covers everything you need to get your first MeshCore device up and running in Ireland and connect to the Irish mesh.

---

## What You Need

### Hardware

You need a LoRa radio device compatible with MeshCore firmware. The most widely used and recommended options are:

| Device | Notes | Approx. Price |
|---|---|---|
| **Heltec WiFi LoRa 32 V3** | Best beginner choice. Widely available, easy to flash, built-in display. | €25–35 |
| **Heltec WiFi LoRa 32 V4** | Upgraded V3 with higher RF output. Recommended over V3 for new purchases. | €30–40 |
| **RAK WisBlock 4631** | nRF52840-based. Excellent power efficiency — the best choice for solar or battery-powered permanent installations. | €40–60 |
| **LilyGO T-Deck Plus** | Standalone device with physical keyboard and screen. No phone needed. | €80–110 |

For a first device, the **Heltec V4** is the easiest starting point. If you're planning a fixed repeater running off solar, start with the **RAK4631** instead.

You can source any of these from AliExpress, Mouser, or Amazon. Always buy from a seller that ships with an antenna included, or purchase a 868 MHz antenna separately — **never power the device on without an antenna connected**, as this can permanently damage the LoRa radio chip.

### A Phone or Computer

To interact with your node you'll need:

- **Android or iOS** — the [MeshCore Companion app](https://meshcore.io) connects over Bluetooth
- **Any browser** — the [MeshCore Web App](https://meshcore.liamcottle.net) connects over USB or Bluetooth

Android gives you the most complete experience. iOS works but with some Bluetooth limitations.

---

## Step 1: Flash the Firmware

MeshCore firmware is installed using the browser-based web flasher — no command line required.

1. Open **Chrome or Edge** (other browsers won't work — Web Serial is required)
2. Go to [MeshCore Web Flasher](https://flasher.meshcore.io)
3. Plug your device in via USB using a **data cable** (charge-only cables won't work)
4. Put the device into bootloader/flash mode:
   - **Heltec V3/V4:** Hold the `BOOT` button, press and release `RST`, then release `BOOT`
   - **RAK4631:** Double-tap the reset button — it will appear as a USB drive
5. Select your device from the list and choose **Companion** firmware (this is what you want for your first device)
6. Click **Flash** and wait for it to complete

> **Tip:** If your device isn't recognised on Windows, you may need to install a driver first. Heltec V3 uses the CP210x driver; Heltec V4 uses the CH340 driver. Both are freely available from the manufacturer.

---

## Step 2: Configure for Ireland

This is the most important part. All nodes on the same network must use identical radio settings — if these don't match, devices cannot hear each other.

Ireland uses the **EU/UK Narrow** preset. These are the settings:

| Parameter | Value |
|---|---|
| **Frequency** | 869.618 MHz |
| **Spreading Factor** | SF8 |
| **Bandwidth** | BW62.5 |
| **Coding Rate** | CR8 |
| **Preset name** | EU/UK Narrow |

After flashing, open the [MeshCore Configurator](https://config.meshcore.io/) or the companion app and apply these settings. Most firmware versions let you simply select the **EU/UK Narrow** preset from a dropdown, which sets all parameters automatically.

Also set:
- **Node name** — choose something identifiable (your callsign if you're licensed, or a location-based name)
- **GPS coordinates** — so your node appears correctly on the network map

> **Note on transmit power:** Ireland falls under ETSI EN 300 220. On the 869 MHz sub-band, the maximum allowed ERP is **25 mW (14 dBm)**. Most devices default to a safe level, but check your TX power setting if you're attaching a high-gain antenna, as antenna gain reduces the allowable transmit power accordingly.

---

## Step 3: Connect via the App

Once flashed and configured:

1. Open the **MeshCore Companion app** on your phone (or the web app)
2. Enable Bluetooth on your phone and tap **Scan for devices**
3. Select your node from the list
4. The app will pair and connect

You should now see your node on the app's map view. It may take a few minutes for nearby repeaters to advertise themselves to you.

To actively search for local repeaters, go to **Tools → Discover Nearby Nodes → Discover Repeaters**.

---

## Connecting to the Irish Network

The Mayo Mesh network operates a number of repeater nodes across Connacht, providing coverage across Mayo and linking into the broader Irish mesh.

Active repeater sites include hilltop locations in west Mayo, giving line-of-sight coverage across significant parts of the county. Coverage continues to grow as more nodes come online.

You can see live network activity at:

- 🗺️ **[Live Map](https://meshcore.mayomesh.net)** — real-time node positions, link paths, and signal data
- 📡 **[CoreScope](https://corescope.mayomesh.net)** — live packet analyser showing traffic across the Irish mesh
- 📶 **MQTT feed:** `wss://mqtt.mayomesh.net` — for advanced users and integrations

If you're in Mayo or Connacht and your device is configured correctly, you should be able to reach at least one repeater without needing your own fixed infrastructure.

---

## Node Types Explained

MeshCore uses three distinct roles, each a separate firmware build:

**Companion** — Your personal device. Paired with your phone via Bluetooth. Sends and receives messages. This is what you flash for your first device.

**Repeater** — Extends network coverage by relaying messages between other nodes. Typically deployed at height (hilltop, rooftop) and left running unattended. Does not need a phone attached.

**Room Server** — Stores and forwards group messages. Members who were offline catch up on messages when they reconnect. Usually run alongside a repeater.

Start with Companion firmware. Once you're comfortable with the network, setting up a Repeater at a good location is the single biggest contribution you can make to expanding Irish coverage.

---

## Troubleshooting

**My device isn't detected by the flasher**
Check you're using Chrome or Edge (not Firefox or Safari), that it's a data cable not a charge-only cable, and that the device is correctly in bootloader mode. On Windows, confirm the correct driver is installed.

**I can't hear any repeaters**
Verify your frequency and radio settings match the EU/UK Narrow preset exactly. A mismatch of even one parameter means you'll hear nothing. Also check your antenna is properly connected and is rated for 868 MHz.

**My node appears on the map in the wrong location**
Set your GPS coordinates manually in the configurator — a Companion node without GPS hardware needs its location set statically.

**I'm getting poor range**
Antenna quality and height matter far more than transmit power. Moving a device from ground level to a first-floor window can double effective range. A proper 868 MHz dipole or collinear will outperform the small stub antenna that ships with most devices.

---

## Getting Help

- **[MeshCore Discord](https://discord.gg/uQRUHbWTAy)** — the main community hub
- **[MeshCore Documentation](https://docs.meshcore.io/)** — official firmware and app docs
- **[Live Map](https://meshcore.mayomesh.net)** — check who's active near you before reaching out

If you're building infrastructure in Mayo or Connacht, get in touch — coordination on repeater placement makes a big difference to overall coverage.
