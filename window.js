var ace = require('brace');
var Interface = require("./interface.js");
require('brace/mode/javascript');
require('brace/mode/python');
require('brace/mode/json');
require('brace/theme/monokai');

var inter;
//var salt = "defaultSalt";
var currentFilename = "0";
var currentProvider = "aws";
var currentEnvironment = "node";
//var allowedExtensions = {
//    node: ["js", "json"],
//    python: ["py", "json"],
//}

var allCode = {};
window.editor = ace.edit('editor');
editor.getSession().setMode('ace/mode/javascript');
editor.setTheme('ace/theme/monokai');
editor.$blockScrolling = Infinity;

//check if
//editor.getSession().on('change', function() {
//console.log("KEEP", window.editor.getValue());
//});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // Set random function name
        var generate = require('project-name-generator');
        document.getElementById('funcName').value = "ff-" + generate().dashed;
        // Set editor content
        editor.setValue(request.code);
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.greeting == "hello")
            sendResponse({ farewell: "goodbye" });
    });



//listen to radio button changes
document.addEventListener('DOMContentLoaded', function () {
    var radioButtons = document.getElementsByClassName('provider');
    for (var i = 0; i < radioButtons.length; i++) {
        radioButtons[i].addEventListener('click', changeProvider, false);
    }


});

/*function changeEnvironment() {
    saveCurrentCode();
    currentEnvironment = document.querySelector('input[name=language]:checked').value
    if (allCode["main.js"] != undefined && allCode["package.json"] != undefined) {
        console.log("changing main.js");
        Object.defineProperty(allCode, "main.py",
            Object.getOwnPropertyDescriptor(allCode, "main.js"));
        delete allCode["main.js"];

        console.log("changing package.json");
        Object.defineProperty(allCode, "requirements.txt",
            Object.getOwnPropertyDescriptor(allCode, "package.json"));
        delete allCode["package.json"];
    }
    else if (allCode["main.py"] != undefined && allCode["requirements.txt"] != undefined) {
        console.log("changing main.py");
        Object.defineProperty(allCode, "main.js",
            Object.getOwnPropertyDescriptor(allCode, "main.py"));
        delete allCode["main.py"];

        console.log("changing requirements.txt");
        Object.defineProperty(allCode, "package.json",
            Object.getOwnPropertyDescriptor(allCode, "requirements.txt"));
        delete allCode["requirements.txt"];
    }
    addFileTabs(Object.keys(allCode));
}*/
function changeEnvironment() {
  saveCurrentCode();

  //currentEnvironment = document.querySelector('input[name=language]:checked').value;
  let sel = document.getElementById("language");
  currentEnvironment = sel.options[sel.selectedIndex].value;

  let allCodeTemp = inter.getFiles(currentEnvironment);
  allCode[0][0] = allCodeTemp[0][0];
  allCode[1] = allCodeTemp[1];
  addFileTabs(Object.keys(allCode)); //no need to pass anything
}

function changeProvider() {
    document.getElementById("provider-form").innerHTML = "";
    document.getElementById("handlerform").innerHTML = "";
    var value = document.querySelector('input[name=provider]:checked').value

    if (value === "aws" || value === "openwhisk" || value === "gcp") {
        currentProvider = value;
        inter = new Interface(value, function () {
        updateCredentialsForm();
      });
        // Save last used provider
        //chrome.storage.local.set({ lastUsedProvider: value }, function () {
        //    console.log("Saved provider in chrome stroage");
        //});
        localStorage.setItem("lastUsedProvider", value );
    }
    // add conditions for other providers here
}

function updateCredentialsForm() {
    inter.getCredentialsFormMarkup(function (markup, show) {
        document.getElementById("provider-form").innerHTML = markup;
        if (!show) {
          console.log("HIDE");
          var x = document.getElementById("credentials-form");
          x.style.display = "none";
        };
        if (inter.getHandler){
            document.getElementById("handlerform").innerHTML = inter.getHandler();
        }
        //saveCurrentCode();
        // Needs an "if" here to overwrite only if unchanged
        console.log("PRE", allCode);
        if (allCode[0]) {
          let allCodeTemp = inter.getFiles(currentEnvironment);
          allCode[0][0] = allCodeTemp[0][0];
          allCode[1] = allCodeTemp[1];
        } else {
          allCode = inter.getFiles(currentEnvironment);
        }
        /*console.log("POST", allCode);
        var fileNames = Object.keys(allCode);
        addFileTabs(fileNames);*/
        //changeEnvironment();
	updateEnvironmentForm();
    });
}

function updateEnvironmentForm() {
    inter.getEnvironments(function (langsList) {
        //document.getElementById("type").innerHTML = markup;

    	//var radioButtons = document.getElementsByClassName('language');
    	//for (var i = 0; i < radioButtons.length; i++) {
        //	radioButtons[i].addEventListener('click', changeEnvironment, false);
    	//}

	let langs = `<select id="language">`;
	for (let i = 0; i < langsList.length; i++) {
		langs += `<option value="${langsList[i]}">${langsList[i]}</option>`;
	}
	langs += `</select>`;	

        document.getElementById("type").innerHTML = langs;
	document.getElementById("language").onchange = changeEnvironment;

        changeEnvironment();
    });
}

function addFileTabs(fileNames) {
    var html = "";
    //currentFilename = fileNames[0];
    //currentFilename = allCode[0][0];
    //currentFilename = 0;
    //fileNames.forEach(function (file) {
    allCode.forEach(function (file, i) {
        html += `<li class="file" data-value="${i}">${file[0]}</li>`
    });
    document.getElementById("filelist").innerHTML = html;
    //window.editor.setValue(allCode[currentFilename] || "");
    openNewFile(currentFilename);
}

//save credentials form data
document.addEventListener('click', function (e) {
    if (e.target && e.target.id == 'submit-credentials-form') {
        e.preventDefault();
        var formElements = document.getElementById("credentials-form").elements;
        var postData = {};
        for (var i = 0; i < formElements.length; i++)
            if (formElements[i].type != "submit")//we dont want to include the submit-buttom
                postData[formElements[i].name] = formElements[i].value;
	// Get selected provider (again?!)
	var value = document.querySelector('input[name=provider]:checked').value
        inter.saveCredentialsFormData(postData, value, function() {
          console.log("update form after save");
          changeProvider();
        });
        let x = document.getElementById("credentials-form"); //hide after saving
        x.style.display = "none";
    // Tabs n files content
    } else if (e.target && e.target.className && e.target.className.match(/\bfile\b/)) {

        saveCurrentCode();
        var fileName = e.target.getAttribute("data-value");
        openNewFile(fileName);
    // Show n hide credentials form
    } else if (e.target && e.target.id === "change-credentials") {
       e.preventDefault();
       let x = document.getElementById("credentials-form");
       //x.style.display = "none";
       if (x.style.display === "none") {
         x.style.display = "block";
       } else {
         x.style.display = "none";
       }
       console.log("CHANGE CREDENTIALS");
    }
})

function saveCurrentCode() {
    var code = window.editor.getValue();
    allCode[currentFilename][1] = code;
}
function openNewFile(fileName) {
    currentFilename = fileName;
    console.log("GGG", fileName);
    window.editor.setValue(allCode[currentFilename][1] || "");
    var extension = allCode[currentFilename][0].split('.').pop();
    changeLanguage(extension);
}

function changeLanguage(extension) {
  //console.log("ECT", extension);
    if (extension === "js") {
        editor.getSession().setMode('ace/mode/javascript');
    } else if (extension === "py") {
        editor.getSession().setMode('ace/mode/python');
    } else if (extension === "json") {
        editor.getSession().setMode('ace/mode/json');
    }
    // add conditions for other providers here
}


// Define run button behaviour
let runButton = document.getElementById('run');
runButton.onclick = function () {
    console.log("RUN");
    //Interface.runFunc();
    saveCurrentCode();
    var funcName = document.getElementById("funcName").value;
    console.log("while sending ", allCode);
    inter.runFunc(funcName, allCode, function (_data) {
        let outbox = document.getElementById('outbox');
        //outbox.value = _data.Payload;
        outbox.value = _data;
    });
}

//let saveSaltButton = document.getElementById('savesalt');
//saveSaltButton.onclick = function () {
//    //salt = document.getElementById("salt").value;
//    updateCredentialsForm();
//}

let addFileButton = document.getElementById('addFile');
addFileButton.onclick = function () {
    //var fileName = askFileName();
    //allCode[fileName] = "";
    saveCurrentCode();
    var fileName = askFileName();
    currentFilename = allCode.push([fileName, ""]) - 1;
    addFileTabs(Object.keys(allCode));

}

function askFileName() {
    var fileName = prompt("Please enter file name with extension");
    var extension = fileName.split('.').pop();
    // var environment = document.querySelector('input[name=language]:checked').value
    if (allCode[fileName]) {
        alert("File with this name already exists");
        return askFileName();
    //} else if (allowedExtensions[currentEnvironment] && !allowedExtensions[currentEnvironment].includes(extension)) {
    //    alert("Extension not allowed for " + currentEnvironment + " environment")
    //    return askFileName();
    } else {
        return fileName;
    }
}

// Old: AWS pre-checked
//document.getElementById("salt").value = salt;
//changeProvider();

// New: localStorage check for last used
// chrome global storage:
/*chrome.storage.local.get(['lastUsedProvider'], function (result) {
  let lastUsedProvider = result.lastUsedProvider;
  if (lastUsedProvider) {
    document.getElementById(lastUsedProvider).checked = true;
    //document.getElementById("salt").value = salt;
    changeProvider();
  }
})*/

// browser storage:
  let lastUsedProvider = localStorage.getItem("lastUsedProvider");
  if (lastUsedProvider) {
    document.getElementById(lastUsedProvider).checked = true;
    //document.getElementById("salt").value = salt;
    changeProvider();
  }

// Useless tabs code
/*
window.addEventListener("load", function () {
    // store tabs variable
    var myTabs = document.querySelectorAll("ul.nav-tabs > li");
    function myTabClicks(tabClickEvent) {
        for (var i = 0; i < myTabs.length; i++) {
            myTabs[i].classList.remove("active");
        }
        var clickedTab = tabClickEvent.currentTarget;
        clickedTab.classList.add("active");
        tabClickEvent.preventDefault();
        var myContentPanes = document.querySelectorAll(".tab-pane");
        for (i = 0; i < myContentPanes.length; i++) {
            myContentPanes[i].classList.remove("active");
        }
        var anchorReference = tabClickEvent.target;
        var activePaneId = anchorReference.getAttribute("href");
        var activePane = document.querySelector(activePaneId);
        activePane.classList.add("active");
    }
    for (i = 0; i < myTabs.length; i++) {
        myTabs[i].addEventListener("click", myTabClicks)
    }
});
//useless tabs code ends */

// Warn user before refresh
//window.onbeforeunload = function(event)
//    {
//        return confirm("Caution - code will be lost on reload.");
//    };
