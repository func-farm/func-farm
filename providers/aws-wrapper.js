
let awsWrapper = class AwsWrapper {
    constructor(credentials) {
      console.log("wrapper constructor", credentials);
      var that = this;
      that.aws = credentials;
    }
    getCredentialsFormMarkup(callback) {
        var that = this;

            var form = `
            <div class="aws-form">
                <a href="" id="change-credentials">Please add your credentials</a>
                <form id="credentials-form">
                    <label for="region">Region:</label><br/>
                    <input type="text" name="region" placeholder="Region" value="${that.aws? that.aws.region : ''}"/><br/>
                    <label for="arn">Role Arn:</label><br/>
                    <input type="text" name="arn" placeholder="Role Arn" value="${that.aws? that.aws.arn : ''}"/><br/>
                    <label for="key">Key:</label><br/>
                    <input type="text" name="key" placeholder="Key" value="${that.aws? that.aws.key : ""}"/><br/>
                    <label for="secret">Secret:</label><br/>
                    <input type="password" name="secret" placeholder="Secret" value="${that.aws? that.aws.secret : ""}"/><br/>
                    <input type="submit" id="submit-credentials-form" value="save"/><br/>
                </form>
            </div>
            `;
            if (!that.aws) {
              callback(form, true);
            } else {
              callback(form, false);
            };
    }


    getEnvironments(callback) {
	    //let langsList = ['nodejs8.10', 'java8', 'python2.7', 'python3.6', 'python3.7', 'dotnetcore1.0', 'dotnetcore2.0', 'dotnetcore2.1', 'go1.x', 'ruby2.5']
	    let langsList = ['nodejs8.10', 'python2.7', 'python3.6', 'python3.7', 'go1.x', 'ruby2.5']
	    callback(langsList);
    }

    getHandler(){
        // if required by provider, return handler field else return empty response.
        return `<input type="text" name="handler" id="handler" placeholder="Handler"/>`;
    }

    getFiles(environment) {
        if ( environment.includes("node") ) {

            let packagejson = `
            {
              "name": "rookout-aws-lambda-example",
              "version": "1.0.0",
              "description": "Rookout deployment example for AWS Lambda",
              "main": "index.js",
              "author": "",
              "license": "ISC",
              "repository": "https://github.com/Rookout/deployment-examples",
              "dependencies": {
                "rookout": "^0.1.13"
              }
            }
            `;
            return [ ["main.js", ""], ["package.json", packagejson] ];
        } else if ( environment.includes("python") ) {
            let requirementsTxt = ``
            return [ ["main.py", ""], [ "requirements.txt", "" ] ];
        } else if ( environment.includes("go") ) {
            return [ ["main.go", ""], [ "requirements.txt", "" ] ];
        } else if ( environment.includes("ruby") ) {
            return [ ["main.rb", ""], [ "requirements.txt", "" ] ];
        }
    }

    runFunc(funcName, allCode, callback) {
        var that = this; //for use in callbacks
	
	// Get handler
        var handler = document.getElementById("handler").value;
        console.log("handler", handler);

	// Get selected language
	let lang = document.getElementById("language");
	lang = lang.options[lang.selectedIndex].value;
	console.log("LANG", lang);

        AWS.config.update({ region: this.aws.region, 'accessKeyId': this.aws.key, 'secretAccessKey': this.aws.secret });
        var lambda = new AWS.Lambda({ apiVersion: '2015-03-31' });

        function invoke() {
            lambda.invoke({ FunctionName: funcName }, function (_err, _data) {
                if (_err) {
                    console.log("ERR RUN:", _err);
                } else {
                    console.log("logs", _data);
                    callback(_data.Payload);
                }
            });
        }

        // get all files and zip them
        var JSZip = require("../lib/jszip.min.js");
        var zip = new JSZip();
	      allCode.forEach( (item, index) => {
	          let filename = item[0];
	          let content = item[1];
            zip.file(filename, content, { unixPermissions: "644" })
        });

        zip.generateAsync({ type: "arraybuffer", platform: "UNIX", compression: "DEFLATE", compressionOptions: { level: 9 } })
            .then(function (base) {
                var params = {
                    Code: { /* required */
                        ZipFile: base
                    },
                    FunctionName: funcName, /* required */
                    Handler: handler, /* required */
                    Role: that.aws.arn, /* required */
                    Runtime: lang, /* required */
                    Description: 'Created from FuncFarm'
                };
                //console.log("params", params);

                lambda.createFunction(params, createCallback);

                function createCallback (err, data) {
                    if (err) {
                        console.log("Create code:", err.statusCode); // an error occurred
                        if (err.statusCode == 409) {
                          lambda.updateFunctionCode({ FunctionName: funcName, ZipFile: base }, updateFunctionCodeCallback);
                        } else {
			    console.log("ERRORR", err);
                    	    callback(err);
			}
                    } else {
                        // successful response
                        console.log("created version", data.Version);
                        // Run function
                        invoke();
                    }
                };

                function updateFunctionCodeCallback(err, data) {
                    if (err) {
                        console.log("Update Err:", err);
                    } else {
                        console.log("Code update success", data);
                        // Run function
                        delete params['Code'];
                        lambda.updateFunctionConfiguration(params, updateFunctionConfigCallback);
                    }
                };

                function updateFunctionConfigCallback(err, data) {
                    if (err) {
                        console.log("Update Err:", err);
                    } else {
                        console.log("Update success", data);
                        // Run function
                        invoke();
                    }
                };

            }, function (err) {
                console.log("ERR", err);
            });
    }
}


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = awsWrapper;
}
else {
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return awsWrapper;
        });
    }
    else {
        window.awsWrapper = awsWrapper;
    }
}
