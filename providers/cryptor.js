
let cryptor = class Cryptor {
    constructor(provider) {
      var data = {};
    }


    encrypt(data, provider, callback){
        let jsonData = JSON.stringify(data);
        let salt = prompt("enter vault password");
        let encData = CryptoJS.AES.encrypt(jsonData, salt).toString();
        // Save encrypted form
        chrome.storage.local.set({ [provider]: encData }, function () {
            console.log("Saved in chrome stroage (cryptor)", encData);
        });
        // Save decrypted cache
        chrome.storage.local.set({ lastUsedCredentials: jsonData }, function () {
          console.log("Caching credentials after encrypt", jsonData);
          callback();
        });

    }

    decrypt(provider, callback){
      let lastUsedProvider = localStorage.getItem("lastUsedProvider");
      console.log("LLAST", lastUsedProvider);

      chrome.storage.local.get(["lastUsedCredentials"], function (cached) {
        if (lastUsedProvider === provider && cached.lastUsedCredentials && Object.keys(cached.lastUsedCredentials).length !== 0) {
          console.log("Cached credentials", cached.lastUsedCredentials);
          callback(JSON.parse(cached.lastUsedCredentials));
        } else {


      chrome.storage.local.get([provider], function (result) {
          let aws = result[provider];
          if (aws) {

            let salt = prompt("enter " + provider + " vault password");
            if (salt !== null) {
              try {
              var jsonData = CryptoJS.AES.decrypt(aws, salt).toString(CryptoJS.enc.Utf8);

                this.data = JSON.parse(jsonData);
              } catch (e) {
                console.log("ERROR", e);
                alert("Wrong vault password.\nRetry or save new credentials.");
                callback();
              }
              console.log("cryptor", this.data);
              chrome.storage.local.set({ lastUsedCredentials: jsonData }, function () {
                console.log("Caching credentials after decrypt");
              });
              callback(this.data);
            };
          } else {
            console.log("No saved credentials");
            callback();
          }
    });
  }
});
}
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = cryptor;
}
else {
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return cryptor;
        });
    }
    else {
        window.cryptor = cryptor;
    }
}
