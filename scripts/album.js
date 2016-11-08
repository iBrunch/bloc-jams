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
    
    setVolume(currentVolume);
};

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
      + '  <td class="song-item-duration">' + songLength + '</td>'
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
	}
	if (currentlyPlayingSongNumber !== songNumber) {
		// Switch from Play -> Pause button to indicate new song is playing.
		$(this).html(pauseButtonTemplate);
		setSong(songNumber);
        currentSoundFile.play();
        updatePlayerBarSong();
	} else if (currentlyPlayingSongNumber === songNumber) {
		// Switch from Pause -> Play button to pause currently playing song.
		$(this).html(playButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPlayButton);
		if(currentSoundFile.isPaused()){
            $('.main-controls .play-pause').html(playerBarPauseButton);
            $(this).html(pauseButtonTemplate);
            currentSoundFile.play();
        } else {
            $('.main-controls .play-pause').html(playerBarPlayButton);
            $(this).html(playButtonTemplate);
            currentSoundFile.pause();
        }
	}
 };

var togglePlayFromPlayerBar = function () {
    var currentlyPlayingCell =
        getSongNumberCell(currentlyPlayingSongNumber);
    var setToPlaying = function(){
        currentlyPlayingCell.html(pauseButtonTemplate);
        $playerBarPlayPauseButton.html(playerBarPauseButton);
        currentSoundFile.play();
    }
    
    if(currentSoundFile === null){
        currentlyPlayingCell = getSongNumberCell(1);
        setSong(1);
        setToPlaying();
    } else if(currentSoundFile.isPaused()){
        setToPlaying();
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

var currentSongIndex = 0;
var changeCurrentSongIndex = function(buttonType){
        currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
        if(buttonType === "next"){currentSongIndex++;} else {currentSongIndex--;}
}


var getLastSongNumber = function(index, buttonType) {
        if(buttonType === "next"){
            return index == 0 ? currentAlbum.songs.length : index;
        } else {
            return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
        }
};


var checkForCurrentSongIndexReset = function(buttonType){
        if(buttonType === "next"){
            if (currentSongIndex >= currentAlbum.songs.length) {
                currentSongIndex = 0;
            }
        } else {
            if (currentSongIndex < 0) {
                currentSongIndex = currentAlbum.songs.length - 1;
            }
        }
}

var updateSongItemCell = function(buttonType){
    if(buttonType === "next"){
        currentlyPlayingSongNumber = currentSongIndex + 1;
        currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

        var lastSongNumber = getLastSongNumber(currentSongIndex, "next");
        var $nextSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
        var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');
        
        if(currentSoundFile.isPaused()){
            $nextSongNumberCell.html(playButtonTemplate);
        }else{
            $nextSongNumberCell.html(pauseButtonTemplate); 
        }
        
        $lastSongNumberCell.html(lastSongNumber);
        
    } else {
        currentlyPlayingSongNumber = currentSongIndex + 1;
        currentSongFromAlbum = currentAlbum.songs[currentSongIndex];
        
        var lastSongNumber = getLastSongNumber(currentSongIndex, "previous");
        var $previousSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
        var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');
        
        if(currentSoundFile.isPaused()){
            $previousSongNumberCell.html(playButtonTemplate);
        }else{
            $previousSongNumberCell.html(pauseButtonTemplate);
        }

        $lastSongNumberCell.html(lastSongNumber);
    }
}


var changeSong = function (buttonType) {
    if(buttonType.data === "next"){
        changeCurrentSongIndex("next");
        checkForCurrentSongIndexReset("next");
        updateSongItemCell("next");    
        updatePlayerBarInfo("next");
    } else { 
        changeCurrentSongIndex("previous");
        checkForCurrentSongIndexReset("previous");
        updateSongItemCell("previous");    
        updatePlayerBarInfo("previous");
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
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playerBarPlayPauseButton = $('.main-controls .play-pause');

$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    $previousButton.click("previous", changeSong);
    $nextButton.click("next", changeSong);
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
