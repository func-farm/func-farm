// Interface for provider interaction
var cryptor = require('./providers/cryptor.js')
cryptor = new cryptor();

let Interface = class Interface {
    constructor(provider, callback) {
      var that = this;
      cryptor.decrypt(provider, function (credentials) {
        console.log("inter constructor", credentials);

        switch (provider) {
            case "aws":
                var awsWrapper = require("./providers/aws-wrapper.js");
                that.wrapper = new awsWrapper(credentials);
                break;
            case 'openwhisk':
                var openwhiskWrapper = require("./providers/openwhisk-wrapper");
                that.wrapper = new openwhiskWrapper(credentials);
                break;
            case "gcp":
                var gcpWrapper = require("./providers/gcp-wrapper");
                that.wrapper = new gcpWrapper(credentials);
                break;
            default:
                break;
        }
        console.log("Interface initiated, provider: ", provider);
        callback();
      });
    }

    getCredentialsFormMarkup(callback) {
        return this.wrapper.getCredentialsFormMarkup(callback);
    }

    getEnvironments(callback) {
        return this.wrapper.getEnvironments(callback);
    }

    saveCredentialsFormData(formData, provider, callback) {
        cryptor.encrypt(formData, provider, callback);
    }

    getFiles(environment) {
        return this.wrapper.getFiles(environment);
    }

    runFunc(funcName,allCode,callback) {
        this.wrapper.runFunc(funcName,allCode,callback);
    }

    getHandler(){
        return this.wrapper.getHandler();
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Interface;
}
else {
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return Interface;
        });
    }
    else {
        window.Interface = Interface;
    }
}
