const music = document.getElementById('bgMusic');
let icon = document.getElementById('icon');

window.onload = function() {
    music.play();
    music.volume = 1;
}

icon.onclick = function (){
    if(music.paused){
        music.play();
        music.volume = 1;
        icon.src = "../assests/images/pause.png";
    } else {
        music.pause();
        icon.src = "../assests/images/play.png";

    }

}