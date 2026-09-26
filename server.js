import express from "express";

const app=express();
const PORT=process.env.PORT||3000;
const VERIFY_TOKEN=process.env.WHATSAPP_VERIFY_TOKEN||"";
const ACCESS_TOKEN=process.env.WHATSAPP_ACCESS_TOKEN||"";
const PHONE_NUMBER_ID=process.env.WHATSAPP_PHONE_NUMBER_ID||"";

app.use(express.json());
app.use(express.static("public"));

const admins=new Set();
const logs=[];

app.get("/webhook",(req,res)=>{
  const mode=req.query["hub.mode"];
  const token=req.query["hub.verify_token"];
  const challenge=req.query["hub.challenge"];
  if(mode==="subscribe" && token && token===VERIFY_TOKEN) return res.status(200).send(challenge);
  return res.sendStatus(403);
});

app.post("/webhook",(req,res)=>{
  res.sendStatus(200);
  try{
    const entry=req.body?.entry?.[0];
    const change=entry?.changes?.[0];
    const value=change?.value;
    const message=value?.messages?.[0];
    if(!message) return;
    const from=message.from;
    const text=message.text?.body?.trim()||"";
    logs.push({from,text,at:new Date().toISOString()});
    if(text.startsWith("/")) handleCommand(from,text);
  }catch(e){ console.error("Webhook error:",e); }
});

async function handleCommand(from,text){
  const cmd=text.toLowerCase().split(/\s+/)[0];
  let reply="";
  if(cmd==="/menu"||cmd==="/help"){
    reply="🤖 Bot Gouichy\n\n/menu — commandes\n/ping — tester le bot\n/info — informations\n/help — aide";
    if(admins.has(from)) reply+="\n/stats — statistiques";
  }else if(cmd==="/ping"){
    reply="🏓 Pong ! Bot Gouichy répond.";
  }else if(cmd==="/info"){
    reply="🤖 Bot Gouichy V4\n⚙️ Webhook actif\n🛡️ Permissions activées.";
  }else if(cmd==="/stats"){
    if(!admins.has(from)) return sendText(from,"⛔ Commande réservée à l'administrateur.");
    reply=`📊 ${logs.length} événement(s) reçu(s).`;
  }else return;

  await sendText(from,reply);
}

async function sendText(to,body){
  if(!ACCESS_TOKEN||!PHONE_NUMBER_ID){
    console.log("Simulation de réponse:",{to,body});
    return;
  }
  const url=`https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`;
  const r=await fetch(url,{
    method:"POST",
    headers:{
      "Authorization":`Bearer ${ACCESS_TOKEN}`,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      messaging_product:"whatsapp",
      to,
      type:"text",
      text:{body}
    })
  });
  if(!r.ok) console.error("WhatsApp API:",await r.text());
}

app.get("/api/status",(req,res)=>res.json({
  online:true, webhook:"/webhook", events:logs.length,
  configured:Boolean(ACCESS_TOKEN&&PHONE_NUMBER_ID&&VERIFY_TOKEN)
}));

app.get("/api/logs",(req,res)=>res.json(logs.slice(-50).reverse()));

app.listen(PORT,()=>console.log(`Bot Gouichy V4: http://localhost:${PORT}`));
