
let azureWrapper = class AzureWrapper {

    constructor() {

    }

    getCredentialsFormMarkup(salt, callback) {
        var form = "<h3>Azure form</h3>";
        callback(form);
    }

    saveCredentialsFormData(formData, salt) {

    }

    runFunc(funcName, handler, allCode, callback) {

    }
}
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = azureWrapper;
}
else {
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return azureWrapper;
        });
    }
    else {
        window.azureWrapper = azureWrapper;
    }
}
