const fs = require("fs");
const path = require("path");
const Moment = require("moment");

const Microphone = require("./src/Microphone");
const Drive = require("./src/Drive");

const { Detector } = require("snowboy");
const { Lame } = require("node-lame");

const SNOWBOY_OPTIONS = require("./detection/build_detector_options");
const RECORDING_DIR = "recording";

// MUST SUPPLY YOUR OWN SERVICE ACCOUNT CREDS
const GOOGLE_SERVICE_ACCOUNT_CREDS = {
  client_email: process.env.CLIENT_EMAIL,
  private_key: process.env.PRIVATE_KEY
};

const EMAIL = process.env.DRIVE_SHARE_EMAIL;

// just dbl check that we have our directory
if (!fs.existsSync(RECORDING_DIR)) {
  fs.mkdirSync(RECORDING_DIR);
}

function getDateString() {
  return Moment(new Date()).format("MMMM_Do_YYYY_h:mm_a");
}

function nameTrack() {
  return path.join(RECORDING_DIR, `${getDateString()}.wav`);
}

function cutTrack(filePath) {
  const encodedFilePath = filePath.split(".wav")[0] + ".mp3";
  const encoder = new Lame({
    output: encodedFilePath,
    bitrate: 192
  }).setFile(filePath);

  encoder
    .encode()
    .then(() => {
      const readStream = fs.createReadStream(encodedFilePath);
      const drive = new Drive(GOOGLE_SERVICE_ACCOUNT_CREDS);

      drive.on("ready", () => {
        drive.upload(readStream, encodedFilePath, EMAIL);
      });

      drive.on("complete", () => {
        // upload completed, clean up file
        fs.unlink(filePath);
        fs.unlink(encodedFilePath);
      });
    })
    .catch(error => {
      console.log(error);
      process.exit(500);
    });
}

const mic = new Microphone();
const hotMic = mic.streamOpen();

// state caching
let taping = false;
let tape = null;
let track = null;
let time = null;

const detector = new Detector(SNOWBOY_OPTIONS);
hotMic.stdout.pipe(detector);

let start = () => {
  track = nameTrack();
  tape = fs.createWriteStream(track);
  hotMic.stdout.pipe(tape);
  taping = true;
  setTimer();
};

let setTimer = () => {
  if (time) {
    clearInterval(time);
  }

  time = setInterval(() => {
    // stop recording
    stop();
  }, 300000); // 5 min
};

let stop = () => {
  hotMic.stdout.unpipe(tape);
  cutTrack(track);
  tape = null;
  track = null;
  taping = false;
};

detector.on("hotword", () => {
  if (!taping) {
    start();
  } else {
    stop();
  }
});
