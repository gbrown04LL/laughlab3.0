# Laugh Lab Pro - Stage 6: Targeted Gap Punch-Ups

## Summary

Generates specific punch-up suggestions for the largest humor gaps identified in the script. For each significant comedic gap (especially the “retention cliff” and other top gaps from Stage 5), the system produces 2–4 tailored joke ideas or enhancements to insert, helping the writer fill those lulls with laughter. These suggestions aim to be context-aware (e.g. callbacks, character-specific humor) so they seamlessly elevate the scene’s comedy.

## Trigger / Function

Invoked by the analysis flow after Stage 5 (Gap Diagnosis) completes, typically via the orchestration pipeline (e.g. runStage(6) within analyzeScript). The backend function (e.g. generatePunchUpSuggestions) takes the gap analysis data and script context as input. It likely calls an LLM to create punch-up lines for each major gap, using the surrounding dialogue as context.

## Data Contract

Input: A list of identified comedy gaps from Stage 5 (with their line ranges, context snippets, and priority). Output: A structured set of punch-up suggestions for each gap. Each suggestion may include the gap identifier, the proposed new joke line(s), and metadata (e.g. humor type or complexity level if applicable). The suggestions are stored in the analysis results JSON under a gapPunchups section, keyed by gap, so the frontend can display them under the corresponding gap.

## UI Display

Rendered in the “Targeted Gap Punch-Ups” panel of the Results view. For each gap (often labeled Gap A, B, C or by scene/line range), the UI lists the punch-up ideas as bullet points or numbered suggestions. They may be presented as expandable examples under each gap description. The panel follows the existing styling for suggestions cards, ensuring each suggested joke is clearly distinguishable (possibly with an icon or highlighting for Advanced vs. High-complexity jokes). This panel is typically shown after the Gap Diagnosis graph, often collapsed by default to avoid overwhelming the user, with a prompt like “💡 3 Punch-Up Ideas Available”.

## QA / Validation Steps

To validate Stage 6, use a script with a known long humor gap. After analysis, confirm that the output JSON includes punch-up suggestions for that gap and that they appear in the UI under the correct gap label. Test that suggestions are contextually relevant (e.g. refer to characters or situations in the gap’s vicinity). Also verify edge cases: if no significant gaps are found, the stage should return an empty suggestions list or a friendly message (“No major gaps – no punch-ups needed!”) and the UI panel should handle that gracefully (e.g. hidden or showing a “no suggestions” note). Because this stage uses AI generation, also review suggestions for appropriateness and comedic value.

## Optional (Dev Notes)

This stage’s implementation may reuse the same LLM integration as the main feedback, but with a prompt specialized for punch-ups. The function might be throttled or stubbed in dev mode. Relevant endpoint: none if using single analysis API (the suggestions are part of the main JSON), otherwise an endpoint like /analysis/:id/punchups could trigger it. Developers can use DevTools to inspect the network response ensuring the gapPunchups data is present.

