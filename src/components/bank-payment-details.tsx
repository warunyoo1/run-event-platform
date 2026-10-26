"use client";

import { UiText } from "@/i18n/client";

export function BankPaymentDetails() {
  return <section className="bank-payment-details" aria-label="ข้อมูลบัญชีรับชำระเงิน">
    <h3><UiText>ชำระเงินผ่านบัญชีธนาคาร</UiText></h3>
    <dl><div><dt><UiText>ธนาคาร</UiText></dt><dd><UiText>ธนาคารออมสิน</UiText></dd></div>
      <div><dt><UiText>เลขบัญชี</UiText></dt><dd className="bank-account-number" dir="ltr">020493687303</dd></div></dl>
    <p><UiText>หลังยืนยันใบสมัคร กรุณาโอนตามยอดในใบสมัคร แล้วส่งหลักฐานการชำระเงิน</UiText></p>
  </section>;
}
