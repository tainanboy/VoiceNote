var recorder, gumStream;
var recordButton = document.getElementById("recordButton");
recordButton.addEventListener("click", toggleRecording);

function toggleRecording() {
    if (recorder && recorder.state == "recording") {
        console.log('stop recording');
        recorder.stop();
        gumStream.getAudioTracks()[0].stop();
    } else {
        console.log('start recording');
        navigator.mediaDevices.getUserMedia({
            audio: true
        }).then(function(stream) {
            gumStream = stream;
            recorder = new MediaRecorder(stream);
            recorder.ondataavailable = function(e) {
                var url = URL.createObjectURL(e.data);
                var preview = document.createElement('audio');
                preview.controls = true;
                preview.src = url;
                document.body.appendChild(preview);
            };
            recorder.start();
        });
    }
}