const { EventEmitter } = require("events");
const processSpawn = require("child_process").spawn;

// local state
let activeProcess = null;

const args = [
  // Show no error messages
  "-V0",
  // Show no progress
  "-q",
  // Endian
  // -L = little
  // -B = big
  // -X = swap
  "-L",
  // Sample rate
  "-r",
  "16000",
  // Channels
  "-c",
  "1",
  // Sample encoding
  "-e",
  "signed-integer",
  // Precision in bits
  "-b",
  "16",
  // Audio type
  "-t",
  "wav",
  // Pipe
  "-"
];

const options = {
  encoding: "binary"
};

class Microphone {
  constructor() {
    return this;
  }

  streamOpen() {
    if (activeProcess) {
      this.stop();
    }
    activeProcess = processSpawn("rec", args, options);
    return activeProcess;
  }
  streamUntil(silence) {
    if (activeProcess) {
      this.stop();
    }

    // add silence args
    const argsWithSilence = Array.from(args);
    argsWithSilence.push("silence", "1", "0.1", "0.5%", "1", silence, "0.5%");

    activeProcess = processSpawn("rec", argsWithSilence, options);
    return activeProcess;
  }
  stop() {
    activeProcess.kill();
    activeProcess = null;

    return this;
  }
}

module.exports = Microphone;
