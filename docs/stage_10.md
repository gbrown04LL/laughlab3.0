# Laugh Lab Pro - Stage 10: Audience Simulation & Engagement

## Summary

Simulates an audience’s reaction throughout the script to gauge engagement levels, predicting where laughs peak and where attention might wane. This stage produces an engagement curve – essentially a timeline of the script marked with laughter intensity or engagement scores. It uses the distribution of jokes (and their estimated strength) to infer how a typical audience might respond, highlighting sustained laughter sequences or dull stretches. The outcome helps writers see the emotional rhythm of their script (e.g. steady chuckles vs. big laughs vs. lulls).

## Trigger / Function

Initiated as the final analysis step for professional users (runStage(10) in the pipeline). The function (e.g. simulateAudienceEngagement) likely aggregates data from prior stages: the timing of jokes (from pacing analysis), joke strength (from classification), and gap lengths. It may assign each segment of the script an engagement score. A simple approach: treat each joke as a spike whose magnitude is the joke’s complexity score (so bigger joke → higher spike) and whose duration effect lasts a few seconds. Then compute how close together spikes are (clusters of jokes = sustained engagement). More advanced: incorporate an LLM to “read” the script and rate each scene for entertainment, but that could be slow; likely it’s a rules-based simulation using the quantitative metrics.

## Data Contract

Input: Comprehensive metrics from earlier stages – especially the timeline of jokes (with timestamps or line indices) and their weighted scores. Output: An engagement profile dataset. For example, a time-series array where each entry corresponds to a position in the script (could be per minute or per scene) with an engagement level (0-10 or a percentage). It might also explicitly list “peak laugh moments” (highest predicted laughter points) and any identified “low engagement segments” beyond a threshold. This data would be included under audienceEngagement in the JSON, potentially as an array of {position, score} points and some summary values (e.g. average engagement, peak score at X). If an audience retention metric is calculated (like chance of audience drop-off at certain points), that could be part of the summary.

## UI Display

Displayed in the “Audience Engagement Simulation” panel (possibly titled “Audience Reaction”). The focal visualization could be a line graph (engagement curve) across the script timeline, where the x-axis is the script progress (pages or time) and the y-axis is predicted laughter/engagement level. Peaks on the graph indicate big laughs; valleys indicate lulls. The panel might highlight the top 1-3 “Peak Laughter Moments” (e.g. marked with stars on the graph and described: “Big laugh around page 30 when the wedding scene’s punchline hits”). Conversely, it could flag the longest low-engagement stretch (which might overlap with the retention cliff from Stage 5). If not a graph, a simpler UI is a timeline bar with segments colored by engagement (green = high laughs, yellow = moderate, red = low/dull). The panel’s text could read, for example: “Audience Engagement starts strong, dips slightly in the middle (around scene 5), then rises to a final big laugh at the end. The longest lull is ~1 minute with no laughs in the middle of Act II.” This gives writers a sense of pacing effectiveness.

## QA / Validation Steps

Since this stage builds on other metrics, use a well-understood script: e.g., feed a script with evenly spaced jokes vs. one with all jokes in the first half. Confirm that the engagement curve reflects those patterns (flat vs. front-loaded). If possible, cross-check the “peak moments” identified with known funny scenes in the script. Validate that the retention/dip identification aligns with Stage 5’s gap (they should at least not contradict – e.g., a retention cliff should correspond to a low point on this curve). Graphical output should be tested in the UI for different lengths of script (e.g. very short sketches vs. long screenplays) to ensure scaling is correct. On the backend, test the performance of computing the engagement array for large scripts (optimizing loop or vector operations if needed). One should also verify the algorithm with edge cases: a drama script with zero jokes should result in a flat near-zero engagement line (and the panel might even suggest “This seems to have little comedy” if applicable).

## Optional

If using a visualization library for the curve, ensure it’s consistent with the rest of the results graphs (e.g. reuse the same chart component as the laugh distribution graph if possible). There may not be a separate API endpoint for this (as it’s part of the main analysis), but developers can generate the engagement data by running the analysis in debug mode. If the logic gets complex, unit tests simulating sequences of laughs (e.g. an array of joke times and weights) can verify the calculated engagement output. Logging intermediate calculations (like total laughter per segment) might help debug any anomalies in the curve shape.

