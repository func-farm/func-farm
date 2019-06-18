let openwhiskWrapper = class OpenwhiskWrapper {
    constructor(credentials) {
      console.log("wrapper constructor", credentials);
      var that = this;
      that.owThat = credentials;
    }
    getCredentialsFormMarkup(callback) {
        var that = this;

            var form = `
            <div class="aws-form">
                <a href="" id="change-credentials">Please add your credentials</a>
                <form id="credentials-form">
                    <label for="endpoint">API Endpoint:</label><br/>
                    <input type="text" name="endpoint" placeholder="http://" value="${that.owThat? that.owThat.endpoint : ''}"/><br/>
                    <label for="key">Key:</label><br/>
                    <input type="text" name="key" placeholder="<uuid>:<secret>" value="${that.owThat? that.owThat.key : ''}"/><br/>
                    <input type="submit" id="submit-credentials-form" value="save"/><br/>
                </form>
            </div>
            `;
            if (!that.owThat) {
              callback(form, true);
            } else {
              callback(form, false);
            };
    }

    getEnvironments(callback) {
	    let langsList = ['nodejs:6', 'nodejs:8', 'python:2', 'python:3', 'go:default', 'ruby:default']
	    callback(langsList);
    }

    getHandler(){
        // if required by provider, return handler field else return empty response.
        return `<input type="text" name="handler" id="handler" placeholder='Handler (default: "main")' disabled="disabled" alt="Coming soon"/>`;
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
              "repository": "https://github.com/Rookout/deployment-examples"
            }
            `;
            return [ ["index.js", ""], ["package.json", packagejson] ];
        } else if ( environment.includes("python") ) {
            let requirementsTxt = ``
            return [ ["__main__.py", ""], [ "requirements.txt", "" ] ];
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

	// Instantiate OpenWhisk
        var openwhisk = require('openwhisk');
	var options = {apihost: this.owThat.endpoint, api_key: this.owThat.key};
	var ow = openwhisk(options);

        function invoke() {
	    let payload = {}; 
	    let blocking = true;
	    let result = false;

	    ow.actions.invoke({name: funcName, blocking: blocking, result: result, payload: payload}).then(result => {
		    console.log("Result", result);
		    callback(formatOutput(result));
	    }).catch(err => {
		    console.log("Invoke Error", err);
		    callback(err);
	    });
        }


	function formatOutput (data) {
	      let outPut = '';
	      outPut += ( 'Name : ' + data.name + '\n')
	
	      outPut += ( 'Logs : ' + JSON.stringify(data.logs) + '\n \n');
	
	      outPut += ( 'Response : \n' );
	      outPut += ( '            Status : ' + data.response.status + '\n');
	      outPut += ( '            Result : ' + JSON.stringify(data.response.result) + '\n');
	      outPut += ( '            Duration : ' + JSON.stringify(data.duration) + '\n \n');
	      outPut += ( 'LastActivationID : ' + data.activationId + '\n \n' );
	
	      return outPut;
	};
	

        // get all files and zip them
        var JSZip = require("../lib/jszip.min.js");
        var zip = new JSZip();
	
	allCode.forEach( (item, index) => {
	          let filename = item[0];
	          let content = item[1];
            zip.file(filename, content, { unixPermissions: "644" })
        });

        zip.generateAsync({ type: "nodebuffer", platform: "UNIX", compression: "DEFLATE", compressionOptions: { level: 9 } })
            .then(function (base) {

		let action = {
			exec: {kind: lang, code: base.toString('base64')}
		};

		ow.actions.create({actionName: funcName, action: action})
		  .then(function createCallback (response) {
                          console.log("Create:", response); 
			  console.log("CREATE DONE");
                          invoke();
			}
                    )
		  .catch(function createError (err) {
                        if (err.statusCode == 409) {
			  console.log("EXISTS", err);
			  console.log("ERR CODE", err.statusCode);
			  updateFunctionCode();
			} else {
			  console.log("ERR", err);
			  console.log("ERR CODE", err.statusCode);
			  callback("Wrong credentials perhaps?\nError:\n" + err);
			}
		  });

		function updateFunctionCode() {
		ow.actions.update({actionName: funcName, action: action})
                .then(function updateFunctionCodeCallback(response) {
			invoke();
		})
		.catch(function updateError (err) {
                        console.log("Update Err:", err);
                });
		}


            }, function (err) {
                console.log("ERR", err);
            });
    }
}


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = openwhiskWrapper;
}
else {
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return openwhiskWrapper;
        });
    }
    else {
        window.openwhiskWrapper = openwhiskWrapper;
    }
}
