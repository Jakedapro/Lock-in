/* ===== Lock In — Year 8 English: Animal Farm (Assessment Task 4) =====
   Plot and characters, themes, techniques, and short answers and PETAL paragraphs for
   George Orwell's Animal Farm, plus a general techniques toolkit. Quotations from the novel are
   kept short and checked against the text; everything else (notes, questions, model answers)
   is original. Formatter note: no asterisks or dollar signs in this file's strings. */

const EN = (() => {
  const T = typeof TK !== 'undefined' ? TK : require('./texkit.js');
  const { pick, shuffle, CH, finish } = T;
  const SUBJECT = 'eng', HUE = 'pink';

  // Pool helpers: Q() describes one multiple-choice item; ask() picks an item at the requested
  // level (falling back to any level) and returns a question whose level matches the item used.
  const Q = (L, tag, q, right, wrongs, why, extra = {}) => ({ L, tag, q, right, wrongs, why, ...extra });
  const forLevel = (items, level) => { const m = items.filter(i => i.L === level); return pick(m.length ? m : items); };
  const toQuestion = (it) => {
    const q = { level: it.L, tags: [it.tag], stem: it.stem || '', parts: [CH('', it.q, it.right, it.wrongs, [it.why])] };
    if (it.passage) q.passage = it.passage;
    return q;
  };
  const ask = (items, level) => toQuestion(forLevel(items, level));

  /* ================= TECHNIQUES TOOLKIT ================= */
  // [section, term, definition, typical effect, level]
  const DEFS = [
    ['T1', 'Alliteration', 'The same consonant sound repeated at the start of words that sit close together.', 'Draws attention to a phrase and makes it memorable; hard sounds feel forceful, soft sounds feel gentle.', 'F'],
    ['T1', 'Assonance', 'Repeated vowel sounds inside nearby words.', 'Creates an internal music; long vowels slow a line and can make it mournful or dreamy.', 'S'],
    ['T1', 'Sibilance', 'Repeated hissing s, sh and soft c sounds.', 'Can feel hushed and soothing, or sly and sinister, depending on context.', 'S'],
    ['T1', 'Onomatopoeia', 'A word that imitates the sound it names, such as crash, murmur or buzz.', 'Makes a scene vivid and immediate by letting the reader hear it.', 'F'],
    ['T1', 'Rhyme', 'Matching end sounds between words, often at the ends of lines.', 'Creates unity and musicality; a broken rhyme pattern can signal disruption.', 'F'],
    ['T1', 'Rhythm and meter', 'The pattern of stressed and unstressed syllables in a line.', 'A steady beat can feel controlled or ritual; an irregular beat can mirror speech, tension or chaos.', 'S'],
    ['T1', 'Cacophony', 'Harsh, clashing combinations of sounds.', 'Reflects conflict, violence or discomfort.', 'S'],
    ['T1', 'Euphony', 'Smooth, pleasing combinations of sounds.', 'Creates calm, beauty or harmony.', 'S'],
    ['T2', 'Simile', 'A comparison between two different things using like or as.', 'Helps the reader grasp an idea through a familiar image while keeping the two things separate.', 'F'],
    ['T2', 'Metaphor', 'A direct comparison that says one thing is another.', 'Transfers qualities from one thing to another more forcefully than a simile.', 'F'],
    ['T2', 'Extended metaphor', 'A single comparison developed across several lines, a passage or a whole text.', 'Builds a layered idea and gives the text unity.', 'S'],
    ['T2', 'Personification', 'Giving human qualities or actions to something non-human.', 'Brings settings and objects to life and can reflect characters’ feelings.', 'F'],
    ['T2', 'Symbolism', 'An object, colour, place or action that stands for a larger idea.', 'Adds layers of meaning beyond the literal.', 'F'],
    ['T2', 'Motif', 'An image, object or idea that keeps recurring through a text.', 'Reinforces a theme and connects different parts of the text.', 'S'],
    ['T2', 'Hyperbole', 'Deliberate exaggeration.', 'Emphasises emotion or creates humour.', 'F'],
    ['T2', 'Pathetic fallacy', 'Weather or nature that mirrors human emotions.', 'Sets the mood and turns characters’ inner states into something visible.', 'S'],
    ['T2', 'Synecdoche', 'A part used to stand for the whole, or the whole for a part (hands for workers).', 'Focuses on a telling detail; can reduce people to their function.', 'S'],
    ['T2', 'Metonymy', 'Referring to something by a closely associated thing (the Crown for the monarchy).', 'Compresses an idea and links it to an institution, power or association.', 'S'],
    ['T3', 'Juxtaposition', 'Placing two contrasting ideas, images or characters side by side.', 'Highlights difference and sharpens meaning through contrast.', 'F'],
    ['T3', 'Cyclical structure', 'A text that ends where it began, echoing its opening.', 'Suggests entrapment or inevitability, or shows how a character has changed against an unchanged backdrop.', 'S'],
    ['T3', 'Enjambment', 'A sentence that runs over the end of a line of poetry with no punctuation.', 'Creates momentum or breathlessness, and stresses the word that starts the next line.', 'S'],
    ['T3', 'Caesura', 'A strong pause in the middle of a line, usually marked by punctuation.', 'Interrupts the flow, creating hesitation, emphasis or shock.', 'S'],
    ['T3', 'Volta', 'A turn in a poem’s thought, tone or argument.', 'Signals a change in perspective, often where the poem’s key insight sits.', 'S'],
    ['T3', 'Fragmented structure', 'A text broken into disjointed pieces, gaps or non-linear sections.', 'Mirrors confusion, trauma, or fractured memory and identity.', 'S'],
    ['T3', 'Foreshadowing', 'Hints early in a text about what will happen later.', 'Builds suspense and makes the outcome feel inevitable.', 'F'],
    ['T3', 'Flashback', 'A shift back to an earlier time.', 'Reveals backstory and shows how the past shapes the present.', 'F'],
    ['T3', 'In medias res', 'Opening in the middle of the action, without setup.', 'Hooks the reader immediately and creates urgency.', 'S'],
    ['T4', 'Rhetorical question', 'A question asked for effect, not to get an answer.', 'Engages the audience and positions them to agree with the speaker.', 'F'],
    ['T4', 'Anaphora', 'Repeating a word or phrase at the start of successive clauses or sentences.', 'Builds rhythm, emphasis and emotional momentum.', 'S'],
    ['T4', 'Tricolon', 'A group of three words, phrases or clauses, often building to a climax.', 'Feels complete and persuasive, and is easy to remember.', 'S'],
    ['T4', 'Imperative', 'A command, usually beginning with a verb.', 'Creates urgency and directly calls the audience to act.', 'F'],
    ['T4', 'High modality', 'Words that express certainty or obligation, such as must, will and certainly.', 'Conveys confidence and authority (low modality, such as might or perhaps, suggests doubt or caution).', 'F'],
    ['T4', 'Emotive language', 'Words chosen to stir strong feelings.', 'Provokes sympathy, outrage or fear in order to persuade.', 'F'],
    ['T4', 'Verbal irony', 'Saying the opposite of what you mean.', 'Creates humour or sarcasm, or a quiet criticism.', 'S'],
    ['T4', 'Situational irony', 'An outcome that is the opposite of what was expected.', 'Surprises the audience and often exposes an absurdity or deeper truth.', 'S'],
    ['T4', 'Dramatic irony', 'When the audience knows something that a character does not.', 'Builds tension and sympathy as we watch the character act without that knowledge.', 'S'],
    ['T4', 'Paradox', 'A statement or situation that seems self-contradictory but reveals a truth.', 'Makes the reader think harder about a complex idea.', 'S'],
    ['T4', 'Oxymoron', 'Two contradictory words placed side by side, such as cruel kindness.', 'Captures mixed or conflicting emotions in a compact phrase.', 'S'],
    ['T4', 'Allusion', 'A reference to a well-known story, event, person or text.', 'Adds meaning by drawing on what the reader already knows.', 'S'],
    ['T4', 'Colloquial language', 'Informal, everyday or slang expressions.', 'Creates familiarity and an authentic voice tied to a place or group.', 'F'],
    ['T4', 'Formal register', 'Precise, impersonal and elevated language.', 'Creates authority and distance.', 'S'],
    ['T4', 'Sentence fragments', 'Deliberately incomplete sentences.', 'Create emphasis or tension, or suggest broken, racing thought.', 'S'],
    ['T5', 'First-person narration', 'A story told by a character using I.', 'Gives intimate access to one perspective, which is limited and may be biased.', 'F'],
    ['T5', 'Third-person omniscient narration', 'An all-knowing narrator outside the story who can enter many characters’ minds.', 'Gives a broad view and can create dramatic irony.', 'F'],
    ['T5', 'Third-person limited narration', 'A narrator outside the story who follows one character’s perceptions closely.', 'Creates closeness to one character while keeping some distance.', 'S'],
    ['T5', 'Unreliable narrator', 'A narrator whose account cannot be fully trusted.', 'Makes the reader question events and read between the lines.', 'S'],
    ['T5', 'Stream of consciousness', 'An unbroken flow of a character’s thoughts, often loosely punctuated and jumping by association.', 'Imitates the messy, restless movement of the mind.', 'S'],
    ['T5', 'Free indirect discourse', 'Third-person narration that slips into a character’s own voice and thoughts without quotation marks.', 'Blends narrator and character, creating intimacy and often irony.', 'S'],
    ['T5', 'Dialogue', 'Characters’ direct speech.', 'Reveals personality and relationships and moves the plot forward.', 'F'],
    ['T5', 'Characterisation', 'How a composer builds a character through actions, speech, appearance, thoughts and others’ reactions.', 'Shapes the reader’s judgement of and sympathy for the character.', 'F'],
    ['T5', 'Setting', 'The time and place in which a text happens.', 'Establishes mood and context, and can symbolise a character’s situation.', 'F'],
    ['T6', 'High camera angle', 'The camera looks down on the subject.', 'Makes the subject seem small, weak or vulnerable.', 'F'],
    ['T6', 'Low camera angle', 'The camera looks up at the subject.', 'Makes the subject seem powerful, threatening or heroic.', 'F'],
    ['T6', 'Close-up', 'A tight shot of a face or object.', 'Reveals emotion or marks something as important.', 'F'],
    ['T6', 'Long shot', 'A shot showing a whole figure within a wide setting.', 'Establishes context, and can make a figure seem isolated or insignificant.', 'F'],
    ['T6', 'High-key lighting', 'Bright, even light with few shadows.', 'Feels open, safe or optimistic.', 'S'],
    ['T6', 'Low-key lighting', 'Strong contrast with deep shadows.', 'Creates mystery, menace or moral ambiguity.', 'S'],
    ['T6', 'Colour', 'The composer’s choice of hues, saturation and contrast.', 'Builds mood and symbolism, such as warm tones for comfort or memory and cold tones for isolation.', 'F'],
    ['T6', 'Diegetic sound', 'Sound that exists inside the world of the scene, such as dialogue or a radio playing.', 'Builds realism and immersion.', 'S'],
    ['T6', 'Non-diegetic sound', 'Sound added for the audience that the characters cannot hear, such as a score or voice-over.', 'Guides the audience’s emotional response.', 'S'],
    ['T6', 'Salience', 'The element of an image that draws the eye first, through size, colour, light or position.', 'Shows what the composer wants to foreground.', 'S'],
    ['T6', 'Vectors', 'Real or implied lines, such as a gaze, a road or a pointing arm, that lead the eye.', 'Directs attention and creates relationships between parts of the image.', 'S'],
    ['T6', 'Framing', 'How elements are placed within the frame, or framed by things inside the scene such as doorways and windows.', 'Can suggest focus, entrapment or isolation.', 'S'],
    ['T6', 'Gaze', 'Where a figure is looking: at the viewer (a demand) or away from them (an offer).', 'A demand creates connection or confrontation; an offer invites the viewer to observe.', 'S'],
  ];
  const noteOf = (d) => `${d[1]}: ${d[2]} Effect: ${d[3]}`;
  const techNotes = (code) => DEFS.filter(d => d[0] === code).map(noteOf);

  // [level, section, example line (all original), technique, three wrong answers that are clearly absent]
  const SPOT = [
    ['F', 'T1', 'The kettle hissed, the toaster popped, and the dog went thud against the back door.', 'Onomatopoeia', ['Simile', 'Anaphora', 'Volta']],
    ['F', 'T1', 'Big brown bears bounded briskly through the bush.', 'Alliteration', ['Onomatopoeia', 'Oxymoron', 'Flashback']],
    ['S', 'T1', 'The slow sea sighed and slid across the silent sand.', 'Sibilance', ['Cacophony', 'Metonymy', 'Caesura']],
    ['S', 'T1', 'Cold stone, old bones, alone at the close of the road.', 'Assonance', ['Onomatopoeia', 'Synecdoche', 'In medias res']],
    ['S', 'T1', 'Crack and grind: the gears clanked, grated, jagged and broken.', 'Cacophony', ['Euphony', 'Free indirect discourse', 'Volta']],
    ['F', 'T1', 'The cat that sat upon the mat\nwas wearing someone else’s hat.', 'Rhyme', ['Hyperbole', 'Flashback', 'Metonymy']],
    ['S', 'T1', 'Soft light, low hum, the lull of the evening’s mellow murmur.', 'Euphony', ['Cacophony', 'Juxtaposition', 'Rhetorical question']],
    ['S', 'T1', 'I walk the road, I climb the hill,\nI hold my breath and wait until\nthe morning comes.', 'Rhythm and meter', ['Sibilance', 'Oxymoron', 'Pathetic fallacy']],
    ['F', 'T2', 'Her smile was like the first warm day of spring.', 'Simile', ['Metaphor', 'Onomatopoeia', 'Caesura']],
    ['F', 'T2', 'By the time the bell rang, the classroom was a zoo.', 'Metaphor', ['Simile', 'Personification', 'Rhyme']],
    ['F', 'T2', 'The old house groaned and sighed as the wind pushed at its windows.', 'Personification', ['Simile', 'Synecdoche', 'Anaphora']],
    ['F', 'T2', 'I have told you a million times to shut the gate.', 'Hyperbole', ['Metaphor', 'Oxymoron', 'Simile']],
    ['S', 'T2', 'As the family argued in the kitchen, thunder rolled across the darkening sky.', 'Pathetic fallacy', ['Simile', 'Synecdoche', 'Onomatopoeia']],
    ['S', 'T2', 'The captain shouted for all hands on deck before the storm hit.', 'Synecdoche', ['Metonymy', 'Simile', 'Hyperbole']],
    ['S', 'T2', 'The Crown has announced an extra public holiday.', 'Metonymy', ['Synecdoche', 'Simile', 'Hyperbole']],
    ['S', 'T2', 'Each morning she passed the empty birdcage on the porch, its little door still hanging open.', 'Symbolism', ['Simile', 'Onomatopoeia', 'Oxymoron']],
    ['C', 'T2', 'Grief was a tide: it pulled back for days, then came roaring over the sandbags she had built, soaking every room of her.', 'Extended metaphor', ['Simile', 'Synecdoche', 'Pathetic fallacy']],
    ['S', 'T2', 'Clocks appear in the opening scene, on the hospital wall in chapter four, and in the novel’s final image.', 'Motif', ['Simile', 'Hyperbole', 'Caesura']],
    ['F', 'T3', 'In the glittering ballroom, a barefoot child pressed her face against the window.', 'Juxtaposition', ['Onomatopoeia', 'Rhyme', 'Rhetorical question']],
    ['S', 'T3', 'The river runs beneath the bridge\nand does not stop to ask\nwho stands above it in the rain.', 'Enjambment', ['Caesura', 'Rhyme', 'Cacophony']],
    ['S', 'T3', 'She turned to speak. And then the line went dead.', 'Caesura', ['Enjambment', 'Rhyme', 'Synecdoche']],
    ['C', 'T3', 'Eight lines of a sonnet praise the summer; the ninth begins, “But all of this was before the letter came.”', 'Volta', ['Caesura', 'Onomatopoeia', 'Metonymy']],
    ['F', 'T3', 'The novel opens and closes with the same image: a girl waiting alone at a bus stop in the rain.', 'Cyclical structure', ['In medias res', 'Onomatopoeia', 'Hyperbole']],
    ['S', 'T3', 'Before he left, he checked the brakes twice, though the mechanic swore they would hold for one more trip.', 'Foreshadowing', ['Flashback', 'Cyclical structure', 'Synecdoche']],
    ['F', 'T3', 'Suddenly she was seven again, standing in her grandmother’s kitchen as the scones came out of the oven.', 'Flashback', ['Foreshadowing', 'In medias res', 'Onomatopoeia']],
    ['F', 'T3', 'The story’s first line: “By the time the second car exploded, Mara was already running.”', 'In medias res', ['Flashback', 'Cyclical structure', 'Rhyme']],
    ['C', 'T3', 'The poem is scattered across the page in half-sentences and gaps, jumping between a hospital room, a beach and a childhood bedroom.', 'Fragmented structure', ['Cyclical structure', 'Rhyme', 'Anaphora']],
    ['F', 'T4', 'How much longer will we step over the people sleeping in our doorways?', 'Rhetorical question', ['Imperative', 'Anaphora', 'Simile']],
    ['F', 'T4', 'We will rebuild. We will remember. We will rise.', 'Anaphora', ['Rhetorical question', 'Oxymoron', 'Simile']],
    ['F', 'T4', 'Act now. Sign the petition. Tell your friends.', 'Imperative', ['Rhetorical question', 'Simile', 'Flashback']],
    ['S', 'T4', 'After the verdict, a deafening silence filled the courtroom.', 'Oxymoron', ['Paradox', 'Simile', 'Anaphora']],
    ['S', 'T4', 'The more I learn, the less I seem to know.', 'Paradox', ['Oxymoron', 'Simile', 'Onomatopoeia']],
    ['S', 'T4', 'The fire station burned down on Tuesday night.', 'Situational irony', ['Dramatic irony', 'Verbal irony', 'Metaphor']],
    ['S', 'T4', 'Stepping into the downpour, he muttered, “Lovely weather for a picnic.”', 'Verbal irony', ['Situational irony', 'Dramatic irony', 'Oxymoron']],
    ['C', 'T4', 'The audience has watched the villain poison the cup; the hero smiles and raises it to toast his friend.', 'Dramatic irony', ['Situational irony', 'Verbal irony', 'Flashback']],
    ['S', 'T4', 'After that exam, she knew she had met her Waterloo.', 'Allusion', ['Metonymy', 'Oxymoron', 'Onomatopoeia']],
    ['F', 'T4', 'Innocent, frightened children are being torn from their families.', 'Emotive language', ['Rhyme', 'Flashback', 'Oxymoron']],
    ['S', 'T4', 'We must act, and we will not fail.', 'High modality', ['Rhetorical question', 'Oxymoron', 'Synecdoche']],
    ['F', 'T4', 'The journey was long, cold and lonely.', 'Tricolon', ['Anaphora', 'Simile', 'Flashback']],
    ['F', 'T4', 'Mate, the footy last night was a total shocker.', 'Colloquial language', ['Formal register', 'Allusion', 'Oxymoron']],
    ['S', 'T4', 'Silence. Then footsteps. Closer.', 'Sentence fragments', ['Rhetorical question', 'Simile', 'Allusion']],
    ['F', 'T5', 'I never meant to lie to Dad; I just could not find the right moment to tell him.', 'First-person narration', ['Third-person omniscient narration', 'Pathetic fallacy', 'Onomatopoeia']],
    ['S', 'T5', 'Sarah believed the house was empty; upstairs, unaware of her, her brother was packing to leave for good.', 'Third-person omniscient narration', ['First-person narration', 'Stream of consciousness', 'Onomatopoeia']],
    ['C', 'T5', '“I am the calmest person you will ever meet,” he wrote, on the night he smashed every plate in the kitchen.', 'Unreliable narrator', ['Third-person omniscient narration', 'Pathetic fallacy', 'Synecdoche']],
    ['S', 'T5', 'milk bread the bill is it Tuesday already why did she look at me like that the bus the bus is late again', 'Stream of consciousness', ['Free indirect discourse', 'Tricolon', 'Rhyme']],
    ['C', 'T5', 'Emma folded the letter. Well, so what if he never wrote again? She had far better things to do on a Saturday.', 'Free indirect discourse', ['Stream of consciousness', 'First-person narration', 'Dramatic irony']],
    ['S', 'T5', 'Without a word, Tom gave his only jacket to the shivering stranger on the platform.', 'Characterisation', ['Pathetic fallacy', 'Flashback', 'Oxymoron']],
    ['F', 'T5', 'The town sat at the end of a dirt road, red dust on every windowsill, the nearest hospital three hours away.', 'Setting', ['Onomatopoeia', 'Rhetorical question', 'Oxymoron']],
    ['F', 'T5', '“You’re late,” she said.\n“I know,” he replied, not looking up.', 'Dialogue', ['Stream of consciousness', 'Simile', 'Rhyme']],
    ['F', 'T6', 'The camera looks down on the boy from above, so he seems tiny in the empty schoolyard.', 'High camera angle', ['Low camera angle', 'Close-up', 'Non-diegetic sound']],
    ['F', 'T6', 'The camera looks up at the chief executive from below as she stands at the top of the stairs.', 'Low camera angle', ['High camera angle', 'Diegetic sound', 'Flashback']],
    ['F', 'T6', 'The whole frame is filled by a single tear running down the soldier’s face.', 'Close-up', ['Long shot', 'High camera angle', 'Non-diegetic sound']],
    ['S', 'T6', 'A tiny figure crosses a vast desert that fills the entire frame.', 'Long shot', ['Close-up', 'Low camera angle', 'Diegetic sound']],
    ['S', 'T6', 'Slow violin music swells as the family drives away, though no one in the scene is playing it.', 'Non-diegetic sound', ['Diegetic sound', 'Onomatopoeia', 'Close-up']],
    ['S', 'T6', 'We hear the car radio reading the news as the character drives through the night.', 'Diegetic sound', ['Non-diegetic sound', 'Close-up', 'Vectors']],
    ['S', 'T6', 'In the poster, a bright red umbrella is the first thing the eye lands on in a crowd of grey coats.', 'Salience', ['Vectors', 'Diegetic sound', 'Long shot']],
    ['C', 'T6', 'Every figure in the painting is pointing or looking towards the open door on the right.', 'Vectors', ['Salience', 'Low-key lighting', 'Low camera angle']],
    ['C', 'T6', 'The girl is shown through the bars of a stair railing, as if she were caged.', 'Framing', ['Vectors', 'Salience', 'Diegetic sound']],
    ['S', 'T6', 'Hard shadows hide half of the detective’s face as he lies to his partner.', 'Low-key lighting', ['High-key lighting', 'Diegetic sound', 'Long shot']],
    ['S', 'T6', 'The flashback scenes are washed in warm gold, while the present-day scenes are cold blue and grey.', 'Colour', ['Diegetic sound', 'Low camera angle', 'Vectors']],
  ];
  // Effect questions: [section, line, question, best effect, three weaker readings]
  const EFFECTS = [
    ['T1', 'The ward was silent except for the slow beep, beep, beep of the heart monitor.', 'What is the main effect of the repeated “beep”?', 'It slows the pace and builds tension, so the reader waits anxiously with the characters.', ['It creates a cheerful, playful mood through rhyme.', 'It shows that the narrator is unreliable.', 'It signals a flashback to an earlier time.']],
    ['T3', 'In the glittering ballroom, a barefoot child pressed her face against the window.', 'Which effect best describes the juxtaposition?', 'It exposes the gap between wealth and poverty, inviting sympathy for the child left outside.', ['It suggests the child is about to be welcomed into the party.', 'It creates a comic tone that celebrates the guests.', 'It slows the rhythm to imitate a dance.']],
    ['T2', 'Grief was a tide: it pulled back for days, then came roaring over the sandbags she had built, soaking every room of her.', 'Which effect best describes this extended metaphor?', 'It presents grief as cyclical and overwhelming, retreating and returning with a force she cannot hold back.', ['It suggests she has fully recovered from her loss.', 'It describes a literal flood that damaged her house.', 'It presents grief as small and easily contained.']],
    ['T4', 'We will rebuild. We will remember. We will rise.', 'Which effect best describes the anaphora?', 'The repetition builds momentum and collective determination, uniting the audience behind the speaker.', ['It creates doubt about whether recovery is possible.', 'It shifts the speech into a private, casual register.', 'It adds humour to lighten a serious moment.']],
    ['T4', 'Silence. Then footsteps. Closer.', 'Which effect best describes the sentence fragments?', 'The clipped fragments build suspense, imitating a held breath as danger approaches.', ['They create a relaxed, conversational tone.', 'They prove the narrator is lying.', 'They slow the moment with long, flowing description.']],
    ['T6', 'The camera looks up at the chief executive from below as she stands at the top of the stairs.', 'Which effect best describes this camera angle?', 'It makes her seem powerful and dominant, placing the viewer beneath her.', ['It makes her seem vulnerable and small.', 'It reveals that she is lying.', 'It signals a flashback.']],
    ['T4', 'After the verdict, a deafening silence filled the courtroom.', 'Which effect best describes the oxymoron?', 'It suggests the silence is so heavy with shock that it feels overwhelming, almost physical.', ['It suggests the courtroom was actually very noisy.', 'It shows the crowd was relaxed and relieved.', 'It creates a light, cheerful tone.']],
    ['T2', 'As the family argued in the kitchen, thunder rolled across the darkening sky.', 'Which effect best describes the pathetic fallacy?', 'The storm mirrors and magnifies the conflict, making the tension feel larger than the room.', ['It suggests the argument will end peacefully.', 'It provides comic relief from the argument.', 'It shows the family is happily unaware of the weather.']],
    ['T5', '“I am the calmest person you will ever meet,” he wrote, on the night he smashed every plate in the kitchen.', 'Which effect best describes this narration?', 'The gap between his claim and his actions makes the reader distrust him and read his account critically.', ['It confirms that he is calm and trustworthy.', 'It establishes a peaceful domestic setting.', 'It shows the narrator knows every character’s thoughts.']],
    ['T4', 'How much longer will we step over the people sleeping in our doorways?', 'Which effect best describes the rhetorical question?', 'It challenges the audience to confront their own inaction, positioning them to feel responsible.', ['It asks the audience for a specific number of years.', 'It shows the speaker is unsure of the argument.', 'It creates a light-hearted, humorous tone.']],
    ['T5', 'Emma folded the letter. Well, so what if he never wrote again? She had far better things to do on a Saturday.', 'Which effect best describes the narrative voice?', 'It blends the narrator with Emma’s own defensive voice, revealing hurt beneath her dismissive tone.', ['It shows Emma is genuinely happy and unbothered.', 'It presents an all-knowing narrator condemning Emma as cruel.', 'It signals a flashback to Emma’s childhood.']],
    ['T2', 'Each morning she passed the empty birdcage on the porch, its little door still hanging open.', 'What does the birdcage most likely suggest?', 'It symbolises loss or absence: something, or someone, is gone and has not returned.', ['She is planning to buy a new bird.', 'It establishes a comic tone.', 'It is a literal detail with no further meaning.']],
  ];

  const tech = finish({
    id: 'engtech', subject: SUBJECT, title: 'Techniques toolkit', chapter: 'English · Skills', hue: HUE,
    blurb: 'Sound, imagery, structure, language, narrative and film techniques, and what each one does to meaning.',
    sections: [
      { code: 'T1', name: 'Sound', notes: techNotes('T1') },
      { code: 'T2', name: 'Imagery and figurative language', notes: techNotes('T2') },
      { code: 'T3', name: 'Structure and form', notes: techNotes('T3') },
      { code: 'T4', name: 'Language and syntax', notes: techNotes('T4') },
      { code: 'T5', name: 'Narrative and perspective', notes: techNotes('T5') },
      { code: 'T6', name: 'Film and visual', notes: techNotes('T6'), ex: ['Analysing a shot: a low-angle shot of a coach shouting at his team', 'Technique: low camera angle, so we look up at him.', 'Evidence: he towers over the frame, blocking the stadium lights.', 'Effect: he seems dominant and intimidating, positioning us to share the players’ fear of him.'] },
    ],
    cards: [
      ...DEFS.map(d => [d[1], `${d[2]} ${d[3]}`]),
      ['Technique, evidence, effect', 'Every time you name a technique, quote or describe the example, then explain what it does to meaning.'],
      ['Feature-spotting', 'Listing techniques without explaining effect. It earns very few marks.'],
      ['Simile or metaphor?', 'A simile compares using like or as; a metaphor says one thing is the other.'],
      ['Oxymoron or paradox?', 'An oxymoron is two clashing words side by side; a paradox is a whole statement or situation that seems contradictory but holds a truth.'],
    ],
    concepts: [
      ['Which line uses a metaphor?', ['The city was like a sleeping animal.', 'The city was a beast that never slept.', 'The city glowed as bright as day.', 'The city was very quiet.'], 1, 'A metaphor says one thing is another, without like or as.'],
      ['A sentence in a poem runs on to the next line with no punctuation. This is…', ['Caesura', 'Volta', 'Enjambment', 'Assonance'], 2, 'Enjambment carries the sentence over the line break.'],
      ['Music that the characters in a film cannot hear is…', ['Non-diegetic sound', 'Diegetic sound', 'Dialogue', 'Ambient sound'], 0, 'Non-diegetic sound sits outside the story world.'],
      ['The most useful way to write about a technique is to…', ['List as many techniques as you can', 'Name it, quote it, and explain its effect on meaning', 'Retell the plot, then name a technique', 'Define the technique in detail'], 1, 'Markers reward the effect, not the label.'],
      ['Which is an oxymoron?', ['The more you give, the more you have', 'The wind whispered', 'Cruel kindness', 'As quiet as a mouse'], 2, 'Two contradictory words side by side.'],
      ['Weather that mirrors a character’s emotions is…', ['Pathetic fallacy', 'Personification', 'Synecdoche', 'Hyperbole'], 0, ''],
      ['A low camera angle usually makes the subject seem…', ['Weak', 'Powerful or threatening', 'Distant', 'Unimportant'], 1, 'We look up at them.'],
      ['A locked gate that appears again and again across a novel is best called a…', ['Simile', 'Caesura', 'Metonymy', 'Motif'], 3, 'A motif recurs through a text.'],
      ['Which situation is dramatic irony?', ['The audience knows a letter is forged, but the character believes it', 'A lifeguard drowns', 'A character says “Great” after bad news', 'A story begins mid-chase'], 0, 'The audience knows more than the character.'],
      ['Calling the film industry “Hollywood” is an example of…', ['Synecdoche', 'Oxymoron', 'Metonymy', 'Onomatopoeia'], 2, 'A place associated with the industry stands for it.'],
      ['A volta is…', ['A rhyme scheme', 'A turn in a poem’s thought or tone', 'A pause mid-line', 'A repeated opening word'], 1, ''],
      ['In a visual text, salience refers to…', ['The element that draws the eye first', 'The colour of the background', 'Where the composer signed the image', 'The direction of light'], 0, ''],
      ['Third-person narration that slips into a character’s own voice without quotation marks is…', ['Stream of consciousness', 'First-person narration', 'Dialogue', 'Free indirect discourse'], 3, ''],
      ['Harsh, clashing sounds that reflect conflict are called…', ['Euphony', 'Cacophony', 'Assonance', 'Rhyme'], 1, ''],
      ['Why might a writer use sentence fragments?', ['To sound more formal', 'To create tension, emphasis or broken thought', 'To slow down with long description', 'To show the narrator is all-knowing'], 1, ''],
      ['“He was so hungry he could eat a horse” is…', ['Hyperbole', 'Metaphor', 'Synecdoche', 'Allusion'], 0, 'Deliberate exaggeration.'],
      ['A story that opens in the middle of a chase starts…', ['With a flashback', 'In medias res', 'With a cyclical structure', 'With foreshadowing'], 1, ''],
    ],
    short: [
      { q: 'Identify two techniques in this sentence and analyse how they create mood.', passage: 'The city slept beneath a bruised sky, its streetlights flickering like tired eyes.', marks: 4, tags: ['T2'], criteria: ['Identifies personification (the city sleeps)', 'Identifies the simile (streetlights like tired eyes) or the metaphor of the bruised sky', 'Explains the mood: weary, wounded or uneasy', 'Supports the explanation with specific words from the sentence'], model: 'The sentence personifies the city, which “slept”, so the whole place seems exhausted rather than peaceful. The “bruised sky” adds a metaphor of injury, suggesting the night carries some hidden damage. The simile comparing the streetlights to “tired eyes” continues the idea of fatigue, and the verb “flickering” makes them seem barely able to stay open. Together the techniques create a weary, slightly wounded mood, as if the city itself is struggling to keep watch.' },
      { q: 'Analyse how sound devices shape the mood of these lines.', passage: 'Rain on the tin roof, rain on the road,\nsoft as a secret, slow as a sigh,\nsettling the dust where the old dog sleeps.', marks: 3, tags: ['T1'], criteria: ['Identifies sibilance (soft, secret, slow, sigh, settling, sleeps)', 'Identifies the repetition of “rain on” or the similes', 'Explains the gentle, soothing, lulling mood the sounds create'], model: 'The repeated phrase “rain on the tin roof, rain on the road” imitates the steady patter of rainfall and gives the lines a lulling rhythm. Sibilance in “soft as a secret, slow as a sigh, settling” and “sleeps” produces a hushed, whispering sound, so the reader hears the rain as gentle rather than threatening. These soft sounds create a calm, comforting mood, as if the rain is quietly putting the whole landscape, and the old dog, to rest.' },
      { q: 'Explain how visual techniques position the viewer to respond to the girl.', passage: 'The image shows a small girl in a yellow raincoat standing in the centre of a crowded grey city street. Everyone around her is blurred and hurrying past; she is the only figure in sharp focus, and she is looking straight at the viewer.', marks: 4, tags: ['T6'], criteria: ['Identifies salience created by the yellow raincoat against grey', 'Identifies the contrast between her sharp focus and the blurred crowd', 'Identifies her direct (demand) gaze', 'Explains the viewer’s response: noticing her when others do not, feeling connected or responsible'], model: 'The girl’s yellow raincoat makes her the most salient element in a grey scene, so the viewer’s eye goes to her first. Because she is the only figure in sharp focus while the crowd is blurred, the image suggests that everyone else is too busy to notice her, which makes her seem small and alone. Her direct gaze is a demand: she looks straight at us, so the viewer feels personally addressed, as if we are the one person who has stopped. Together the techniques position the viewer to feel both sympathy and a sense of responsibility for her.' },
      { q: 'Explain how the narrative voice reveals Lena’s feelings in this extract.', passage: 'Lena read the email twice. So the scholarship had gone to someone else. Fine. It wasn’t as if she had stayed up every night for a month polishing the application, or told everyone at work. She closed the laptop very gently, the way you would close a door on a sleeping child.', marks: 3, tags: ['T5'], criteria: ['Identifies free indirect discourse: third-person narration slipping into Lena’s own thoughts', 'Explains the irony or sarcasm of “Fine” and “It wasn’t as if…” revealing hurt beneath a dismissive surface', 'Explains the closing simile as restraint or suppressed emotion'], model: 'The extract uses free indirect discourse: although it is in third person, the clipped “Fine.” and the sarcastic “It wasn’t as if she had stayed up every night…” are clearly Lena’s own words. The irony reveals the opposite of what she claims, since the details show how much effort and hope she invested, so the reader senses hurt beneath her shrug. The final simile, closing the laptop “the way you would close a door on a sleeping child”, shows her carefully holding her emotion in, which makes her disappointment feel even more painful.' },
    ],
  });
  tech.bank = [
    function spotTechnique(level) {
      if (level === 'C' && Math.random() < 0.5) {
        const [code, line, q, right, wrongs] = pick(EFFECTS);
        return { level: 'C', tags: [code], stem: 'Read the line, then choose the best analysis.', passage: line, parts: [CH('', q, right, wrongs, ['The best answer names what the technique does to meaning, not just what is happening.'])] };
      }
      const m = SPOT.filter(s => s[0] === level), [L, code, line, techName, wrongs] = pick(m.length ? m : SPOT);
      const d = DEFS.find(x => x[1] === techName);
      return { level: L, tags: [code], stem: 'Read the example, then identify the main technique.', passage: line, parts: [CH('', 'Which technique is used most clearly here?', techName, wrongs, [d ? `${techName}: ${d[2]}` : techName])] };
    },
    function nameTheTerm(level) {
      const pool = DEFS.filter(d => d[4] === (level === 'F' ? 'F' : 'S')), [code, term, def, effect, L] = pick(pool);
      const others = shuffle(DEFS.filter(d => d[0] === code && d[1] !== term)).slice(0, 3).map(d => d[1]);
      return { level: L, tags: [code], stem: def, parts: [CH('', 'Which technique matches this description?', term, others, [`Typical effect: ${effect}`])] };
    },
  ];

  /* ================= ANIMAL FARM: SHARED HELPERS ================= */
  // n distinct items from list that are not equal to right.
  const othersOf = (list, right, n = 3) => shuffle([...new Set(list)].filter(x => x !== right)).slice(0, n);

  /* ================= ANIMAL FARM: PLOT AND CHARACTERS ================= */
  // [name, description, what they represent in the allegory]
  const CHARS = [
    ['Old Major', 'A wise, prize-winning old boar whose dream of a world without humans inspires the Rebellion. He dies three nights after his speech.', 'Karl Marx and Lenin'],
    ['Napoleon', 'A large, fierce-looking Berkshire boar who says little, wins power with his dogs and becomes a dictator.', 'Joseph Stalin'],
    ['Snowball', 'A lively, clever pig with big ideas, such as the windmill. He is chased off the farm and then blamed for everything.', 'Leon Trotsky'],
    ['Squealer', 'A small, fat pig with a shrill voice who is so persuasive the others say he could turn black into white.', 'Propaganda and state-controlled media'],
    ['Boxer', 'A huge, strong carthorse who is loyal and hard-working but not clever. His mottos are “I will work harder” and “Napoleon is always right.”', 'The loyal, hard-working working class'],
    ['Clover', 'A kind, motherly carthorse who senses something is wrong but cannot find the words to say it.', 'Working people who sensed the betrayal but stayed loyal'],
    ['Benjamin', 'An old, bad-tempered donkey who can read as well as any pig but refuses to get involved.', 'Cynical people who saw the truth but did nothing'],
    ['Mollie', 'A vain white mare who loves sugar and ribbons and runs away to live with humans.', 'The middle and upper classes who fled the revolution'],
    ['Moses', 'Jones’s tame raven, who tells stories of Sugarcandy Mountain, a paradise for animals after death.', 'The Church and religion'],
    ['Mr Jones', 'The drunken, careless owner of Manor Farm who is driven out in the Rebellion.', 'Tsar Nicholas II'],
    ['The dogs', 'Nine puppies that Napoleon raises in secret. They grow into fierce dogs that protect him and attack his enemies.', 'The secret police'],
    ['The sheep', 'Animals that cannot learn much but bleat slogans on cue, drowning out debate.', 'The easily led masses who repeat slogans'],
    ['Minimus', 'A pig who writes songs and poems, including the new anthem and a poem praising Napoleon.', 'Propaganda poets and artists who glorified Stalin'],
    ['Mr Frederick', 'The tough owner of Pinchfield, a neighbouring farm. He cheats Napoleon with forged banknotes and then attacks the farm.', 'Adolf Hitler and Nazi Germany'],
    ['Mr Pilkington', 'The easy-going owner of Foxwood, a neighbouring farm. He plays cards with the pigs at the end.', 'Britain and the Western powers'],
    ['Mr Whymper', 'A human solicitor who acts as Napoleon’s go-between for trade with the outside world.', 'Westerners who did business with the Soviet Union'],
  ];
  const MAIN_CHARS = CHARS.slice(0, 11);

  // Events in the order they happen.
  const EVENTS = [
    'Old Major tells the animals about his dream and teaches them Beasts of England',
    'Old Major dies in his sleep',
    'The Rebellion drives Mr Jones off the farm',
    'Snowball paints the Seven Commandments on the barn wall',
    'The cows’ milk mysteriously disappears',
    'Napoleon takes nine puppies from their mothers, saying he will be responsible for their education',
    'Squealer explains why only the pigs get the milk and apples',
    'The animals win the Battle of the Cowshed',
    'Mollie runs away from the farm',
    'Napoleon’s dogs chase Snowball off the farm',
    'Napoleon abolishes the Sunday meetings',
    'The pigs move into the farmhouse',
    'A storm knocks down the half-built windmill',
    'The hens rebel against having their eggs sold',
    'Animals confess to crimes and are killed by the dogs',
    'Beasts of England is banned',
    'The Sixth Commandment is found to end with “without cause”',
    'Frederick pays for the timber with forged banknotes',
    'Frederick’s men blow up the windmill',
    'The pigs get drunk on whisky they found in the farmhouse',
    'Animal Farm becomes a Republic with Napoleon as President',
    'Boxer is taken away in the knacker’s van',
    'The pigs begin walking on two legs',
    'Napoleon announces the farm will be called Manor Farm again',
  ];

  // Who did it: [level, action, character, wrong characters]
  const WHO_DID = [
    ['F', 'Gives the speech about a dream of a world without humans.', 'Old Major', ['Snowball', 'Napoleon', 'Squealer']],
    ['F', 'Works harder than anyone and says “I will work harder!”', 'Boxer', ['Clover', 'Benjamin', 'Napoleon']],
    ['F', 'Explains to the animals why the pigs must have the milk and apples.', 'Squealer', ['Snowball', 'Boxer', 'Old Major']],
    ['F', 'Draws up the plans for the windmill.', 'Snowball', ['Napoleon', 'Squealer', 'Boxer']],
    ['F', 'Runs away because she misses sugar and ribbons.', 'Mollie', ['Clover', 'Muriel', 'Benjamin']],
    ['F', 'Reads the words on the side of the van and realises Boxer is being taken to the slaughterer.', 'Benjamin', ['Clover', 'Squealer', 'Muriel']],
    ['S', 'Takes the puppies from their mothers and raises them in secret.', 'Napoleon', ['Snowball', 'Squealer', 'Mr Jones']],
    ['S', 'Plans the defence in the Battle of the Cowshed after studying Julius Caesar’s campaigns.', 'Snowball', ['Napoleon', 'Boxer', 'Squealer']],
    ['S', 'Tells stories about Sugarcandy Mountain.', 'Moses', ['Old Major', 'Minimus', 'Squealer']],
    ['S', 'Reads the changed commandments aloud to Clover.', 'Muriel', ['Squealer', 'Boxer', 'Mollie']],
    ['S', 'Writes the new anthem that replaces Beasts of England.', 'Minimus', ['Squealer', 'Snowball', 'Old Major']],
    ['S', 'Pays for the farm’s timber with forged banknotes.', 'Mr Frederick', ['Mr Pilkington', 'Mr Whymper', 'Mr Jones']],
    ['C', 'Is found at night lying beside a broken ladder and a pot of white paint near the barn wall.', 'Squealer', ['Napoleon', 'Benjamin', 'Snowball']],
    ['C', 'Acts as the go-between when the farm begins trading with humans.', 'Mr Whymper', ['Mr Pilkington', 'Mr Frederick', 'Mr Jones']],
    ['C', 'Remembers on the hill after the executions that this was not what Old Major had promised.', 'Clover', ['Boxer', 'Benjamin', 'Mollie']],
    ['C', 'Returns to the farm in Chapter 9 and is allowed to stay, with a daily ration of beer.', 'Moses', ['Snowball', 'Mollie', 'Mr Jones']],
    ['C', 'Raises a glass to the pigs and jokes that humans have their “lower classes” just as the pigs have their lower animals.', 'Mr Pilkington', ['Mr Frederick', 'Mr Whymper', 'Mr Jones']],
  ];

  const afplot = finish({
    id: 'afplot', subject: SUBJECT, title: 'Animal Farm: plot and characters', chapter: 'Animal Farm', hue: HUE,
    blurb: 'What happens in each part of the novel, who does what, and who each character stands for in the story of the Russian Revolution.',
    sections: [
      { code: 'P1', name: 'Chapters 1–2: the dream and the Rebellion', notes: [
        'The setting is Manor Farm, owned by Mr Jones, a careless farmer who drinks too much. The very first sentence shows him too drunk to shut the popholes of the hen-houses.',
        'Old Major, a respected old boar, gathers the animals in the big barn. He says their lives are “miserable, laborious, and short”, blames humans for all their suffering and describes a dream of a world without Man.',
        'He tells them that all men are enemies and all animals are comrades, and teaches them the song Beasts of England. Three nights later he dies peacefully in his sleep.',
        'The pigs, the cleverest animals, take over the teaching. Snowball, Napoleon and Squealer turn Major’s ideas into a system called Animalism.',
        'Moses, Jones’s tame raven, tells the animals about Sugarcandy Mountain, a paradise they will go to when they die. The pigs argue hard against him.',
        'The Rebellion comes suddenly, on Midsummer’s Eve. Jones gets drunk and forgets to feed the animals, they break into the store-shed, and when Jones and his men attack them with whips they fight back and chase the humans off the farm.',
        'The animals destroy the whips, nose-rings and other reminders of Jones. Snowball paints over the name Manor Farm with Animal Farm, and paints the Seven Commandments on the end wall of the big barn.',
        'At the end of Chapter 2 the cows’ milk disappears while everyone else is out harvesting. It is the first hint that the pigs are keeping good things for themselves.',
      ] },
      { code: 'P2', name: 'Chapters 3–4: early success and the Battle of the Cowshed', notes: [
        'The first harvest is a great success. Every animal works, and Boxer, the enormous carthorse, works hardest of all with his motto “I will work harder!”',
        'The pigs do not do physical work. They direct and supervise the others. This is the first sign of a new ruling class.',
        'Snowball sets up committees and reading classes, but most animals learn very little. Boxer cannot get past the letter D. Snowball sums up the Commandments for them in one maxim: “Four legs good, two legs bad”, which the sheep bleat for hours.',
        'Napoleon takes nine newborn puppies away from their mothers, Jessie and Bluebell, saying he will educate them himself. He keeps them hidden in a loft.',
        'The milk and the windfall apples go to the pigs only. Squealer explains that the pigs are brainworkers who need this food, and warns that if the pigs failed, Jones would come back.',
        'The flag is green for the fields of England, with a white hoof and horn for the future Republic of the Animals.',
        'Battle of the Cowshed (Chapter 4): Jones and men from the neighbouring farms try to retake the farm. Snowball, who has studied Julius Caesar’s battles, plans the ambush and is wounded leading the charge. The humans flee.',
        'Boxer thinks he has killed a stable-lad and is upset; the boy was only stunned. Snowball and Boxer are given the medal “Animal Hero, First Class”, and a sheep killed in the battle is honoured too.',
      ] },
      { code: 'P3', name: 'Chapter 5: Snowball versus Napoleon', notes: [
        'Mollie, the vain white mare, is seen letting a man from a neighbouring farm stroke her nose. She disappears, and is later seen in town pulling a smart cart, wearing a ribbon.',
        'Snowball and Napoleon disagree about almost everything. Snowball is a brilliant speaker full of plans; Napoleon is better at quietly winning support between meetings, especially from the sheep.',
        'The biggest argument is the windmill. Snowball says it will make electricity and cut the working week to three days. Napoleon says they should grow food instead, and shows his contempt by urinating on Snowball’s plans.',
        'At the deciding meeting Napoleon makes a strange high-pitched whimper. Nine huge dogs, the puppies he took, burst in and chase Snowball off the farm. He is never seen again.',
        'Napoleon abolishes the Sunday meetings: from now on a special committee of pigs led by him will decide everything. Four young pigs protest, but the dogs growl them into silence and the sheep drown them out.',
        'Squealer tells the animals that Napoleon has made a great sacrifice by taking on leadership, and that Snowball was a criminal. Boxer adopts a new motto: “Napoleon is always right.”',
        'Three weeks later Napoleon announces that the windmill will be built after all. Squealer explains that Napoleon never really opposed it; that was just “tactics”.',
      ] },
      { code: 'P4', name: 'Chapters 6–7: hard work, trade and terror', notes: [
        'The animals work like slaves all year. Sunday afternoon work is called voluntary, but any animal that skips it has its rations cut by half.',
        'Napoleon announces that the farm will trade with neighbouring farms through a solicitor, Mr Whymper. The animals remember resolutions against trade and money, but Squealer assures them that no such resolution was ever passed: it was “pure imagination”.',
        'The pigs move into the farmhouse and sleep in the beds. Clover asks Muriel to read the Fourth Commandment, which now says: “No animal shall sleep in a bed with sheets.”',
        'In November a storm knocks down the half-built windmill. Napoleon blames Snowball, sentences him to death and orders the windmill rebuilt.',
        'Chapter 7: a hard winter and a food shortage. Napoleon fools Mr Whymper by filling empty bins with sand and covering it with grain, so the outside world thinks the farm is doing well.',
        'Napoleon orders the hens to give up their eggs to be sold. The hens rebel; Napoleon stops their food, and nine hens die.',
        'Snowball is now blamed for every problem. Squealer claims Snowball was working for Jones all along, even at the Battle of the Cowshed.',
        'The purge: four pigs, the hens who led the rebellion and other animals confess to plotting with Snowball, and the dogs kill them on the spot. The dogs even attack Boxer, who pins one under his hoof.',
        'Afterwards the animals huddle on a hill. Clover thinks this is not what they hoped for when Old Major spoke. They sing Beasts of England, and Squealer announces that the song is now banned and replaced by a new anthem written by Minimus.',
      ] },
      { code: 'P5', name: 'Chapters 8–10: lies, war and the ending', notes: [
        'The Sixth Commandment now reads: “No animal shall kill any other animal without cause.” Napoleon is rarely seen in public, is given grand titles, and Minimus writes a poem praising him.',
        'Napoleon plays Mr Pilkington of Foxwood and Mr Frederick of Pinchfield off against each other over a pile of timber, then sells it to Frederick, who pays with forged banknotes.',
        'Frederick and his men attack: the Battle of the Windmill. They blow up the newly finished windmill. The animals drive them off, but many are hurt or killed. Squealer calls it a victory.',
        'The pigs find a case of whisky and get drunk. The next day Napoleon is ill. Soon after, Squealer is found at night beside a broken ladder and a pot of paint, and the Fifth Commandment now reads: “No animal shall drink alcohol to excess.”',
        'Chapter 9: food is short for everyone except the pigs and dogs, but Squealer calls the cut a “readjustment”. Animal Farm becomes a Republic and Napoleon is elected President; he is the only candidate. Moses returns and the pigs let him stay.',
        'Boxer, worn out, collapses. The pigs say he is going to a hospital, but Benjamin reads the side of the van: it belongs to a horse slaughterer. Boxer is sold to the knacker. Squealer claims Boxer died in hospital praising Napoleon. Soon after, the pigs buy another case of whisky.',
        'Chapter 10: years pass. Most animals who remember the Rebellion have died. The farm is richer, but only the pigs and dogs enjoy the wealth. The windmill is used to grind corn for profit, not to give the animals electricity and comfort.',
        'The pigs learn to walk on two legs and carry whips. The sheep bleat “Four legs good, two legs better!” and all the Commandments are replaced by one: “All animals are equal but some animals are more equal than others.” Then the pigs start wearing Jones’s clothes.',
        'Napoleon hosts the neighbouring farmers and announces the farm will be called Manor Farm again. A card game ends in a furious quarrel, and the animals watching through the window can no longer tell the pigs from the men.',
      ] },
      { code: 'P6', name: 'Characters and the allegory', notes: [
        'An allegory is a story with a second, hidden meaning. Animal Farm uses farm animals to retell the Russian Revolution of 1917 and Stalin’s rule of the Soviet Union. Orwell published it in 1945.',
        ...CHARS.map(c => `${c[0]}: ${c[1]} Represents: ${c[2]}.`),
        'Muriel: a white goat who can read a little better than the dogs. She reads the changed commandments to Clover, but does not question them.',
        'Events in the allegory: the Rebellion is the 1917 Revolution; the Battle of the Cowshed is the Russian Civil War; the windmill is Stalin’s Five-Year Plans to modernise the country; the hens’ rebellion is the peasants who resisted Stalin taking their farms; the confessions and executions are Stalin’s purges and show trials in the 1930s; the Battle of the Windmill is Germany’s invasion of the Soviet Union in 1941; the final card game is the uneasy meetings between Stalin and Western leaders at the end of World War Two.',
      ], ex: ['How to use the allegory in an answer', 'Make your point about the novel first: Napoleon uses his dogs to drive Snowball out and silence any protest.', 'Then add the link to history briefly: this mirrors how Stalin used the secret police to remove Trotsky and his rivals.', 'Finish with Orwell’s message: absolute power is kept through fear, not fairness, in any society.'] },
    ],
    cards: [
      ['Where is the novel set?', 'Manor Farm (renamed Animal Farm), an English farm owned by Mr Jones.'],
      ['How does the novel open?', 'Mr Jones is too drunk to remember to shut the popholes of the hen-houses, showing he is a neglectful master.'],
      ['What does Old Major say about animals’ lives?', 'They are miserable, laborious and short: animals are worked until they are useless and then slaughtered.'],
      ['Who does Old Major blame for the animals’ misery?', 'Man, who consumes without producing.'],
      ['What song does Old Major teach the animals?', 'Beasts of England.'],
      ['When does Old Major die?', 'Three nights after his speech, peacefully in his sleep.'],
      ['What is Animalism?', 'The system of ideas the pigs build from Old Major’s teachings.'],
      ['What is Sugarcandy Mountain?', 'The paradise Moses the raven says animals go to when they die.'],
      ['What triggers the Rebellion?', 'Jones gets drunk and does not feed the animals; they break into the store-shed and fight back when he attacks them with whips.'],
      ['When does the Rebellion happen?', 'On Midsummer’s Eve.'],
      ['Who writes the Seven Commandments, and where?', 'Snowball paints them on the end wall of the big barn.'],
      ['What happens to the milk at the end of Chapter 2?', 'It disappears while the animals are harvesting. Later we learn the pigs have been taking it.'],
      ['Who works hardest on the farm?', 'Boxer, the huge carthorse.'],
      ['What are Boxer’s two mottos?', '“I will work harder!” and “Napoleon is always right.”'],
      ['Which maxim does Snowball give the less clever animals?', '“Four legs good, two legs bad.”'],
      ['What does Napoleon do with the puppies?', 'Takes them from their mothers and raises them in secret. They become his guard dogs.'],
      ['Who takes the milk and apples, and how is it justified?', 'The pigs. Squealer says they are brainworkers who need it, and that otherwise Jones would come back.'],
      ['What do the green flag and the hoof and horn stand for?', 'Green for the fields of England; the hoof and horn for the future Republic of the Animals.'],
      ['What is the Battle of the Cowshed?', 'Jones and other men try to retake the farm in Chapter 4. Snowball leads the defence and the humans are driven off.'],
      ['Who receives “Animal Hero, First Class”?', 'Snowball and Boxer, after the Battle of the Cowshed.'],
      ['Why does Mollie leave the farm?', 'She misses sugar, ribbons and being petted by humans.'],
      ['What is the windmill argument?', 'Snowball wants to build a windmill to make electricity and shorten the working week; Napoleon opposes it.'],
      ['How is Snowball removed from the farm?', 'Napoleon’s nine dogs chase him off at the meeting where the windmill is to be voted on.'],
      ['What does Napoleon do to the Sunday meetings?', 'He abolishes them. A committee of pigs led by him will decide everything.'],
      ['What does Squealer say about Napoleon and the windmill?', 'That Napoleon never really opposed it; it was just “tactics”.'],
      ['Who is Mr Whymper?', 'A solicitor who acts as Napoleon’s go-between for trading with humans.'],
      ['What does the Fourth Commandment say after the pigs move into the farmhouse?', '“No animal shall sleep in a bed with sheets.”'],
      ['What destroys the first windmill?', 'A November storm. Napoleon blames Snowball.'],
      ['How does Napoleon fool Mr Whymper about the food shortage?', 'He fills the empty bins with sand and covers it with grain.'],
      ['Why do the hens rebel?', 'Napoleon orders them to give up their eggs to be sold. He stops their food and nine hens die.'],
      ['What happens in the confessions and executions?', 'Animals confess to plotting with Snowball and are immediately killed by the dogs.'],
      ['What replaces Beasts of England?', 'A new song by Minimus beginning “Animal Farm, Animal Farm”.'],
      ['What does the Sixth Commandment become?', '“No animal shall kill any other animal without cause.”'],
      ['How does Frederick cheat Napoleon?', 'He pays for the timber with forged banknotes.'],
      ['What happens in the Battle of the Windmill?', 'Frederick’s men attack and blow up the windmill. The animals drive them off at a heavy cost.'],
      ['What does the Fifth Commandment become?', '“No animal shall drink alcohol to excess.”'],
      ['How does Squealer describe the cut in food in Chapter 9?', 'As a “readjustment”, never a “reduction”.'],
      ['How does Napoleon become President?', 'Animal Farm becomes a Republic and he is elected unopposed: he is the only candidate.'],
      ['What really happens to Boxer?', 'He is sold to a horse slaughterer (the knacker). Soon after, the pigs somehow have the money for another case of whisky.'],
      ['Who realises Boxer is being taken to the knacker?', 'Benjamin, who reads the writing on the side of the van.'],
      ['What story does Squealer tell about Boxer’s death?', 'That Boxer died in hospital, praising Napoleon and the Rebellion to the end.'],
      ['What do the sheep bleat in Chapter 10?', '“Four legs good, two legs better!”'],
      ['What single commandment replaces the Seven?', '“All animals are equal but some animals are more equal than others.”'],
      ['What is the farm called at the end?', 'Manor Farm again.'],
      ['What is the very last image of the novel?', 'The animals look from pig to man and from man to pig, and cannot tell which is which.'],
      ['What does the windmill end up being used for?', 'Grinding corn for profit, not providing electricity for the animals.'],
      ...CHARS.map(c => [`Who does ${c[0]} represent?`, c[2] + '.']),
    ],
    concepts: [
      ['Who first inspires the animals to dream of rebellion?', ['Snowball', 'Old Major', 'Napoleon', 'Moses'], 1, 'Old Major’s speech and dream in Chapter 1 inspire the Rebellion.'],
      ['Why do the animals finally rebel?', ['Old Major orders them to', 'Jones forgets to feed them and attacks them with whips', 'Snowball plans a surprise attack', 'Frederick invades the farm'], 1, 'The Rebellion is sudden, not planned: hunger and Jones’s whips spark it.'],
      ['What is the first sign that the pigs are taking more for themselves?', ['The windmill collapsing', 'The milk disappearing at the end of Chapter 2', 'Mollie running away', 'The Battle of the Cowshed'], 1, 'The disappearing milk quietly foreshadows the pigs’ greed.'],
      ['Why does Napoleon take the puppies?', ['To give them a better life', 'To train them as his private army', 'To sell them to Pilkington', 'To teach them to read'], 1, 'The puppies grow into the dogs that chase Snowball away and terrorise the farm.'],
      ['Who leads the animals in the Battle of the Cowshed?', ['Napoleon', 'Boxer', 'Snowball', 'Squealer'], 2, 'Snowball plans and leads the defence, which is why later lies about his role matter.'],
      ['What is the main disagreement between Snowball and Napoleon in Chapter 5?', ['Whether to build the windmill', 'Whether to keep Moses on the farm', 'Who should marry Mollie', 'Whether to sing Beasts of England'], 0, ''],
      ['What happens straight after Snowball is chased away?', ['Napoleon abolishes the Sunday meetings', 'The windmill is finished', 'Boxer dies', 'The pigs walk on two legs'], 0, 'Napoleon immediately removes the animals’ say in decisions.'],
      ['What reason does Squealer give for Napoleon suddenly supporting the windmill?', ['Snowball asked him to', 'It was “tactics”: he had never really opposed it', 'The sheep voted for it', 'Old Major appeared in a dream'], 1, 'Squealer rewrites the past to protect Napoleon.'],
      ['Who is blamed for the destruction of the first windmill?', ['The storm', 'Snowball', 'Mr Frederick', 'Boxer'], 1, 'Napoleon uses Snowball as a scapegoat for everything that goes wrong.'],
      ['Why do the hens rebel?', ['Their eggs are to be sold', 'They want to sleep in beds', 'They miss Mr Jones', 'They are not allowed to vote'], 0, ''],
      ['What happens to the animals who confess in Chapter 7?', ['They are exiled', 'They are killed by the dogs', 'They are given extra rations', 'They are sent to Sugarcandy Mountain'], 1, 'The executions show Napoleon ruling by terror.'],
      ['How does Frederick trick Napoleon?', ['He pays with forged banknotes', 'He steals the windmill plans', 'He bribes Squealer', 'He poisons the water'], 0, ''],
      ['What really happens to Boxer?', ['He retires to a pasture', 'He dies in hospital', 'He is sold to a horse slaughterer', 'He runs away like Mollie'], 2, 'The pigs sell their most loyal worker to the knacker.'],
      ['Who represents Stalin?', ['Snowball', 'Old Major', 'Napoleon', 'Squealer'], 2, ''],
      ['Who represents Trotsky?', ['Snowball', 'Napoleon', 'Boxer', 'Benjamin'], 0, 'Like Trotsky, Snowball is driven out and then blamed for everything.'],
      ['Squealer best represents…', ['The Church', 'Propaganda and state media', 'The secret police', 'The upper classes'], 1, ''],
      ['What does Moses the raven represent?', ['Religion and the Church', 'The army', 'Western leaders', 'The working class'], 0, 'Sugarcandy Mountain is like the promise of heaven, which keeps animals patient with suffering.'],
      ['Benjamin best represents people who…', ['Fled the revolution', 'Saw what was happening but did nothing', 'Led the revolution', 'Wrote propaganda'], 1, ''],
      ['What happens in the final scene?', ['Snowball returns to the farm', 'The animals cannot tell the pigs from the men', 'The animals rebel against Napoleon', 'Old Major’s dream comes true'], 1, ''],
      ['What is the farm called at the very end?', ['Animal Farm', 'Napoleon Farm', 'Manor Farm', 'Foxwood'], 2, 'Returning to the old name shows the revolution has gone full circle.'],
    ],
    short: [
      { q: 'What does this opening sentence suggest about Mr Jones as a farmer?', passage: 'The opening sentence of the novel: Mr Jones “had locked the hen-houses for the night, but was too drunk to remember to shut the popholes.”', marks: 2, tags: ['P1'], criteria: ['States that Jones is careless or neglectful of the animals in his care', 'Supports this with the detail that he is “too drunk” to finish the job properly'], model: 'The sentence suggests Jones is a careless, neglectful farmer. He is “too drunk” to finish locking up, so the animals’ safety comes second to his drinking, which helps explain why they later want to get rid of him.' },
      { q: 'How does Old Major persuade the animals that Man is their enemy?', passage: '“Man is the only creature that consumes without producing. He does not give milk, he does not lay eggs, he is too weak to pull the plough… Yet he is lord of all the animals.”', marks: 3, tags: ['P1'], criteria: ['Identifies a technique such as repetition of “he does not” or the list', 'Explains that the list shows Man is useless because he produces nothing', 'Explains how the final short sentence makes Man’s power seem unfair, stirring the animals to anger'], model: 'Old Major uses a list with repetition (“He does not give milk, he does not lay eggs”) to pile up all the things Man cannot do. This makes humans seem lazy and useless compared with the animals, who do all the producing. The short final sentence, “Yet he is lord of all the animals”, then shows how unfair it is that such a weak creature is in charge, which makes the animals angry enough to want to rebel.' },
      { q: 'What does this line reveal about Benjamin’s attitude to the Rebellion?', passage: 'When asked whether he is happier now that Jones is gone, Benjamin says only: “Donkeys live a long time. None of you has ever seen a dead donkey”', marks: 2, tags: ['P6'], criteria: ['States that Benjamin is cynical or doubtful that anything will really change', 'Explains that the cryptic answer shows he avoids getting involved or taking a side'], model: 'The line reveals that Benjamin is cynical. He has lived a long time and seen that life stays hard whoever is in charge, so he does not believe the Rebellion will really change anything. His odd, cryptic answer also shows that he refuses to commit himself or get involved.' },
      { q: 'How does Squealer change the animals’ memory of Snowball in this line?', passage: 'After Snowball is chased off, an animal points out that he fought bravely at the Battle of the Cowshed.\n“Bravery is not enough,” said Squealer. “Loyalty and obedience are more important.”', marks: 3, tags: ['P3'], criteria: ['Explains that Squealer is dismissing Snowball’s real bravery at the Battle of the Cowshed', 'Explains that he replaces bravery with loyalty and obedience to Napoleon as the most important values', 'Explains the effect: the animals are pushed to stop thinking for themselves and simply obey'], model: 'Squealer admits Snowball was brave but says “Bravery is not enough”, which quietly dismisses the courage the animals all saw at the Battle of the Cowshed. He then puts “Loyalty and obedience” above it, so the most important thing is now obeying Napoleon. This teaches the animals to distrust their own memories and simply follow orders, preparing the way for Snowball to be turned into a villain.' },
      { q: 'Outline how Napoleon takes control of the farm in Chapter 5.', marks: 3, tags: ['P3'], criteria: ['Napoleon uses the nine dogs he secretly raised to chase Snowball off the farm', 'He abolishes the Sunday meetings so the animals no longer debate or vote', 'Squealer and the dogs (and the sheep) silence anyone who objects'], model: 'At the meeting about the windmill, Napoleon calls in the nine dogs he secretly raised from puppies, and they chase Snowball off the farm. He then abolishes the Sunday meetings, so a committee of pigs he leads makes all the decisions. When four young pigs protest, the dogs growl and the sheep bleat to drown them out, and Squealer explains the change away.' },
      { q: 'Why is Boxer’s death one of the most powerful moments in the novel?', marks: 4, tags: ['P5'], criteria: ['Describes what happens: Boxer collapses and is sold to the horse slaughterer, not sent to hospital', 'Explains that Boxer was the most loyal and hard-working animal, so this is the ultimate betrayal', 'Explains Squealer’s lie about Boxer dying in hospital and the pigs buying whisky', 'Links to a message: the working class is used and thrown away by those in power'], model: 'When Boxer collapses, the pigs say he is going to hospital, but Benjamin reads the van and reveals that he is being taken to a horse slaughterer. This is shocking because Boxer was the most loyal animal on the farm, always saying “I will work harder” and “Napoleon is always right”. Squealer then lies that Boxer died in hospital, his last words praising Napoleon, and soon afterwards the pigs somehow find the money for another case of whisky. Orwell shows that leaders like Napoleon use loyal workers until they are worn out and then throw them away.' },
    ],
  });
  afplot.bank = [
    function whoRepresents(level) {
      if (level === 'F') {
        const c = pick(MAIN_CHARS);
        return { level: 'F', tags: ['P6'], stem: 'Animal Farm is an allegory of the Russian Revolution.', parts: [CH('', `In the allegory, who or what does ${c[0]} represent?`, c[2], othersOf(CHARS.map(x => x[2]), c[2]), [`${c[0]}: ${c[1]}`])] };
      }
      if (level === 'S') {
        const c = pick(CHARS);
        return { level: 'S', tags: ['P6'], stem: 'Animal Farm is an allegory of the Russian Revolution.', parts: [CH('', `Which character represents ${c[2].charAt(0).toLowerCase() + c[2].slice(1)}?`, c[0], othersOf(CHARS.map(x => x[0]), c[0]), [`${c[0]}: ${c[1]}`])] };
      }
      const c = pick(CHARS);
      return { level: 'C', tags: ['P6'], stem: c[1], parts: [CH('', 'Which character is described here?', c[0], othersOf(CHARS.map(x => x[0]), c[0]), [`${c[0]} represents ${c[2]}.`])] };
    },
    function eventOrder(level) {
      const n = EVENTS.length;
      if (level === 'F') {
        const idx = shuffle([...Array(n).keys()]).slice(0, 3).sort((a, b) => a - b);
        while (idx[1] - idx[0] < 4 || idx[2] - idx[1] < 4) { idx.splice(0, 3, ...shuffle([...Array(n).keys()]).slice(0, 3).sort((a, b) => a - b)); }
        return { level: 'F', tags: ['P5'], stem: 'Think about the order of events in the novel.', parts: [CH('', 'Which of these happens first?', EVENTS[idx[0]], [EVENTS[idx[1]], EVENTS[idx[2]]], [`Order: ${idx.map(i => EVENTS[i]).join(' → ')}.`])] };
      }
      if (level === 'S') {
        const idx = shuffle([...Array(n).keys()]).slice(0, 4).sort((a, b) => a - b);
        return { level: 'S', tags: ['P5'], stem: 'Think about the order of events in the novel.', parts: [CH('', 'Which of these happens last?', EVENTS[idx[3]], idx.slice(0, 3).map(i => EVENTS[i]), [`Order: ${idx.map(i => EVENTS[i]).join(' → ')}.`])] };
      }
      const i = 1 + Math.floor(Math.random() * (n - 5));
      const wrongs = [EVENTS[i - 1], EVENTS[i + 2], EVENTS[i + 4]];
      return { level: 'C', tags: ['P5'], stem: `Event: ${EVENTS[i]}.`, parts: [CH('', 'Which of these happens next, straight after this event?', EVENTS[i + 1], wrongs, [`Order: ${EVENTS.slice(i - 1, i + 3).join(' → ')}.`])] };
    },
    function whoDidIt(level) {
      const m = WHO_DID.filter(w => w[0] === level), [L, action, who, wrongs] = pick(m.length ? m : WHO_DID);
      const c = CHARS.find(x => x[0] === who);
      return { level: L, tags: ['P6'], stem: action, parts: [CH('', 'Which character does this?', who, wrongs, [c ? `${who}: ${c[1]}` : `${who} does this.`])] };
    },
  ];

  /* ================= ANIMAL FARM: THEMES AND MESSAGES ================= */
  const TH = {
    H1: 'Power and corruption', H2: 'Propaganda and the power of language', H3: 'Equality and class',
    H4: 'Education, ignorance and control', H5: 'The revolution betrayed', H6: 'Fear and violence', H7: 'Rewriting history and memory',
  };
  // [level, section, moment, three themes it fits less well, why]
  const MOMENTS = [
    ['F', 'H2', 'Squealer persuades the animals that the pigs need the milk and apples for their brains.', ['H6', 'H7', 'H5'], 'Squealer uses clever words, fake science and scare tactics to make an unfair decision sound reasonable.'],
    ['F', 'H6', 'Napoleon’s dogs tear out the throats of animals who confess to plotting with Snowball.', ['H4', 'H2', 'H3'], 'The executions show Napoleon ruling through terror.'],
    ['F', 'H3', 'The pigs do not do physical work, but direct and supervise the others.', ['H6', 'H7', 'H2'], 'A new ruling class appears straight after the Rebellion.'],
    ['F', 'H5', 'At the end the animals cannot tell the pigs from the men.', ['H4', 'H6', 'H7'], 'The new rulers have become just like the old ones: the revolution has gone full circle.'],
    ['F', 'H4', 'Boxer cannot learn the alphabet past the letter D.', ['H6', 'H1', 'H7'], 'Animals who cannot read cannot check the Commandments, so they are easy to control.'],
    ['F', 'H7', 'Squealer claims Snowball was secretly working for Jones even at the Battle of the Cowshed.', ['H3', 'H4', 'H6'], 'The past is rewritten so Snowball becomes a villain.'],
    ['S', 'H1', 'Napoleon gives himself titles such as “Father of All Animals” and “Terror of Mankind”.', ['H4', 'H7', 'H3'], 'Power has gone to Napoleon’s head; he is treated almost like a god.'],
    ['S', 'H1', 'The pigs move into the farmhouse and sleep in Jones’s beds.', ['H6', 'H4', 'H7'], 'The pigs take the privileges they once condemned.'],
    ['S', 'H2', 'Squealer calls a cut in rations a “readjustment”, never a “reduction”.', ['H6', 'H3', 'H5'], 'A gentle word hides a harsh reality.'],
    ['S', 'H2', 'The sheep bleat “Four legs good, two legs bad” whenever anyone tries to argue.', ['H3', 'H7', 'H5'], 'A slogan drowns out real debate and thinking.'],
    ['S', 'H4', 'Napoleon takes the puppies from their mothers, saying he will be responsible for their education.', ['H3', 'H7', 'H2'], 'Education is used to create obedient servants, not free thinkers.'],
    ['S', 'H6', 'The dogs growl at the four young pigs who protest when the Sunday meetings are abolished.', ['H3', 'H4', 'H7'], 'The threat of violence silences protest.'],
    ['S', 'H3', 'The pigs get the milk and apples while the other animals go without.', ['H6', 'H7', 'H4'], 'The animals are no longer equal: the pigs have special privileges.'],
    ['S', 'H7', 'The animals are told there was never a resolution against trading with humans.', ['H3', 'H6', 'H1'], 'Because nothing was written down, the pigs can deny the past.'],
    ['C', 'H5', 'The windmill, meant to give the animals electricity and a three-day week, ends up grinding corn for profit.', ['H6', 'H4', 'H2'], 'The revolution’s promise of a better life is broken; only the pigs benefit.'],
    ['C', 'H5', 'Beasts of England is banned because “the Rebellion is now completed”.', ['H3', 'H4', 'H6'], 'The song of hope for a better future is silenced, showing the dream is dead.'],
    ['C', 'H7', 'Clover is unsure whether the Sixth Commandment always ended with “without cause”, but Muriel reads it and she accepts it.', ['H3', 'H6', 'H1'], 'The animals’ memories are weak, so the written version replaces the truth.'],
    ['C', 'H4', 'Benjamin can read as well as any pig but never uses his knowledge to challenge them.', ['H7', 'H6', 'H3'], 'Knowledge is useless against tyranny if people will not act on it.'],
    ['C', 'H6', 'Nine hens die after Napoleon stops their food when they refuse to give up their eggs.', ['H4', 'H7', 'H2'], 'Napoleon crushes resistance with starvation and violence.'],
    ['C', 'H1', 'Napoleon’s pigs begin carrying whips in their trotters.', ['H4', 'H7', 'H2'], 'The pigs now hold the same tool of control as Jones.'],
  ];

  // [number, original, changed version or what happened, chapter, event that came first]
  const COMMANDMENTS = [
    [1, 'Whatever goes upon two legs is an enemy.', 'Never reworded on the wall, but broken when the pigs trade with humans and finally walk on two legs themselves.', '10', 'the pigs learning to walk on two legs'],
    [2, 'Whatever goes upon four legs, or has wings, is a friend.', 'Never reworded, but broken when animals are killed by the dogs in the purge.', '7', 'the executions'],
    [3, 'No animal shall wear clothes.', 'Never reworded, but broken in Chapter 10 when the pigs wear Jones’s clothes, after all the Commandments have been replaced.', '10', 'all the Commandments being replaced'],
    [4, 'No animal shall sleep in a bed.', 'No animal shall sleep in a bed with sheets.', '6', 'the pigs moving into the farmhouse'],
    [5, 'No animal shall drink alcohol.', 'No animal shall drink alcohol to excess.', '8', 'the pigs getting drunk on whisky'],
    [6, 'No animal shall kill any other animal.', 'No animal shall kill any other animal without cause.', '8', 'the confessions and executions'],
    [7, 'All animals are equal.', 'All animals are equal but some animals are more equal than others.', '10', 'the pigs walking on two legs'],
  ];
  const ORDINAL = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh'];

  const afthemes = finish({
    id: 'afthemes', subject: SUBJECT, title: 'Animal Farm: themes and messages', chapter: 'Animal Farm', hue: HUE,
    blurb: 'The big ideas in Animal Farm: what Orwell is saying, the key moments that show it, and how to write about each one.',
    sections: [
      { code: 'H1', name: 'Power and corruption', notes: [
        'What Orwell is saying: power corrupts. The more power a leader has, and the fewer limits on it, the more likely they are to abuse it for their own benefit.',
        'Key moments: the pigs take the milk and apples (Chapter 3); Napoleon seizes control with his dogs (Chapter 5); the pigs move into the farmhouse (Chapter 6); Napoleon’s grand titles (Chapter 8); the pigs walk on two legs and carry whips (Chapter 10).',
        'Napoleon starts as one of the rebels and ends up just like Jones, or worse: the animals work harder and eat less than they did before the Rebellion.',
        'How to write about it: trace a change over time. “At first… but by the end…” shows how power gradually corrupts. Useful verbs: exploits, abuses, seizes, dominates.',
      ] },
      { code: 'H2', name: 'Propaganda and the power of language', notes: [
        'What Orwell is saying: language can be used as a weapon. Leaders who control words, information and stories can control what people believe.',
        'Squealer is the main tool of propaganda. He uses fake facts and figures, scare tactics (“Jones would come back!”), rhetorical questions, flattery and euphemism (calling a cut in rations a “readjustment”).',
        'Slogans replace thinking: the sheep bleat “Four legs good, two legs bad” to drown out debate, and later “Four legs good, two legs better!”',
        'Songs and poems also become propaganda: Beasts of England is banned and replaced by an anthem and poems praising Napoleon.',
        'How to write about it: name the persuasive technique Squealer uses, then explain how it stops the animals from questioning the pigs. Useful verbs: manipulates, deceives, justifies, silences.',
      ] },
      { code: 'H3', name: 'Equality, class and the Seven Commandments', notes: [
        'What Orwell is saying: a revolution that promises equality can simply create a new ruling class. The pigs replace the humans at the top.',
        'The original Seven Commandments: 1. Whatever goes upon two legs is an enemy. 2. Whatever goes upon four legs, or has wings, is a friend. 3. No animal shall wear clothes. 4. No animal shall sleep in a bed. 5. No animal shall drink alcohol. 6. No animal shall kill any other animal. 7. All animals are equal.',
        'Changed on the wall: the Fourth becomes “No animal shall sleep in a bed with sheets” (Chapter 6, after the pigs move into the farmhouse). The Sixth becomes “No animal shall kill any other animal without cause” (Chapter 8, after the executions). The Fifth becomes “No animal shall drink alcohol to excess” (Chapter 8, after the pigs get drunk).',
        'In Chapter 10 all seven are replaced by a single commandment: “All animals are equal but some animals are more equal than others.” The pigs then wear Jones’s clothes and walk on two legs, breaking the First and Third Commandments.',
        'Each change adds just a few words, so the pigs can claim the rule was always there. The changes always happen after the pigs have already broken the rule.',
        'How to write about it: show the gap between the ideal (Old Major’s “All animals are equal”) and the reality (the pigs’ privileges). Useful words: hierarchy, privilege, hypocrisy, inequality.',
      ], ex: ['How a commandment changes: the Fourth', 'Original: No animal shall sleep in a bed.', 'What the pigs do first: move into the farmhouse and sleep in Jones’s beds.', 'New version: No animal shall sleep in a bed with sheets.', 'What it shows: the pigs change the rules to fit what they have already done, and the animals cannot prove it was ever different.'] },
      { code: 'H4', name: 'Education, ignorance and control', notes: [
        'What Orwell is saying: people who cannot read, question or remember clearly are easy to control. Knowledge is power, and the pigs keep it for themselves.',
        'The pigs learn to read and write well; most other animals barely learn the alphabet. Boxer cannot get past D, and the sheep only manage slogans.',
        'Napoleon takes charge of the puppies’ “education”, turning them into his guards, and later teaches the young animals himself: education becomes training in obedience.',
        'Benjamin can read but chooses to do nothing, showing that knowledge alone is not enough without the courage to act.',
        'How to write about it: explain how the animals’ ignorance lets the pigs get away with lies, especially changing the Commandments. Useful verbs: exploits, keeps in the dark, manipulates.',
      ] },
      { code: 'H5', name: 'The revolution betrayed', notes: [
        'What Orwell is saying: revolutions can be betrayed by their own leaders. The animals overthrow one tyrant only to end up under a worse one.',
        'Old Major’s dream was a farm where animals were free, equal and well fed. By the end the animals are hungrier and work harder than under Jones, and the pigs live like humans.',
        'The cyclical ending: the farm is renamed Manor Farm, the pigs walk on two legs, wear clothes and drink with farmers, and the animals cannot tell pig from man. The story has gone full circle.',
        'Beasts of England, the song of hope, is banned because “the Rebellion is now completed”.',
        'How to write about it: compare the beginning with the end. Explain that Orwell is warning his readers, not just telling a sad story. Useful phrases: Orwell warns, Orwell criticises, full circle.',
      ] },
      { code: 'H6', name: 'Fear and violence', notes: [
        'What Orwell is saying: dictators keep power through fear. Terror stops people from speaking up, even when they know something is wrong.',
        'Key moments: the dogs chase Snowball off the farm (Chapter 5); the dogs growl down protest; the hens are starved (Chapter 7); the confessions and executions (Chapter 7); Boxer is sold to the knacker (Chapter 9).',
        'Squealer also uses fear of the past: the threat that Jones will come back stops the animals complaining.',
        'After the executions, Clover reflects that these scenes of terror and slaughter were not what the animals had hoped for when Old Major spoke.',
        'How to write about it: explain how fear changes what the animals do and say. Useful verbs: intimidates, terrorises, silences, crushes.',
      ] },
      { code: 'H7', name: 'Rewriting history and memory', notes: [
        'What Orwell is saying: whoever controls the record of the past controls the present. If people’s memories are weak, leaders can rewrite history.',
        'Snowball goes from hero of the Battle of the Cowshed to traitor: Squealer claims he was working for Jones all along, and later that his medal was a story he made up himself.',
        'The animals are told there was never a resolution against trade or money, and the Commandments are quietly repainted.',
        'Because most animals cannot read, and those who remember die off over the years, by Chapter 10 nobody can compare life now with life under Jones.',
        'How to write about it: point out the difference between what really happened (what the reader saw) and what the animals are told. Useful verbs: distorts, rewrites, erases, falsifies.',
      ] },
    ],
    cards: [
      ['What is a theme?', 'A big idea or message the writer explores across the whole text, such as power or propaganda.'],
      ['What is Orwell’s main message about power?', 'Power corrupts: leaders with unlimited power will abuse it, even if they started out with good ideals.'],
      ['Best evidence that power corrupts Napoleon', 'He goes from rebel to dictator: dogs, titles, the farmhouse, whips, and finally walking on two legs.'],
      ['What is propaganda?', 'Information, often biased or false, used to make people believe what those in power want.'],
      ['Who is the main source of propaganda?', 'Squealer.'],
      ['Name three of Squealer’s persuasive methods', 'Fake statistics, scare tactics (Jones will come back), rhetorical questions, euphemism, flattery.'],
      ['How does the slogan “Four legs good, two legs bad” control the animals?', 'The sheep bleat it to drown out debate, so nobody can argue.'],
      ['Original First Commandment', 'Whatever goes upon two legs is an enemy.'],
      ['Original Second Commandment', 'Whatever goes upon four legs, or has wings, is a friend.'],
      ['Original Third Commandment', 'No animal shall wear clothes.'],
      ['Original Fourth Commandment, and its changed version', 'No animal shall sleep in a bed. Changed to: No animal shall sleep in a bed with sheets.'],
      ['Original Fifth Commandment, and its changed version', 'No animal shall drink alcohol. Changed to: No animal shall drink alcohol to excess.'],
      ['Original Sixth Commandment, and its changed version', 'No animal shall kill any other animal. Changed to: No animal shall kill any other animal without cause.'],
      ['Original Seventh Commandment, and what replaces it', 'All animals are equal. Replaced by: All animals are equal but some animals are more equal than others.'],
      ['Which change comes after the pigs move into the farmhouse?', 'The Fourth: “with sheets” is added.'],
      ['Which change comes after the executions?', 'The Sixth: “without cause” is added.'],
      ['Which change comes after the pigs get drunk?', 'The Fifth: “to excess” is added.'],
      ['Why do the pigs only add a few words to each commandment?', 'So the change is hard to notice and they can claim the rule always said that.'],
      ['How does ignorance help the pigs?', 'Animals who cannot read or remember clearly cannot prove the rules or history have been changed.'],
      ['How is education used to control the animals?', 'Napoleon takes charge of the puppies’ “education”, turning them into his guards; the other animals are taught slogans, not how to think.'],
      ['What does Benjamin show about knowledge?', 'Knowing the truth is not enough if you do nothing with it.'],
      ['What does “the revolution betrayed” mean?', 'The leaders of the revolution turn against the ideals they fought for, and become like the tyrants they replaced.'],
      ['How does the ending show the revolution has gone full circle?', 'The farm is Manor Farm again and the pigs look and act exactly like the humans.'],
      ['Why is Beasts of England banned?', 'Squealer says the Rebellion is completed, but really the song’s dream of freedom is dangerous to Napoleon.'],
      ['How does Napoleon use fear?', 'The dogs, the executions, starving the hens and the threat that Jones will return.'],
      ['What does Clover realise after the executions?', 'That the terror and slaughter are not what Old Major’s dream promised.'],
      ['How is Snowball’s history rewritten?', 'From hero of the Cowshed to secret traitor working for Jones all along.'],
      ['Why can the pigs rewrite history?', 'There are no written records, the animals’ memories are weak, and those who remember die over time.'],
      ['What warning is Orwell giving his readers?', 'Watch your leaders closely, question what you are told, and do not let anyone have unlimited power.'],
      ['Is Animal Farm only about Russia?', 'No. Orwell uses Russia as an example, but the message about power and propaganda applies to any society.'],
      ['How does inequality appear straight after the Rebellion?', 'The pigs supervise instead of working and take the milk and apples.'],
      ['How does Orwell show the working class being exploited?', 'Boxer works himself to exhaustion and is then sold to the knacker.'],
    ],
    concepts: [
      ['Which theme is best shown by the pigs taking the milk and apples?', ['Equality and class', 'Fear and violence', 'Education', 'Religion'], 0, 'The pigs give themselves privileges straight away.'],
      ['“Power corrupts” means…', ['Leaders with power tend to abuse it', 'Only bad animals want power', 'Power is always shared fairly', 'Leaders should never be trusted to read'], 0, ''],
      ['Which change was made to the Fourth Commandment?', ['“to excess” was added', '“with sheets” was added', '“without cause” was added', 'It was never changed'], 1, ''],
      ['Which commandment became “No animal shall drink alcohol to excess”?', ['The Third', 'The Fourth', 'The Fifth', 'The Sixth'], 2, ''],
      ['Which commandment had “without cause” added?', ['The Sixth', 'The Seventh', 'The Second', 'The Fourth'], 0, 'It comes just after the executions in Chapter 7.'],
      ['What replaces all Seven Commandments in Chapter 10?', ['Four legs good, two legs better', 'Napoleon is always right', 'All animals are equal but some animals are more equal than others', 'No animal shall wear clothes'], 2, ''],
      ['Why does the commandment about clothes matter at the end?', ['The pigs start wearing Jones’s clothes', 'The sheep start wearing ribbons', 'Boxer wears a straw hat', 'Mollie returns in a coat'], 0, 'The pigs now look like humans.'],
      ['Why do the pigs change the Commandments at night?', ['So the animals will not see it happen', 'Because paint dries faster at night', 'Because Napoleon is asleep', 'To surprise the humans'], 0, 'Squealer is caught by the barn wall with a ladder and paint.'],
      ['How does the animals’ lack of education help the pigs?', ['The animals cannot check what the rules really said', 'The animals work harder', 'The animals can build the windmill faster', 'It makes no difference'], 0, ''],
      ['Which moment best shows fear being used to control the animals?', ['The confessions and executions', 'The first harvest', 'Snowball’s reading classes', 'Mollie leaving'], 0, ''],
      ['Which moment best shows history being rewritten?', ['Snowball is said to have fought for Jones at the Cowshed', 'Boxer learns the letter D', 'The flag is raised', 'The animals win the first harvest'], 0, ''],
      ['The ending, where pigs and men look the same, shows…', ['The revolution has gone full circle', 'The animals are finally free', 'Snowball has returned', 'The humans have become animals'], 0, ''],
      ['Which of these is propaganda?', ['Squealer’s lists of figures showing production has risen', 'Boxer pulling stone', 'Clover protecting ducklings', 'The storm knocking down the windmill'], 0, 'False or one-sided information used to persuade.'],
      ['What does Orwell suggest about people like Benjamin?', ['Doing nothing allows tyranny to grow', 'They are the true heroes', 'They should have joined the humans', 'They wrote the Commandments'], 0, ''],
      ['What does Old Major’s dream represent in the theme of the revolution betrayed?', ['The ideals the pigs later abandon', 'Napoleon’s secret plan', 'Moses’ Sugarcandy Mountain', 'Frederick’s attack'], 0, ''],
      ['When you write about a theme, you should…', ['Retell the whole plot', 'Explain what Orwell is saying about it, using a key moment and a technique', 'Just name the theme', 'Write about your own opinion only'], 1, ''],
      ['Which theme does “readjustment” instead of “reduction” best show?', ['Propaganda and language', 'Fear and violence', 'Education', 'Class'], 0, 'A euphemism hides a harsh truth.'],
    ],
    short: [
      { q: 'Explain the irony in the single commandment that replaces the Seven.', passage: 'The single Commandment painted on the barn wall in Chapter 10:\n“ALL ANIMALS ARE EQUAL BUT SOME ANIMALS ARE MORE EQUAL THAN OTHERS”', marks: 2, tags: ['H3'], criteria: ['Explains that the statement contradicts itself: equal cannot have degrees', 'Explains that it reveals the pigs now openly see themselves as superior, betraying the original idea of equality'], model: 'The statement contradicts itself, because if all animals are truly equal, none can be “more equal” than others. This irony exposes the truth of the farm: the pigs now openly see themselves as superior, so the revolution’s central promise of equality has been completely betrayed.' },
      { q: 'How does Squealer persuade the animals to accept that the pigs should keep the milk and apples?', passage: 'Squealer: “Milk and apples (this has been proved by Science, comrades) contain substances absolutely necessary to the well-being of a pig… Do you know what would happen if we pigs failed in our duty? Jones would come back!”', marks: 3, tags: ['H2'], criteria: ['Identifies the appeal to authority or fake science (“proved by Science”)', 'Identifies the rhetorical question and scare tactic about Jones coming back', 'Explains the effect: the animals are confused or frightened into accepting the pigs’ privilege'], model: 'Squealer claims his argument has been “proved by Science”, an appeal to authority that the uneducated animals cannot check. He then asks a rhetorical question, “Do you know what would happen…?”, and answers it with the frightening idea that “Jones would come back!” By using fake science and fear together, he makes the pigs’ greed sound like a duty, so the animals accept it without complaint.' },
      { q: 'What does this sentence reveal about how the animals feel after the executions?', passage: '“These scenes of terror and slaughter were not what they had looked forward to on that night when old Major first stirred them to rebellion.”', marks: 2, tags: ['H5'], criteria: ['Identifies the animals’ shock, sadness or disappointment', 'Explains the contrast between Old Major’s hopeful dream and the violent reality, showing the revolution has been betrayed'], model: 'The sentence shows the animals’ shock and deep disappointment. Orwell contrasts the hopeful night of Old Major’s speech with these “scenes of terror and slaughter”, highlighting how far the farm has fallen from its ideals and suggesting the revolution has been betrayed.' },
      { q: 'What does this sentence suggest about the pigs straight after the Rebellion?', passage: '“The pigs did not actually work, but directed and supervised the others.”', marks: 2, tags: ['H3'], criteria: ['States that the pigs have made themselves a ruling or privileged class', 'Explains that this is an early sign of inequality, foreshadowing that they will become like the humans'], model: 'It suggests that the pigs have already made themselves a separate ruling class, giving orders instead of sharing the hard work. This early sign of inequality foreshadows how the pigs will eventually become just like the humans they overthrew.' },
      { q: 'Explain how the changes to the Seven Commandments show the pigs’ growing power.', marks: 4, tags: ['H3'], criteria: ['Gives an accurate example of a changed commandment (original and new wording)', 'Explains that the change comes after the pigs have already broken the rule', 'Explains that the animals cannot read or remember well enough to challenge it', 'Links to the final commandment and the message that power corrupts'], model: 'The pigs change the Commandments to excuse their own behaviour. For example, after moving into the farmhouse, “No animal shall sleep in a bed” becomes “No animal shall sleep in a bed with sheets”. The pigs break the rule first and then change the wording, and because most animals cannot read or remember clearly, nobody can prove it. By Chapter 10 the rules are replaced by “All animals are equal but some animals are more equal than others”, showing the pigs now have so much power that they no longer even pretend to be equal.' },
      { q: 'How does Orwell show that ignorance makes it easier for leaders to control people?', marks: 3, tags: ['H4'], criteria: ['Gives an example of the animals’ lack of education (Boxer and the letter D, the sheep and slogans)', 'Explains how this lets the pigs lie or change rules without being challenged', 'Explains Orwell’s message or warning about education and questioning leaders'], model: 'Most animals never learn to read properly: Boxer cannot get past the letter D and the sheep can only bleat slogans. Because of this, the pigs can quietly repaint the Commandments and tell lies about the past, and the animals have no way to check. Orwell warns that people who are not educated, or who do not question what they are told, are easy for leaders to control.' },
    ],
  });
  afthemes.bank = [
    function matchTheme(level) {
      const m = MOMENTS.filter(x => x[0] === level), [L, code, moment, wrongs, why] = pick(m.length ? m : MOMENTS);
      return { level: L, tags: [code], stem: `Moment: ${moment}`, parts: [CH('', 'Which theme does this moment show most clearly?', TH[code], wrongs.map(w => TH[w]), [why])] };
    },
    function commandmentChange(level) {
      if (level === 'F') {
        const c = pick(COMMANDMENTS.slice(3, 6));
        const fakes = [`${c[1].slice(0, -1)} with sheets.`, `${c[1].slice(0, -1)} to excess.`, `${c[1].slice(0, -1)} without cause.`, `${c[1].slice(0, -1)} on Sundays.`];
        return { level: 'F', tags: ['H3'], stem: `The ${ORDINAL[c[0] - 1]} Commandment originally said: “${c[1]}”`, parts: [CH('', 'What was it changed to?', c[2], fakes, [`Changed in Chapter ${c[3]}, after ${c[4]}.`])] };
      }
      if (level === 'S') {
        const c = pick([...COMMANDMENTS.slice(3, 6), COMMANDMENTS[6]]);
        return { level: 'S', tags: ['H3'], stem: `New wording: “${c[2]}”`, parts: [CH('', 'Which commandment was changed to say this?', `The ${ORDINAL[c[0] - 1]}`, ORDINAL.filter((_, i) => i !== c[0] - 1).map(o => `The ${o}`).slice(0, 6).sort(() => Math.random() - 0.5).slice(0, 3), [`Original: “${c[1]}” Changed in Chapter ${c[3]}, after ${c[4]}.`])] };
      }
      const items = [
        ['Which commandment is changed straight after the pigs move into the farmhouse?', 'The Fourth', ['The Fifth', 'The Sixth', 'The Seventh'], 'Chapter 6: “with sheets” is added.'],
        ['Which commandment is changed after the pigs get drunk on whisky?', 'The Fifth', ['The Fourth', 'The Sixth', 'The Third'], 'Chapter 8: “to excess” is added.'],
        ['Which commandment is changed after the confessions and executions?', 'The Sixth', ['The Fifth', 'The Fourth', 'The Seventh'], 'Chapter 8: “without cause” is added.'],
        ['Which commandment is never reworded but is broken when the pigs put on Jones’s clothes?', 'The Third', ['The Fourth', 'The Fifth', 'The Sixth'], 'The Third said “No animal shall wear clothes.”'],
        ['Which commandment is broken when the pigs walk on two legs?', 'The First', ['The Fourth', 'The Fifth', 'The Sixth'], 'The First said “Whatever goes upon two legs is an enemy.”'],
        ['Squealer is found at night beside a broken ladder and a pot of paint. Which commandment is soon found to be different?', 'The Fifth', ['The Fourth', 'The Sixth', 'The Third'], 'It now reads “No animal shall drink alcohol to excess.”'],
        ['Why do the pigs only add a few words when they change a commandment?', 'So the animals think it always said that and cannot prove otherwise', ['Because they run out of paint', 'Because Old Major told them to', 'Because the humans demand it'], 'Small changes are hard to notice, and the animals’ memories are weak.'],
      ];
      const [q, right, wrongs, why] = pick(items);
      return { level: 'C', tags: ['H3'], stem: 'The Seven Commandments.', parts: [CH('', q, right, wrongs, [why])] };
    },
  ];

  /* ================= ANIMAL FARM: TECHNIQUES ================= */
  // [section, term, definition, Animal Farm example, effect]
  const AF_TECH = [
    ['K1', 'Allegory', 'A story with a second, hidden meaning, where characters and events stand for real people and events.', 'The animals’ rebellion and Napoleon’s rule retell the Russian Revolution and Stalin’s dictatorship.', 'Lets Orwell criticise real dictators in a simple story that anyone can understand.'],
    ['K1', 'Fable', 'A short story, often with animals, that teaches a moral lesson. Orwell subtitled the book “A Fairy Story”.', 'Talking farm animals in a simple story about rules and their consequences.', 'Makes the warning feel like a timeless lesson and easy to follow.'],
    ['K1', 'Satire', 'Mocking people or institutions, often with humour or exaggeration, to criticise them.', 'Pigs greedily taking the milk and apples while claiming it is for everyone’s good.', 'Makes the reader laugh at, then judge, the hypocrisy of those in power.'],
    ['K1', 'Anthropomorphism', 'Giving animals human qualities, such as speaking, reading and voting.', 'The pigs argue, write rules, trade and finally walk on two legs.', 'Lets Orwell show human politics clearly; the pigs becoming more human shows their corruption.'],
    ['K1', 'Allusion', 'A reference to a well-known person, event or text.', 'Napoleon is named after the French emperor who seized power after a revolution.', 'Hints at the pig’s ambition before he does anything.'],
    ['K2', 'Dramatic irony', 'When the reader understands something that the characters do not.', 'The reader knows the pigs are taking the milk and lying about Boxer, but most animals believe them.', 'Makes the reader frustrated and sympathetic, and sharpens Orwell’s criticism.'],
    ['K2', 'Situational irony', 'When what happens is the opposite of what was expected.', 'The pigs, who led the Rebellion against humans, end up acting exactly like humans.', 'Shows how badly the revolution has failed.'],
    ['K2', 'Verbal irony', 'When words mean the opposite of what they seem to say, or contradict the reality.', '“All animals are equal but some animals are more equal than others.”', 'Exposes the pigs’ hypocrisy in their own words.'],
    ['K3', 'Symbolism', 'Using an object, place or action to stand for a bigger idea.', 'The windmill, the farmhouse, the whip, the flag, the songs and the barn wall all carry bigger meanings.', 'Adds layers of meaning and lets small details show big changes.'],
    ['K4', 'Slogans', 'Short, catchy phrases repeated to spread an idea.', '“Four legs good, two legs bad.” “Napoleon is always right.”', 'Replace thinking with chanting and drown out debate.'],
    ['K4', 'Repetition', 'Repeating words or ideas for emphasis.', '“Jones would come back! Yes, Jones would come back!”', 'Hammers a fear into the animals’ minds so they stop arguing.'],
    ['K4', 'Rhetorical question', 'A question asked for effect, not to get an answer.', 'Squealer: “Do you know what would happen if we pigs failed in our duty?”', 'Makes the answer seem obvious and pushes listeners to agree.'],
    ['K4', 'Emotive language', 'Words chosen to stir strong feelings.', 'Squealer’s warnings about Jones returning and his tearful story of Boxer’s death.', 'Uses fear or sadness to stop the animals thinking clearly.'],
    ['K4', 'Euphemism', 'A mild word used to hide something harsh or unpleasant.', 'Squealer calls a cut in rations a “readjustment”, never a “reduction”.', 'Hides bad news so the animals do not complain.'],
    ['K4', 'Statistics and false evidence', 'Using numbers or “facts” to make a claim seem true.', 'Squealer reads out long lists of figures showing that food production has gone up.', 'The animals cannot check, so the numbers silence their doubts even when they are hungry.'],
    ['K4', 'Flattery and titles', 'Praising a leader in exaggerated ways.', 'Napoleon is called “Father of All Animals” and “Terror of Mankind”.', 'Builds a cult of personality around Napoleon.'],
    ['K5', 'Foreshadowing', 'Hints early in a story about what will happen later.', 'The milk disappears at the end of Chapter 2; Napoleon takes the puppies in Chapter 3.', 'Builds unease and shows the pigs’ corruption began straight away.'],
    ['K5', 'Cyclical structure', 'A story that ends where it began.', 'The novel opens at Manor Farm under a drunk master and ends at Manor Farm under pigs who drink and look like men.', 'Suggests the revolution has changed nothing: one tyrant has replaced another.'],
    ['K5', 'Naive (limited) narration', 'A third-person narrator who mostly tells events as the ordinary animals see them, without explaining the truth.', 'Lies are reported plainly, for example that the animals were happy in their work, while we see they are starving.', 'The reader has to spot the lies, which makes us more alert and more critical.'],
    ['K5', 'Juxtaposition', 'Placing two contrasting things side by side.', 'The pigs drink whisky in the farmhouse while the other animals go hungry.', 'Highlights the inequality and hypocrisy of the pigs.'],
  ];
  // [symbol, meaning]
  const SYMBOLS = [
    ['The windmill', 'The pigs’ broken promises: it is meant to make life easier but only makes the animals work harder, and finally makes profit for the pigs. It also stands for Stalin’s Five-Year Plans.'],
    ['The farmhouse', 'Human power and privilege; when the pigs move in, they become the new masters.'],
    ['The green flag with the hoof and horn', 'The hope of an animal republic; when Napoleon removes the hoof and horn at the end, that hope is gone.'],
    ['Beasts of England', 'The dream of freedom and equality; banning it shows the dream is dead.'],
    ['The new anthem by Minimus', 'Loyalty to the state and to Napoleon instead of to the animals’ freedom.'],
    ['The whip', 'Cruel control by force; first Jones’s tool, later carried by the pigs.'],
    ['The Seven Commandments on the barn wall', 'The ideals of the revolution, and how easily the powerful can rewrite them.'],
    ['The name changes: Manor Farm to Animal Farm and back', 'The revolution’s hope and then its complete failure; the farm ends where it began.'],
    ['Sugarcandy Mountain', 'The promise of a reward after death, which keeps animals patient with suffering now.'],
    ['Walking on two legs', 'The pigs becoming the humans they overthrew.'],
  ];
  // [level, section, example, technique, wrongs]
  const AF_SPOT = [
    ['F', 'K4', '“Four legs good, two legs bad.”', 'Slogan', ['Simile', 'Flashback', 'Onomatopoeia']],
    ['F', 'K4', 'Squealer calls a cut in rations a “readjustment”, never a “reduction”.', 'Euphemism', ['Hyperbole', 'Simile', 'Alliteration']],
    ['F', 'K1', 'Pigs, horses and sheep talk, argue, vote and paint rules on a wall.', 'Anthropomorphism', ['Onomatopoeia', 'Euphemism', 'Flashback']],
    ['F', 'K4', 'Squealer: “Do you know what would happen if we pigs failed in our duty?”', 'Rhetorical question', ['Euphemism', 'Simile', 'Foreshadowing']],
    ['F', 'K5', 'At the end of Chapter 2, the cows’ milk disappears while the other animals are out harvesting.', 'Foreshadowing', ['Flashback', 'Euphemism', 'Simile']],
    ['F', 'K3', 'The pigs move into the farmhouse and sleep in Jones’s beds.', 'Symbolism', ['Onomatopoeia', 'Simile', 'Rhetorical question']],
    ['S', 'K4', '“Jones would come back! Yes, Jones would come back!”', 'Repetition', ['Euphemism', 'Simile', 'Allusion']],
    ['S', 'K1', 'A story about farm animals that retells the Russian Revolution and Stalin’s rule.', 'Allegory', ['Simile', 'Flashback', 'Onomatopoeia']],
    ['S', 'K1', 'The dictator pig is named Napoleon, after a French emperor who seized power after a revolution.', 'Allusion', ['Euphemism', 'Onomatopoeia', 'Simile']],
    ['S', 'K5', 'The pigs drink whisky in the farmhouse while the other animals go hungry.', 'Juxtaposition', ['Foreshadowing', 'Euphemism', 'Onomatopoeia']],
    ['S', 'K5', 'Napoleon takes nine puppies away from their mothers, saying he will educate them himself.', 'Foreshadowing', ['Flashback', 'Simile', 'Euphemism']],
    ['S', 'K4', 'Squealer reads out long lists of figures proving that food production has gone up.', 'Statistics and false evidence', ['Euphemism', 'Simile', 'Foreshadowing']],
    ['S', 'K3', 'Napoleon appears in the yard carrying a whip in his trotter.', 'Symbolism', ['Simile', 'Onomatopoeia', 'Euphemism']],
    ['S', 'K4', 'Napoleon is called “Father of All Animals” and “Terror of Mankind”.', 'Flattery and titles', ['Euphemism', 'Onomatopoeia', 'Foreshadowing']],
    ['C', 'K2', 'The single Commandment on the barn wall: “ALL ANIMALS ARE EQUAL BUT SOME ANIMALS ARE MORE EQUAL THAN OTHERS”', 'Verbal irony', ['Simile', 'Foreshadowing', 'Onomatopoeia']],
    ['C', 'K2', 'Squealer tells the animals Boxer died in the hospital at Willingdon, but the reader has seen the slaughterer’s van take him away.', 'Dramatic irony', ['Simile', 'Foreshadowing', 'Onomatopoeia']],
    ['C', 'K2', 'The pigs, who led a rebellion against humans, end up walking on two legs and playing cards with farmers.', 'Situational irony', ['Euphemism', 'Simile', 'Flashback']],
    ['C', 'K5', 'The novel opens at Manor Farm under a drunken master and ends at Manor Farm under pigs who drink and look like men.', 'Cyclical structure', ['Flashback', 'Simile', 'Euphemism']],
    ['C', 'K1', 'Orwell mocks a dictatorship by showing its leaders as greedy pigs who claim everything they take is for the good of all.', 'Satire', ['Flashback', 'Euphemism', 'Onomatopoeia']],
    ['C', 'K5', 'The narrator plainly reports Squealer’s figures showing everything is improving, without saying that the animals are hungry and cold.', 'Naive (limited) narration', ['Foreshadowing', 'Simile', 'Onomatopoeia']],
  ];
  // [section, example, question, best effect, weaker readings]
  const AF_EFFECTS = [
    ['K4', 'Squealer calls a cut in rations a “readjustment”, never a “reduction”.', 'What is the effect of this euphemism?', 'It makes a harsh cut sound harmless, so the hungry animals do not complain.', ['It shows the animals will soon get more food.', 'It creates a cheerful, comic mood.', 'It shows Squealer is confused about the rations.']],
    ['K4', '“Four legs good, two legs bad.”', 'What is the effect of this slogan when the sheep bleat it during meetings?', 'It drowns out debate, so the animals stop thinking for themselves.', ['It helps the animals discuss ideas fairly.', 'It teaches the sheep to read.', 'It makes the humans afraid of the farm.']],
    ['K4', '“Jones would come back! Yes, Jones would come back!”', 'What is the effect of this repetition?', 'It hammers home the animals’ biggest fear, so they accept the pigs’ privileges rather than risk it.', ['It shows that Squealer misses Jones.', 'It makes the speech sound calm and relaxed.', 'It proves Jones is about to attack.']],
    ['K5', 'The cows’ milk disappears at the end of Chapter 2.', 'What is the effect of this foreshadowing?', 'It hints early on that the pigs are already greedy and the revolution will be corrupted.', ['It shows the cows are unwell.', 'It proves Snowball is a thief.', 'It shows the harvest has failed.']],
    ['K5', 'At the end, the animals look from pig to man and from man to pig and cannot tell which is which.', 'What is the effect of this ending?', 'It shows the pigs have become as bad as the humans, so the revolution has gone full circle.', ['It shows the pigs and humans are now true friends who will treat the animals well.', 'It suggests the animals need glasses.', 'It shows Snowball has returned in disguise.']],
    ['K2', 'Squealer tells the animals Boxer died in the hospital at Willingdon, but the reader has seen the slaughterer’s van take him away.', 'What is the effect of this dramatic irony?', 'The reader feels angry and sad because we know the truth the animals are denied.', ['It makes the reader trust Squealer more.', 'It creates a light, comic tone.', 'It shows Boxer was not really loyal.']],
    ['K3', 'The windmill is finally used to grind corn for profit, not to give the animals electricity.', 'What does this show about the windmill as a symbol?', 'It shows the revolution’s promises of an easier life were broken and only the pigs benefit.', ['It shows the animals finally have an easy life.', 'It shows Snowball’s plan has worked perfectly.', 'It shows the windmill was never built.']],
    ['K1', 'Pigs, rather than another animal, become the ruling class.', 'What is the effect of Orwell making the rulers pigs?', 'Pigs are often linked to greed, so the reader is positioned to see the rulers as greedy and selfish.', ['Pigs are admired as brave, so the rulers seem heroic.', 'It shows the rulers are the hardest workers.', 'It has no effect on how we see them.']],
    ['K5', 'The pigs drink whisky in the farmhouse while the other animals go hungry.', 'What is the effect of this juxtaposition?', 'It highlights the huge gap between the pigs and the other animals, showing the pigs’ hypocrisy.', ['It shows all the animals are now equal.', 'It shows the pigs are sharing their food.', 'It creates a peaceful, happy mood.']],
    ['K4', 'Squealer: “Do you know what would happen if we pigs failed in our duty?”', 'What is the effect of this rhetorical question?', 'It makes the answer seem obvious and frightening, pushing the animals to agree without arguing.', ['It shows Squealer is genuinely unsure.', 'It invites the animals to vote on the question.', 'It makes the speech sound funny.']],
  ];

  const afTechNotes = (code) => AF_TECH.filter(t => t[0] === code).map(t => `${t[1]}: ${t[2]} Example: ${t[3]} Effect: ${t[4]}`);
  const aftech = finish({
    id: 'aftech', subject: SUBJECT, title: 'Animal Farm: techniques', chapter: 'Animal Farm', hue: HUE,
    blurb: 'Allegory, satire, irony, symbols, Squealer’s persuasive language and the structure of the novel, with what each one does to Orwell’s message.',
    sections: [
      { code: 'K1', name: 'Allegory, fable and satire', notes: [...afTechNotes('K1'), 'Remember: a technique is only worth marks when you explain how it helps Orwell create meaning.'] },
      { code: 'K2', name: 'Irony', notes: [...afTechNotes('K2'), 'Tip: irony is everywhere in Animal Farm because the animals believe the pigs while the reader can see the truth.'] },
      { code: 'K3', name: 'Symbolism', notes: ['Symbolism: an object, place or action that stands for a bigger idea.', ...SYMBOLS.map(s => `${s[0]}: ${s[1]}`)], ex: ['Analysing a symbol: the windmill', 'Point: the windmill symbolises the pigs’ broken promises.', 'Evidence: Snowball promises it will cut the working week, but at the end it is used to grind corn for profit.', 'Analysis: the animals work themselves to exhaustion building it three times, yet never get its benefits.', 'Link: Orwell suggests that leaders often use grand projects to make people work harder for the leaders’ own gain.'] },
      { code: 'K4', name: 'The language of power: Squealer, slogans and euphemism', notes: [...afTechNotes('K4'), 'Squealer usually combines several techniques at once: a rhetorical question, a scary warning and a fact the animals cannot check.'] },
      { code: 'K5', name: 'Narration and structure', notes: [...afTechNotes('K5'), 'The narrator rarely tells us directly that the pigs are lying. Orwell trusts the reader to notice the gap between what the animals are told and what is really happening.'] },
    ],
    cards: [
      ...AF_TECH.map(t => [t[1], `${t[2]} In Animal Farm: ${t[3]}`]),
      ...SYMBOLS.map(s => [`What does ${s[0].charAt(0).toLowerCase() + s[0].slice(1)} symbolise?`, s[1]]),
      ['Allegory or fable?', 'An allegory has a hidden second meaning (Russia). A fable is a simple animal story that teaches a lesson. Animal Farm is both.'],
      ['Dramatic or situational irony?', 'Dramatic: the reader knows more than the characters. Situational: the outcome is the opposite of what was expected.'],
      ['Why is the narration called naive?', 'It reports events as the ordinary animals understand them, without pointing out the lies, so the reader must spot them.'],
      ['Why do the pigs becoming more human matter?', 'It shows step by step that they are turning into the masters they overthrew.'],
      ['Technique, evidence, effect', 'Name the technique, give a short quote or describe the moment, then explain how it shapes Orwell’s message.'],
    ],
    concepts: [
      ['Animal Farm is an allegory because…', ['It has talking animals', 'Its characters and events stand for real people and events', 'It is very short', 'It has a happy ending'], 1, 'The second meaning is the Russian Revolution.'],
      ['Which is the best example of euphemism?', ['“Four legs good, two legs bad”', 'Calling a cut in rations a “readjustment”', 'The windmill falling down', 'Napoleon’s dogs'], 1, 'A mild word hides a harsh fact.'],
      ['The reader knows the pigs sold Boxer, but the animals believe he died in hospital. This is…', ['Situational irony', 'Dramatic irony', 'Foreshadowing', 'Allusion'], 1, ''],
      ['The pigs end up just like the humans they rebelled against. This is…', ['Situational irony', 'Euphemism', 'A slogan', 'Anthropomorphism'], 0, 'The outcome is the opposite of what the Rebellion intended.'],
      ['The farm’s name going from Manor Farm to Animal Farm and back is an example of…', ['Cyclical structure', 'Onomatopoeia', 'Simile', 'Euphemism'], 0, ''],
      ['What does the windmill symbolise by the end?', ['The animals’ easy life', 'The pigs’ broken promises and the animals’ exploitation', 'Snowball’s victory', 'The humans’ defeat'], 1, ''],
      ['Why does Napoleon remove the hoof and horn from the flag?', ['It shows the hope of an animal republic is gone', 'The paint ran out', 'Snowball designed it', 'The humans asked him to'], 0, ''],
      ['What does the whip in the pigs’ trotters symbolise?', ['Control through cruelty, like Jones', 'Farming skill', 'Equality', 'Celebration'], 0, ''],
      ['“Four legs good, two legs bad” is mainly an example of…', ['A slogan', 'A simile', 'Dramatic irony', 'Flashback'], 0, ''],
      ['Why does Squealer use rhetorical questions?', ['To make the answer seem obvious and push the animals to agree', 'Because he does not know the answer', 'To start a debate', 'To make the animals laugh'], 0, ''],
      ['The disappearing milk in Chapter 2 is an example of…', ['Foreshadowing', 'Cyclical structure', 'Euphemism', 'Allusion'], 0, ''],
      ['Giving animals the ability to talk, read and vote is…', ['Anthropomorphism', 'Onomatopoeia', 'Euphemism', 'Juxtaposition'], 0, ''],
      ['Orwell’s use of satire in the novel is meant to…', ['Mock and criticise dictators and their hypocrisy', 'Praise Napoleon', 'Teach farming', 'Make the animals look heroic'], 0, ''],
      ['What is the effect of the naive narration?', ['The reader must work out the truth behind the lies', 'The narrator explains every lie', 'The story is told by Napoleon', 'It makes the story confusing on purpose'], 0, ''],
      ['Which sentence best explains the effect of a technique?', ['Orwell uses a slogan.', 'The slogan “Four legs good, two legs bad” is repeated by the sheep to drown out debate, showing how slogans stop people thinking.', 'There are slogans in Animal Farm.', 'The sheep say a slogan.'], 1, 'It names the technique, gives evidence and explains the effect.'],
      ['Banning Beasts of England and replacing it with a new anthem symbolises…', ['The death of the revolution’s dream', 'A happier farm', 'Snowball’s return', 'A better harvest'], 0, ''],
      ['“All animals are equal but some animals are more equal than others” is ironic because…', ['It contradicts itself', 'It rhymes', 'It is a question', 'It is said by a human'], 0, 'Equal cannot come in degrees.'],
    ],
    short: [
      { q: 'Identify one technique in the novel’s final sentence and explain its effect.', passage: '“The creatures outside looked from pig to man, and from man to pig, and from pig to man again; but already it was impossible to say which was which.”', marks: 3, tags: ['K5'], criteria: ['Identifies a technique: repetition, cyclical structure or situational irony', 'Supports it with words from the sentence (“from pig to man, and from man to pig”)', 'Explains that the pigs have become as bad as the humans, so the revolution has gone full circle'], model: 'Orwell uses repetition in “from pig to man, and from man to pig, and from pig to man again”, so the animals’ eyes move back and forth just like the reader’s. This shows their confusion and creates situational irony: the pigs who led the fight against humans are now impossible to tell apart from them. It completes the cyclical structure, showing the revolution has gone full circle and the animals are no better off than under Jones.' },
      { q: 'Identify two persuasive techniques Squealer uses here and explain how they control the animals.', passage: 'Squealer: “Do not imagine, comrades, that leadership is a pleasure! On the contrary, it is a deep and heavy responsibility… But sometimes you might make the wrong decisions, comrades, and then where should we be?”', marks: 4, tags: ['K4'], criteria: ['Identifies one technique, such as the rhetorical question “where should we be?”', 'Identifies a second technique, such as inclusive address “comrades” or emotive language “deep and heavy responsibility”', 'Explains how Squealer presents Napoleon as self-sacrificing rather than power-hungry', 'Explains how the animals are made to doubt themselves and give up their right to decide'], model: 'Squealer repeats “comrades”, an inclusive form of address that makes the animals feel he is on their side. He uses emotive language, calling leadership “a deep and heavy responsibility”, so Napoleon’s grab for power sounds like a sacrifice. He ends with a rhetorical question, “then where should we be?”, which hints at disaster without saying it and makes the animals doubt their own judgement. Together these techniques persuade the animals to hand all decisions to Napoleon.' },
      { q: 'What is the technique here, and why does Squealer use it?', passage: 'When food rations are cut in Chapter 9, Squealer always speaks of a “readjustment”, never a “reduction”.', marks: 2, tags: ['K4'], criteria: ['Identifies euphemism', 'Explains that the gentle word hides the harsh truth that the animals are getting less food, so they do not complain'], model: 'This is euphemism, using a mild word to hide something unpleasant. By saying “readjustment” instead of “reduction”, Squealer makes a cut in food sound harmless and technical, so the hungry animals do not realise how bad things are and do not complain.' },
      { q: 'How does Orwell use these two slogans to show the pigs’ corruption?', passage: 'Chapter 3: the sheep learn the slogan “Four legs good, two legs bad.”\nChapter 10: after the pigs begin walking on two legs, the sheep bleat “Four legs good, two legs better!”', marks: 3, tags: ['K4'], criteria: ['Identifies the slogan or repetition and its role in drowning out thought', 'Explains the change of a single word, from “bad” to “better”', 'Explains that this shows the pigs have betrayed the revolution and can make the sheep say anything'], model: 'The first slogan sums up the revolution’s belief that humans are the enemy, and the sheep repeat it so often that it replaces real thinking. In Chapter 10 Orwell changes one word, “bad” to “better”, at the exact moment the pigs start walking like humans. The sheep chant the opposite of the original idea just as happily, which shows the pigs have completely betrayed the revolution and can control what the animals believe.' },
      { q: 'Explain how Orwell uses the windmill as a symbol.', marks: 3, tags: ['K3'], criteria: ['States what the windmill was promised to do (electricity, shorter working week, easier lives)', 'Describes what really happens (rebuilt with huge effort, finally used to grind corn for profit)', 'Explains what it symbolises: broken promises and the exploitation of the workers'], model: 'Snowball promises the windmill will give the animals electricity and a much shorter working week. Instead, the animals work themselves to exhaustion building it again and again, and at the end it is used to grind corn for profit, which only benefits the pigs. The windmill therefore symbolises the pigs’ broken promises and the way the workers are exploited for their leaders’ gain.' },
    ],
  });
  aftech.bank = [
    function spotTechnique(level) {
      const m = AF_SPOT.filter(s => s[0] === level), [L, code, line, techName, wrongs] = pick(m.length ? m : AF_SPOT);
      const t = AF_TECH.find(x => x[1] === techName);
      return { level: L, tags: [code], stem: 'Read the moment from Animal Farm, then identify the main technique.', passage: line, parts: [CH('', 'Which technique is used most clearly here?', techName, wrongs, [t ? `${techName}: ${t[2]} Effect: ${t[4]}` : `${techName}: an object, place or action that stands for a bigger idea.`])] };
    },
    function techniqueEffect(level) {
      const [code, line, q, right, wrongs] = pick(AF_EFFECTS);
      return { level: level === 'F' ? 'S' : 'C', tags: [code], stem: 'Read the moment, then choose the best explanation of its effect.', passage: line, parts: [CH('', q, right, wrongs, ['The best answer explains how the technique shapes Orwell’s message, not just what happens.'])] };
    },
    function symbolMeaning(level) {
      const s = pick(SYMBOLS);
      if (level === 'F') return { level: 'F', tags: ['K3'], stem: 'Symbols in Animal Farm.', parts: [CH('', `What does ${s[0].charAt(0).toLowerCase() + s[0].slice(1)} symbolise?`, s[1], othersOf(SYMBOLS.map(x => x[1]), s[1]), [`${s[0]}: ${s[1]}`])] };
      return { level: 'S', tags: ['K3'], stem: `Symbol meaning: ${s[1]}`, parts: [CH('', 'Which symbol is this?', s[0], othersOf(SYMBOLS.map(x => x[0]), s[0]), [`${s[0]}: ${s[1]}`])] };
    },
  ];

  /* ================= SHORT ANSWERS AND PETAL PARAGRAPHS ================= */
  // [level, section, question, best answer, weaker answers, why]
  const WRITE_Q = [
    Q('F', 'W2', 'Question: How does Orwell present Napoleon as a dictator? Which sentence is the best Point?', 'Orwell presents Napoleon as a ruthless dictator who uses fear and violence to gain and keep power.', ['Napoleon is a pig on Animal Farm.', 'In Chapter 5, the dogs chase Snowball off the farm.', 'I think Napoleon is a really mean character.'], 'A good Point answers the question directly and names the idea you will prove.'),
    Q('F', 'W2', 'Question: How does Orwell show the power of propaganda? Which sentence is the best Point?', 'Orwell shows that propaganda allows leaders to control what people believe, mainly through the character of Squealer.', ['Squealer is a small, fat pig.', 'Propaganda is a type of language.', 'There is a lot of propaganda in the book and it is bad.'], 'It answers the question and sets up the paragraph’s argument.'),
    Q('S', 'W2', 'Which sentence is the best Analysis of “readjustment” instead of “reduction”?', 'The gentle word “readjustment” disguises the harsh reality of starvation, revealing how Squealer manipulates language so the animals do not complain.', ['This is a euphemism.', 'Squealer says “readjustment” in Chapter 9.', 'This shows that Squealer is a pig who talks a lot.'], 'Analysis explains how the words work and what they reveal.'),
    Q('S', 'W2', 'Which sentence is the best Analysis of the slogan “Four legs good, two legs bad”?', 'Because the sheep bleat the slogan whenever there is debate, it drowns out thinking, highlighting how simple slogans can replace real discussion.', ['The slogan has six words.', 'The sheep say this slogan.', 'This slogan is repetitive.'], 'It explains the effect of the slogan, not just what it is.'),
    Q('S', 'W2', 'Which sentence is the best Link for a paragraph about Napoleon’s use of fear?', 'Therefore, Orwell warns that leaders who rule through fear will crush any resistance to keep their power.', ['That is all about Napoleon.', 'In conclusion, the dogs are scary.', 'Next I will talk about Squealer.'], 'A Link ties the paragraph back to the question and Orwell’s message.'),
    Q('S', 'W2', 'Which sentence is the best Link for a paragraph about the changing Commandments?', 'In this way, Orwell reveals how those in power rewrite the rules to protect themselves, showing that power corrupts.', ['The Commandments are on the barn wall.', 'This was the Fourth Commandment.', 'Squealer had a ladder.'], 'It links the evidence back to the big idea.'),
    Q('C', 'W3', 'Which verb makes this sentence the most analytical? “Orwell ___ how ignorance allows the pigs to control the animals.”', 'exposes', ['shows', 'says', 'writes'], '“Exposes” suggests Orwell is revealing something hidden and critical.'),
    Q('C', 'W2', 'Which sentence is the best Technique sentence?', 'Orwell uses dramatic irony, as the reader knows Boxer has been sold to the knacker while the animals believe Squealer’s lie.', ['There is a technique in this part.', 'Boxer dies in Chapter 9.', 'Orwell uses lots of techniques in Animal Farm.'], 'It names the technique and shows exactly where it is used.'),
    Q('C', 'W2', 'Which sentence is the best Evidence sentence for a paragraph about inequality?', 'After the Rebellion, the narrator explains that the pigs “did not actually work, but directed and supervised the others”.', ['The pigs are unfair.', 'Inequality is a big theme.', 'There are lots of examples of inequality in the book.'], 'Evidence gives a short quote or a specific moment.'),
  ];
  // Paragraphs with one PETAL step missing: [level, paragraph, missing step, why]
  const MISSING = [
    ['F', 'Orwell shows that power corrupts. Napoleon moves into the farmhouse and sleeps in Jones’s bed. This symbolism shows that he is becoming like the humans he overthrew. Orwell warns that leaders with unlimited power will take privileges for themselves.', 'Nothing is missing: it has P, E, T, A and L', 'P: “Orwell shows…”; E: the farmhouse and bed; T: symbolism; A: becoming like the humans; L: Orwell warns…'],
    ['F', 'Orwell shows how propaganda controls people. Squealer uses a rhetorical question, which makes the animals feel they have no choice but to agree. Orwell warns that leaders who control language can control their people.', 'Evidence: there is no quote or specific moment', 'The paragraph never says which question Squealer asks or when.'],
    ['S', 'Squealer says the pigs need the milk and apples because they are “brainworkers”, using a scare tactic that “Jones would come back!” This makes the animals too frightened to complain. Therefore, Orwell suggests that fear is used to justify inequality.', 'Point: there is no opening sentence that answers the question', 'It jumps straight to evidence without stating the argument first.'],
    ['S', 'Orwell shows that the revolution is betrayed. At the end the animals look “from pig to man, and from man to pig” and cannot tell them apart. This shows the pigs have become the humans. Orwell warns that revolutions can end in new tyranny.', 'Technique: no technique is named', 'It could name repetition, cyclical structure or situational irony.'],
    ['S', 'Orwell shows that ignorance allows leaders to control people. Boxer cannot learn past the letter D, and Orwell uses characterisation to present him as loyal but easily led. Therefore, Orwell warns that people who do not question their leaders are easily exploited.', 'Analysis: the effect is not explained', 'It needs to explain how Boxer’s ignorance lets the pigs lie to him, for example with “Napoleon is always right”.'],
    ['C', 'Orwell presents Napoleon as a ruthless dictator. When the four young pigs protest, the dogs let out “deep, menacing growls” and the pigs fall silent, and Orwell uses this moment to symbolise the threat of violence. Fear stops the animals from speaking, so Napoleon can rule without any opposition.', 'Link: it does not return to the question or Orwell’s message', 'It needs a final sentence such as “Orwell warns that dictators use terror to silence opposition.”'],
    ['C', 'Orwell shows the power of propaganda. Squealer calls a cut in rations a “readjustment”. This euphemism hides the truth, so the animals do not realise they are starving. Through Squealer, Orwell criticises leaders who twist words to avoid blame.', 'Nothing is missing: it has P, E, T, A and L', 'P: power of propaganda; E: “readjustment”; T: euphemism; A: hides the truth; L: Orwell criticises…'],
  ];

  const afwrite = finish({
    id: 'afwrite', subject: SUBJECT, title: 'Short answers and PETAL paragraphs', chapter: 'Animal Farm', hue: HUE,
    blurb: 'How to read exam questions, how many marks need what, and how to write strong PETAL paragraphs about Animal Farm.',
    sections: [
      { code: 'W1', name: 'Reading the question', notes: [
        'Underline the key words in the question: the instruction word (identify, explain, how does), the theme or character, and any technique named.',
        'Identify means name it: a short answer is fine. Explain means say how or why, with a reason. How does Orwell… means you must name a technique and explain its effect.',
        'Look at the marks: they tell you how much to write.',
        '1 mark: one clear point, often one sentence (for example, naming a technique or a character).',
        '2–3 marks: a technique plus a short quote or a specific moment plus its effect. Think of it as a mini-PETAL in two to four sentences.',
        '4 marks: two techniques or two points, each with evidence and effect.',
        '8 marks: a full extended response, written as one or two PETAL paragraphs.',
        'If the question gives you an extract, your evidence must come from that extract.',
      ], ex: ['Unpacking a question: “How does Orwell use Squealer to show the power of language? (3 marks)”', 'How does Orwell use: I must name a technique and explain its effect.', 'Squealer: my evidence must be something Squealer says or does.', 'Power of language: my explanation must show how words control the animals.', '3 marks: technique, evidence and effect, in about three or four sentences.'] },
      { code: 'W2', name: 'PETAL explained', notes: [
        'P is for Point: one sentence that answers the question directly. Starter: “Orwell presents… as…” or “Orwell shows that…”',
        'E is for Evidence: a short quotation or a specific moment from the novel or extract. Starter: “For example, when…” or “This is shown when Squealer says…”',
        'T is for Technique: name the technique the writer uses. Starter: “Orwell uses [technique] to…” or “Through the symbol of…”',
        'A is for Analysis: explain how the technique and evidence create meaning. This is the most important part. Starter: “This reveals…”, “This suggests…”, “The word … highlights…”',
        'L is for Link: tie back to the question and Orwell’s message. Starter: “Therefore, Orwell warns…”, “In this way, Orwell criticises…”',
        'You can combine E and T in one sentence: “Orwell uses euphemism when Squealer calls a cut in rations a “readjustment”.”',
        'For an 8-mark answer, write one PETAL paragraph with two pieces of evidence, or two PETAL paragraphs with one main example each.',
      ] },
      { code: 'W3', name: 'Strong analysis vocabulary', notes: [
        'Avoid repeating “shows”. Use precise verbs: reveals, highlights, emphasises, suggests, conveys, exposes, criticises, warns, mocks, symbolises, foreshadows.',
        'Talk about Orwell as a writer making choices: “Orwell suggests…”, “Orwell positions the reader to…”, “Orwell uses Squealer to…”',
        'Name the reader’s response: “The reader feels angry/sympathetic/uneasy because…”',
        'Words for power: manipulates, exploits, dominates, controls, silences, corrupts.',
        'Words for the animals: naive, loyal, exploited, oppressed, powerless, ignorant, obedient.',
        'Words for the pigs: hypocritical, greedy, ruthless, cunning, tyrannical, privileged.',
        'Zoom in on a single word: “The word ‘readjustment’ sounds calm and technical, which hides…”',
        'Do not retell the plot. Every sentence should either prove your point or explain why it matters.',
      ] },
      { code: 'W4', name: 'Model PETAL paragraph: power and corruption', notes: ['Question: How does Orwell show that power corrupts?', 'Each step is labelled so you can see the PETAL structure. In the exam you would write it as one paragraph.'], ex: ['Model 1: How does Orwell show that power corrupts?', 'P: Orwell shows that power corrupts by tracing how Napoleon gradually becomes the very tyrant the animals rebelled against.', 'E: After the pigs move into the farmhouse, the Fourth Commandment is found to read “No animal shall sleep in a bed with sheets.”', 'T: The farmhouse and its beds are symbols of human privilege, and the small change to the commandment is an example of how rules are quietly rewritten.', 'A: By adding just three words, the pigs make their new luxury seem legal, revealing that once Napoleon has power, he bends the rules to serve himself rather than the other animals.', 'L: Therefore, Orwell warns that leaders with unchecked power will always take privileges for themselves, betraying the people they claim to serve.'] },
      { code: 'W5', name: 'Model PETAL paragraph: propaganda', notes: ['Question: How does Orwell use Squealer to show the power of language to control others?'], ex: ['Model 2: How does Orwell use Squealer to show the power of language?', 'P: Orwell uses Squealer to reveal how leaders can twist language to make injustice seem reasonable.', 'E: When the pigs take the milk and apples, Squealer claims they have been “proved by Science” to be necessary for pigs, and asks what would happen if the pigs failed in their duty: “Jones would come back!”', 'T: Squealer combines a false appeal to authority with a rhetorical question and a scare tactic.', 'A: Because the animals cannot check the “Science”, and because their greatest fear is Jones returning, they are confused and frightened into silence, so the pigs’ greed is disguised as a duty.', 'L: In this way, Orwell criticises the use of propaganda and warns readers to question leaders who use clever words to justify their privileges.'] },
      { code: 'W6', name: 'Model PETAL paragraph: the revolution betrayed', notes: ['Question: How does Orwell show that the revolution has been betrayed by the end of the novel?'], ex: ['Model 3: How does Orwell show that the revolution has been betrayed?', 'P: Orwell shows that the revolution has been completely betrayed, as the pigs end up indistinguishable from the humans they overthrew.', 'E: In the final scene, the animals look “from pig to man, and from man to pig, and from pig to man again” and find it “impossible to say which was which”.', 'T: Orwell uses repetition and a cyclical structure, ending the novel at Manor Farm just as it began.', 'A: The repetition imitates the animals’ eyes darting back and forth in confusion, emphasising that the pigs have become exactly like their former masters, so the animals’ suffering has been for nothing.', 'L: Therefore, Orwell warns that revolutions can be corrupted by their leaders until they simply replace one tyranny with another.'] },
      { code: 'W7', name: 'Exam tips', notes: [
        'The exam is 60 minutes for 20 marks: roughly three minutes per mark.',
        'Suggested timing: spend about 5 minutes reading the whole paper, about 30 minutes on Section 1 (multiple choice and short answers), and about 20–25 minutes on the Section 2 extended response, leaving a few minutes to check.',
        'Unseen extracts: read the extract twice. First for what is happening, second with a pen, underlining strong words, repeated ideas and anything Squealer-like.',
        'Pick one technique you are confident about and explain it well, rather than listing many techniques with no explanation.',
        'Use short quotes from the extract: three to eight words is usually enough. You do not need to memorise quotes; for the extended response you can describe a moment in your own words.',
        'For the extended response, spend two or three minutes planning: write P, E, T, A, L down the margin and jot a word or two next to each.',
        'Multiple choice: cross out answers you know are wrong, and be careful with “not” and “best”.',
        'Always link back to Orwell’s message: what is he warning us about?',
      ] },
    ],
    cards: [
      ['What does PETAL stand for?', 'Point, Evidence, Technique, Analysis, Link.'],
      ['What makes a good Point?', 'One sentence that directly answers the question and states the idea you will prove.'],
      ['What counts as Evidence?', 'A short quotation, or a specific moment from the novel or extract described clearly.'],
      ['What goes in the Technique step?', 'The name of the technique Orwell uses, such as symbolism, euphemism or irony.'],
      ['What is Analysis?', 'Explaining how the technique and evidence create meaning and affect the reader. It is the most important step.'],
      ['What is the Link?', 'A sentence that ties the paragraph back to the question and Orwell’s message.'],
      ['Point sentence starter', '“Orwell presents… as…” or “Orwell shows that…”'],
      ['Analysis sentence starters', '“This reveals…”, “This suggests…”, “The word … highlights…”'],
      ['Link sentence starters', '“Therefore, Orwell warns…”, “In this way, Orwell criticises…”'],
      ['What does a 1-mark question need?', 'One clear, correct point, often a single sentence.'],
      ['What does a 2–3 mark question need?', 'A technique, a short quote or specific moment, and its effect.'],
      ['What does an 8-mark question need?', 'One or two full PETAL paragraphs.'],
      ['What does “identify” mean?', 'Name it. A short answer is fine.'],
      ['What does “explain” mean?', 'Say how or why, giving reasons.'],
      ['What does “How does Orwell…” want?', 'A technique and how it creates meaning, not just what happens.'],
      ['Better verbs than “shows”', 'Reveals, highlights, emphasises, suggests, conveys, exposes, criticises, warns.'],
      ['How long should a quote be?', 'Short: usually three to eight words.'],
      ['Do I need to memorise quotes?', 'No. Use quotes from the extract, and describe moments in your own words for the extended response.'],
      ['How long is the exam?', '60 minutes for 20 marks: about three minutes per mark.'],
      ['How should you read an unseen extract?', 'Twice: first for meaning, then with a pen, underlining strong words and techniques.'],
      ['Biggest mistake in analysis', 'Retelling the plot or just naming a technique without explaining its effect.'],
      ['Feature-spotting', 'Listing techniques with no explanation. It earns very few marks.'],
      ['How do you plan an extended response quickly?', 'Write P, E, T, A, L down the margin and jot a few words next to each.'],
    ],
    concepts: [
      ['In PETAL, what does the A stand for?', ['Answer', 'Analysis', 'Argument', 'Audience'], 1, ''],
      ['Which part of PETAL is most important for high marks?', ['Point', 'Evidence', 'Analysis', 'Link'], 2, 'Analysis is where you explain how meaning is created.'],
      ['A 1-mark question usually needs…', ['A full PETAL paragraph', 'One clear point', 'Three quotes', 'An essay'], 1, ''],
      ['An 8-mark question needs…', ['One word', 'One or two PETAL paragraphs', 'Only a quote', 'A list of techniques'], 1, ''],
      ['Which is the strongest verb for analysis?', ['shows', 'says', 'highlights', 'has'], 2, ''],
      ['Which is the best Point for “How does Orwell present Squealer?”', ['Squealer is a pig.', 'Orwell presents Squealer as a cunning manipulator who uses language to control the animals.', 'Squealer talks a lot in the book.', 'I like Squealer.'], 1, ''],
      ['What should a Link do?', ['Introduce a new quote', 'Tie back to the question and Orwell’s message', 'Retell the plot', 'List more techniques'], 1, ''],
      ['Which is feature-spotting?', ['“Orwell uses euphemism, repetition and symbolism.”', '“The euphemism ‘readjustment’ hides the cut in food, so the animals do not complain.”', '“The windmill symbolises broken promises because it ends up making profit for the pigs.”', '“The slogan drowns out debate, stopping the animals thinking.”'], 0, 'It names techniques without explaining any effect.'],
      ['How should you read an unseen extract?', ['Once, quickly', 'Twice, underlining key words the second time', 'Only the first line', 'Skip it and answer from memory'], 1, ''],
      ['The exam is 60 minutes for 20 marks. About how long per mark?', ['30 seconds', '3 minutes', '10 minutes', '1 minute'], 1, ''],
      ['“Explain” in a question means…', ['Name it', 'Say how or why, with reasons', 'Copy the extract', 'Draw a diagram'], 1, ''],
      ['Which is the best Evidence?', ['The pigs are bad.', 'Squealer calls the cut a “readjustment”.', 'There is lots of evidence in the novel.', 'Orwell is a good writer.'], 1, 'Evidence is a specific quote or moment.'],
      ['Where should your evidence come from when a question gives an extract?', ['Anywhere in the novel', 'The extract', 'The film version', 'Your own life'], 1, ''],
      ['Which sentence talks about Orwell as a writer making choices?', ['Napoleon chased Snowball.', 'Orwell uses the dogs to symbolise the terror of a police state.', 'The dogs are big.', 'Snowball ran away.'], 1, ''],
    ],
    short: [
      { q: 'Identify the technique in this quotation: “Four legs good, two legs bad.”', marks: 1, tags: ['W1'], criteria: ['Identifies a slogan (or repetition)'], model: 'It is a slogan: a short, catchy phrase repeated to spread an idea.' },
      { q: 'Name the character who represents propaganda in the allegory.', marks: 1, tags: ['W1'], criteria: ['Squealer'], model: 'Squealer.' },
      { q: 'Explain what the farmhouse symbolises when the pigs move into it.', marks: 2, tags: ['W2'], criteria: ['States that the farmhouse symbolises human power or privilege', 'Explains that the pigs moving in shows they are becoming the new masters, like Jones'], model: 'The farmhouse symbolises the power and comfort of the humans. When the pigs move in and sleep in the beds, it shows they are taking the humans’ privileges and becoming the new masters.' },
      { q: 'Rewrite this weak analysis to make it stronger: “This shows that Squealer is bad.”', marks: 3, tags: ['W3'], criteria: ['Uses a stronger verb than “shows” (reveals, highlights, exposes)', 'Uses a precise adjective or idea instead of “bad” (manipulative, deceitful)', 'Explains the effect on the animals or Orwell’s message'], model: 'This reveals that Squealer is deeply manipulative, twisting the truth so the animals accept the pigs’ privileges without question, and highlights Orwell’s warning about the power of propaganda.' },
      { q: 'How does Orwell use Squealer to show the power of language to control others?', marks: 8, tags: ['W5'], criteria: ['Point: a clear opening sentence that directly answers the question', 'Evidence: a relevant, accurate quote or specific moment involving Squealer', 'Evidence: a second relevant example (another speech, euphemism or the story of Boxer’s death)', 'Technique: accurately names at least one language technique (rhetorical question, euphemism, repetition, fake statistics, scare tactics)', 'Analysis: explains how the technique affects the animals (confuses, frightens or silences them)', 'Analysis: uses precise analytical verbs and zooms in on specific words', 'Link: ties the paragraph back to the question and Orwell’s warning about propaganda', 'Expression: clear, well-structured PETAL paragraph(s) with accurate spelling and no plot retelling'], model: 'Orwell uses Squealer to reveal how language can be twisted into a weapon that controls what people think. When the pigs take the milk and apples, Squealer claims this has been “proved by Science” and asks the animals what would happen if the pigs failed in their duty, answering that “Jones would come back!” This rhetorical question and scare tactic play on the animals’ greatest fear, while the false appeal to “Science” cannot be checked by animals who can barely read, so their objections are silenced. Later, Squealer calls a cut in rations a “readjustment”, never a “reduction”. This euphemism sounds calm and technical, disguising the reality that the animals are starving and preventing them from complaining. Through Squealer, Orwell exposes how leaders manipulate words to justify injustice, warning readers that whoever controls language can control a whole society.' },
      { q: 'How does Orwell show that fear is used to keep Napoleon in power?', marks: 8, tags: ['W4'], criteria: ['Point: a clear opening sentence that directly answers the question', 'Evidence: a relevant moment, such as the dogs chasing Snowball off the farm', 'Evidence: a second relevant moment, such as the confessions and executions or the dogs silencing the protesting pigs', 'Technique: names a technique, such as symbolism (the dogs), juxtaposition or Squealer’s scare tactics', 'Analysis: explains how fear changes what the animals say and do', 'Analysis: uses precise analytical verbs (intimidates, silences, crushes) and considers the reader’s response', 'Link: ties back to the question and Orwell’s warning about dictatorships', 'Expression: clear, well-structured PETAL paragraph(s) without plot retelling'], model: 'Orwell shows that Napoleon keeps his power through terror rather than the animals’ support. When the dogs he secretly raised chase Snowball off the farm, “Silent and terrified, the animals crept back into the barn”, and when four young pigs protest the end of the Sunday meetings, the dogs’ growling silences them. The dogs symbolise the secret police of a dictatorship: they make it clear that any opposition will be met with violence. This fear reaches its peak in the confessions and executions, when animals are killed on the spot in front of everyone. Orwell positions the reader to feel horror at how quickly the animals learn to stay silent, and Clover’s sad reflection that this was not what Old Major had dreamed of highlights the gap between the revolution’s hopes and its reality. Therefore, Orwell warns that dictators keep control by making people too afraid to speak the truth.' },
      { q: 'How does Orwell show that the revolution has been betrayed by the end of the novel?', marks: 8, tags: ['W6'], criteria: ['Point: a clear opening sentence that directly answers the question', 'Evidence: the final scene where pigs and men cannot be told apart', 'Evidence: a second example, such as the single commandment, the name Manor Farm, or the windmill grinding corn for profit', 'Technique: names a technique, such as cyclical structure, situational irony, repetition or symbolism', 'Analysis: explains how the evidence shows the pigs have become like the humans', 'Analysis: compares the ending with Old Major’s dream or the original Commandments', 'Link: ties back to Orwell’s warning about revolutions and power', 'Expression: clear, well-structured PETAL paragraph(s) without plot retelling'], model: 'Orwell shows that by the end, the revolution has been completely betrayed, as the pigs become the masters they once overthrew. The Seven Commandments are replaced by a single rule, “All animals are equal but some animals are more equal than others”, a piece of verbal irony that openly contradicts Old Major’s dream of equality. In the final scene, the animals look “from pig to man, and from man to pig” and cannot tell which is which. Orwell uses a cyclical structure: the farm is renamed Manor Farm, and the pigs walk on two legs and carry whips, just as Jones once did. This situational irony emphasises that the animals’ suffering and sacrifice have changed nothing. Therefore, Orwell warns that revolutions can be corrupted by their leaders until one tyranny is simply replaced by another.' },
    ],
  });
  afwrite.bank = [
    function bestSentence(level) { return ask(WRITE_Q, level); },
    function whatsMissing(level) {
      const m = MISSING.filter(x => x[0] === level), [L, para, right, why] = pick(m.length ? m : MISSING);
      const opts = ['Point: there is no opening sentence that answers the question', 'Evidence: there is no quote or specific moment', 'Technique: no technique is named', 'Analysis: the effect is not explained', 'Link: it does not return to the question or Orwell’s message', 'Nothing is missing: it has P, E, T, A and L'];
      return { level: L, tags: ['W2'], stem: 'Read this PETAL paragraph.', passage: para, parts: [CH('', 'What, if anything, is missing?', right, shuffle(opts.filter(o => o !== right)).slice(0, 3), [why])] };
    },
    function marksMeaning(level) {
      const items = [
        ['F', 'A question is worth 1 mark. What should your answer include?', 'One clear, correct point', ['Two full PETAL paragraphs', 'A plot summary', 'Three quotes and three techniques']],
        ['F', 'What does PETAL stand for?', 'Point, Evidence, Technique, Analysis, Link', ['Plot, Example, Theme, Answer, List', 'Point, Explain, Tell, Argue, Learn', 'Paragraph, Evidence, Text, Author, Language']],
        ['S', 'A question is worth 3 marks and asks “How does Orwell…?” What should your answer include?', 'A technique, a short quote or moment, and its effect', ['Just the name of a technique', 'A retelling of the chapter', 'Your personal opinion of the characters']],
        ['S', 'The question includes an extract. Where should your evidence come from?', 'The extract', ['Any other chapter', 'The film version', 'Your own experience']],
        ['C', 'A question is worth 8 marks. What should your answer be?', 'One or two well-developed PETAL paragraphs', ['One sentence', 'A list of techniques', 'A summary of the whole novel']],
        ['C', 'You have 60 minutes for 20 marks. About how long should you spend on a 4-mark question?', 'About 12 minutes', ['About 1 minute', 'About 30 minutes', 'About 45 minutes']],
      ];
      const m = items.filter(x => x[0] === level), [L, q, right, wrongs] = pick(m.length ? m : items);
      return { level: L, tags: ['W1'], stem: 'Reading the question.', parts: [CH('', q, right, wrongs, ['Let the marks guide how much you write.'])] };
    },
  ];

  return { DECKS: [afplot, afthemes, aftech, afwrite, tech] };
})();
if (typeof module !== 'undefined') module.exports = EN;
