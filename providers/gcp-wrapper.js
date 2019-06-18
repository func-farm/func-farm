
let gcpWrapper = class GcpWrapper {

    constructor() {

    }
    getCredentialsFormMarkup(salt, callback) {
        var form = "<h3>gcp form</h3>";
        callback(form);
    }

    saveCredentialsFormData(formData, salt) {

    }

    runFunc(funcName, handler, allCode, callback) {

    }
}
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = gcpWrapper;
}
else {
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return gcpWrapper;
        });
    }
    else {
        window.gcpWrapper = gcpWrapper;
    }
}
