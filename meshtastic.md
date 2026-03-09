# Meshtastic

[Meshtastic](https://meshtastic.org/) is a free, open-source project that lets you build long-range, off-grid mesh networks using inexpensive LoRa radio devices. Devices relay messages hop-by-hop across the network so you can communicate without any internet connection, phone signal, or central infrastructure.

**Meshtastic is great for:**
- Casual text messaging between friends and family off-grid
- Group hikes, cycling trips, and outdoor events where phone coverage is patchy
- Simple GPS position tracking and sharing
- Getting started quickly — low cost hardware, beginner-friendly apps
- Community mesh networks like Mayo Mesh

The official Meshtastic apps are available for Android, iOS, and desktop, and most devices can be configured in minutes via Bluetooth.

---

## Getting started — connecting a new device

If you've just unboxed your first Meshtastic device, here's how to get connected to the Mayo Mesh **LongFast** preset:

1. **Update the device**
    - Visit [https://flasher.meshtastic.org/](https://flasher.meshtastic.org) for instructions on how to update your device to the latest firmware.

2. **Install the Meshtastic app**
   - Download the official Meshtastic app from the [Google Play Store](https://play.google.com/store/apps/details?id=com.geeksville.mesh&hl=en_IE&pli=1) or [Apple App Store](https://apps.apple.com/in/app/meshtastic/id1586432531), or install the desktop app if preferred.

3. **Power up your device**
   - Connect it via USB to your laptop or charge it if it has a built-in battery. Most devices will power on automatically.

4. **Pair with your device**
   - In the Meshtastic app, search for your device over Bluetooth or USB. Select it to pair.

5. **Apply the LongFast preset**
   - Go to **Settings > Radio**.
   - Select **Region: EU868** (if in Ireland).
   - Under **Channel settings**, choose the **LongFast** preset.
   - Save and sync the configuration.

6. **Test your connection**
   - Send a short text message in the app. If another Mayo Mesh device is nearby, you should see an acknowledgement.

7. **You're on the mesh!**
   - From here, you can experiment, join range tests, or link up with other Mayo Mesh members.

If you get stuck, don't worry — bring your device to a meetup and we'll help you configure it.

---

## Custom Channel for Telemetry

We have some fixed nodes deployed and so that we can monitor signal strength remotely, those fixed nodes are using a non-default primary channel. This means that you might not see these nodes via the default 'LongFast' preset alone. If you want to receive updates from those devices and join the 'MayoMesh' channel, [visit this link](https://meshtastic.org/e/#ChUSAQEaCExvbmdGYXN0KAEwADoCCA0KNBIg9CZ1rVl1dJ86uaPkiodoKPsZEUn3gWn6lPU2jY3rUrYaCE1heW9NZXNoKAEwADoCCA4) or scan this QR code:

![image](mayo-mesh-channel-add.jpeg)

---

## Resources

- [Meshtastic official docs](https://meshtastic.org/docs/getting-started/)
- [Meshtastic hardware devices list](https://meshtastic.org/docs/hardware/devices/)
- [Liam Cottle's Meshtastic Map](https://meshtastic.liamcottle.net/?lat=53.832230300637704&lng=350.7948303222657&zoom=10) — see nearby nodes sharing public data
- [MeshSense by Affirmatech](https://meshsense.affirmatech.com/) — another tool for visualising nearby nodes
