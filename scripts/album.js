/* I needed to update the volume bar so the volume didn't change
back when you switched songs. so I got rid of "currentVolume" and
changed it to "initialVolume." I added "globalVolume" to control it,
but named it this way so that you wouldn't mistake it for "currentVolume," which is what I wanted to call the new "globalVolume" variable.
*/ 
var globalVolume = null;
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
    if(globalVolume === null){
        setVolume(initialVolume);
    } else {
        setVolume(globalVolume);
    }
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

var clickHandler = function(targetElement) {
    var songNumber = $(this).attr('data-song-number');
	if (currentlyPlayingSongNumber !== null) {
		// Revert to song number for currently playing song because user started playing new song.
		var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
		currentlyPlayingCell.html(currentlyPlayingSongNumber);
        updateSeekBarWhileSongPlays();
        
	}
	if (currentlyPlayingSongNumber !== songNumber) {
		// Switch from Play -> Pause button to indicate new song is playing.
		
		setSong(songNumber);
        currentSoundFile.play();
        updateSeekBarWhileSongPlays();
        var $volumeFill = $('.volume .fill');
        var $volumeThumb = $('.volume .thumb');
        $volumeFill.width(globalVolume + '%');
        $volumeThumb.css({left: globalVolume + '%'});
        $(this).html(pauseButtonTemplate);
        updatePlayerBarSong();
        
	} else if (currentlyPlayingSongNumber === songNumber) {
		// Switch from Pause -> Play button to pause currently playing song.
		$(this).html(playButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPlayButton);
		if(currentSoundFile.isPaused()){
            $('.main-controls .play-pause').html(playerBarPauseButton);
            $(this).html(pauseButtonTemplate);
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
        } else {
            $('.main-controls .play-pause').html(playerBarPlayButton);
            $(this).html(playButtonTemplate);
            currentSoundFile.pause();
            updateSeekBarWhileSongPlays();
        }
	}
 };

var togglePlayFromPlayerBar = function () {
    var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
    
    if(currentSoundFile === null){
        currentlyPlayingCell = getSongNumberCell(1);
        setSong(1);
        currentSoundFile.play();
        getSongNumberCell(1);
        currentlyPlayingCell.html(pauseButtonTemplate);
        $playerBarPlayPauseButton.html(playerBarPauseButton);
        updateSeekBarWhileSongPlays();
    } else if(currentSoundFile.isPaused()){
        currentlyPlayingCell.html(pauseButtonTemplate);
        $playerBarPlayPauseButton.html(playerBarPauseButton);
        currentSoundFile.play();
    } else{
        currentlyPlayingCell.html(playButtonTemplate);
        $playerBarPlayPauseButton.html(playerBarPlayButton);
        currentSoundFile.pause();
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

var setupSeekBars = function() {
    var $seekBars = $('.player-bar .seek-bar');
        updateSeekPercentage($('.seek-control'), 0);
        
        $seekBars.click(function(event) {
             var offsetX = event.pageX - $(this).offset().left;
             var barWidth = $(this).width();
             var seekBarFillRatio = offsetX / barWidth;
            if($(this).parent().attr('class')=='seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());
            } else {
                globalVolume = seekBarFillRatio * 100;
                setVolume(seekBarFillRatio * 100);
            }

            updateSeekPercentage($(this), seekBarFillRatio); 
        });
    
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

var updateAlbumInfo = function (){
    
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    
}

var nextSongPreviousSong = function (value) {
    if(value.data === "next"){
        var getLastSongNumber = function(index) {
            return index == 0 ? currentAlbum.songs.length : index;
        };

        var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
        currentSongIndex++;
        
        if (currentSongIndex >= currentAlbum.songs.length) {
            currentSongIndex = 0;
        }

        setSong(currentSongIndex + 1);
        currentSoundFile.play();
        
        var $volumeFill = $('.volume .fill');
        var $volumeThumb = $('.volume .thumb');
        $volumeFill.width(globalVolume + '%');
        $volumeThumb.css({left: globalVolume + '%'});
        updateSeekBarWhileSongPlays();
        updateAlbumInfo();
        var lastSongNumber = getLastSongNumber(currentSongIndex);
        var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
        var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

        $nextSongNumberCell.html(pauseButtonTemplate);
        $lastSongNumberCell.html(lastSongNumber);
        
    } else if (value.data === "previous"){
        
        var getLastSongNumber = function(index) {
            return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
        };

        var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
        currentSongIndex--;

        if (currentSongIndex < 0) {
            currentSongIndex = currentAlbum.songs.length - 1;
        }

        setSong(currentSongIndex + 1);
        currentSoundFile.play();
        var $volumeFill = $('.volume .fill');
        var $volumeThumb = $('.volume .thumb');
        $volumeFill.width(globalVolume + '%');
        $volumeThumb.css({left: globalVolume + '%'});
        updateSeekBarWhileSongPlays();
        updateAlbumInfo();

        var lastSongNumber = getLastSongNumber(currentSongIndex);
        var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
        var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

        $previousSongNumberCell.html(pauseButtonTemplate);
        $lastSongNumberCell.html(lastSongNumber);
    }
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
    setupSeekBars();
    $previousButton.click("previous", nextSongPreviousSong);
    $nextButton.click("next", nextSongPreviousSong);
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
