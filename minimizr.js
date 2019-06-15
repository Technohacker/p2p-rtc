let map = {
  "a=end-of-candidates": "ae",
  "a=candidate": "ac",
  "a=sendrecv": "as",
  "a=rtcp-fb": "arf",
  "a=extmap": "ax",
  "a=rtpmap": "ap",
  "a=group": "ag",
  "a=msid": "am",
  "a=fmtp": "at",
  "a=rtcp": "ar",
  "a=ice": "ai"
};

let short = {
  UDP: "<",
  TCP: ">",
  BUNDLE: "!",

};

let rev = Object.keys(map).reduce(function(acc, k) {
  acc[map[k]] = k;
  return acc;
}, {});

let revShort = Object.keys(short).reduce(function(acc, k) {
  acc[short[k]] = k;
  return acc;
}, {});

class SDPMin {
  static reduce(sdp) {
    let lines = sdp.split("\r\n");

    // Shortening
    lines = lines.map(line => {
      for (let patt in map) {
        if (map.hasOwnProperty(patt) && line.startsWith(patt)) {
          return line.replace(patt, map[patt]);
        }
      }

      // for (let patt in short) {
      //   if (short.hasOwnProperty(patt) && line.contains(patt)) {
      //     return line.replace(patt, short[patt]);
      //   }
      // }

      if (line.startsWith("a=fingerprint:sha-256")) {
        let fp = line.split(" ")[1].split(":").join("");
        return `af:${fp}`;
      }
      return line;
    });
    return lines.join("^");
  }
  static expand(sdp) {
    let lines = sdp.split("^");
    // Shortening
    lines = lines.map(line => {
      for (let patt in rev) {
        if (rev.hasOwnProperty(patt) && line.startsWith(patt)) {
          return line.replace(patt, rev[patt]);
        }
      }
      if (line.startsWith("af")) {
        let fp = line.split(":")[1].match(/.{1,2}/g).join(":");
        return `a=fingerprint:sha-256 ${fp}`;
      }
      return line;
    });
    return lines.join("\r\n");
  }
}
