const music = document.getElementById('bgMusic');
let icon = document.getElementById('icon');

// window.onload = function() {
//     music.play();
//     music.volume = 1;
// }

const harlem = () => {
    (function () {
        function l(a) {
          var c = a.offsetHeight;
          a = a.offsetWidth;
          return c > q && c < r && a > s && a < t;
        }
        function m() {
          for (
            var a = document.getElementsByClassName(f), c = RegExp("\\b" + f + "\\b");
            0 < a.length;
      
          )
            a[0].className = a[0].className.replace(c, "");
        }
        var q = 10,
          s = 10,
          r = 1e3,
          t = 1e3,
          f = "mw-harlem_shake_me",
          n = ["im_drunk", "im_baked", "im_trippin", "im_blown", "im_hanging"],
          p,
          b = document.documentElement;
        p = window.innerWidth
          ? window.innerHeight
          : b && !isNaN(b.clientHeight)
          ? b.clientHeight
          : 0;
        var g;
        g = window.pageYOffset
          ? window.pageYOffset
          : Math.max(document.documentElement.scrollTop, document.body.scrollTop);
        for (
          var b = document.getElementsByTagName("*"), h = null, e = 0;
          e < b.length;
          e++
        ) {
          var a = b[e];
          if (l(a)) {
            var d;
            d = a;
            for (var j = 0; d; ) (j += d.offsetTop), (d = d.offsetParent);
            d = j;
            if (d >= g && d <= p + g) {
              h = a;
              break;
            }
          }
        }
        if (null === a) a = b;
        else {
          a = document.createElement("link");
          a.setAttribute("type", "text/css");
          a.setAttribute("rel", "stylesheet");
          a.setAttribute(
            "href",
            "//dl.dropboxusercontent.com/s/nt5iljw2e0iac44/harlem-shake.css"
          );
          a.setAttribute("class", "mw_added_css");
          document.body.appendChild(a);
          a = document.createElement("audio");
          a.setAttribute("class", "mw_added_css");
          a.src = "//dl.dropboxusercontent.com/s/vyk1ctygfanj78p/harlem-shake.mp3";
          a.loop = !1;
          a.addEventListener(
            "canplay",
            function () {
              setTimeout(function () {
                h.className += " " + f + " im_first";
              }, 500);
              setTimeout(function () {
                m();
                var a = document.createElement("div");
                a.setAttribute("class", "mw-strobe_light");
                document.body.appendChild(a);
                setTimeout(function () {
                  document.body.removeChild(a);
                }, 100);
                for (var c = 0; c < k.length; c++) {
                  var b = k[c];
                  b.className +=
                    " " + f + " " + n[Math.floor(Math.random() * n.length)];
                }
              }, 15500);
            },
            !0
          );
          a.addEventListener(
            "ended",
            function () {
              m();
              for (
                var a = document.getElementsByClassName("mw_added_css"), b = 0;
                b < a.length;
                b++
              )
                document.body.removeChild(a[b]);
            },
            !0
          );
          a.innerHTML =
            " <p>If you are reading this, it is because your browser does not support the audio element. We recommend that you get a new browser.</p> <p>";
          document.body.appendChild(a);
          a.play();
          for (var k = [], e = 0; e < b.length; e++) (a = b[e]), l(a) && k.push(a);
        }
      })();
      
}

icon.onclick = function (){
    if(music.paused){
        music.play();
        music.volume = 1;
        icon.src = "../assests/images/pause.png";
        harlem();
        
    } else {
        music.pause();
        icon.src = "../assests/images/play.png";

    }

}