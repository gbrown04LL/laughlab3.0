# Laugh Lab Pro - Stage 8: Character & Relationship Analytics

## Summary

Analyzes the script’s humor distribution across characters and the comedic dynamics between them. It identifies which characters are driving the comedy (e.g. jokes per character) and whether the humor is balanced or one-note. Additionally, it examines relationships or interactions – for instance, detecting comedic pairings or how characters’ interactions contribute to laughs. The goal is to ensure an ensemble comedy has diverse contributions and to flag if any character is underutilized humor-wise.

## Trigger / Function

Runs in the professional-tier analysis flow (triggered via runStage(8)) after the core script analysis. The implementation (e.g. analyzeCharacters) uses data extracted during parsing: notably the mapping of dialogue lines to characters and the jokes identified. It likely tallies metrics per character (lines spoken, jokes delivered, laughter score contribution) and might use an AI module to qualitatively assess character humor (e.g. identifying each character’s comedic voice or role). If relationship dynamics are analyzed, the function might look at dialogue exchanges to see if certain character pairs or groups generate humor together (e.g. a straight-man/funny-man duo pattern).

## Data Contract

Input: Structured script content annotated with speaker tags for each line, plus joke indicators from earlier stages. Output: Character-level comedy stats and insights. For each major character, data could include: totalLines, totalJokes, jokePercentage (percentage of their lines that are jokes), perhaps an humorScoreContribution. It might also include a ranking of characters by number of jokes. For relationship analysis, the output could list top character pairs (e.g. “Alice & Bob have 5 banter moments”) or note if any character is frequently the butt of jokes vs. the joker. This data is stored under a characterAnalysis node in the JSON.

## UI Display

Presented in the “Character & Relationship Analytics” panel. Likely this appears as a dedicated section of the results dashboard for pro/expert users. The UI might include a bar chart or list showing each character’s contribution to humor (e.g. a bar of how many laughs each character delivers). A textual summary could accompany it: e.g. “Character A carries most of the comedic weight with 40% of all jokes, while Character C has few comedic lines – consider giving them more funny moments.” If relationship insights are available, they might be shown as bullet points: “Alice and Bob form a strong comedic duo, appearing together in 30% of jokes. Meanwhile, Carol often sets up jokes that Dave delivers – a classic straight vs. comic dynamic.” The panel should match the project’s card style, possibly with sub-tabs or toggle between “By Character” and “By Relationship.”

## QA / Validation Steps

Use a sample script with multiple characters (e.g. a sitcom scene) where you know how jokes are divided. Verify the character stats match (if Character X has 3 jokes, ensure the output reflects that). Check that a character with zero jokes is handled properly (the UI might list them with 0 or omit them with a note). If possible, create a scenario where two characters frequently joke together and see if the system notes that pairing. Validation should also include ensuring minor characters (with very few lines) don’t skew the analysis or UI (they might be grouped as “Others” if needed). In terms of integration, confirm the data joins correctly with the script (character names exactly matching those in the script to aggregate counts). Edge case: monologue or stand-up style scripts (only one “character”) – the panel should gracefully handle a single-character scenario (likely simplifying to “all jokes by this character”).

## Optional

The implementation might rely on accurate dialogue tagging from preprocessing. If using a screenplay format, ensure the parser reliably captures character names. An endpoint like /analysis/:id/characters could fetch this data for external use (if provided). For developers, using sample JSON from this stage in DevTools ensures the front-end renders it correctly – e.g. check the array of characters and their joke counts in the console. If relationship analysis is more complex (like detecting comedic foils), that may be a stretch goal; the spec can note it as a future enhancement if not fully implemented initially.

