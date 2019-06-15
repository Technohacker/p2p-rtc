# True P2P WebRTC (with manual signaling)

Inspired by [This StackOverflow Answer](https://stackoverflow.com/a/54985729) and [This example](https://sickschool.com/programming/webrtc-datachannel/webrtc-datachannel-with-manual-signaling/).

This is an example of a video chat application with no dependency on an external signaling server (with the exception of a STUN and TURN server). Users have to exchange WebRTC metadata manually to initiate a channel.

## Steps:
0. Grant access to camera and microphone access when requested
1. **[Initiator]** Click on "Start A Call" to initiate a new call
2. **[Initiator]** Copy the printed Offer message and send to your peer
3. **[Receiver]** Press "Join A Call" and paste the offer message in the designated box
4. **[Receiver]** Press "Enter Offer" to generate an answer message. Send the answer message to your peer
5. **[Initiator]** Paste the answer in the designated box and press "Enter Answer"
6. The call should be fully set up now
