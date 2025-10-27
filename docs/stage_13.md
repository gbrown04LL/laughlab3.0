# Laugh Lab Pro - Stage 13: Brainstorm Board

## Summary

Offers an interactive “whiteboard” for idea brainstorming, where collaborators (and the AI, optionally) can post sticky-note style ideas, jokes, or references that aren’t part of the script yet. This is essentially a visual mode in the chat sidebar that collects creative ideas: users can throw out wild concepts or alternate jokes on virtual index cards. It helps teams organize and save potential material without immediately editing the script, mimicking a writers’ room pinboard.

## Trigger / Function

Toggled by users from the chat interface (e.g. clicking a “Brainstorm Board” tab or button in the collaboration sidebar). When activated, the system switches the collaboration sidebar into board mode. The same backend supporting the chat likely handles board items, or a dedicated service (e.g. BoardManager). Functions include addBrainstormItem(sessionId, user, content, type) to post a new idea and possibly moveBrainstormItem(itemId, newOrder/position) if reordering or categorizing is allowed. These board events, like chat, are broadcast to all users so the board stays in sync. The board items are likely stored similarly to chat messages (in-memory plus DB save), but as separate entities with possible attributes (like an ID, text, maybe a category or an image URL if images are allowed).

## Data Contract

Input: New idea posts containing content (text or maybe link/image) and optional metadata (e.g. a tag like “character idea” or an association to a script line if dragged from script). Move or delete events are also inputs if the board allows rearranging or removing ideas. Output: The current set of brainstorm notes in the session. This could be represented as an array of objects each with id, author, content, timestamp, (x,y) position or order, type. If the board is purely list-based (e.g. just a column of sticky notes), position might not be needed. If it’s more free-form (drag anywhere), coordinates or a grid placement is output. The data is not part of the main script analysis but is part of session state. The board persists through the session (and possibly can be saved for later reference).

## UI Display

In the collaboration sidebar, when switched to Brainstorm Board mode, the UI might show a grid or canvas where each idea is a card (a colored sticky note element). Users can add a new idea by typing in an input (similar to chat but it creates a note), or by clicking a “+” button. Each idea card displays the content and possibly the author’s name or initials. Users (or only the author) might drag cards around to cluster related ideas – for example, grouping joke ideas by scene or by character. The interface could also allow converting a brainstorm idea into script text: e.g. dragging a note onto the script editor to insert that idea at a particular point. This stage’s UI focuses on visualization and ease of reordering ideas. It should feel playful and creative (like a corkboard or mind-map). The board also likely has a “Back to Chat” toggle to return to normal chat mode.

## QA / Validation Steps

Collaborative testing is key: ensure that when one user posts an idea, it appears on all screens in the same position/order. If the board allows reordering or dragging, test that moving a note on one client updates it for others (and that no ghost duplicates or desync occur). Check adding various content types: text length limits (a very long idea might need truncation or a bigger card), maybe image support if any (an image could be displayed as a thumbnail on a card). Test the transition between chat and board views: nothing should be lost or duplicated when switching modes. If dragging a note into the script is supported, try it and confirm the note’s text inserts into the script editor for all users and possibly marks the note as resolved or used. Also, ensure that brainstorming ideas persist for the session – if everyone leaves and comes back (or refreshes), the ideas should still be there (assuming we save them on the server). On the backend, monitor that the board’s data structure doesn’t bloat with too many items or cause performance issues with lots of moves.

## Optional

The brainstorm board might later integrate AI assistance – e.g. an “Inspire Me” button that asks the AI to post a random joke idea to the board. If such features exist, validate their integration (AI ideas should be clearly marked and reasonably relevant). Dev-wise, if a library or framework is used for a drag-and-drop board (like a React DnD or similar), ensure it works well with concurrent updates from other users (which can be tricky). It might be prudent to lock position editing to one user at a time or simply use a sorted list model to avoid coordinate conflicts. Logging board events (like creation, movement) to the console can help debug synchronization.

