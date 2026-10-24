// Supabase + app instalável. Se o Supabase não estiver configurado, o site segue funcionando só com WhatsApp.
(function(){
var C=window.RN_CONFIG||{},ok=C.url&&C.key&&C.url.indexOf("SEU-")<0&&window.supabase;
var sb=ok?supabase.createClient(C.url,C.key,{auth:{persistSession:false,autoRefreshToken:false}}):null;
var L=document.createElement("link");L.rel="stylesheet";L.href="assets/css/extra.css";document.head.appendChild(L);
function $(i){return document.getElementById(i)}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function brl(c){return(c/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
var QUALQUER="Qualquer profissional",svcs=[],bars=[],cache={};
function barId(n){return(bars.filter(function(b){return b.name===n})[0]||{}).id||null}

// rodapé + newsletter
var fw=document.querySelector("footer .wrap");if(fw)fw.insertAdjacentHTML("beforeend",' · <a href="privacidade.html">Privacidade</a>');
var loc=$("local"),ns=document.createElement("section");ns.id="novidades";
ns.innerHTML='<div class="wrap"><h2>Receba novidades</h2><p>Promoções e avisos da barbearia por e-mail. Sem spam, e você sai quando quiser.</p><form id="news" class="news"><input id="news-hp" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true"><input id="news-mail" type="email" required maxlength="120" placeholder="Seu e-mail" autocomplete="email" aria-label="Seu e-mail"><label class="chk"><input id="news-ok" type="checkbox" required><span>Concordo em receber e-mails promocionais e aceito a <a href="privacidade.html">política de privacidade</a>.</span></label><button class="btn" type="submit">Quero receber</button><p id="news-msg" role="status"></p></form></div>';
if(loc)loc.parentNode.insertBefore(ns,loc);
$("news").onsubmit=function(e){e.preventDefault();var m=$("news-msg");
  if($("news-hp").value)return;
  if(!sb){m.textContent="Cadastro indisponível no momento.";return}
  sb.rpc("subscribe",{p_email:$("news-mail").value}).then(function(r){
    m.textContent=r.error?"E-mail inválido ou indisponível agora.":"Pronto! Você vai receber nossas novidades.";
    if(!r.error)$("news").reset()})};

// instalar como app
var dp,ib=document.createElement("button"),sa=matchMedia("(display-mode: standalone)").matches||navigator.standalone;
ib.id="inst";ib.className="btn ghost";ib.textContent="Instalar app";ib.hidden=true;document.body.appendChild(ib);
addEventListener("beforeinstallprompt",function(e){e.preventDefault();dp=e;ib.hidden=!!sa});
if(/iphone|ipad|ipod/i.test(navigator.userAgent)&&!sa)ib.hidden=false;
ib.onclick=function(){if(dp){dp.prompt();dp=null;ib.hidden=true}else alert("No iPhone: toque em Compartilhar e depois em “Adicionar à Tela de Início”.")};
if("serviceWorker"in navigator)addEventListener("load",function(){navigator.serviceWorker.register("sw.js")});

if(!sb)return;
try{
// horários vagos
function taken(day){return cache[day]?Promise.resolve(cache[day]):sb.rpc("taken_slots",{p_day:day}).then(function(r){return cache[day]=r.data||[]})}
function mark(){if(!S.dia)return;var day=S.dia;taken(day).then(function(rows){
  if(S.dia!==day)return;var sel=S.prof===QUALQUER?null:barId(S.prof),cnt={};
  rows.forEach(function(x){if(sel&&x.barber_id!==sel)return;cnt[x.hhmm]=(cnt[x.hhmm]||0)+1});
  var lim=sel?1:Math.max(bars.length,1);
  document.querySelectorAll("#o-hora .slot").forEach(function(b){if(cnt[b.textContent]>=lim){b.disabled=true;b.title="Ocupado"}})})}
var dh=window.desenhaHoras;if(typeof dh==="function")window.desenhaHoras=function(){dh();mark()};
$("o-prof").addEventListener("click",function(){setTimeout(window.desenhaHoras,0)});

// agendar
var btn=$("enviar"),orig=btn.onclick;
btn.insertAdjacentHTML("beforebegin",'<p class="lgpd">Usamos só seu nome e telefone para confirmar o horário. Apagamos 7 dias após a data. <a href="privacidade.html">Privacidade</a></p>');
btn.onclick=function(){
  var n=$("nome").value.trim(),t=$("tel").value.trim(),e=$("erro"),sv=svcs.filter(function(s){return s.name===S.serv})[0];
  if(!svcs.length||!sv)return orig&&orig();
  if(!S.dia||!S.hora){e.textContent="Escolha serviço, dia e horário.";return}
  if(n.length<2){e.textContent="Informe seu nome.";return}
  if(t.replace(/\D/g,"").length<10){e.textContent="Informe um WhatsApp com DDD.";return}
  e.textContent="";btn.disabled=true;var day=S.dia,hora=S.hora;
  sb.rpc("book",{p_service:sv.id,p_barber:S.prof===QUALQUER?null:barId(S.prof),p_day:day,p_time:hora,p_name:n,p_phone:t}).then(function(r){
    btn.disabled=false;delete cache[day];
    if(r.error){e.textContent=/indisponivel/.test(r.error.message)?"Esse horário acabou de ser ocupado. Escolha outro.":"Não foi possível agendar agora. Tente pelo WhatsApp.";window.desenhaHoras();return}
    var rs=$("resumo");rs.textContent="✔ Horário reservado: "+r.data+" · "+S.serv+". ";
    var a=document.createElement("a");a.className="btn ghost";a.target="_blank";a.rel="noopener";a.textContent="Avisar no WhatsApp";
    a.href="https://wa.me/"+window.WHATS+"?text="+encodeURIComponent("Olá! Agendei pelo site: "+S.serv+", "+r.data+". Meu nome é "+n+".");
    rs.appendChild(a);S.hora=null;window.desenhaHoras()})};

// catálogo vindo do banco
Promise.all([sb.from("services").select("id,name,price_cents").order("sort").order("name"),sb.from("barbers").select("id,name").order("name"),sb.from("hours").select("*"),sb.from("plans").select("*").limit(1)]).then(function(r){
  svcs=r[0].data||[];bars=r[1].data||[];var hrs=r[2].data||[],plan=(r[3].data||[])[0];
  if(svcs.length){SERVICOS=svcs.map(function(s){return s.name});chips("o-serv",SERVICOS,"serv");
    $("lista").innerHTML=svcs.map(function(s){return"<li>"+esc(s.name)+(s.price_cents!=null?" <b>"+brl(s.price_cents)+"</b>":"")+"</li>"}).join("")}
  if(bars.length){PROFISSIONAIS=[QUALQUER].concat(bars.map(function(b){return b.name}));chips("o-prof",PROFISSIONAIS,"prof")}
  if(hrs.length){hrs.forEach(function(h){HORARIO[h.weekday]=h.opens?[parseInt(h.opens,10),parseInt(h.closes,10)]:null});
    dias.length=0;var d0=new Date();d0.setHours(0,0,0,0);
    for(var i=0;i<=DIAS_A_FRENTE;i++){var x=new Date(d0);x.setDate(d0.getDate()+i);if(HORARIO[x.getDay()])dias.push(x)}
    desenhaDias();window.desenhaHoras();
    $("horarios").innerHTML=[2,3,4,5,6,0,1].map(function(d){var h=HORARIO[d];return"<tr><td>"+NOMES[d]+"</td><td>"+(h?pad(h[0])+":00 – "+pad(h[1])+":00":"Fechado")+"</td></tr>"}).join("")}
  if(plan){var s=document.createElement("section");s.id="pacote";
    s.innerHTML='<div class="wrap"><div class="plan"><h2>'+esc(plan.name)+'</h2><div class="price">'+brl(plan.price_cents)+'</div>'+(plan.details?"<p>"+esc(plan.details)+"</p>":"")+'<a class="btn" target="_blank" rel="noopener" href="https://wa.me/'+window.WHATS+"?text="+encodeURIComponent("Olá! Quero saber mais sobre o "+plan.name)+'">Quero o pacote</a></div></div>';
    var av=$("avaliacoes");if(av)av.parentNode.insertBefore(s,av)}
});
}catch(err){console.warn("Integração com a agenda não aplicada:",err)}
})();
