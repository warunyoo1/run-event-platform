---
target: run-event-platform UI
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:C:\\Project\\run-event-platform\\src\\components"
timestamp: 2026-10-19T05-02-21Z
slug: src-components
---
Method: dual-agent (A: /root/platform_design; B: /root/platform_technical)
Target: src/components, Run Event Platform. Desktop live home/events/find-order/how-to-register plus source. API inventory empty; registration/results and mobile are source-only. QR/payment configuration deliberately deferred.

Health: provisional 25/40.
|Nielsen heuristic|Score /4|
|---|---:|
|System status|3|
|Real-world match|3|
|User control|3|
|Consistency|2|
|Error prevention|3|
|Recognition|2|
|Efficiency|2|
|Minimalism|3|
|Error recovery|2|
|Help|2|

Specificity: Thai race discovery, photography, filters and registration flow fit the audience. Conventional blue interface is coherent; preserve it.
Strengths: focused home search, readable Thai navigation, source-level review/edit/validation/focus support.
Priority issues:
P1 In-app navigation discards unsent registration; beforeunload only does not intercept client-side links. registration-form.tsx:54-59,168. Guard SPA navigation without retaining sensitive fields in browser storage. Command: harden.
P2 Zero-inventory catalog offers clear-filters with no active constraints. event-catalog.tsx:62. Distinguish unavailable inventory from filtered zero results; simplify irrelevant controls. Command: clarify.
P2 Hero province options are five hardcoded entries, unlike API-driven catalog. hero.tsx:26 and event-catalog.tsx:58. Share the options source. Command: harden.
P2 Undo silently expires at 10 seconds. registration-form.tsx:64,175. Keep undo until next deliberate action or communicate/extend expiry. Command: harden.
P2 Lookup demands reference recall without help. order-lookup.tsx:47-52. Explain where reference is shown; provide a truthful help route. Automated recovery would require an API addition. Command: clarify.
Cognitive load: many filters/sort/view decisions while no inventory exists; lookup demands remembering an identifier. Emotional valley at zero events and possible lost application work. Personas: distracted runner loses in-progress work; first-time runner has no next step at zero inventory; keyboard/slow reader loses timed undo.
Minor: guide needs a direct lookup link; internal Admin wording should be removed; faint phone input border is a non-text contrast candidate, not a verified universal WCAG failure.
Detector: 4 warnings, 0 errors, 2 rules, globals.css lines 34/162/165 (overused-font Arial),198 (side-tab). All weak/contextual stylistic signals, not confirmed user-blocking defects.
Questions: prioritize registration data protection or discovery/lookup clarity? Fix top 3 or all 5?
