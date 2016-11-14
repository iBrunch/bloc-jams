var globalVolume = 80;
var setSong = function (songNumber) {
    if (currentSoundFile) {
         currentSoundFile.stop();
     }
 
    currentlyPlayingSongNumber = songNumber;
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        formats: [ 'mp3' ],
        preload: true
    });
    
    setVolume(globalVolume);
};

var seek = function(time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
}

var setVolume = function(volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};

var getSongNumberCell = function (number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
};

var createSongRow = function (songNumber, songName, songLength) {
     var template =
        '<tr class="album-view-song-item">'
      +'  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
      + '  <td class="song-item-title">' + songName + '</td>'
      + '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
      + '</tr>'
      ;
 
    var $row = $(template);
    
 
    var onHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        if (songNumber !== parseInt(currentlyPlayingSongNumber)) {
            songNumberCell.html(playButtonTemplate);
        }
    };
    var offHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        if (songNumber !== parseInt(currentlyPlayingSongNumber)) {
            songNumberCell.html(songNumber);
        }
    };
 
    $row.find('.song-item-number').click(clickHandler);
    $row.hover(onHover, offHover);
    return $row;
};

var setVolumeFill = function() {
    var $volumeFill = $('.volume .fill');
    var $volumeThumb = $('.volume .thumb');
    $volumeFill.width(globalVolume + '%');
    $volumeThumb.css({left: globalVolume + '%'});
}

var setPlay = function(data){
    $('.main-controls .play-pause').html(playerBarPlayButton);
    $(data).html(playButtonTemplate);
    updateSeekBarWhileSongPlays();
}

var setPause = function(data){
    $('.main-controls .play-pause').html(playerBarPauseButton);
    $(data).html(pauseButtonTemplate);
    updateSeekBarWhileSongPlays();
}

var clickHandler = function(targetElement) {
    var songNumber = $(this).attr('data-song-number');
	
    if (currentlyPlayingSongNumber !== null) {   
       var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
	   currentlyPlayingCell.html(currentlyPlayingSongNumber);
        
	}
    
	if (currentlyPlayingSongNumber !== songNumber) {
		setSong(songNumber);
        currentSoundFile.play();
        setVolumeFill();
        $(this).html(pauseButtonTemplate);
        updatePlayerBarSong();
        
	} else if (currentlyPlayingSongNumber === songNumber) {
		if(currentSoundFile.isPaused()){
            setPause(this);
            currentSoundFile.play();
            
        } else {
            setPlay(this);
            currentSoundFile.pause();
            
        }
	}
    
   updateSeekBarWhileSongPlays();
 }; 

var getCurrentlyPlayingCell = function() {
   return currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
}

var setPlayerBarPlay = function() {
    getCurrentlyPlayingCell();
    currentlyPlayingCell.html(pauseButtonTemplate);
    $playerBarPlayPauseButton.html(playerBarPauseButton);
    currentSoundFile.play();
}

var setPlayerBarPause = function() {
    getCurrentlyPlayingCell();
    currentlyPlayingCell.html(playButtonTemplate);
    $playerBarPlayPauseButton.html(playerBarPlayButton);
    currentSoundFile.pause();
}

var togglePlayFromPlayerBar = function () { 
    
var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
    if(currentSoundFile === null){
        currentlyPlayingCell = getSongNumberCell(1);
        setSong(1);
        setPlayerBarPlay();
        getSongNumberCell(1);
        updateSeekBarWhileSongPlays();
        
    } else if(currentSoundFile.isPaused()){
        setPlayerBarPlay();
    } else{
        setPlayerBarPause();
    }
}

var setCurrentAlbum = function (album) {
    currentAlbum = album;
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');
 
    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);
    $albumSongList.empty();
     
    for (var i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }
};


var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);

    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
};
    
var updateSeekBarWhileSongPlays = function() {
    if (currentSoundFile) {
        currentSoundFile.bind('timeupdate', function(event) {
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');
            setCurrentTimeInPlayerBar(this.getTime());
            setTotalTimeInPlayerBar(this.getDuration());
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
    }
};

var $seekBars = $('.player-bar .seek-bar');

// I split up the volume and track bar code, but they need the same
// function to work. The original handles the volume slider and the song slider
// because they work exactly the same way except for how they're filled
//(song duration and volume level).

var trackBarSetByClick = function(){
    $seekBars.click(function(event) {
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;

        seek(seekBarFillRatio * currentSoundFile.getDuration());
        
        updateSeekPercentage($(this), seekBarFillRatio); 
    
    });
}

var volumeBarSetByClick = function(){
    $seekBars.click(function(event) {
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;    
        
        globalVolume = seekBarFillRatio * 100;
        setVolume(seekBarFillRatio * 100);

        updateSeekPercentage($(this), seekBarFillRatio); 
    });
}

var seekbarSetByDrag = function(){
    updateSeekPercentage($('.seek-control'), 0);
    
    $seekBars.find('.thumb').mousedown(function(event) {        
        var $seekBar = $(this).parent();
        $(document).bind('mousemove.thumb', function(event){
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;

            updateSeekPercentage($seekBar, seekBarFillRatio);
        });

        $(document).bind('mouseup.thumb', function() {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
}

var setupTrackBar = function() {
    trackBarSetByClick();
    seekbarSetByDrag();
}

var setupVolumeBar = function() {
    volumeBarSetByClick();
    seekbarSetByDrag();
}



var setCurrentTimeInPlayerBar = function (currentTime) {
    $(".current-time").text(filterTimeCode(currentTime));
}

var setTotalTimeInPlayerBar = function (totalTime) {
    $(".total-time").text(filterTimeCode(totalTime));
}

var filterTimeCode = function (timeInSeconds) {
    var minutes = Math.floor(parseFloat(timeInSeconds) / 60);
    var seconds = Math.floor(parseFloat(timeInSeconds)%60);
    return (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
}

var trackIndex = function(album, song) {
     return album.songs.indexOf(song);
};

var updatePlayerBarSong = function () {
    $(".artist-song-mobile").text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    $(".song-name").text(currentSongFromAlbum.title);
    $(".artist-name").text(currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    
}; 

var updatePlayerBarInfo = function(){
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
    
    if(currentSoundFile.isPaused()===false) {
        $('.main-controls .play-pause').html(playerBarPauseButton);
    }
    
}

var currentSongIndex = 0;
var playPauseCheck = 0;

var changeCurrentSongIndex = function(){
    currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    if(playPauseCheck){
        currentSongIndex++;
    } else {
        currentSongIndex--;
    }
}

var getLastSongNumber = function(index) {
    if(playPauseCheck){
        if(index == 0){
            return currentAlbum.songs.length;
        } else{
            return index;
        }
    } else {
        if(index == (currentAlbum.songs.length - 1)){
            return 1;
        } else{
            return index + 2;
        }
    }
};

var checkForCurrentSongIndexReset = function(){
    if(playPauseCheck){
        if (currentSongIndex >= currentAlbum.songs.length) {
            currentSongIndex = 0;
        }
    } else {
        if (currentSongIndex < 0) {
            currentSongIndex = currentAlbum.songs.length - 1;
        }
    }
}

var updateSongItemCell = function(){
    
    currentlyPlayingSongNumber = currentSongIndex + 1;
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];
    
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $nextSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');
    var $previousSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
    
    if(currentSoundFile.isPaused()){
        $nextSongNumberCell.html(playButtonTemplate);
    }else{ 
        setSong(currentlyPlayingSongNumber);
        $nextSongNumberCell.html(pauseButtonTemplate);
        currentSoundFile.play();
    } 
    
    $lastSongNumberCell.html(lastSongNumber);   
}

var changeSong = function (clicked) {
    playPauseCheck = clicked.data;
    changeCurrentSongIndex();
    checkForCurrentSongIndexReset();
    updateSongItemCell();    
    updatePlayerBarInfo(); 
    updateSeekBarWhileSongPlays();
}

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var initialVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playerBarPlayPauseButton = $('.main-controls .play-pause');

$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    setupTrackBar();
    setupVolumeBar();
    $nextButton.click(true, changeSong);
    $previousButton.click(false, changeSong);
    var albumList = [albumPicasso, albumMarconi, albumTuring];
    var counter = 1;
    var albumImage = document.getElementsByClassName('album-cover-art')[0];
    $playerBarPlayPauseButton.click(togglePlayFromPlayerBar);
    
    albumImage.addEventListener("click", function(event){
        
        if(counter < albumList.length){
             setCurrentAlbum(albumList[counter]);
             counter++;
             if(counter === albumList.length){
                counter = 0;
             }
        }
    });
});
