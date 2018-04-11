
/**
 * The *AudioSource object creates an analyzer node, sets up a repeating function with setInterval
 * which samples the input and turns it into an FFT array. The object has two properties:
 * streamData - this is the Uint8Array containing the FFT data
 */

var SoundcloudComponent

var SoundcloudAudioSource = function(player) {
    var analyser;
    var audioCtx = new (window.AudioContext || window.webkitAudioContext);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    player.crossOrigin = "anonymous";
    var source = audioCtx.createMediaElementSource(player);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    var sampleAudioStream = () => {
        analyser.getByteFrequencyData(this.streamData);

        //FTT comes out here!!!!!
        console.log(this.streamData);
    };
    setInterval(sampleAudioStream, 20);
    this.streamData = new Uint8Array(128);
    this.playStream = (streamUrl) => {
        player.setAttribute('src', streamUrl);
        player.play();
    }
};

// Makes a request to the Soundcloud API and returns the JSON data.
var SoundcloudLoader = function(player) {
    var self = this;
    var client_id = "67129366c767d009ecc75cec10fa3d0f";
    this.streamUrl = "";
    this.errorMessage = "";
    this.player = player;
    this.loadStream = function(track_url) {
        SC.initialize({
            client_id: client_id
        });
        SC.get('/resolve', { url: track_url }, function(sound) {
            if (sound.errors) {
                console.log("error in SC.get")
            } else {
                self.sound = sound;
                self.streamUrl = () => { return sound.stream_url + '?client_id=' + client_id; };
            }
        });
    };
};

window.onload = function init() {
    var player =  document.getElementById('player');
    var loader = new SoundcloudLoader(player);

    var audioSource = new SoundCloudAudioSource(player);
    var form = document.getElementById('form');
    var loadAndUpdate = (trackUrl) => {
      loader.loadStream(trackUrl, function() {
          audioSource.playStream(loader.streamUrl());
          var trackToken = loader.sound.permalink_url.substr(22);
          window.location = '#' + trackToken;
        });
    };

    // handle the form submit event to load the new URL
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var trackUrl = document.getElementById('input').value;
        loadAndUpdate(trackUrl);
    });

};
