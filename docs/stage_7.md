# Laugh Lab Pro - Stage 7: Joke Quality Check & Classification

## Summary

Evaluates each identified joke in the script for its quality and type, classifying jokes into tiers (e.g. Basic, Standard, Intermediate, Advanced, High-Complexity) and flagging those that are low-impact or could be improved. It acts as a “joke QA” stage – ensuring the comedy is not only frequent but also high-quality. The stage may suggest improvements for weaker jokes (e.g. “This punchline is fairly basic; consider adding a twist”).

## Trigger / Function

Executed after initial metrics and punch-ups, via the pipeline (e.g. runStage(7)). The function (possibly analyzeJokeQuality or part of analyzeScript) uses the list of jokes detected in earlier stages. It might re-use the classification from Stage 1’s detection (which already tags joke complexity) and/or call an AI to double-check humor effectiveness. Essentially, it cross-verifies each joke’s score and category. If any joke falls below a certain quality threshold (e.g. marked “Basic”), the system can flag it for punch-up.

## Data Contract

Input: A list of all jokes or punchlines identified (with their text, line number, and initial complexity rating from earlier analysis). Output: An enriched list of jokes with a “quality” classification and optional comments. For each joke, the output might include fields like classificationTier (Basic/Standard/…/High), a boolean flaggedForImprovement if low-tier, and an optional improvementSuggestion text. This data is appended to the analysis JSON under a jokeQuality or similar node, and may also update overall metrics (e.g. count of jokes by tier).

## UI Display

Shown in the “Joke Quality & Classification” panel in the results UI (name following conventions). This panel could list jokes or summarize quality distribution. For example, it might show a small table or list: each joke (or a snippet of it) with a badge indicating its classification (e.g. a color-coded tag for Basic, Advanced, etc.), and an icon or warning for those flagged as weak. Hovering or expanding a flagged joke could reveal the suggested improvement (“Try a misdirection here to elevate this joke”). Alternatively, the UI might present aggregate info: e.g. “Jokes by Quality: 2 Basic, 5 Intermediate, 3 Advanced, 1 High – some basic jokes detected; consider refining them.” The naming and design mirror existing components (likely an extension of the joke detection panel).

## QA / Validation Steps

Test with scripts containing a mix of joke types: e.g. one script with very obvious simple jokes, another with complex layered jokes. Verify that Stage 7 correctly classifies each (matching known categories). Check that the counts of each tier match expectations and that any suggestions to improve are sensible (not appearing for already high-tier jokes). If a joke is misidentified (false positive/negative), ensure the system’s fallback might be to not flag it too aggressively (to avoid noise). From a developer standpoint, ensure that adding this stage’s data doesn’t break the JSON contract for earlier stages. Also, toggling this stage off (for lower-tier users) should hide the panel entirely.

## Optional

Endpoints/DevTools: In a single-API architecture, this stage’s logic is internal. If separately accessible, an endpoint like /analysis/:id/jokes might return the joke list with classifications. DevTools: use the browser console to inspect the jokeQuality data structure in the global state after analysis. Also consider adding unit tests for the classification logic (feeding known jokes lines to ensure they map to expected tiers). Prompt tuning for the AI (if used) can be validated by checking a sample of AI outputs for edge cases (e.g. sarcasm detection).

