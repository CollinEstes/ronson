const { google } = require("googleapis");

const { EventEmitter } = require("events");

// local state
let authorizedClient = null;

function addPermissions(fileId, email) {
  console.log("adding permission");
  drive.permissions.create(
    {
      auth: authorizedClient,
      fileId: fileId,
      resource: {
        role: "reader",
        type: "user",
        emailAddress: email
      }
    },
    function(err, response) {
      if (err) {
        console.log(err);
        process.exit(500);
      }
    }
  );
}

class Drive extends EventEmitter {
  constructor(creds) {
    super();

    if (!creds) {
      console.log("YOU MUST SUPPLY GOOGLE SERVICE ACCOUNT CREDITIALS TO DRIVE");
      process.exit(500);
    }

    let jwtClient = new google.auth.JWT(
      creds.client_email,
      null,
      creds.private_key,
      ["https://www.googleapis.com/auth/drive"]
    );

    //authenticate request
    jwtClient.authorize((err, tokens) => {
      if (err) {
        console.log(err);
        process.exit(500); // if we can't auth just kill the process
      }
      console.log("authorized");
      authorizedClient = jwtClient;

      this.emit("ready");
    });

    return this;
  }

  upload(fileStream, file, email) {
    console.log("uploading");
    //Google Drive API
    const drive = google.drive("v3");

    const fileMetadata = {
      name: file.split("/").pop()
    };
    const media = {
      mimeType: "audio/mpeg",
      body: fileStream
    };

    drive.files.create(
      {
        auth: authorizedClient,
        resource: fileMetadata,
        media: media,
        fields: "id"
      },
      (err, response) => {
        if (err) {
          console.log(err);
          process.exit(500);
        }
        this.emit("complete");
        addPermissions(response.data.id, email);
      }
    );
  }
}

module.exports = Drive;
