const $ = window.jQuery;
const utils = require("./utils");
const storage = require("./storage");

function getCaptchaResult(raw_image_data, callback) {
  if (!raw_image_data) {
    console.error("Image data undefined!");
    return;
  }

  const rawCreds = getCaptchaCreds();
  if (!rawCreds) {
    return null;
  }
  const creds = rawCreds.split(";");

  const image_data = raw_image_data.replace(/^data:image\/(png|jpg|jpeg|gif);base64,/, "");
  const params = {
    userid: creds[0],
    apikey: creds[1],
    data: image_data,
  };
  const url = "https://api.apitruecaptcha.org/one/gettext";

  fetch(url, {
    method: "post",
    body: JSON.stringify(params),
  })
    .then(response => response.json())
    .then(data => callback(data));
}

function doCaptchaJQ() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = this.naturalWidth;
  canvas.height = this.naturalHeight;

  context.drawImage(this, 0, 0);
  const base64ImageData = canvas.toDataURL("image/png");

  getCaptchaResult(base64ImageData, data => {
    if (!data.result) {
      console.error("Error loading captcha result! Data: ", data);
      return;
    }

    $("#cap").val(data.result);
  });
}

function captchaCredsPrompt() {
  let credsInput = unsafeWindow.prompt(
    "Írd be a truecaptcha.org userid és apikey adataid, pontosvesszővel elválasztva! Ha nem szeretnéd ezt a funkciót használni, hagyd üresen!",
    "userid;apikey"
  );
  if (!credsInput) {
    credsInput = "";
  }

  const creds = credsInput.split(";");
  if (creds.length !== 2 || creds[0] === "userid" || creds[1] === "apikey") {
    credsInput = "";
  }

  storage.set("truecaptcha", utils.getDomain(), credsInput);
}

function getCaptchaCreds() {
  const creds = storage.get("truecaptcha", utils.getDomain());
  if (!creds) {
    captchaCredsPrompt();
  }

  if (creds === "") {
    return null;
  }

  return creds;
}

module.exports = {
  doCaptchaJQ,
  captchaCredsPrompt,
};
