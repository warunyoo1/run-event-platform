import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyParticipant, emptyDelivery, validateParticipant, validateDelivery } from '../src/lib/registration.ts';
import { listEvents, findEvent, createOrder, findOrder, sendSlip, PublicApiError } from '../src/lib/api.ts';

test('public checkout contract over real HTTP through Postman simulation', { skip: !process.env.SIMULATION_API_URL }, async () => {
 process.env.API_PROXY_TARGET = process.env.SIMULATION_API_URL;
 const events = await listEvents();
 assert.equal(events[0].slug,'integration-run'); assert.equal(events[0].races[0].start,'');
 assert.equal((await findEvent('integration-run')).races[0].remaining,100);
 assert.equal(await findEvent('missing'),undefined);
 const participant={...emptyParticipant(),firstName:'Test',lastName:'Runner',gender:'ไม่ระบุ',birthDay:'1',birthMonth:'1',birthYear:'2000',phone:'0812345678',race:'5 KM',size:'M',province:'กรุงเทพมหานคร'};
 assert.deepEqual(validateParticipant(participant,events[0]),{});
 const delivery={...emptyDelivery(),method:'shipping',phone:'0812345678',contact:'Test Runner',street:'Test 1',subdistrict:'Test',district:'Test',province:'กรุงเทพมหานคร',postalCode:'10100'};
 assert.deepEqual(validateDelivery(delivery),{});
 const created=await createOrder('integration-run',[participant],delivery);
 assert.deepEqual(created.amount,{subtotal:399,shipping:50,total:449});
 const order=await findOrder(created.orderNo,'5678'); assert.equal(order.canUploadSlip,true);
 await assert.rejects(findOrder(created.orderNo,'0000'),e=>e instanceof PublicApiError && e.status===404);
 await assert.rejects(createOrder('integration-run',[{...participant,race:'unknown'}],delivery),e=>e instanceof PublicApiError && e.status===409);
 await sendSlip(created.orderNo,'5678',new File(['test-image'],'slip.png',{type:'image/png'}));
 const submitted=await findOrder(created.orderNo,'5678'); assert.equal(submitted.status,'slip_uploaded'); assert.equal(submitted.canUploadSlip,false);
});
