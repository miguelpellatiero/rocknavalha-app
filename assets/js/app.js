// ===== CONFIGURAÇÃO (ajuste aqui) =====
var WHATS = "5512997083768";
var SERVICOS = ["Corte de cabelo","Corte em degradê","Corte com navalha","Corte com tesoura","Corte militar","Corte infantil","Corte personalizado","Barba","Barba com navalha","Barbear com toalha quente","Cabelo e barba","Coloração","Depilação com cera","Raspar a cabeça"];
var PROFISSIONAIS = ["Qualquer profissional","Rodrigo"];
// 0=dom ... 6=sáb ; [abre, fecha] em horas. null = fechado
var HORARIO = {0:null,1:null,2:[9,19],3:[9,19],4:[9,19],5:[9,19],6:[9,18]};
var PASSO = 30, DIAS_A_FRENTE = 14;
// ======================================
var NOMES = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
var S = {serv:null,prof:PROFISSIONAIS[0],dia:null,hora:null};
function $(id){return document.getElementById(id)}
function pad(n){return String(n).padStart(2,"0")}
function fmtH(m){return pad(Math.floor(m/60))+":"+pad(m%60)}

$("lista").innerHTML = SERVICOS.map(function(s){return "<li>"+s+"</li>"}).join("");
$("horarios").innerHTML = [2,3,4,5,6,0,1].map(function(d){var h=HORARIO[d];return "<tr><td>"+NOMES[d]+"</td><td>"+(h?pad(h[0])+":00 – "+pad(h[1])+":00":"Fechado")+"</td></tr>"}).join("");

function chips(el,arr,key){
  $(el).innerHTML="";
  arr.forEach(function(v){
    var b=document.createElement("button");b.type="button";b.className="chip";b.textContent=v;
    b.setAttribute("aria-pressed",S[key]===v);
    b.onclick=function(){S[key]=v;chips(el,arr,key);resumo()};
    $(el).appendChild(b);
  });
}
chips("o-serv",SERVICOS,"serv");chips("o-prof",PROFISSIONAIS,"prof");

var dias=[];
(function(){
  var d=new Date();d.setHours(0,0,0,0);
  for(var i=0;i<=DIAS_A_FRENTE;i++){var x=new Date(d);x.setDate(d.getDate()+i);if(HORARIO[x.getDay()])dias.push(x)}
})();
function key(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
function desenhaDias(){
  $("o-dia").innerHTML="";
  dias.forEach(function(d){
    var b=document.createElement("button");b.type="button";b.className="chip";
    b.innerHTML=NOMES[d.getDay()].slice(0,3)+"<small>"+pad(d.getDate())+"/"+pad(d.getMonth()+1)+"</small>";
    b.setAttribute("aria-pressed",S.dia===key(d));
    b.onclick=function(){S.dia=key(d);S.hora=null;desenhaDias();desenhaHoras();resumo()};
    $("o-dia").appendChild(b);
  });
}
function desenhaHoras(){
  var el=$("o-hora");el.innerHTML="";
  if(!S.dia){el.textContent="Escolha um dia primeiro.";return}
  var p=S.dia.split("-"),d=new Date(+p[0],+p[1]-1,+p[2]),h=HORARIO[d.getDay()];
  var agora=new Date(),hoje=key(agora)===S.dia,min=agora.getHours()*60+agora.getMinutes()+30;
  for(var m=h[0]*60;m<h[1]*60;m+=PASSO){
    var b=document.createElement("button");b.type="button";b.className="slot";b.textContent=fmtH(m);
    b.disabled=hoje&&m<min;
    b.setAttribute("aria-pressed",S.hora===fmtH(m));
    (function(t){b.onclick=function(){S.hora=t;desenhaHoras();resumo()}})(fmtH(m));
    el.appendChild(b);
  }
}
desenhaDias();desenhaHoras();

function dataBR(k){var p=k.split("-"),d=new Date(+p[0],+p[1]-1,+p[2]);return NOMES[d.getDay()]+", "+p[2]+"/"+p[1]}
function resumo(){
  $("resumo").textContent = (S.serv&&S.dia&&S.hora)
    ? S.serv+" com "+(S.prof==="Qualquer profissional"?"o primeiro profissional livre":S.prof)+" · "+dataBR(S.dia)+" às "+S.hora
    : "Escolha serviço, dia e horário.";
}
$("enviar").onclick=function(){
  var n=$("nome").value.trim(),t=$("tel").value.trim(),e=$("erro");
  if(!S.serv||!S.dia||!S.hora){e.textContent="Escolha serviço, dia e horário.";return}
  if(n.length<2){e.textContent="Informe seu nome.";return}
  if(t.replace(/\D/g,"").length<10){e.textContent="Informe um WhatsApp com DDD.";return}
  e.textContent="";
  var msg="Olá! Quero agendar na Rock & Navalha.\n\nServiço: "+S.serv+"\nProfissional: "+S.prof+"\nDia: "+dataBR(S.dia)+"\nHorário: "+S.hora+"\nNome: "+n+"\nWhatsApp: "+t;
  window.open("https://wa.me/"+WHATS+"?text="+encodeURIComponent(msg),"_blank","noopener");
};

(function(){
  var a=new Date(),h=HORARIO[a.getDay()],m=a.getHours()+a.getMinutes()/60,el=$("status");
  if(h&&m>=h[0]&&m<h[1]){el.textContent="Aberto agora · fecha às "+pad(h[1])+":00";el.className="status open";return}
  for(var i=0;i<=7;i++){
    var d=new Date(a);d.setDate(a.getDate()+i);var x=HORARIO[d.getDay()];
    if(x&&(i>0||m<x[0])){el.textContent="Fechado · abre "+(i===0?"hoje":i===1?"amanhã":NOMES[d.getDay()].toLowerCase())+" às "+pad(x[0])+":00";return}
  }
})();

(function(){
var H=document.documentElement,rm=matchMedia("(prefers-reduced-motion:reduce)").matches;H.classList.add("js");
// revelar ao rolar
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.12});
document.querySelectorAll("section:not(.hero) .wrap > *:not(.setlist)").forEach(function(el){el.classList.add("rv");io.observe(el)});
// nota contando
var sc=document.querySelector(".score");
if(sc&&!rm){var t0=null,done=false;new IntersectionObserver(function(es,o){if(es[0].isIntersecting&&!done){done=true;requestAnimationFrame(function f(t){t0=t0||t;var k=Math.min((t-t0)/1400,1);sc.textContent=(5*k).toFixed(1).replace(".",",");if(k<1)requestAnimationFrame(f)})}}).observe(sc)}
// brilho no cursor + inclinação 3D do setlist
var gl=document.getElementById("glow"),st=document.querySelector(".setlist");
if(matchMedia("(hover:hover)").matches&&!rm){
addEventListener("pointermove",function(e){gl.style.opacity=1;gl.style.transform="translate("+e.clientX+"px,"+e.clientY+"px)"});
if(st){st.style.transform="rotate(-.6deg)";
st.addEventListener("pointermove",function(e){var b=st.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;st.style.transform="perspective(900px) rotateY("+x*10+"deg) rotateX("+-y*10+"deg) scale(1.02)"});
st.addEventListener("pointerleave",function(){st.style.transform="rotate(-.6deg)"})}}
// poste de barbeiro 3D
var cv=document.getElementById("gl");
try{
var R=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));
var S=new THREE.Scene(),cam=new THREE.PerspectiveCamera(40,1,.1,100);cam.position.z=9;
var c=document.createElement("canvas");c.width=c.height=256;var x=c.getContext("2d");
x.fillStyle="#f4f4f4";x.fillRect(0,0,256,256);x.fillStyle="#161616";
for(var k=-2;k<=3;k++){x.beginPath();x.moveTo(k*128,0);x.lineTo(k*128+64,0);x.lineTo(k*128+64-256,256);x.lineTo(k*128-256,256);x.fill()}
var tex=new THREE.CanvasTexture(c);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(2,2);
var g=new THREE.Group(),pole=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,5,64,1,true),new THREE.MeshStandardMaterial({map:tex,metalness:.2,roughness:.3,side:THREE.DoubleSide}));
var metal=new THREE.MeshStandardMaterial({color:0xdddddd,metalness:.7,roughness:.25});
var cap1=new THREE.Mesh(new THREE.CylinderGeometry(.85,.85,.45,48),metal),cap2=cap1.clone(),ball=new THREE.Mesh(new THREE.SphereGeometry(.5,32,32),metal);
cap1.position.y=2.65;cap2.position.y=-2.65;ball.position.y=3.3;
g.add(pole,cap1,cap2,ball);
var rings=[];for(var i=0;i<3;i++){var m=new THREE.Mesh(new THREE.TorusGeometry(1.7+i*.45,.012,8,160),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.55-i*.12}));m.rotation.x=1.2+i*.25;g.add(m);rings.push(m)}
S.add(g);
var n=500,pos=new Float32Array(n*3);for(var j=0;j<n*3;j++)pos[j]=(Math.random()-.5)*(j%3==2?10:28);
var pg=new THREE.BufferGeometry();pg.setAttribute("position",new THREE.BufferAttribute(pos,3));
var stars=new THREE.Points(pg,new THREE.PointsMaterial({size:.04,color:0xffffff,transparent:true,opacity:.7}));S.add(stars);
S.add(new THREE.AmbientLight(0xffffff,.55));
var d=new THREE.DirectionalLight(0xffffff,1.2);d.position.set(3,4,5);S.add(d);
var pl=new THREE.PointLight(0xffffff,.9);pl.position.set(-4,-2,4);S.add(pl);
var mx=0,my=0,vis=true,raf=0;
function fit(){var w=cv.clientWidth,h=cv.clientHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();g.position.x=cam.aspect>1.1?Math.min(cam.aspect*1.7,5.2):0;g.scale.setScalar(cam.aspect>1.1?1:.75)}
fit();addEventListener("resize",fit);
addEventListener("pointermove",function(e){mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
function tick(){raf=0;if(!vis)return;
pole.rotation.y+=.012;rings.forEach(function(m,i){m.rotation.z+=.004*(i+1)*(i%2?-1:1)});
stars.rotation.y+=.0006;stars.rotation.x=scrollY*.0004;
g.rotation.z=.16+mx*.15;g.rotation.x=my*.25;g.position.y=-scrollY*.004+Math.sin(performance.now()/900)*.12;
pl.position.x=mx*10;R.render(S,cam);if(!rm)raf=requestAnimationFrame(tick)}
new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis&&!raf)raf=requestAnimationFrame(tick)}).observe(cv);
raf=requestAnimationFrame(tick);
}catch(e){cv.style.display="none"}
})();
