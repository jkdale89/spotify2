// find template and compile it
var albumsTemplateSource = document.getElementById('albums-template').innerHTML,
    albumsTemplate = Handlebars.compile(albumsTemplateSource),
    tracksTemplateSource = document.getElementById('tracks-template').innerHTML,
    tracksTemplate = Handlebars.compile(tracksTemplateSource),
    albumsResultsPlaceholder = document.getElementById('albums'),
    tracksResultsPlaceholder = document.getElementById('tracks'),
    playingCssClass = 'playing',
    audioObject = null;

var fetchTracks = function (albumId, callback) {
    $.ajax({
        url: 'https://api.spotify.com/v1/albums/' + albumId,
        success: function (response) {
            callback(response);
            // console.log(response);
        }
    });
};

var fetchTopTracks = function (artistId) {
  $.ajax({
    url: "https://api.spotify.com/v1/artists/" + artistId + "/top-tracks",
    data: {
      country: 'US'
    },
    success: function (response) {
        tracksResultsPlaceholder.innerHTML = tracksTemplate(response);

      }
    });
};

var searchAlbums = function (query, id=1) {
    $.ajax({
        url: 'https://api.spotify.com/v1/search',
        data: {
            q: query,
            type: 'album'
        },
        success: function (response) {
            response.albums.items[id]._center = true;
            response.albums.items[id+1]._right = true;
            response.albums.items[id-1]._left = true;
            albumsResultsPlaceholder.innerHTML = albumsTemplate(response);
            //set opacity next event loop
            // this loads images gracefully
            setTimeout(function(){
              $(".leftAlbum").css("opacity", "1");
              $(".rightAlbum").css("opacity", "1");
              $(".centerAlbum").css("opacity", "1");
            },500);
        }
    });
};

var searchArtists = function(query){
  $.ajax({
    url: 'http://api.spotify.com/v1/search',
    data: {
      q: query,
      type: 'artist'
    },
    success: function (response) {
      if(response.artists.items.length == 0){
        $("body").css("opacity", ".2");

        setTimeout(function(){
          $("#query").css("color", "red");
          $("#query").css("opacity", "1");
          document.getElementById("query").value = "No artist found - search again";
        }, 1);
      }
      else {
        // console.log(response);
        $("#query").css("color", "black");
        $("#query").text("joe");
        $("body").css("opacity", "1")
        fetchTopTracks(response.artists.items[0].id);
        // console.log(response.artists.items[0].id);
        let artistPic = "url(" + response.artists.items[0].images[0].url + ")";
        $("div.artistBackground").css({
          "background-image": artistPic,
          "opacity": .2
          }
        );
      }
    }
  })
};

albums.addEventListener('click', function (e) {
    var target = e.target;
    if (target !== null && target.classList.contains('album')) {
        if (target.classList.contains(playingCssClass)) {
            audioObject.pause();
        } else {
            if (audioObject) {
                audioObject.pause();
            }
            fetchTracks(target.getAttribute('data-album-id'), function (data) {
                audioObject = new Audio(data.tracks.items[0].preview_url);
                audioObject.play();
                target.classList.add(playingCssClass);
                audioObject.addEventListener('ended', function () {
                    target.classList.remove(playingCssClass);
                });
                audioObject.addEventListener('pause', function () {
                    target.classList.remove(playingCssClass);
                });
            });
        }
    }
});

document.getElementById('search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    searchAlbums(document.getElementById('query').value);
    searchArtists(document.getElementById('query').value);
}, false);
