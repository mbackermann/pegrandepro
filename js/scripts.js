let videosArr = [];
let videosCounter = 0;
const VIDEOS_NUMBER = $(window).width() > 1000 ? 9 : 12;
let modalActive = false;
let currentVideoId;
$(".videos").on("click", '.video',function(){
  let id = $(this).data("id");
  renderVideo(id);
});


function renderVideo(id){
  $(".lightbox").hide();
  $(".lightbox .video").html("");
  $(".lightbox .video").html(videosArr[id].embed);
  $(".lightbox .video").append("<p>"+ videosArr[id].description +"</p>")
  $(".lightbox .video iframe").attr("width", 768)
  $(".lightbox .video iframe").attr("height", 432)
  $(".lightbox").show();
  modalActive = true;
  currentVideoId = id;
}



$(document).ready(function(){

  $("body").keydown(function(e){
    if(modalActive){
      if(e.keyCode == 37){
        let videoId = currentVideoId == 0 ? videosArr.length - 1 : currentVideoId - 1;
        renderVideo(videoId);
      }else if(e.keyCode == 39){
        let videoId = currentVideoId < videosArr.length - 1 ? currentVideoId + 1 : 0;
        renderVideo(videoId);
      }
    }
  });

  $(document).mouseup(function(e)
    {
    var container = $(".lightbox .video");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0)
    {
      closeModal();
    }
    });
  $('a[href^="#"]').on('click', function(event) {
    var target = $(this.getAttribute('href'));
    if( target.length ) {
      event.preventDefault();
      $('html, body').stop().animate({
        scrollTop: target.offset().top
      }, 1000);
    }
  });

  getVideosIds();

  $("#show-more").click(function(){
    printVideos();
  })


  $(".lightbox .close").click(function(){
    closeModal();
  })

  $(document).keyup(function(e) {
    if (e.key === "Escape") { // escape key maps to keycode `27`
      closeModal();
    }

  });

});


function closeModal(){
  $(".lightbox .video").html("");
  $(".lightbox").hide();
  modalActive = false;
}

async function getVideosIds(){
  let videoObjs = [];
  let response = fetch('videos.txt')
    .then(function(videos){
      return videos.text();
    }).then(function(response){
      let videosIds = response.split("\n");
      videosIds = videosIds.filter(function(video){
        return video != "";
      })
      videosIds.map(function(video){
        videoObjs.push(getVideoInfo(video));
      })
      return videoObjs;
    }).then(function(response){
      return Promise.all(response)
    }).then(mountVideos)
    .catch(function(err){
      console.log(err);
    });
}

function getVideoInfo(id){
  return fetch(`https://api.vimeo.com/videos/${id}?access_token=bb93d46ea0fb592925e66691e552c00b`)
    .then(function(response){
      return response.json();
    })
}

function mountVideos(array){
  videosArr = array.map(function(video){
    return {
      title: video.name,
      description: video.description,
      embed: video.embed.html,
      thumb: video.pictures.sizes.filter(function(s){ return s.width > 250})[0].link
    }
  })
  printVideos();
}


function printVideos(array){
  let html = '';
  videosCounter = videosCounter + VIDEOS_NUMBER > videosArr.length ? videosArr.length : videosCounter + VIDEOS_NUMBER
  let videos = videosArr.slice(0, videosCounter)
  videos.map(function(video, index){
    html += '<div class="video" data-id="'+ index + '" ><div class="overlay"><p>'+ video.title +'</p></div><img title="'+ video.title +'" src="'+ video.thumb +'"></div>';
  })
  $(".video-content").html(html);
  if(videosCounter == videosArr.length){
    $(".more").hide();
  }else{
    $(".more").show();
  }
}
