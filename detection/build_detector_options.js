const { Models } = require("snowboy");
const VOICE_MODELS = [
  {
    file: "/opt/app/detection/ronson.pmdl",
    hotwords: "ronson",
    sensitivity: "0.5"
  }
];

// detector opts
let models = new Models();

// adds all the models from the manifest to the snowboy Models collection
VOICE_MODELS.forEach(_ => models.add(_));

const opts = {
  resource: "/opt/app/node_modules/snowboy/resources/common.res",
  models
};

module.exports = opts;
