// Contract fixture derived from running-event-api public routes/views/validators.
// No real participant data. This process is used only for local integration checks.
const http = require('http');
const event = { id:'111111111111111111111111',slug:'integration-run',name:'Integration Run',date:'2027-05-01',venue:'Test Park',province:'กรุงเทพมหานคร',status:'open',category:'road',theme:'orange',races:[{id:'222222222222222222222222',name:'5 KM',price:399,quota:100,remaining:100,start:null}],images:[] };
let order;
http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const respond=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(body));};
 const ok=data=>respond(200,{data}); const error=(status,code,message)=>respond(status,{error:{code,message}});
 if(req.method==='GET' && url.pathname==='/api/v1/public/events') return ok([event]);
 if(req.method==='GET' && url.pathname==='/api/v1/public/events/integration-run') return ok(event);
 if(req.method==='GET' && url.pathname.startsWith('/api/v1/public/events/')) return error(404,'NOT_FOUND','ไม่พบงานวิ่ง');
 if(req.method==='POST' && url.pathname==='/api/v1/public/events/integration-run/orders') {
  let raw=''; for await(const chunk of req) raw+=chunk;
  const body=JSON.parse(raw);
  if(!body.participants?.length || !body.delivery?.phone) return error(422,'VALIDATION_ERROR','ข้อมูลไม่ครบ');
  if(body.participants.some(p=>p.race!=='5 KM')) return error(409,'RACE_UNAVAILABLE','ระยะวิ่งไม่พร้อมรับสมัคร');
  const subtotal=body.participants.length*399; const shipping=body.delivery.method==='shipping'?50:0;
  order={orderNo:'RR-TEST-0001',status:'pending',amount:{subtotal,shipping,total:subtotal+shipping},expiresAt:'2027-05-01T00:00:00Z',event,races:body.participants.map(p=>({race:p.race,size:p.size})),delivery:body.delivery.method,createdAt:new Date().toISOString(),canUploadSlip:true};
  order.phoneLast4=body.delivery.phone.slice(-4);
  return respond(201,{data:{orderNo:order.orderNo,status:order.status,amount:order.amount,expiresAt:order.expiresAt}});
 }
 if(url.pathname.startsWith('/api/v1/public/orders/')) {
  if(!order || !url.pathname.includes(order.orderNo)) return error(404,'NOT_FOUND','ไม่พบใบสมัคร');
  if(req.method==='GET') {if(url.searchParams.get('phoneLast4')!==order.phoneLast4)return error(404,'NOT_FOUND','ไม่พบใบสมัคร');const {phoneLast4,...safe}=order;return ok(safe);}
  if(req.method==='POST' && url.pathname.endsWith('/slip')) {
   let raw='';for await(const chunk of req)raw+=chunk.toString('latin1');
   if(!req.headers['content-type']?.startsWith('multipart/form-data') || !raw.includes('name="slip"') || !raw.includes(order.phoneLast4))return error(422,'VALIDATION_ERROR','ไฟล์หรือเบอร์โทรไม่ถูกต้อง');
   order.status='slip_uploaded';order.canUploadSlip=false;return ok({status:'slip_uploaded'});
  }
 }
 error(501,'NOT_IMPLEMENTED','Endpoint not modeled');
}).listen(process.env.PORT);
