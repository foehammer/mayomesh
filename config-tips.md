# Configuration Tips

Whilst getting a node up and running can be easy, ensuring that your node is performing optimally can be a little more difficult for new comers.

Here's some tips that we've gathered along the way.

## Router/Repeater Mode

You probably don't need to run your node as router. In nearly all cases, the client mode will do just fine.

## Smart Position

If you're using your meshtastic device for tracking an activity or a group of you on an excursion, [smart position](https://meshtastic.org/docs/configuration/radio/position/#smart-broadcast) can be very handy. Once you've travelled a certain distance, your node will send a location message out to the mesh informing everyone of your location.

The downside here is that if you're running a node with a static location, this is just draining battery power and spamming the mesh with needless updates. For static infrastructure nodes, turn this off and rely on regular old location updates.