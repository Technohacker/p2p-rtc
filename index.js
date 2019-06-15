class RTCUtil {
  constructor() {
    this.config = {
      iceServers: [
        {urls: "stun:stun.1.google.com:19302"},
        {
          urls: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com'
        }
      ]
    };
    this.peerConnection = new RTCPeerConnection(this.config);
    this.dataChannel = this.peerConnection.createDataChannel("chat", {
      negotiated: true,
      id: 0
    });

    // dc.onopen = () => chat.select();
    // dc.onmessage = e => log(`> ${e.data}`);
    //   dc.send(chat.value);
    this.peerConnection.oniceconnectionstatechange = e => {
      console.log(this.peerConnection.iceConnectionState);
      if (this.peerConnection.iceConnectionState === "connected") {
        document.querySelector(".sidebar").style.display = "none";
        document.querySelector(".main").style.display = "block";
      } else if (this.peerConnection.iceConnectionState === "disconnected") {
        document.querySelector("#remote").stop();
      }
    };
    this.peerConnection.ontrack = e => {
      document.querySelector("#remote").srcObject = e.streams[0];
      document.querySelector("#remote").play();
    }
  }

  async createOffer() {
    await this.peerConnection.setLocalDescription(await this.peerConnection.createOffer());
    return await new Promise((resolve) => {
      this.peerConnection.onicecandidate = ({candidate}) => {
        if (candidate) return;
        resolve(this.peerConnection.localDescription.sdp);
      };
    });
  }

  async createAnswer(offer) {
    await this.peerConnection.setRemoteDescription({type: "offer", sdp: offer});
    await this.peerConnection.setLocalDescription(await this.peerConnection.createAnswer());
    return await new Promise((resolve) => {
      this.peerConnection.onicecandidate = ({candidate}) => {
        if (candidate) return;
        resolve(this.peerConnection.localDescription.sdp);
      };
    });
  }

  async enterAnswer(answer) {
    this.peerConnection.setRemoteDescription({type: "answer", sdp: answer});
  }

  async addStream(stream) {
    stream.getTracks().forEach(track => this.peerConnection.addTrack(track, stream));
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  let rtc = new RTCUtil();
  let offerWrap = document.getElementById("offer");
  let answerWrap = document.getElementById("answer");

  // let {encode, decode} = Zany(Zany.block.EMOTICONS);
  let {encode, decode} = {
    encode(e, t) { return SDPMin.reduce(e); },
    decode(e, t) { return SDPMin.expand(e); }
  };

  try {
    document.querySelector("#start-call").addEventListener("click", async e => {
      let offer = await rtc.createOffer();

      console.log(offer);

      offerWrap.querySelector("textarea").value = encode(offer, "offer");
      offerWrap.querySelector("textarea").select();

      offerWrap.querySelector("label").innerText = "Send this offer to your peer";
      answerWrap.querySelector("label").innerText = "Paste answer from your peer";

      M.updateTextFields();
      M.textareaAutoResize(offerWrap.querySelector("textarea"));

      offerWrap.style.display = "block";
      answerWrap.style.display = "block";
      answerWrap.querySelector("button").style.display = "block";
    });

    document.querySelector("#join-call").addEventListener("click", async e => {
      offerWrap.querySelector("label").innerText = "Paste offer from your peer";
      answerWrap.querySelector("label").innerText = "Send this answer to your peer";

      offerWrap.style.display = "block";
      answerWrap.style.display = "block";
      offerWrap.querySelector("button").style.display = "block";
    });

    document.querySelector("#enter-offer").addEventListener("click", async e => {
      document.querySelector("#enter-offer").innerText = "Loading";
      let answer = await rtc.createAnswer(decode(offerWrap.querySelector("textarea").value, "offer"));

      console.log(answer);

      answerWrap.querySelector("textarea").value = encode(answer, "answer");
      answerWrap.querySelector("textarea").select();

      M.updateTextFields();
      M.textareaAutoResize(answerWrap.querySelector("textarea"));
    });

    document.querySelector("#enter-answer").addEventListener("click", async e => {
      await rtc.enterAnswer(decode(answerWrap.querySelector("textarea").value, "answer"));
    });

    let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    document.querySelector("#local").srcObject = stream;
    document.querySelector("#local").muted = true;
    document.querySelector("#local").play();
    rtc.addStream(stream);
  } catch (e) {
    console.error(e);
  }
}, false);
