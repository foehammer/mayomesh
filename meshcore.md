# MeshCore

[MeshCore](https://meshcore.io/) is an open-source LoRa mesh networking platform designed with a focus on reliable, structured communication infrastructure. Where Meshtastic targets ease of use for individuals, MeshCore is built around a client/repeater architecture that gives you more control over how messages are routed across a network.

**MeshCore is great for:**
- Building reliable fixed infrastructure (dedicated repeater nodes)
- Scenarios where predictable, low-latency routing matters
- Operators who want more control over network topology
- Running a mix of infrastructure nodes and lightweight client devices
- Longer-term deployments where power efficiency and link reliability are priorities

MeshCore devices are configured using the [MeshCore companion app](https://meshcore.io/) and firmware is available for a range of common LoRa hardware platforms.

---

## How it differs from Meshtastic

| | Meshtastic | MeshCore |
|---|---|---|
| **Architecture** | Flat mesh — all nodes are peers | Client / repeater model |
| **Routing** | Flood-based | More structured, targeted |
| **Focus** | Consumer-friendly, broad community | Infrastructure-oriented, operator control |
| **App ecosystem** | Mature — Android, iOS, desktop | Newer, evolving |
| **Best for** | Casual users, events, hiking | Fixed networks, repeater deployments |

The two platforms use different protocols and are **not directly interoperable**, but they can coexist on the same LoRa frequencies as long as channels are configured to avoid collisions.

---

## Getting started with MeshCore

1. **Check supported hardware**
   - MeshCore runs on many of the same LoRa boards used by Meshtastic (e.g. Heltec, RAK, T-Echo). Check the [MeshCore documentation](https://meshcore.io/) for the current list of supported devices.

2. **Flash the firmware**
   - Download the appropriate MeshCore firmware for your board and flash it using your preferred flashing tool.

3. **Configure your node**
   - Use the MeshCore companion app to set your node's role (client or repeater), frequency, and channel settings.
   - For operation, use the **EU/UK Narrow** preset settings.

4. **Connect to the network**
   - Once configured, your node will begin communicating with any other MeshCore nodes within range.

---

## Resources

- [MeshCore official site](https://meshcore.io/)
- [MeshCore GitHub](https://github.com/ripplebiz/MeshCore)
- [LoRa Project Ireland](https://loraproject.ie)
