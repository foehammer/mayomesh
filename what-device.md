# What device should I get?

Most LoRa mesh hardware is **firmware-agnostic** — the same board can run either [MeshCore](meshcore) or [Meshtastic](meshtastic) depending on what you flash onto it. So rather than choosing a device for a specific protocol, pick the hardware that suits your use case, then choose the firmware that fits your needs.

**MeshCore is the primary protocol used by Mayo Mesh** for its fixed infrastructure. If you're joining the network or setting up a node intended to connect to the group's repeaters, MeshCore is the recommended starting point. Meshtastic remains well-supported and is a great choice for casual, portable, or personal use.

For a comprehensive list of supported hardware, check the documentation for [MeshCore](https://meshcore.co.uk/) and [Meshtastic](https://meshtastic.org/docs/hardware/devices/) respectively — support across both platforms is broadly similar.

---

## Fixed Nodes

For a permanent or semi-permanent installation, you'll want something with good power flexibility and reasonable range.

The **[Heltec WiFi LoRa 32 v3](https://heltec.org/project/wifi-lora-32-v3/)** is compact and straightforward to get running quickly. It supports both Bluetooth and WiFi connectivity, making it easy to configure and monitor. The main trade-off is its ESP32 chipset, which draws more power than NRF-based alternatives — less ideal for solar or battery-only deployments.

The **[RAK WisBlock Starter Kit](https://store.rakwireless.com/products/wisblock-meshtastic-starter-kit)** is a strong choice if power efficiency matters. Built around a Nordic NRF52 core, it supports battery, solar, and USB-C input, and can accommodate a wide range of sensor add-ons. A good platform for experimentation and longer-term deployments.

The **[Seeed SenseCAP Solar Node P1](https://www.seeedstudio.com/SenseCAP-Solar-Node-P1-for-Meshtastic-LoRa-p-6425.html)** is purpose-built for fixed solar-powered installations. It includes a 5W solar panel, an NRF52840 chipset with very low idle draw, and an RP-SMA antenna connector for an external aerial. A P1-Pro variant includes four 18650 batteries and optional GPS. Both versions support Meshtastic and MeshCore firmware and are a natural fit for an always-on repeater or infrastructure node.

---

## Portable Nodes

For use on the move, smaller and more rugged options work well.

The **[Seeed Studio SenseCAP T1000-E](https://www.seeedstudio.com/SenseCAP-Card-Tracker-T1000-E-for-Meshtastic-p-5913.html)** is a compact card-sized tracker with an IP65 rating and built-in GPS. It clips to a belt or backpack easily and offers roughly two days of battery life under typical use.

The **[RAK WisMesh Tag](https://store.rakwireless.com/products/wismesh-tag)** is a similar form factor from RAK — lightweight and portable, running on the same NRF52-based platform as the rest of the WisBlock range.

The **[Seeed Studio Wio Tracker L1 Pro](https://www.seeedstudio.com/Wio-Tracker-L1-Pro-p-6454.html)** is a well-rounded portable option — NRF52840-based, with built-in GPS, a small OLED display, a 2000mAh battery (up to ~5 days), and solar input support. It's available pre-flashed for either Meshtastic or MeshCore, making it one of the more straightforward out-of-the-box choices for either protocol.

For something with a more capable antenna, the **[Muzi Works H2T](https://muzi.works/products/h2t-complete-device-heltec-t114-with-gps-running-meshtastic)** (based on the Heltec T114 module) is a popular option where range is a priority.

---

These are devices we have direct experience with — do your own research and pick whatever suits your use case and budget. When in doubt, bring questions to a meetup and we can help you decide.
