# Laugh Lab Pro - Stage 9: Callback Architecture Mapping

## Summary

Maps out the callbacks (running gags or repeated jokes) within the script and highlights opportunities for additional callbacks. A callback is a comedic reference to a setup made earlier. This stage identifies where callbacks occur (which joke refers back to an earlier one) and assesses the effectiveness and frequency of these callbacks. It also flags missed opportunities – places where a prior joke or theme could be echoed for extra laughs but wasn’t. The result is a “callback map” of the script’s humor architecture.

## Trigger / Function

Launched in the analysis sequence for professional tier (via runStage(9)). The underlying function (e.g. analyzeCallbacks) scans the script’s joke list and narrative for repeated motifs. This may involve text analysis (searching for repeated unique phrases/names associated with jokes) and possibly semantic analysis with AI to catch non-verbatim callbacks (e.g. a situation in Act 3 that mirrors a joke from Act 1). The function uses the data from Stage 1 (where each joke could carry an ID or content snippet) to link jokes that are related. It likely also computes a Callback Frequency metric (percentage of jokes that are callbacks). If the frequency is low or zero, it suggests adding callbacks.

## Data Contract

Input: Full script text or tokenized form, with marked jokes from earlier stages. Possibly also the list of significant story elements or comedic themes (if provided by an AI pass). Output: A structured representation of callbacks. For example: an array of callback clusters, where each cluster has a description of the original joke (the “setup”) and references to all later jokes that callback to it (with their line numbers or IDs). Each callback instance might include its line and a brief identification of how it relates (e.g. same punchline phrase, same situational gag). Additionally, the output might include summary metrics like callbackCount and callbackFrequencyPercent. Missed opportunity suggestions could be a list of promising setups that had no callback, with a note (these might feed into punch-up suggestions too). The output is added to the JSON under callbackAnalysis or similar.

## UI Display

Shown in the “Callback Mapping” panel (or “Callback Architecture” panel). This could be a visual or textual map of the callbacks. A simple UI approach: list each identified callback chain. For example: “Running Gag: Alice’s coffee spill” – introduced on page 2, later referenced on page 5 and page 10. The UI might indent the references under the original or use arrows to show linkage. If a visual graph is feasible, callbacks could be plotted on a timeline of the script (e.g. markers connected by lines). The panel also displays the Callback Frequency (e.g. “Callbacks comprise 15% of all jokes” for context). Any missed opportunity suggestions might appear as italicized tips: “The joke about Bob’s car (page 3) isn’t referenced again – consider a callback in later scenes.” The design should align with the existing result panels, likely text-focused with icons for clarity (e.g. a link icon next to callback jokes).

## QA / Validation Steps

Test on a script with known callbacks – for instance, a screenplay where a certain catchphrase appears multiple times. Ensure the stage correctly groups those instances and labels one as the first occurrence. Verify the UI labels and ordering (the first instance should be clearly the origin). Test a script with no callbacks: the panel should say “No callbacks detected” or not appear for lower tiers. Check edge cases like callbacks within dialogue variations (e.g. a joke repeated with a twist – the system should ideally catch it if it’s clearly derived). Also, measure performance on longer scripts: scanning for callbacks could be costly if done naively – ensure the implementation perhaps pre-indexes unique joke signatures for efficiency. From a dev perspective, confirm the linking logic doesn’t produce false positives (e.g. common words causing unrelated lines to be marked as callbacks – might need stop-word filtering or a threshold).

## Optional

Relevant internals might include a text normalization function for jokes (to compare similarity) and perhaps a simple NLP component to detect paraphrased callbacks. There could be a developer tool to visualize the callback graph for debugging. If exposed, an API endpoint /analysis/:id/callbacks could return all callback groupings. Logging could be added to see which lines were considered a callback to which (useful during development to refine the matching algorithm).

