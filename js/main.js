window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
classifier = new Bayes({
    //adding tokenizer
    tokenize: function (text) {
        return text.split(' ');
    }
});

function isSpeechAvailable() {
    if ('SpeechRecognition' in window) {
        recognition = new window.SpeechRecognition();
        return true;
    } else {
        return false;
    }
}

function trainVoiceData() {
    classifyData.forEach((currentObj, index, array) => {
        let inputArray = currentObj.inputData;
        let result = currentObj.result;
        inputArray.forEach((curentValue) => {
            classifier.train(curentValue, result);
        });
        if (index + 1 == array.length) {
            $("#RecResult").html("Voice Model trained successfully!!!");
        }
    });
}

function initilaizeSpeech() {
    if (isSpeechAvailable()) {
        var finalTranscript = '';
        recognition.interimResults = true;
        recognition.maxAlternatives = 10;
        recognition.continuous = false;
        recognition.onstart = (eve) => {
            finalTranscript = "";
            $("#result").html("Voice Recognition Started!!!");
        };
        recognition.onresult = (event) => {
            var interimTranscript = '';
            for (var i = event.resultIndex, len = event.results.length; i < len; i++) {
                var transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                    $("#result").html(finalTranscript);
                } else {
                    interimTranscript += transcript;
                    $("#result").html(finalTranscript + '<i style="color:#f00;">' + interimTranscript + '</>');
                }
            }
        };
        recognition.onend = (eve) => {
            if (finalTranscript == "") {
                $("#result").html("Voice Recognition Stoped!!!")
            } else {
                validateVoiceData(finalTranscript);
            }
        };
        recognition.onerror = (err) => {
            $("#result").html("Voice Recognition Error: ", err);
        };
    } else {
        alert("Speech Recognition does not support on this browser. Please reopen the application in chrome browser...");
    }
}

function validateVoiceData(data) {
    var output = classifier.guess(data);
    var values = Object.values(output);
    if (this.isAllEqual(values)) {
        var resultobj = data;
    } else {
        var maxValue = Math.max(...values);
        var finalValue = this.getKey(output, maxValue);
        var resultobj = finalValue;
    }
    performCustomActions(resultobj);
}

function isAllEqual(arr) {
    return arr.every(v => v === arr[0]);
}

function getKey(objectData, value) {
    for (var key in objectData) {
        if (objectData[key] == value)
            return key;
    }
}

function performCustomActions(data) {
    var today = new Date();
    $("#RecResult").html("");
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var day = days[today.getDay()];
    switch (data) {
        case "time":
            $("#RecResult").html(time);
            break;
        case "date":
            $("#RecResult").html(date);
            break;
        case "day":
            $("#RecResult").html(day);
            break;
        default:
            $("#RecResult").html("No possible commands found!!!");
    }
}
$(function () {
    $("#RecResult").html("Voice Model Loading!!!");
    trainVoiceData();
    initilaizeSpeech();
    $("#voiceEle").hover(function (eve) {
        $(this).addClass("hover");
    }, function (eve) {
        $(this).removeClass("hover");
    });

    $("#voiceEle").off("click").on("click", function () {
        recognition.start();
        $(this).removeClass("hover");
    });

});