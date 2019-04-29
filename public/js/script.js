try {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
} catch (e) {
    console.error(e);
    $('.no-browser-support').show();
    $('.app').hide();
}

var noteTextarea = $('#note-textarea');
var instructions = $('#recording-instructions');
var notesList = $('ul#notes');
//add output text
var outputText = $('#output-textarea')

var noteContent = '';

// Get all notes from previous sessions and display them.
var notes = getAllNotes();
renderNotes(notes);

/*-----------------------------
      Voice Recognition
------------------------------*/

// If false, the recording will stop after a few seconds of silence.
// When true, the silence period is longer (about 15 seconds),
// allowing us to keep recording even when the user pauses.
recognition.continuous = true;

// This block is called every time the Speech APi captures a line.
recognition.onresult = function(event) {

    // event is a SpeechRecognitionEvent object.
    // It holds all the lines we have captured so far.
    // We only need the current one.
    var current = event.resultIndex;

    // Get a transcript of what was said.
    var transcript = event.results[current][0].transcript;

    // Add the current transcript to the contents of our Note.
    // There is a weird bug on mobile, where everything is repeated twice.
    // There is no official solution so far so we have to handle an edge case.
    var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

    if (!mobileRepeatBug) {
        noteContent += transcript;
        noteTextarea.val(noteContent);
    }
};

recognition.onstart = function() {
    instructions.text('Voice recognition activated. Try speaking into the microphone.');
}

recognition.onspeechend = function() {
    instructions.text('You were quiet for a while so voice recognition turned itself off.');
}

recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
        instructions.text('No speech was detected. Try again.');
    };
}

/*-----------------------------
      App buttons and input
------------------------------*/
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia supported.');
    navigator.mediaDevices.getUserMedia (
       // constraints - only audio needed for this app
       {
          audio: true
       })
       // Success callback
       .then(function(stream) {
           console.log('success')
           var recordedChunks = [];

           mediaRecorder = new MediaRecorder(stream);
           mediaRecorder.ondataavailable = handleDataAvailable;
           function handleDataAvailable(event) {
               if (event.data.size > 0) {
                   recordedChunks.push(event.data);
                } else {    
                }
            };
            $('#start-record-btn').on('click', function(e) {
                if (noteContent.length) {
                    noteContent += ' ';
                }
                recognition.start();
                mediaRecorder.start();
            });
            
            $('#pause-record-btn').on('click', function(e) {
                recognition.stop();
                mediaRecorder.stop();
                instructions.text('Voice recognition paused.');
            });
            
            // Sync the text inside the text area with the noteContent variable.
            noteTextarea.on('input', function() {
                noteContent = $(this).val();
            });
            
            $('#save-note-btn').on('click', function(e) {
                recognition.stop();
                //
                if (!noteContent.length) {
                    instructions.text('Could not save empty note. Please add a message to your note.');
                } else {
                    var blob = new Blob(recordedChunks, { 'type' : 'audio/wav; codecs=MS_PCM' });
                    var fd = new FormData();
                    fd.append('audio', blob);
                    fd.append('data', noteContent);
                    console.log(fd);
                    // post the note data to '/save' route
                    $.ajax({
                        type: 'POST',
                        url: '/save',
                        data: fd,
                        enctype: 'multipart/form-data',
                        processData: false,
                        contentType: false
                    }).done(function(res) {
                        console.log(res);
                        // Reset variables and update UI.
                        noteContent = '';
                        renderNotes(getAllNotes());
                        noteTextarea.val('');
                        instructions.text(res);
                    });
                }
            })
       })
       // Error callback
       .catch(function(err) {
          console.log('The following getUserMedia error occured: ' + err);
       }
    );
 } else {
    console.log('getUserMedia not supported on your browser!');
 }


//Start the Google api
$('#analysis-note-btn').on('click', function(e) {
    //console.log("analysis button clicked.")
    instructions.text('Start analyse ......');
    outputText.html("")
    console.log(noteContent);
    var input =  noteContent;
    //var input = "today is monday in NYC. have a nice day. remember out date at 8 pm. I will call Donald Trump at 10.";
    //console.log("input is:"+input);
    //post to /nlp route: call goolge entites api
    var data = {text: input};
    //
    var entity = $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/nlp',
      success: function(response) {
        console.log('success');
        //console.log(JSON.stringify(response));
        res = response;
        }
      });
    //
    $.when(entity).done(function(){
      console.log("NLP job complete.");
      //return a list of word
      //console.log(res);
      //console.log(res['entities']);
      output = colorText(input,res);
      instructions.text('Analysis complete');
      console.log(output);
    });
})


/*-----------------------------
      Helper Functions
------------------------------*/

function renderNotes(notes) {
    var html = '';
    if (notes.length) {
        notes.forEach(function(note) {
            html += `
      <!--Hide for now
        <li class="note">
        <p class="header">
          <span class="date">${note.date}</span>
          <a href="#" class="listen-note" title="Listen to Note">Listen to Note</a>
          <a href="#" class="delete-note" title="Delete">Delete</a>
        </p>
      </li>
      -->`;
        });
    } else {
        html = '<li><p class="content">You don\'t have any notes yet.</p></li>';
    }
    notesList.html(html);
}
//show cat

function showTooltip(x) {

  var popup = $(x);
  console.log('popUp');
  console.log(popup);
  console.log(popup[0].firstElementChild);
  popup[0].firstElementChild.classList.toggle("show");
  console.log('with x');
  console.log(x.classList);

}

function HideTooltip(x) {
  var popup = $(x);
  popup[0].firstElementChild.classList.toggle("show");

}

//Add colored word as a list
function colorText(text,response){
  words_arr = []
  obj_list = []
  entites_arr = response['entities']
  $.each(entites_arr, function( index, value ) {
    //value is a dictionary
    word = value['name']
    type = value['type']
    //save as html element
    temp = $('<span onmouseover="showTooltip(this)" onmouseout="HideTooltip(this)"> </span>').text(word).addClass(type + ' popup');
    temp.append(' <span class="popuptext" id = "myPopup">'+ type +'</span>')
    words_arr.push(word)
    obj_list.push(temp[0].outerHTML)

  });



  //loop the original text
  var arr = text.split(' ');
  var output_html = ''
  for (var i = 0; i < arr.length; i++) {
    var word = arr[i];
    if($.inArray(word, words_arr) != -1) {
      var index = words_arr.indexOf(word)
      //output = output + '<span></span>'
      output_html = output_html + " " + obj_list[index]
    }else{
      output_html = output_html + " " + word
    }
  }
  outputText.append(output_html)
  return words_arr
}

function saveNote(dateTime, content) {
    localStorage.setItem('note-' + dateTime, content);
}
/*
function colorText(response){
  coloredText = []
  entites_arr = response['entities']
  console.log("colorText")

  $.each(entites_arr, function( index, value ) {
    //value is a dictionary
    word = value['name']
    console.log(word)
    //the color of word is by types
    coloredText.push(word)
    return coloredText
  });
}*/

function getAllNotes() {
    var notes = [];
    var key;
    for (var i = 0; i < localStorage.length; i++) {
        key = localStorage.key(i);

        if (key.substring(0, 5) == 'note-') {
            notes.push({
                date: key.replace('note-', ''),
                content: localStorage.getItem(localStorage.key(i))
            });
        }
    }
    return notes;
}