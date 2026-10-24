// Trilha sonora: 4 faixas; a cada visita (abrir o site de novo) toca a próxima.
// Coloque os arquivos em assets/audio/ (use só músicas livres de direitos autorais).
(function(){
var TRACKS=["assets/audio/musica-1.mp3","assets/audio/musica-2.mp3","assets/audio/musica-3.mp3","assets/audio/musica-4.mp3"];
var i=0;try{i=(parseInt(localStorage.getItem("rn_track"),10)||0)%TRACKS.length;localStorage.setItem("rn_track",String((i+1)%TRACKS.length))}catch(e){}
var a=new Audio(TRACKS[i]);a.loop=true;a.volume=.5;a.preload="none";
var b=document.createElement("button");b.id="music-toggle";b.type="button";b.textContent="♫";b.setAttribute("aria-label","Ligar ou desligar a música");b.setAttribute("aria-pressed","false");document.body.appendChild(b);
function set(on){b.setAttribute("aria-pressed",on);try{localStorage.setItem("rn_music",on?"1":"0")}catch(e){}}
function play(){a.play().then(function(){set(true)}).catch(function(){set(false)})}
b.onclick=function(){if(a.paused)play();else{a.pause();set(false)}};
a.onerror=function(){b.hidden=true};
document.addEventListener("visibilitychange",function(){if(document.hidden&&!a.paused){a.pause();b.setAttribute("aria-pressed","false")}});
try{if(localStorage.getItem("rn_music")==="1")addEventListener("pointerdown",play,{once:true})}catch(e){}
})();
