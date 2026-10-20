/* ===== Lock In — Year 8 Science (Yearly Examination) =====
   Exam: Mon 26 Oct, P3–4 in the Hall. 5 min reading + 60 min working. Multiple choice and written response.
   Topics: CHANGE (energy transfers, chemical change, geological change, rocks and fossils) and
   DATA SCIENCE 1 / WORKING SCIENTIFICALLY. Outcomes SC4-CHG-01, SC4-DAT-01, SC4-WS-01, 03, 04, 05, 06, 07.
   All notes, questions and model answers are original. Formatter note: no asterisks, dollar signs or carets
   in this file's strings (they mean bold and maths to the formatter). */

const SC = (() => {
  const T = typeof TK !== 'undefined' ? TK : require('./texkit.js');
  const { ri, pick, shuffle, CH, finish, rnd } = T;
  const SUBJECT = 'sci';

  // Pool helpers (same shape as english.js): Q() is one multiple-choice item at a level; ask() picks one at the
  // requested level (falling back to any level) and returns a one-part question whose level matches the item used.
  const Q = (L, tag, q, right, wrongs, why, extra = {}) => ({ L, tag, q, right, wrongs, why, ...extra });
  const forLevel = (items, level) => { const m = items.filter(i => i.L === level); return pick(m.length ? m : items); };
  const toQuestion = (it) => ({ level: it.L, tags: [it.tag], stem: it.stem || '', parts: [CH('', it.q, it.right, it.wrongs, [it.why])], ...(it.visual ? { visual: it.visual } : {}) });
  const ask = (items, level) => toQuestion(forLevel(items, level));
  const lvl = (L) => (['F', 'S', 'C'].includes(L) ? L : 'S');
  const num = (label, q, value, steps, extra = {}) => ({ label, q, type: 'num', value, show: String(value), steps, marks: 1, ...extra });
  const SA = (label, q, marks, criteria, model) => ({ label, q, type: 'short', marks, criteria, model, steps: [] });

  /* =====================================================================
     DECK 1: ENERGY
     ===================================================================== */
  const ENERGY_POOL = [
    Q('F', 'E1', 'Which form of energy does a moving bicycle have because it is moving?', 'Kinetic energy', ['Gravitational potential energy', 'Chemical energy', 'Nuclear energy'], 'Anything that is moving has kinetic energy.'),
    Q('F', 'E1', 'A book sitting on a high shelf has which type of stored energy?', 'Gravitational potential energy', ['Kinetic energy', 'Elastic potential energy', 'Sound energy'], 'Raised objects store gravitational potential energy because of their height.'),
    Q('F', 'E1', 'A stretched rubber band stores…', 'Elastic potential energy', ['Kinetic energy', 'Light energy', 'Thermal energy'], 'Stretched or squashed objects store elastic potential energy.'),
    Q('F', 'E1', 'Food, fuels and batteries all store…', 'Chemical energy', ['Nuclear energy', 'Kinetic energy', 'Sound energy'], 'Chemical energy is stored in the bonds between particles in food, fuel and batteries.'),
    Q('F', 'E1', 'The energy released when the nuclei of atoms split or join (as in the Sun) is…', 'Nuclear energy', ['Chemical energy', 'Elastic energy', 'Electrical energy'], 'The Sun runs on nuclear fusion; nuclear power stations use fission.'),
    Q('F', 'E1', 'Which of these is a stored (potential) form of energy?', 'Chemical energy in petrol', ['Sound from a speaker', 'Light from a torch', 'A rolling ball'], 'Stored forms: chemical, gravitational, elastic, nuclear. Sound, light and motion are energy being used or moving.'),
    Q('F', 'E2', 'The law of conservation of energy says energy…', 'Cannot be created or destroyed, only transferred or transformed', ['Is used up when a device is switched on', 'Can be created by machines', 'Is destroyed by friction'], 'The total amount of energy always stays the same.'),
    Q('F', 'E2', 'What is the main useful energy transformation in a light bulb?', 'Electrical → light', ['Light → electrical', 'Chemical → light', 'Thermal → electrical'], 'Electricity goes in; light is the useful output (and some heat is wasted).'),
    Q('F', 'E3', 'In most devices, the wasted energy mostly ends up as…', 'Heat (thermal energy) and sound', ['Nuclear energy', 'Chemical energy', 'Elastic energy'], 'Friction and electrical resistance turn some energy into heat and sound that spread into the surroundings.'),
    Q('F', 'E4', 'Heat transfer through a solid, by particles passing on vibrations, is called…', 'Conduction', ['Convection', 'Radiation', 'Evaporation'], 'Conduction: particles vibrate and pass energy to their neighbours.'),
    Q('F', 'E4', 'Which type of heat transfer can travel through empty space (a vacuum)?', 'Radiation', ['Conduction', 'Convection', 'All three'], 'Radiation is infrared waves; it does not need particles. That is how the Sun heats Earth.'),
    Q('F', 'E4', 'Which material is the best conductor of heat?', 'Copper', ['Wood', 'Plastic', 'Air'], 'Metals are good conductors. Wood, plastic and air are insulators.'),
    Q('S', 'E2', 'A ball is dropped from a height. As it falls, its…', 'Gravitational potential energy turns into kinetic energy', ['Kinetic energy turns into gravitational potential energy', 'Chemical energy turns into kinetic energy', 'Total energy increases'], 'It loses height (GPE goes down) and speeds up (KE goes up).'),
    Q('S', 'E2', 'What is the main energy transformation in a car engine?', 'Chemical → kinetic (plus wasted heat and sound)', ['Kinetic → chemical', 'Electrical → chemical', 'Light → kinetic'], 'Petrol (chemical energy) is burned to make the car move.'),
    Q('S', 'E2', 'Burning wood in a campfire transforms…', 'Chemical energy into thermal and light energy', ['Thermal energy into chemical energy', 'Light energy into chemical energy', 'Kinetic energy into nuclear energy'], 'The wood is a fuel; burning releases its stored chemical energy as heat and light.'),
    Q('S', 'E2', 'A solar panel transforms…', 'Light energy into electrical energy', ['Electrical energy into light energy', 'Thermal energy into chemical energy', 'Chemical energy into electrical energy'], 'Solar (photovoltaic) cells turn light into electricity.'),
    Q('S', 'E2', 'A bouncing ball bounces a little lower each time. Why?', 'Some energy is transformed to heat and sound at each bounce', ['Energy is destroyed at each bounce', 'Gravity gets weaker', 'The ball gains mass'], 'Energy is not destroyed; it is transferred to the surroundings as heat and sound, so less is left as useful kinetic energy.'),
    Q('S', 'E3', 'A device has an efficiency of 30%. What does this mean?', '30% of the energy put in becomes useful output', ['It wastes 30% of the energy', 'It works 30% of the time', 'It creates 30% more energy'], 'Efficiency = useful output ÷ total input × 100%. The other 70% is wasted.'),
    Q('S', 'E3', 'Why can no machine be 100% efficient?', 'Some energy is always transformed into wasted forms, usually heat from friction', ['Energy is destroyed inside machines', 'Machines create extra energy', 'Machines only work with nuclear energy'], 'There is always some friction, resistance or sound, so some energy is always wasted.'),
    Q('S', 'E3', 'In a Sankey diagram, the width of each arrow shows…', 'The amount of energy', ['The speed of the energy', 'The type of device', 'How long the device was on'], 'Wider arrow = more energy. The input width equals the total width of all the outputs.'),
    Q('S', 'E4', 'Why does hot air rise in a room?', 'It expands, becomes less dense and rises; cooler, denser air sinks', ['Hot air particles are lighter than cold ones', 'Heat always travels upwards', 'Cold air pushes it up by conduction'], 'This movement makes a convection current.'),
    Q('S', 'E4', 'Why is a saucepan handle often made of plastic or wood?', 'They are insulators, so heat is not conducted to your hand', ['They are good conductors', 'They reflect radiation', 'They make convection currents'], 'Insulators slow down the transfer of heat.'),
    Q('S', 'E4', 'Which surface absorbs radiant heat best?', 'A dull (matte) black surface', ['A shiny silver surface', 'A white glossy surface', 'A mirror'], 'Dark, matte surfaces absorb and emit radiation best. Shiny surfaces reflect it.'),
    Q('C', 'E4', 'A heater is placed low on one wall of a cold room. Which explains how the whole room warms up?', 'Air near the heater warms, becomes less dense and rises; cooler air sinks to replace it, setting up a convection current', ['Heat is conducted through the air from particle to particle very quickly', 'The heater radiates only upwards to the ceiling', 'Cold air rises and is replaced by warm air from the ceiling'], 'Air is a poor conductor; convection currents carry the energy around the room.'),
    Q('C', 'E2', 'In a Rube Goldberg machine, a marble rolls down a ramp, knocks over dominoes, and the last domino tips a cup of water. Which is true?', 'Each step transfers energy to the next, and some energy is wasted as heat and sound at every step', ['Energy is created at each step', 'The machine is 100% efficient because every step works', 'The marble’s energy is destroyed when it hits the dominoes'], 'A chain of transfers: GPE → KE → KE… with losses at every step, so very little of the original energy does the final job.'),
    Q('C', 'E3', 'A kettle uses 2000 J of electrical energy and 1600 J heats the water. Where did the other 400 J go?', 'It was transferred to the surroundings, mostly as heat (warming the kettle and air) and some sound', ['It was destroyed', 'It stayed inside the electricity', 'It turned into nuclear energy'], 'Conservation of energy: 2000 J in = 1600 J useful + 400 J wasted.'),
    Q('C', 'E3', 'An old globe is 5% efficient and an LED is 40% efficient. Both give the same light. Which statement is correct?', 'The LED needs much less electrical energy for the same amount of light', ['The globe makes more light from the same energy', 'Both use the same electrical energy', 'The LED wastes more energy as heat'], 'Higher efficiency = less input energy needed for the same useful output, so less is wasted as heat.'),
  ];
  function energyMC(L) { return ask(ENERGY_POOL, lvl(L)); }

  // Efficiency calculations, optionally with a Sankey diagram.
  const DEVICES = [
    { name: 'a light globe', input: 'Electrical', useful: 'Light', waste: [['Heat', 1]] },
    { name: 'an electric motor', input: 'Electrical', useful: 'Kinetic', waste: [['Heat', 0.7], ['Sound', 0.3]] },
    { name: 'a car engine', input: 'Chemical', useful: 'Kinetic', waste: [['Heat', 0.8], ['Sound', 0.2]] },
    { name: 'a television', input: 'Electrical', useful: 'Light and sound', waste: [['Heat', 1]] },
    { name: 'a kettle', input: 'Electrical', useful: 'Thermal (in the water)', waste: [['Heat to the air', 0.8], ['Sound', 0.2]] },
    { name: 'a wind turbine', input: 'Kinetic (wind)', useful: 'Electrical', waste: [['Heat', 0.6], ['Sound', 0.4]] },
  ];
  function efficiencyQ(L) {
    L = lvl(L);
    const d = pick(DEVICES), input = pick([100, 200, 400, 500, 800, 1000, 1200, 2000]), eff = pick([10, 20, 25, 30, 40, 50, 60, 75, 80, 90]);
    const useful = input * eff / 100, wasted = input - useful;
    let wList = [[d.waste[0][0], wasted]];
    if (d.waste.length > 1) { const w1 = Math.round(wasted * d.waste[0][1] / 10) * 10; if (w1 > 0 && w1 < wasted) wList = [[d.waste[0][0], w1], [d.waste[1][0], wasted - w1]]; }
    const visual = { type: 'sankey', input: [d.input, input], out: [[d.useful, useful, true], ...wList.map(w => [w[0], w[1], false])] };
    const stem = `The Sankey diagram shows the energy transfers in ${d.name}. Energy is measured in joules (J).`;
    const pW = CH('a', 'How much energy is wasted?', `${wasted} J`, [useful, input, wasted / 2, wasted + 100].map(v => `${v} J`), [`Wasted = total input − useful output`, `= ${input} − ${useful} = ${wasted} J`]);
    const pE = num('b', 'Calculate the efficiency of the device as a percentage (number only).', eff, ['Efficiency = useful output ÷ total input × 100%', `= ${useful} ÷ ${input} × 100%`, `= ${eff}%`]);
    const pC = CH('c', 'Which statement about the energy in this device is correct?', `${input} J in = ${useful} J useful + ${wasted} J wasted, so no energy is destroyed`, [`${wasted} J of energy is destroyed`, `The device creates ${useful} J of energy`, `The useful energy is greater than the input energy`], ['Conservation of energy: total energy in = total energy out.']);
    if (L === 'F') return { level: 'F', tags: ['E3'], stem, visual, parts: [pW] };
    if (L === 'S') return { level: 'S', tags: ['E3'], stem, visual, parts: [pW, pE] };
    // Complex: compare with a second device of a different efficiency
    const eff2 = pick([10, 20, 25, 40, 50, 60, 75, 80, 90].filter(e => e !== eff)), better = eff2 > eff ? 'the new model' : 'the original device';
    const pD = CH('d', `A new model of ${d.name} is ${eff2}% efficient. For the same useful output, which needs less input energy?`, better === 'the new model' ? 'The new model, because it is more efficient' : 'The original device, because it is more efficient', ['The new model, because it is more efficient', 'The original device, because it is more efficient', 'They need the same input energy'], [`Higher efficiency means less energy is wasted, so less input is needed for the same useful output.`, `${Math.max(eff, eff2)}% beats ${Math.min(eff, eff2)}%.`]);
    return { level: 'C', tags: ['E2', 'E3'], stem, visual, parts: [pW, pE, pC, pD] };
  }
  // Single multiple choice efficiency question (used in the practice exam's multiple choice section).
  function efficiencyMC(L) {
    const input = pick([200, 400, 500, 1000, 2000]), eff = pick([10, 20, 25, 40, 60, 75, 80]), useful = input * eff / 100;
    return { level: 'F', tags: ['E3'], stem: '', parts: [CH('', `A hair dryer uses ${input} J of electrical energy. ${useful} J is transferred as useful thermal energy to blow warm air. What is its efficiency?`, `${eff}%`, [100 - eff, eff / 10, Math.min(99, eff * 2), Math.round(input / useful)].map(v => `${v}%`), [`Efficiency = ${useful} ÷ ${input} × 100% = ${eff}%`])] };
  }

  const TRANSFORMS = [
    ['a torch (flashlight) with batteries', 'Chemical → electrical → light', ['Light → electrical → chemical', 'Electrical → chemical → sound', 'Thermal → light → electrical']],
    ['a toaster', 'Electrical → thermal', ['Thermal → electrical', 'Chemical → thermal', 'Electrical → sound']],
    ['a speaker', 'Electrical → sound', ['Sound → electrical', 'Kinetic → electrical', 'Chemical → sound']],
    ['a microphone', 'Sound → electrical', ['Electrical → sound', 'Light → electrical', 'Sound → chemical']],
    ['a wind turbine', 'Kinetic → electrical', ['Electrical → kinetic', 'Chemical → electrical', 'Thermal → kinetic']],
    ['a plant doing photosynthesis', 'Light → chemical', ['Chemical → light', 'Thermal → chemical', 'Electrical → chemical']],
    ['charging a phone battery', 'Electrical → chemical', ['Chemical → electrical', 'Light → chemical', 'Electrical → nuclear']],
    ['a trampoline launching a jumper upwards', 'Elastic potential → kinetic', ['Kinetic → elastic potential', 'Chemical → elastic potential', 'Gravitational potential → elastic potential']],
    ['a bow firing an arrow', 'Elastic potential → kinetic', ['Kinetic → chemical', 'Gravitational potential → elastic potential', 'Sound → kinetic']],
    ['a cyclist pedalling', 'Chemical → kinetic', ['Kinetic → chemical', 'Electrical → kinetic', 'Thermal → chemical']],
    ['water falling through a hydro-electric dam turbine', 'Gravitational potential → kinetic → electrical', ['Electrical → kinetic → gravitational potential', 'Chemical → thermal → electrical', 'Nuclear → kinetic → electrical']],
    ['a coal power station', 'Chemical → thermal → kinetic → electrical', ['Electrical → kinetic → thermal → chemical', 'Nuclear → thermal → electrical', 'Light → chemical → electrical']],
    ['an electric fan', 'Electrical → kinetic', ['Kinetic → electrical', 'Electrical → light', 'Chemical → kinetic']],
    ['a rollercoaster car rolling down the first big drop', 'Gravitational potential → kinetic', ['Kinetic → gravitational potential', 'Elastic potential → kinetic', 'Chemical → gravitational potential']],
  ];
  function transformQ(L) {
    L = lvl(L);
    const [dev, right, wrongs] = pick(TRANSFORMS);
    if (L !== 'C') return { level: L === 'F' ? 'F' : 'S', tags: ['E2'], stem: '', parts: [CH('', `What is the main energy transformation in ${dev}?`, right, wrongs, [right + '. Some energy is also wasted, mostly as heat and sound.'])] };
    // Complex: a Rube Goldberg chain
    const chains = [
      { steps: ['A marble rolls down a ramp', 'It knocks a toy car along the table', 'The car hits a bell'], ans: ['Gravitational potential → kinetic', 'Kinetic → kinetic (transfer)', 'Kinetic → sound'] },
      { steps: ['A stretched spring is released and flicks a ball', 'The ball rolls off the table and falls', 'It lands on a switch that turns on a light'], ans: ['Elastic potential → kinetic', 'Gravitational potential → kinetic', 'Electrical → light'] },
    ];
    const ch = pick(chains), i = ri(0, 2);
    const allAns = ['Gravitational potential → kinetic', 'Kinetic → sound', 'Elastic potential → kinetic', 'Electrical → light', 'Kinetic → gravitational potential', 'Light → electrical'];
    return {
      level: 'C', tags: ['E2', 'E3'], stem: `A Rube Goldberg machine is a chain reaction. Steps: ${ch.steps.map((s, k) => `(${k + 1}) ${s}`).join('; ')}.`,
      parts: [
        CH('a', `What is the main energy transformation in step ${i + 1}?`, ch.ans[i], allAns.filter(a => a !== ch.ans[i]), [ch.ans[i]]),
        CH('b', 'Why does the last step receive much less energy than the first step started with?', 'Some energy is transferred to the surroundings as heat and sound at every step', ['Energy is destroyed at every step', 'The machine creates energy at the start only', 'Gravity removes energy from the machine'], ['Conservation of energy: none is destroyed, but each transfer wastes some as heat and sound.']),
        CH('c', 'How could the machine be made more efficient?', 'Reduce friction, e.g. smoother ramps and lubricated parts', ['Add more steps', 'Use heavier dominoes everywhere', 'Paint it black'], ['Less friction = less energy wasted as heat.']),
      ],
    };
  }

  const HEAT = [
    ['A metal spoon in a hot cup of soup gets hot at the handle.', 'Conduction'], ['You feel warmth on your face from a campfire across the room.', 'Radiation'],
    ['Water at the bottom of a saucepan heats, rises, and cooler water sinks.', 'Convection'], ['The Sun warms the Earth across space.', 'Radiation'],
    ['A sea breeze blows onto the beach on a hot afternoon as warm air over the land rises.', 'Convection'], ['Your hand warms up holding a hot mug.', 'Conduction'],
    ['A hot-air balloon rises when the burner heats the air inside it.', 'Convection'], ['A car parked in the sun gets hot inside.', 'Radiation'],
    ['An ironing board cover gets warm under the iron.', 'Conduction'], ['Warm air from a ducted heater circulates around a lounge room.', 'Convection'],
  ];
  function heatQ(L) {
    L = lvl(L);
    const [sit, ans] = pick(HEAT);
    const why = { Conduction: 'Conduction: heat passes through a solid (or between touching objects) as particles vibrate and bump their neighbours.', Convection: 'Convection: in liquids and gases, warm fluid becomes less dense and rises, cooler fluid sinks: a convection current.', Radiation: 'Radiation: infrared waves carry heat, even through empty space; no contact needed.' }[ans];
    const p1 = CH(L === 'F' ? '' : 'a', `${sit} Which type of heat transfer is this mainly?`, ans, ['Conduction', 'Convection', 'Radiation'], [why]);
    if (L === 'F') return { level: 'F', tags: ['E4'], stem: '', parts: [p1] };
    const p2 = CH('b', 'Thermal energy always flows…', 'From a hotter object to a colder one', ['From a colder object to a hotter one', 'Upwards only', 'Only through metals'], ['Heat flows from hot to cold until they are the same temperature.']);
    if (L === 'S') return { level: 'S', tags: ['E4'], stem: '', parts: [p1, p2] };
    const p3 = CH('c', 'A double-walled drink bottle has a vacuum between its walls and shiny inner surfaces. How does this keep a drink hot?', 'The vacuum stops conduction and convection; the shiny surfaces reflect radiation back in', ['The vacuum conducts heat back into the drink', 'Shiny surfaces absorb radiation and add heat', 'Convection currents in the vacuum keep it warm'], ['No particles in a vacuum = no conduction or convection. Shiny surfaces are poor emitters and good reflectors of radiation.']);
    return { level: 'C', tags: ['E4'], stem: '', parts: [p1, p2, p3] };
  }

  const energy = finish({
    id: 'scienergy', subject: SUBJECT, title: 'Energy transfers', chapter: 'Change · Energy', hue: 'gold',
    blurb: 'Forms of energy, transformations, conservation of energy, efficiency and Sankey diagrams, conduction, convection and radiation.',
    sections: [
      { code: 'E1', name: 'Forms of energy', notes: [
        'Energy is the ability to do work or cause change. It is measured in joules (J); 1000 J = 1 kJ.',
        'Kinetic energy: the energy of anything that is moving. Faster or heavier = more kinetic energy.',
        'Potential (stored) energy: gravitational potential (raised objects, e.g. a rock on a cliff), elastic potential (stretched or squashed objects, e.g. a rubber band, a trampoline), chemical (stored in food, fuel and batteries) and nuclear (stored in the nucleus of atoms).',
        'Energy that is being transferred: thermal (heat), light, sound and electrical energy.',
        'Thermal energy is the total kinetic energy of the particles in a substance: hotter = particles moving faster.',
      ] },
      { code: 'E2', name: 'Transfers, transformations and conservation', notes: [
        'An energy transfer moves energy from one object to another (a bat hitting a ball). An energy transformation changes energy from one form to another (electrical → light in a bulb).',
        'Examples: chemical → kinetic (car engine, a person running); electrical → light (light bulb); gravitational potential → kinetic (a falling object); chemical → thermal + light (burning wood); light → electrical (solar panel); elastic potential → kinetic (bow and arrow).',
        'Law of conservation of energy: energy cannot be created or destroyed, only transferred or transformed. The total energy before = the total energy after.',
        'A Rube Goldberg machine is a deliberately complicated chain where each step transfers energy to the next (e.g. a marble rolls down a ramp, knocks dominoes, a lever lifts a flag). Every step wastes some energy as heat and sound.',
      ] },
      { code: 'E3', name: 'Efficiency and Sankey diagrams', notes: [
        'Useful energy: the output we want (light from a bulb). Wasted energy: outputs we do not want, usually heat and sound, that spread into the surroundings.',
        'Efficiency = useful energy output ÷ total energy input × 100%.',
        'Example: a bulb uses 100 J and gives 20 J of light. Efficiency = 20 ÷ 100 × 100% = 20%. Wasted = 100 − 20 = 80 J (as heat).',
        'No transformation is 100% efficient: friction, air resistance and electrical resistance always waste some energy as heat and sound.',
        'A Sankey (energy flow) diagram shows the input on the left and the outputs as arrows. Arrow width is proportional to the amount of energy. Useful energy goes straight on; wasted energy bends away.',
        'Improving efficiency: lubricate moving parts, streamline shapes, insulate, use LEDs instead of old globes.',
      ] },
      { code: 'E4', name: 'Heat transfer: conduction, convection, radiation', notes: [
        'Heat (thermal energy) always flows from a hotter object to a colder one.',
        'Conduction: in solids, particles vibrate and pass energy to neighbouring particles. Metals are good conductors (they also have free electrons). Insulators (wood, plastic, air, wool) conduct poorly. Example: a metal spoon getting hot in soup.',
        'Convection: in liquids and gases (fluids). Heated fluid expands, becomes less dense and rises; cooler, denser fluid sinks to take its place, making a convection current. Examples: boiling water in a pot, sea breezes, heaters warming a room, hot-air balloons. Convection currents in the mantle also move tectonic plates.',
        'Radiation: energy carried by infrared waves. It needs no particles, so it can travel through a vacuum (the Sun heating Earth). Dark, matte surfaces absorb and emit radiation well; light, shiny surfaces reflect it.',
        'Reducing heat transfer: a vacuum flask stops conduction and convection (vacuum) and radiation (shiny walls). Trapped air in clothes, double glazing and insulation batts slows conduction and convection.',
      ] },
    ],
    cards: [
      ['Energy', 'The ability to do work or cause change. Unit: joule (J).'],
      ['Kinetic energy', 'Energy of a moving object.'],
      ['Gravitational potential energy', 'Stored energy of an object because of its height.'],
      ['Elastic potential energy', 'Stored energy in a stretched or squashed object, e.g. a spring.'],
      ['Chemical energy', 'Stored in the bonds of substances: food, fuels, batteries.'],
      ['Nuclear energy', 'Stored in the nucleus of atoms; released by fission or fusion (the Sun).'],
      ['Thermal energy', 'Heat: the kinetic energy of moving particles.'],
      ['Energy transfer vs transformation', 'Transfer: energy moves between objects. Transformation: energy changes form.'],
      ['Law of conservation of energy', 'Energy cannot be created or destroyed, only transferred or transformed.'],
      ['Light bulb', 'Electrical → light (+ wasted heat).'],
      ['Car engine', 'Chemical → kinetic (+ wasted heat and sound).'],
      ['Falling object', 'Gravitational potential → kinetic.'],
      ['Burning wood', 'Chemical → thermal + light.'],
      ['Solar panel', 'Light → electrical.'],
      ['Efficiency formula', 'Efficiency = useful output ÷ total input × 100%.'],
      ['Wasted energy', 'Energy not used for the intended purpose; usually heat and sound.'],
      ['Sankey diagram', 'Energy-flow diagram; arrow width shows the amount of energy.'],
      ['Why not 100% efficient?', 'Friction and resistance always turn some energy into heat and sound.'],
      ['Rube Goldberg machine', 'A chain of energy transfers and transformations, each step triggering the next.'],
      ['Conduction', 'Heat passed between vibrating particles in solids. Metals are good conductors.'],
      ['Convection', 'Heat carried by moving fluids: warm fluid rises, cool fluid sinks (convection current).'],
      ['Radiation', 'Heat carried by infrared waves; can travel through a vacuum.'],
      ['Insulator', 'A material that slows heat transfer: wood, plastic, air, wool.'],
      ['Best absorbers of radiation', 'Dull, dark (matte black) surfaces. Shiny surfaces reflect.'],
    ],
    concepts: [
      ['Which of these is NOT a stored (potential) form of energy?', ['Sound energy', 'Chemical energy', 'Elastic potential energy', 'Gravitational potential energy'], 0, 'Sound is energy being transferred, not stored.'],
      ['What is the unit of energy?', ['Joule (J)', 'Watt (W)', 'Newton (N)', 'Kilogram (kg)'], 0, ''],
      ['A skateboarder at the top of a ramp has mostly…', ['Gravitational potential energy', 'Kinetic energy', 'Sound energy', 'Nuclear energy'], 0, 'High up and not moving yet.'],
      ['Energy cannot be created or destroyed. This is the law of…', ['Conservation of energy', 'Conservation of mass', 'Superposition', 'Gravity'], 0, ''],
      ['A radio changes electrical energy mainly into…', ['Sound energy', 'Chemical energy', 'Nuclear energy', 'Elastic energy'], 0, ''],
      ['A machine uses 500 J and gives 100 J of useful energy. Its efficiency is…', ['20%', '50%', '80%', '400%'], 0, '100 ÷ 500 × 100% = 20%.'],
      ['Which is the best explanation of “wasted energy”?', ['Energy transferred to forms we do not want, such as heat and sound', 'Energy that is destroyed', 'Energy that is created by friction', 'Energy stored in a battery'], 0, ''],
      ['In a Sankey diagram, a wide arrow means…', ['A large amount of energy', 'Fast-moving energy', 'Useful energy only', 'A small amount of energy'], 0, ''],
      ['Heat travels through a metal rod by…', ['Conduction', 'Convection', 'Radiation', 'Evaporation'], 0, ''],
      ['Convection can happen in…', ['Liquids and gases', 'Solids only', 'A vacuum', 'Metals only'], 0, 'Particles must be free to move.'],
      ['Heat from the Sun reaches Earth by…', ['Radiation', 'Conduction', 'Convection', 'Insulation'], 0, 'Space is a vacuum.'],
      ['Which would keep a cup of hot chocolate warm the longest?', ['A lidded cup with a vacuum between double walls', 'A thin metal cup', 'An open glass cup', 'A black metal cup with no lid'], 0, 'Lid stops convection and evaporation; vacuum stops conduction.'],
      ['When a bouncing ball stops bouncing, its energy has mostly become…', ['Heat and sound in the ball, floor and air', 'Destroyed', 'Nuclear energy', 'Chemical energy'], 0, 'Conservation of energy.'],
      ['Which change would make a car more efficient?', ['Reducing friction in the engine', 'Adding more weight', 'Using rougher tyres', 'Driving with the windows down at high speed'], 0, ''],
      ['Thermal energy flows…', ['From hotter objects to colder objects', 'From colder objects to hotter objects', 'Only upwards', 'Only through liquids'], 0, ''],
    ],
    short: [
      { q: 'Explain the difference between an energy transfer and an energy transformation. Give an example of each.', marks: 4, tags: ['E2'], criteria: ['Transfer: energy moves from one object to another (stays the same form)', 'Valid example of a transfer, e.g. a moving bat hitting a ball (kinetic to kinetic) or a hot stove heating a pot', 'Transformation: energy changes from one form to another', 'Valid example of a transformation, e.g. a light bulb (electrical to light) or a car engine (chemical to kinetic)'], model: 'An energy transfer is when energy moves from one object to another without changing form, for example when a cricket bat hits a ball, kinetic energy is transferred from the bat to the ball. An energy transformation is when energy changes from one form into another, for example a light bulb transforms electrical energy into light energy (and some wasted heat).' },
      { q: 'A light globe uses 60 J of electrical energy every second and produces 6 J of light. Calculate its efficiency and explain what happens to the rest of the energy.', marks: 3, tags: ['E3'], criteria: ['Correct working: efficiency = useful output ÷ total input × 100% = 6 ÷ 60 × 100%', 'Correct answer: 10%', 'The other 54 J is wasted, mostly as heat (thermal energy) to the surroundings; it is not destroyed'], model: 'Efficiency = useful output ÷ total input × 100% = 6 ÷ 60 × 100% = 10%. The remaining 54 J is not destroyed (conservation of energy); it is transformed into wasted thermal energy that heats the globe and the surrounding air.' },
      { q: 'Explain, using the law of conservation of energy, why no machine can be 100% efficient.', marks: 3, tags: ['E2', 'E3'], criteria: ['States the law: energy cannot be created or destroyed, only transferred or transformed', 'In every machine some energy is transformed into unwanted forms such as heat and sound (friction, resistance)', 'So the useful output is always less than the total input, giving an efficiency below 100%'], model: 'Energy cannot be created or destroyed, only transferred or transformed. In every machine, moving parts rub together and electricity meets resistance, so some of the input energy is always transformed into heat and sound that escape to the surroundings. Because some energy is always wasted, the useful energy output is always less than the total input, so efficiency is always less than 100%.' },
      { q: 'Describe how heat is transferred by conduction, convection and radiation. Use the particle model and give an example of each.', marks: 6, tags: ['E4'], criteria: ['Conduction: particles vibrate and pass energy to neighbouring particles', 'Conduction example, e.g. a metal spoon heating up in hot soup', 'Convection: in fluids, heated fluid expands, becomes less dense and rises while cooler, denser fluid sinks (a convection current)', 'Convection example, e.g. water circulating in a heated saucepan or a heater warming a room', 'Radiation: energy carried by infrared waves; no particles needed, so it can cross a vacuum', 'Radiation example, e.g. the Sun warming Earth or feeling the heat of a fire'], model: 'Conduction happens mostly in solids: when one end is heated its particles vibrate faster and bump into neighbouring particles, passing the energy along, e.g. a metal spoon gets hot in soup. Convection happens in liquids and gases: heated fluid expands, becomes less dense and rises, while cooler, denser fluid sinks to replace it, forming a convection current, e.g. water circulating in a saucepan on a stove. Radiation is the transfer of heat by infrared waves, which do not need particles and so can travel through a vacuum, e.g. the Sun warming the Earth.' },
      { q: 'A marble rolls down a ramp in a Rube Goldberg machine, hits a row of dominoes, and the last domino rings a bell. Identify the energy transformations and explain why the bell rings only softly.', marks: 4, tags: ['E2', 'E3'], criteria: ['Ramp: gravitational potential energy is transformed into kinetic energy', 'Dominoes: kinetic energy is transferred from domino to domino', 'Bell: kinetic energy is transformed into sound energy', 'At each step some energy is wasted as heat and sound (friction), so little energy is left for the bell'], model: 'As the marble rolls down the ramp its gravitational potential energy is transformed into kinetic energy. When it hits the dominoes, kinetic energy is transferred from one domino to the next. The last domino transforms kinetic energy into sound when it hits the bell. At every step some energy is transferred to the surroundings as heat (from friction) and sound, so by the end only a small amount of the original energy reaches the bell and it rings softly.' },
      { q: 'Explain why a home with insulation in the ceiling stays warmer in winter.', marks: 2, tags: ['E4'], criteria: ['Insulation (e.g. batts with trapped air) is a poor conductor and stops air moving, reducing conduction and convection', 'So less thermal energy flows from the warm inside to the cold outside through the roof'], model: 'Ceiling insulation is made of materials that trap air, which is a poor conductor and cannot form convection currents. This reduces the flow of heat from the warm house to the cold outside through the roof, so the house loses heat more slowly and stays warmer.' },
    ],
    bank: [energyMC, efficiencyQ, transformQ, heatQ, efficiencyMC],
  });

  /* =====================================================================
     DECK 2: CHEMICAL CHANGE
     ===================================================================== */
  const CHEM_POOL = [
    Q('F', 'C1', 'Which is a chemical change?', 'Toast burning', ['Ice melting', 'Sugar dissolving in tea', 'Cutting paper'], 'Burning makes new substances (carbon, carbon dioxide, water). The others are physical changes.'),
    Q('F', 'C1', 'Which is a physical change?', 'Water boiling into steam', ['An iron nail rusting', 'Wood burning', 'An egg cooking'], 'Boiling is a change of state: still water, no new substance.'),
    Q('F', 'C1', 'In a physical change…', 'No new substance is formed', ['A new substance is always formed', 'Atoms are destroyed', 'The change can never be reversed'], 'Physical changes alter state, shape or size, and are often reversible.'),
    Q('F', 'C1', 'Which observation is a sign that a chemical change has happened?', 'Bubbles of a new gas form when two substances are mixed', ['The substance changes shape', 'The substance melts', 'The substance is cut into pieces'], 'Signs: colour change, gas produced, temperature change, precipitate, light or a new smell.'),
    Q('F', 'C1', 'A precipitate is…', 'A solid that forms when two solutions are mixed', ['A gas given off in a reaction', 'A liquid that evaporates', 'Rain falling from clouds'], 'A cloudy solid appearing in a mixture of solutions is evidence of a chemical change.'),
    Q('F', 'C2', 'In a chemical reaction, the substances you start with are called the…', 'Reactants', ['Products', 'Precipitates', 'Solutions'], 'Reactants → products.'),
    Q('F', 'C2', 'Which word equation shows photosynthesis?', 'Carbon dioxide + water → glucose + oxygen', ['Glucose + oxygen → carbon dioxide + water', 'Oxygen + water → carbon dioxide + glucose', 'Carbon dioxide + oxygen → glucose + water'], 'Plants use light energy (absorbed by chlorophyll) to make glucose and release oxygen.'),
    Q('F', 'C5', 'Rusting needs iron, oxygen and…', 'Water', ['Carbon dioxide', 'Salt only', 'Sunlight'], 'Iron + oxygen + water → rust (hydrated iron oxide). Salt speeds it up but is not required.'),
    Q('F', 'C4', 'A reaction that releases heat so the surroundings get warmer is…', 'Exothermic', ['Endothermic', 'Physical', 'Reversible'], 'EXothermic: heat EXits.'),
    Q('F', 'C4', 'Mixing baking soda and vinegar makes the mixture colder. This reaction is…', 'Endothermic', ['Exothermic', 'Not a reaction', 'Combustion'], 'It absorbs heat from the surroundings, so the temperature drops.'),
    Q('S', 'C3', 'The law of conservation of mass says that in a chemical reaction…', 'The total mass of the reactants equals the total mass of the products', ['Mass is lost as energy', 'Products are always heavier', 'Atoms are created'], 'Atoms are only rearranged, never created or destroyed.'),
    Q('S', 'C3', 'Baking soda and vinegar react in an open beaker on a balance. The reading goes down. Why?', 'Carbon dioxide gas escapes into the air', ['Mass is destroyed in the reaction', 'The reaction is endothermic', 'The vinegar evaporates instantly'], 'In a closed container the mass would stay the same.'),
    Q('S', 'C3', 'When magnesium ribbon burns in air, the white powder left has MORE mass than the ribbon. Why?', 'The magnesium has combined with oxygen from the air', ['Burning creates new atoms', 'Heat has mass', 'Smoke is added to it'], 'Magnesium + oxygen → magnesium oxide. The extra mass is the oxygen.'),
    Q('S', 'C3', 'According to the particle model, what happens to atoms in a chemical reaction?', 'They are rearranged into new combinations', ['They are destroyed', 'They change into different elements', 'They get bigger'], 'Bonds break and new bonds form; the same atoms are there before and after.'),
    Q('S', 'C2', 'Complete: methane + oxygen → carbon dioxide + ____', 'Water', ['Hydrogen', 'Glucose', 'Rust'], 'Combustion of a fuel containing carbon and hydrogen makes carbon dioxide and water.'),
    Q('S', 'C5', 'Cellular respiration in your body is…', 'Glucose + oxygen → carbon dioxide + water (+ energy)', ['Carbon dioxide + water → glucose + oxygen', 'Glucose → oxygen + water', 'Oxygen + water → glucose'], 'Respiration releases the chemical energy in glucose; it is the reverse of photosynthesis.'),
    Q('S', 'C5', 'Hydrochloric acid reacts with zinc. The gas produced makes a “pop” with a lit splint. The gas is…', 'Hydrogen', ['Oxygen', 'Carbon dioxide', 'Nitrogen'], 'Acid + metal → salt + hydrogen.'),
    Q('S', 'C5', 'Acid + carbonate (e.g. vinegar + baking soda) produces a salt, water and…', 'Carbon dioxide', ['Hydrogen', 'Oxygen', 'Methane'], 'Carbon dioxide turns limewater milky.'),
    Q('S', 'C1', 'Sugar dissolving in water is a physical change because…', 'The sugar is still there and can be recovered by evaporating the water', ['A new substance forms', 'It gives off a gas', 'It changes colour'], 'No new substance; the change is reversible.'),
    Q('C', 'C1', 'When water boils, bubbles form. Why is this NOT evidence of a chemical change?', 'The bubbles are water vapour, the same substance in a different state', ['Boiling never makes bubbles', 'The bubbles are oxygen and hydrogen', 'Gas is never evidence of a chemical change'], 'Gas is only evidence of a chemical change if it is a NEW substance.'),
    Q('C', 'C4', 'Photosynthesis is endothermic. Which explains why?', 'It absorbs light energy to make glucose, storing it as chemical energy', ['It releases heat to the surroundings', 'It happens only at night', 'It makes the plant warmer than the air'], 'Energy is taken in from the surroundings (sunlight).'),
    Q('C', 'C3', 'A student reacts 5.0 g of a metal with 20.0 g of acid in a sealed flask. Which total mass will the balance show at the end?', '25.0 g', ['20.0 g', '15.0 g', 'Less than 25.0 g because gas forms'], 'Sealed (closed) system: nothing enters or leaves, so mass is conserved.'),
    Q('C', 'C5', 'Why does a cut apple go brown, and is this a physical or chemical change?', 'Chemicals in the apple react with oxygen in the air: a chemical change', ['The apple dries out: a physical change', 'Light bleaches it: a physical change', 'Bacteria paint it: a physical change'], 'A colour change from a reaction with oxygen makes a new substance.'),
    Q('C', 'C4', 'Respiration and combustion are similar because both…', 'React a fuel with oxygen, release energy and produce carbon dioxide and water', ['Are endothermic', 'Need light', 'Produce oxygen'], 'Both are exothermic reactions of a fuel with oxygen.'),
  ];
  function chemMC(L) { return ask(CHEM_POOL, lvl(L)); }

  const CHANGES = [
    ['A candle wick burns with a flame', 'Chemical', 'Light and heat are given off and new gases form'],
    ['Chocolate melts in the sun', 'Physical', 'Only the state changes; it sets again when cooled'],
    ['A nail left outside turns orange-brown', 'Chemical', 'Colour change: rust is a new substance'],
    ['Salt dissolves in water', 'Physical', 'No new substance; evaporate the water to get the salt back'],
    ['Milk goes sour and smells', 'Chemical', 'A new smell shows new substances have formed'],
    ['A glass bottle smashes', 'Physical', 'Only the shape and size change'],
    ['Two clear solutions are mixed and a yellow solid appears', 'Chemical', 'A precipitate forms: a new substance'],
    ['A cake bakes and rises in the oven', 'Chemical', 'Heating causes reactions that make new substances and gas; it cannot be un-baked'],
    ['Water freezes into ice cubes', 'Physical', 'Change of state, easily reversed'],
    ['A sparkler burns with bright light', 'Chemical', 'Light and heat are given off as the metal reacts with oxygen'],
    ['Vinegar and baking soda fizz and the cup gets colder', 'Chemical', 'Gas produced and temperature change'],
    ['Steam condenses on a cold mirror', 'Physical', 'Change of state only'],
  ];
  function changeQ(L) {
    L = lvl(L);
    const [sit, ans, why] = pick(CHANGES);
    const p1 = CH(L === 'F' ? '' : 'a', `“${sit}.” Is this a physical or a chemical change?`, ans + ' change', ['Physical change', 'Chemical change'], [why + '.']);
    if (L === 'F') return { level: 'F', tags: ['C1'], stem: '', parts: [p1] };
    const evid = ans === 'Chemical' ? why : 'No new substance is formed';
    const p2 = CH('b', 'Which is the best evidence for your answer?', evid, ans === 'Chemical' ? ['Only the shape changes', 'It can easily be reversed', 'The substance is the same afterwards'] : ['A new substance forms', 'A precipitate forms', 'It gives off light'], [why + '.']);
    return { level: 'S', tags: ['C1'], stem: '', parts: [p1, p2] };
  }

  function massQ(L) {
    L = lvl(L);
    const a = rnd(ri(20, 90) / 10, 1), b = rnd(ri(300, 900) / 10, 1), tot = rnd(a + b, 1), gas = rnd(ri(5, 25) / 10, 1);
    if (L === 'F') return { level: 'F', tags: ['C3'], stem: `In a sealed flask, ${a} g of baking soda reacts with ${b} g of vinegar.`, parts: [num('', 'What is the total mass of the flask’s contents after the reaction (in g)?', tot, ['Closed system: the law of conservation of mass applies.', `Mass after = mass before = ${a} + ${b} = ${tot} g`], { round: 1 })] };
    const after = rnd(tot - gas, 1);
    const parts = [
      num('a', `The same reaction is done in an OPEN beaker. Afterwards the contents have a mass of ${after} g. What mass of carbon dioxide escaped (in g)?`, gas, [`Before = ${a} + ${b} = ${tot} g`, `Gas lost = ${tot} − ${after} = ${gas} g`], { round: 1 }),
      CH('b', 'Does this experiment break the law of conservation of mass?', 'No: the missing mass is the gas that escaped into the air', ['Yes: mass was destroyed', 'Yes: the products are lighter than reactants in every reaction', 'No: the balance must be broken'], ['Atoms are not destroyed; the carbon dioxide left the beaker. In a closed container the mass would not change.']),
    ];
    if (L === 'C') parts.push(CH('c', 'How could the student show that mass is conserved in this reaction?', 'Repeat it in a sealed container (e.g. a flask with a balloon over it) and weigh before and after', ['Use more vinegar', 'Heat the beaker', 'Weigh only the baking soda'], ['Trapping the gas keeps everything in the system.']));
    return { level: L, tags: ['C3'], stem: `${a} g of baking soda is added to ${b} g of vinegar. The mixture fizzes.`, parts };
  }
  function massMC() {
    const m = ri(24, 60) / 10, o = rnd(m * 2 / 3, 1), tot = rnd(m + o, 1);
    return { level: 'F', tags: ['C3'], stem: '', parts: [CH('', `${m.toFixed(1)} g of magnesium burns completely and combines with ${o.toFixed(1)} g of oxygen. What is the mass of magnesium oxide produced?`, `${tot.toFixed(1)} g`, [m.toFixed(1), rnd(m - o, 1).toFixed(1), o.toFixed(1), rnd(tot + 1, 1).toFixed(1)].map(v => `${v} g`), [`Conservation of mass: ${m.toFixed(1)} + ${o.toFixed(1)} = ${tot.toFixed(1)} g`])] };
  }

  const EQUATIONS = [
    ['Combustion of methane', ['methane', 'oxygen'], ['carbon dioxide', 'water']],
    ['Photosynthesis', ['carbon dioxide', 'water'], ['glucose', 'oxygen']],
    ['Respiration', ['glucose', 'oxygen'], ['carbon dioxide', 'water']],
    ['Burning magnesium', ['magnesium', 'oxygen'], ['magnesium oxide']],
    ['Rusting', ['iron', 'oxygen', 'water'], ['hydrated iron oxide (rust)']],
    ['Acid + metal', ['hydrochloric acid', 'zinc'], ['zinc chloride', 'hydrogen']],
    ['Acid + carbonate', ['hydrochloric acid', 'calcium carbonate'], ['calcium chloride', 'water', 'carbon dioxide']],
  ];
  const SUBST = ['carbon dioxide', 'water', 'oxygen', 'hydrogen', 'glucose', 'magnesium oxide', 'methane', 'nitrogen', 'salt'];
  function equationQ(L) {
    L = lvl(L);
    const [name, re, pr] = pick(EQUATIONS), side = L === 'F' ? 'p' : pick(['p', 'r']), arr = side === 'p' ? pr : re, i = ri(0, arr.length - 1), gap = arr[i];
    const show = (xs, j) => xs.map((x, k) => (k === j ? '____' : x)).join(' + ');
    const eq = side === 'p' ? `${re.join(' + ')} → ${show(pr, i)}` : `${show(re, i)} → ${pr.join(' + ')}`;
    const p1 = CH(L === 'F' ? '' : 'a', `${name}: complete the word equation. ${eq}`, gap, SUBST.filter(s => s !== gap && !re.includes(s) && !pr.includes(s)).slice(0, 6).sort(() => Math.random() - 0.5), [`${re.join(' + ')} → ${pr.join(' + ')}`]);
    if (L !== 'C') return { level: L, tags: ['C2', 'C5'], stem: '', parts: [p1] };
    const exo = !/Photosynthesis/.test(name);
    return { level: 'C', tags: ['C2', 'C4', 'C5'], stem: '', parts: [p1,
      CH('b', 'Which are the reactants in this reaction?', re.join(' and '), [pr.join(' and '), [re[0], pr[0]].join(' and '), 'There are no reactants'], ['Reactants are written on the left of the arrow.']),
      CH('c', 'Is this reaction exothermic or endothermic?', exo ? 'Exothermic: it releases energy' : 'Endothermic: it absorbs (light) energy', ['Exothermic: it releases energy', 'Endothermic: it absorbs (light) energy'], [exo ? 'Combustion, respiration, rusting and acid reactions release energy.' : 'Photosynthesis takes in light energy.'])] };
  }
  function tempQ(L) {
    L = lvl(L);
    const endo = Math.random() < 0.5, start = ri(19, 23), d = ri(3, 12), end = endo ? start - d : start + d;
    const rx = endo ? pick(['citric acid and baking soda solution', 'vinegar and baking soda']) : pick(['hydrochloric acid and magnesium ribbon', 'hydrochloric acid and sodium hydroxide solution']);
    const pts = [0, 30, 60, 90, 120, 150, 180].map((t, k) => [t, rnd(start + (end - start) * (1 - Math.exp(-k / 1.5)) * (k ? 1 : 0), 1)]);
    const visual = { type: 'xy', pts, xl: 'Time (s)', yl: 'Temperature (°C)', join: true, title: `Temperature of ${rx}`, ymax: 40 };
    const parts = [
      num(L === 'F' ? '' : 'a', 'What is the change in temperature from the start to the end (in °C, as a positive number)?', rnd(Math.abs(pts[6][1] - start), 1), [`Start ${start} °C, end ${pts[6][1]} °C`, `Change = ${rnd(Math.abs(pts[6][1] - start), 1)} °C`], { round: 1 }),
    ];
    if (L !== 'F') parts.push(CH('b', 'Is the reaction exothermic or endothermic?', endo ? 'Endothermic' : 'Exothermic', ['Exothermic', 'Endothermic'], [endo ? 'The temperature fell: energy was absorbed from the surroundings.' : 'The temperature rose: energy was released to the surroundings.']));
    if (L === 'C') parts.push(CH('c', 'Why does the graph level off at the end?', 'The reaction has finished (a reactant is used up), so no more energy is absorbed or released', ['The thermometer has broken', 'Energy has been destroyed', 'The reaction speeds up'], ['A flat line means the temperature has stopped changing.']));
    return { level: L === 'F' ? 'F' : L, tags: ['C4'], stem: `A student mixes ${rx} and measures the temperature every 30 seconds with a thermometer.`, visual, parts };
  }

  const chem = finish({
    id: 'scichem', subject: SUBJECT, title: 'Chemical change', chapter: 'Change · Chemistry', hue: 'pink',
    blurb: 'Physical vs chemical change, word equations, conservation of mass, exothermic and endothermic reactions, everyday reactions.',
    sections: [
      { code: 'C1', name: 'Physical vs chemical change', notes: [
        'Physical change: no new substance forms. Only the state, shape or size changes, and it is often easy to reverse. Examples: melting, freezing, boiling, dissolving, cutting, crushing.',
        'Chemical change: one or more NEW substances form. It is usually hard to reverse. Examples: burning, rusting, cooking an egg, baking a cake, milk souring.',
        'Signs of a chemical change: a colour change; a gas produced (bubbles, fizzing) that is a new substance; a temperature change (heat given out or taken in); a precipitate (a solid forming when two solutions are mixed); light given off; a new smell.',
        'Careful: boiling water makes bubbles, but they are water vapour (same substance), so it is a physical change.',
      ] },
      { code: 'C2', name: 'Chemical reactions and word equations', notes: [
        'A chemical reaction turns reactants into products: reactants → products. The arrow means “react to form”.',
        'Example: magnesium + oxygen → magnesium oxide. Magnesium and oxygen are the reactants; magnesium oxide is the product.',
        'Combustion (burning): fuel + oxygen → carbon dioxide + water (for fuels such as methane, petrol or wood). It gives off heat and light.',
      ] },
      { code: 'C3', name: 'Particle model and conservation of mass', notes: [
        'All matter is made of tiny particles (atoms). In a chemical reaction, bonds between atoms break and new bonds form, so the atoms are rearranged into new substances.',
        'No atoms are created or destroyed, so the total mass of the reactants equals the total mass of the products. This is the law of conservation of mass.',
        'Closed system (sealed container): the mass stays the same. Open system: if a gas escapes the measured mass goes down (baking soda + vinegar in an open beaker); if a gas from the air joins in, the mass goes up (burning magnesium or steel wool).',
      ] },
      { code: 'C4', name: 'Exothermic and endothermic reactions', notes: [
        'Exothermic reactions release energy (heat, and sometimes light) to the surroundings, so the temperature rises. Examples: combustion, respiration, rusting (slowly), acid + metal, neutralisation.',
        'Endothermic reactions absorb energy from the surroundings, so the temperature falls. Examples: baking soda + vinegar, photosynthesis (absorbs light), cooking (needs heat to keep going).',
        'Teacher’s example: a graph of temperature against time for vinegar + baking soda drops from about 20 °C and then levels off when the reaction finishes. A temperature decrease means endothermic.',
      ] },
      { code: 'C5', name: 'Everyday reactions', notes: [
        'Photosynthesis (in chloroplasts, needs light and chlorophyll): carbon dioxide + water → glucose + oxygen.',
        'Respiration (in all living cells): glucose + oxygen → carbon dioxide + water, releasing energy. It is the reverse of photosynthesis.',
        'Rusting (corrosion): iron + oxygen + water → hydrated iron oxide (rust). Salt water speeds it up; paint, oil and galvanising (zinc coating) prevent it.',
        'Acid + metal → salt + hydrogen (hydrogen makes a squeaky “pop” with a lit splint).',
        'Acid + carbonate → salt + water + carbon dioxide (carbon dioxide turns limewater milky). Vinegar + baking soda is an example.',
        'Cooking: heat changes the proteins in an egg and makes gases that make a cake rise. New substances form, so cooking is a chemical change.',
      ] },
    ],
    cards: [
      ['Physical change', 'No new substance; change of state, shape or size; often reversible.'],
      ['Chemical change', 'At least one new substance forms; usually hard to reverse.'],
      ['Signs of a chemical change', 'Colour change, gas produced, temperature change, precipitate, light, new smell.'],
      ['Precipitate', 'A solid that forms when two solutions are mixed.'],
      ['Reactants', 'The substances that react (left of the arrow).'],
      ['Products', 'The new substances formed (right of the arrow).'],
      ['Word equation', 'Shows a reaction in words: reactants → products.'],
      ['Combustion', 'Fuel + oxygen → carbon dioxide + water (+ heat and light).'],
      ['Photosynthesis', 'Carbon dioxide + water → glucose + oxygen (light energy, chlorophyll).'],
      ['Respiration', 'Glucose + oxygen → carbon dioxide + water (+ energy).'],
      ['Rusting', 'Iron + oxygen + water → rust (hydrated iron oxide).'],
      ['Acid + metal', '→ salt + hydrogen. Test: lit splint goes “pop”.'],
      ['Acid + carbonate', '→ salt + water + carbon dioxide. Test: limewater turns milky.'],
      ['Conservation of mass', 'Total mass of reactants = total mass of products (atoms are rearranged, not created or destroyed).'],
      ['Open vs closed system', 'Open: gases can escape or enter, so measured mass can change. Closed: mass stays constant.'],
      ['Exothermic', 'Releases heat to the surroundings: temperature rises. e.g. combustion.'],
      ['Endothermic', 'Absorbs heat from the surroundings: temperature falls. e.g. baking soda + vinegar.'],
      ['Particle model in reactions', 'Bonds break, atoms rearrange, new bonds form.'],
      ['Why does boiling make bubbles but stay physical?', 'The bubbles are water vapour, the same substance.'],
      ['Preventing rust', 'Paint, oil, plastic coating, galvanising (zinc), keeping iron dry.'],
    ],
    concepts: [
      ['Which is a physical change?', ['Dissolving salt in water', 'Burning paper', 'Rusting iron', 'Frying an egg'], 0, ''],
      ['Which is NOT a sign of a chemical change?', ['Change of shape', 'Colour change', 'Precipitate forms', 'Gas produced'], 0, 'Changing shape makes no new substance.'],
      ['In “zinc + hydrochloric acid → zinc chloride + hydrogen”, the products are…', ['Zinc chloride and hydrogen', 'Zinc and hydrochloric acid', 'Zinc and hydrogen', 'Only zinc chloride'], 0, ''],
      ['The products of photosynthesis are…', ['Glucose and oxygen', 'Carbon dioxide and water', 'Glucose and carbon dioxide', 'Oxygen and water'], 0, ''],
      ['Which gas turns limewater milky?', ['Carbon dioxide', 'Oxygen', 'Hydrogen', 'Nitrogen'], 0, ''],
      ['10 g of reactants in a sealed container produce how much product?', ['10 g', 'Less than 10 g', 'More than 10 g', 'It depends on the colour'], 0, 'Conservation of mass.'],
      ['A reaction makes a test tube feel cold. It is…', ['Endothermic', 'Exothermic', 'A physical change', 'Combustion'], 0, ''],
      ['Which is an exothermic reaction?', ['Burning natural gas', 'Photosynthesis', 'Baking soda + vinegar', 'Melting ice'], 0, ''],
      ['Rusting is an example of…', ['Corrosion (a chemical change)', 'A physical change', 'An endothermic change', 'Melting'], 0, ''],
      ['Galvanising protects iron from rusting by…', ['Coating it in zinc', 'Heating it', 'Adding salt water', 'Painting it with acid'], 0, ''],
      ['During a chemical reaction, atoms are…', ['Rearranged', 'Destroyed', 'Created', 'Turned into energy'], 0, ''],
      ['Respiration is basically the reverse of…', ['Photosynthesis', 'Combustion', 'Rusting', 'Melting'], 0, ''],
      ['Steel wool burns in air and gets heavier. Why?', ['It combines with oxygen from the air', 'Burning creates mass', 'Ash is heavier than metal', 'Heat adds mass'], 0, ''],
      ['Cooking an egg is a chemical change because…', ['New substances form and it cannot be reversed', 'It changes shape', 'It gets hot', 'It can be easily reversed'], 0, ''],
    ],
    short: [
      { q: 'Distinguish between a physical change and a chemical change, giving one example of each.', marks: 4, tags: ['C1'], criteria: ['Physical change: no new substance forms (state, shape or size change; often reversible)', 'Valid example of a physical change, e.g. ice melting or sugar dissolving', 'Chemical change: one or more new substances form (usually hard to reverse)', 'Valid example of a chemical change, e.g. wood burning or iron rusting'], model: 'In a physical change no new substance forms; only the state, shape or size changes and it can often be reversed, for example ice melting into water. In a chemical change one or more new substances are produced and the change is usually hard to reverse, for example iron rusting to form iron oxide.' },
      { q: 'List THREE observations that could show a chemical change has taken place.', marks: 3, tags: ['C1'], criteria: ['One valid sign, e.g. colour change', 'A second distinct sign, e.g. a gas is produced (bubbles/fizzing)', 'A third distinct sign, e.g. temperature change, precipitate forms, light or new smell'], model: 'A colour change, a gas being produced (bubbles or fizzing), and a temperature change. A precipitate forming, light being given off or a new smell are also signs.' },
      { q: 'A student places a beaker of vinegar and a dish of baking soda on a balance (total 150.0 g), then mixes them in the open beaker. After fizzing stops the balance reads 148.2 g. Explain this result using the law of conservation of mass.', marks: 3, tags: ['C3'], criteria: ['States the law: mass is not created or destroyed; total mass of reactants = total mass of products', 'The reaction produces carbon dioxide gas, which escaped from the open beaker (1.8 g)', 'In a closed/sealed container the mass would stay at 150.0 g'], model: 'The law of conservation of mass says atoms are not created or destroyed, so the total mass of the products equals the total mass of the reactants. The reaction produced carbon dioxide gas, and because the beaker was open, 150.0 − 148.2 = 1.8 g of gas escaped into the air. If the reaction were done in a sealed container, the balance would still read 150.0 g.' },
      { q: 'Write the word equation for photosynthesis and explain why it is an endothermic reaction.', marks: 3, tags: ['C2', 'C4', 'C5'], criteria: ['Correct reactants: carbon dioxide + water', 'Correct products: glucose + oxygen', 'Endothermic because it absorbs (light) energy from the surroundings and stores it as chemical energy in glucose'], model: 'Carbon dioxide + water → glucose + oxygen (using light energy absorbed by chlorophyll). It is endothermic because the plant absorbs energy from sunlight and stores it as chemical energy in glucose, rather than releasing energy.' },
      { q: 'Compare exothermic and endothermic reactions. Give an example of each.', marks: 4, tags: ['C4'], criteria: ['Exothermic reactions release energy (heat) to the surroundings, so the temperature rises', 'Valid exothermic example, e.g. combustion, respiration, acid + metal', 'Endothermic reactions absorb energy from the surroundings, so the temperature falls', 'Valid endothermic example, e.g. baking soda + vinegar, photosynthesis'], model: 'Exothermic reactions release thermal energy to the surroundings, so the temperature goes up, for example burning natural gas (combustion). Endothermic reactions absorb thermal energy from the surroundings, so the temperature goes down, for example vinegar reacting with baking soda.' },
      { q: 'Use the particle model to explain what happens to atoms during a chemical reaction.', marks: 2, tags: ['C3'], criteria: ['Bonds between atoms in the reactants break and new bonds form, rearranging the atoms into new substances', 'No atoms are created or destroyed, so the same number and type of atoms are present before and after (mass is conserved)'], model: 'During a chemical reaction the bonds holding the atoms of the reactants together break, and the atoms rearrange and form new bonds to make the products. No atoms are created or destroyed, so the same atoms are present before and after, which is why mass is conserved.' },
      { q: 'Explain why iron rusts faster near the beach, and describe one way to prevent rusting.', marks: 3, tags: ['C5'], criteria: ['Rusting is a chemical reaction of iron with oxygen and water', 'Salt (from sea spray) speeds up the reaction', 'A valid prevention method that keeps out oxygen and/or water, e.g. painting, oiling, galvanising with zinc'], model: 'Rusting is a chemical reaction in which iron reacts with oxygen and water to form hydrated iron oxide. Near the beach the air is moist and contains salt from sea spray, and salt speeds up rusting. Painting the iron prevents rusting because it stops oxygen and water reaching the metal.' },
    ],
    bank: [chemMC, changeQ, massQ, equationQ, tempQ, massMC],
  });

  /* =====================================================================
     DECK 3: GEOLOGICAL CHANGE (Earth's structure, plate tectonics, hazards)
     ===================================================================== */
  const TECT_POOL = [
    Q('F', 'P1', 'What is the outermost, thinnest layer of the Earth called?', 'The crust', ['The mantle', 'The outer core', 'The inner core'], 'Crust → mantle → outer core → inner core.'),
    Q('F', 'P1', 'Which layer of the Earth is liquid iron and nickel?', 'The outer core', ['The inner core', 'The crust', 'The mantle'], 'The inner core is solid because of the enormous pressure.'),
    Q('F', 'P1', 'Which planet is a rocky (terrestrial) planet?', 'Mars', ['Jupiter', 'Saturn', 'Neptune'], 'The four inner planets (Mercury, Venus, Earth, Mars) are rocky.'),
    Q('F', 'P1', 'Jupiter and Saturn are mostly made of…', 'Hydrogen and helium gas', ['Solid rock and iron', 'Ice and water only', 'Liquid lava'], 'They are gas giants. Uranus and Neptune are ice giants.'),
    Q('F', 'P2', 'What causes tectonic plates to move?', 'Convection currents in the mantle', ['The Moon’s gravity', 'Wind blowing on the continents', 'Ocean waves'], 'Heat from the core makes hot mantle rock rise and cooler rock sink, dragging the plates.'),
    Q('F', 'P2', 'The scientist who proposed “continental drift” in 1912 was…', 'Alfred Wegener', ['Charles Darwin', 'Isaac Newton', 'Marie Curie'], 'He suggested the continents were once joined in a supercontinent, Pangaea.'),
    Q('F', 'P3', 'At a divergent boundary, plates…', 'Move apart', ['Move towards each other', 'Slide past each other', 'Do not move'], 'Magma rises to fill the gap, making new crust (e.g. the Mid-Atlantic Ridge).'),
    Q('F', 'P3', 'At a transform boundary, plates…', 'Slide past each other', ['Move apart', 'Collide head-on', 'Sink into the core'], 'Example: the San Andreas Fault in California. Causes earthquakes.'),
    Q('F', 'P3', 'The Himalayas formed where…', 'Two continental plates collided (convergent boundary)', ['Two plates moved apart', 'Two plates slid past each other', 'A volcano erupted under the sea'], 'India pushing into Asia crumpled the crust into fold mountains.'),
    Q('F', 'P4', 'An instrument that detects and records earthquake waves is a…', 'Seismometer (seismograph)', ['Thermometer', 'Barometer', 'Anemometer'], ''),
    Q('F', 'P4', 'Most tsunamis are caused by…', 'Earthquakes under the sea floor', ['Strong winds', 'High tides', 'Heavy rain'], 'The sea floor moves suddenly and displaces a huge volume of water.'),
    Q('S', 'P2', 'Fossils of the same land reptile (Mesosaurus) are found in both South America and Africa. This supports plate tectonics because…', 'The continents must once have been joined', ['The reptile could swim across the Atlantic', 'Fossils move with ocean currents', 'Reptiles lived everywhere'], 'A small freshwater reptile could not cross an ocean.'),
    Q('S', 'P2', 'On the sea floor, rocks get older the further they are from a mid-ocean ridge. This shows…', 'New crust is made at the ridge and spreads outwards (sea-floor spreading)', ['The ridge is the oldest part of the ocean', 'Rocks age faster under water', 'The ocean is shrinking'], 'Magnetic stripes are also mirror images on both sides of the ridge.'),
    Q('S', 'P2', 'Why are earthquakes and volcanoes found in long narrow belts (like the Pacific “Ring of Fire”)?', 'They occur mostly along plate boundaries', ['They follow the equator', 'They occur where it rains most', 'They happen near big cities'], 'Plate boundaries are where plates interact.'),
    Q('S', 'P3', 'When an oceanic plate meets a continental plate, the oceanic plate sinks underneath because…', 'Oceanic crust is denser than continental crust', ['Oceanic crust is lighter', 'Water pushes it down', 'Continental crust is hotter'], 'This is subduction; it forms a deep trench, volcanoes and earthquakes (e.g. the Andes).'),
    Q('S', 'P3', 'Iceland sits on the Mid-Atlantic Ridge. What type of boundary is it, and what happens there?', 'Divergent: plates move apart and magma rises to make new crust', ['Convergent: plates collide and make fold mountains', 'Transform: plates slide past each other', 'There is no boundary there'], 'Iceland has many volcanoes because of this.'),
    Q('S', 'P4', 'Why does mainland Australia have no active volcanoes and fewer large earthquakes than New Zealand?', 'Australia is in the middle of a plate, while New Zealand is on a plate boundary', ['Australia is too dry', 'Australia is closer to the equator', 'Australia’s crust is thicker everywhere'], 'Intraplate earthquakes still happen, e.g. Newcastle in 1989.'),
    Q('S', 'P4', 'Which observation would best warn scientists that a volcano may erupt soon?', 'The ground swelling and more small earthquakes and gas', ['A drop in air temperature', 'A full moon', 'Heavy rainfall'], 'Tiltmeters/GPS, seismometers and gas sensors monitor volcanoes.'),
    Q('S', 'P4', 'How can buildings be designed to reduce damage in earthquakes?', 'Flexible frames and shock-absorbing bases that let the building sway', ['Using heavy unreinforced brick', 'Making buildings as tall as possible', 'Building on loose sand'], 'Building codes in quake zones require reinforced, flexible designs.'),
    Q('C', 'P4', 'Scientists can say which areas are likely to have earthquakes but not exactly when. Why?', 'Stress builds up unpredictably along faults, so only the probability over time can be estimated from past data', ['Earthquakes are random and happen anywhere equally', 'Seismometers cannot detect earthquakes', 'Earthquakes only happen at night'], 'Hazard maps use data from past earthquakes to model and predict risk.'),
    Q('C', 'P3', 'A deep ocean trench with a line of volcanic islands beside it most likely forms where…', 'Two oceanic plates converge and one subducts', ['Two plates move apart', 'Two continental plates collide', 'A transform fault slides'], 'Example: the Mariana Trench and islands, and Japan.'),
    Q('C', 'P2', 'Which is the strongest evidence that the sea floor is spreading?', 'Matching magnetic stripes of the same age on either side of a mid-ocean ridge', ['The shapes of the continents', 'Coal found in Antarctica', 'Earthquakes in California'], 'Rock records Earth’s magnetic field as it cools; stripes are mirror images on both sides.'),
    Q('C', 'P4', 'A tsunami warning is issued for the NSW coast after a large undersea earthquake near New Zealand. Which data would scientists use to confirm a tsunami is travelling?', 'Deep-ocean pressure sensors (DART buoys) and coastal sea-level gauges', ['Rain gauges', 'Wind speed readings in Sydney', 'Satellite photos of clouds'], 'The Joint Australian Tsunami Warning Centre uses seismic and sea-level data.'),
  ];
  function tectMC(L) { return ask(TECT_POOL, lvl(L)); }

  const BOUNDARIES = [
    { type: 'Divergent', move: 'move apart', feat: 'a mid-ocean ridge or rift valley, with new crust forming', ex: 'Mid-Atlantic Ridge (Iceland) or the East African Rift' },
    { type: 'Convergent', move: 'move towards each other', feat: 'subduction, a trench, volcanoes and fold mountains', ex: 'The Andes, the Himalayas or Japan' },
    { type: 'Transform', move: 'slide past each other', feat: 'frequent earthquakes along a fault, with no crust made or destroyed', ex: 'The San Andreas Fault (USA) or the Alpine Fault (New Zealand)' },
  ];
  function boundaryQ(L) {
    L = lvl(L);
    const b = pick(BOUNDARIES), o = BOUNDARIES.filter(x => x !== b);
    const p1 = CH(L === 'F' ? '' : 'a', `Two tectonic plates ${b.move}. What type of plate boundary is this?`, b.type, ['Divergent', 'Convergent', 'Transform', 'Stationary'], [`Plates that ${b.move}: ${b.type.toLowerCase()} boundary.`]);
    if (L === 'F') return { level: 'F', tags: ['P3'], stem: '', parts: [p1] };
    const parts = [p1,
      CH('b', 'Which feature is typical of this boundary?', b.feat, o.map(x => x.feat), [`${b.type}: ${b.feat}.`]),
      CH('c', 'Which is an example of this boundary?', b.ex, o.map(x => x.ex), [b.ex + '.'])];
    if (L === 'C') parts.push(CH('d', 'What drives the movement of the plates at this boundary?', 'Convection currents in the mantle carrying the plates', ['Tides pulling on the crust', 'Earth’s magnetic field', 'Erosion by rivers'], ['Hot mantle rock rises, spreads and sinks as it cools, dragging the plates.']));
    return { level: L, tags: ['P3', 'P2'], stem: '', parts };
  }

  // Plate speed calculations (data used to model and predict).
  function spreadQ(L) {
    L = lvl(L);
    const plate = pick([['the Atlantic Ocean widening', 2.5], ['the Australian plate moving north', 7], ['the Pacific plate moving north-west', 8], ['the East African Rift opening', 0.5], ['the Mid-Atlantic Ridge spreading', 2]]);
    const [what, r] = plate, yrs = pick([100, 1000, 10000, 1000000]), cm = r * yrs;
    const fmt = (c) => (c >= 100000 ? `${rnd(c / 100000, 2)} km` : c >= 100 ? `${rnd(c / 100, 2)} m` : `${rnd(c, 2)} cm`);
    const p1 = CH(L === 'F' ? '' : 'a', `Measurements show ${what} at about ${r} cm per year. How far will it move in ${yrs.toLocaleString('en-AU')} years?`, fmt(cm), [fmt(cm * 10), fmt(cm / 10), fmt(cm * 100), fmt(r + yrs)], [`Distance = rate × time = ${r} cm × ${yrs.toLocaleString('en-AU')} = ${cm.toLocaleString('en-AU')} cm`, `= ${fmt(cm)} (100 cm = 1 m, 1000 m = 1 km)`]);
    if (L === 'F') return { level: 'F', tags: ['P2'], stem: '', parts: [p1] };
    const km = pick([20, 50, 100, 200]), t = km * 100000 / r;
    const yrsF = (n) => (n >= 1e6 ? `about ${rnd(n / 1e6, 1)} million years` : `about ${Number(n.toPrecision(2)).toLocaleString('en-AU')} years`);
    const parts = [p1, CH('b', `At ${r} cm per year, roughly how long would it take to move ${km} km?`, yrsF(t), [yrsF(t * 10), yrsF(t / 10), yrsF(t * 100), yrsF(km * r)], [`${km} km = ${(km * 100000).toLocaleString('en-AU')} cm`, `Time = distance ÷ rate = ${(km * 100000).toLocaleString('en-AU')} ÷ ${r} ≈ ${Math.round(t).toLocaleString('en-AU')} years`])];
    if (L === 'C') parts.push(CH('c', 'Why is this kind of prediction only an estimate?', 'Plate speeds are averages and can change over long periods', ['Plates never move', 'Centimetres cannot be measured', 'Plates move faster every year by the same amount'], ['Models assume the rate stays constant, which may not be true over millions of years.']));
    return { level: L, tags: ['P2'], stem: '', parts };
  }

  function quakeDataQ(L) {
    L = lvl(L);
    const rows = shuffle([['Japan', 'Plate boundary (convergent)', 9.1], ['Chile', 'Plate boundary (convergent)', 8.8], ['Newcastle, NSW', 'Middle of a plate', 5.6], ['Christchurch, NZ', 'Near a plate boundary', 6.2], ['California, USA', 'Plate boundary (transform)', 6.9], ['Meckering, WA', 'Middle of a plate', 6.5]]).slice(0, 5);
    const big = rows.reduce((a, b) => (b[2] > a[2] ? b : a));
    const visual = { type: 'table', head: ['Location', 'Position', 'Magnitude'], rows: rows.map(r => [r[0], r[1], String(r[2])]), cap: 'Some significant earthquakes' };
    const parts = [CH(L === 'F' ? '' : 'a', 'Which location had the largest earthquake in the table?', big[0], rows.map(r => r[0]), [`Highest magnitude: ${big[2]} (${big[0]}).`])];
    if (L !== 'F') parts.push(CH('b', 'What pattern does the data show?', 'The largest earthquakes happen at plate boundaries; mid-plate earthquakes are usually smaller', ['Earthquakes are all the same size', 'Mid-plate earthquakes are always the largest', 'Earthquakes only happen in Australia'], ['Compare magnitudes for “plate boundary” rows with “middle of a plate” rows.']));
    if (L === 'C') parts.push(CH('c', 'Why might a scientist want more data before making this conclusion?', 'A small sample of earthquakes may not represent all earthquakes', ['The magnitudes are wrong', 'Earthquakes cannot be compared', 'Tables cannot show patterns'], ['More data makes a conclusion more reliable.']));
    return { level: L, tags: ['P2', 'P4'], stem: 'Use the data in the table.', visual, parts };
  }

  const geol = finish({
    id: 'scigeo', subject: SUBJECT, title: 'Geological change: plate tectonics and hazards', chapter: 'Change · Earth', hue: 'coral',
    blurb: 'Earth’s layers and the planets, plate tectonics and its evidence, plate boundaries, earthquakes, volcanoes and tsunamis.',
    sections: [
      { code: 'P1', name: 'Earth’s structure and the planets', notes: [
        'Crust: the thin, solid outer layer. Oceanic crust is thin (about 5–10 km), dense basalt; continental crust is thicker (about 30–70 km) and less dense (granite-like).',
        'Mantle: the thickest layer, hot rock that is mostly solid but flows very slowly. The crust and the very top of the mantle form the lithosphere, broken into tectonic plates.',
        'Outer core: liquid iron and nickel (its movement makes Earth’s magnetic field). Inner core: solid iron and nickel, about 5000–6000 °C, solid because of the huge pressure.',
        'Planets: the inner planets (Mercury, Venus, Earth, Mars) are rocky, with solid surfaces and metal cores. Jupiter and Saturn are gas giants (mostly hydrogen and helium). Uranus and Neptune are ice giants (water, ammonia and methane ices around a rocky core).',
      ] },
      { code: 'P2', name: 'Plate tectonics and the evidence', notes: [
        'The lithosphere is broken into about a dozen large plates that move a few centimetres a year (about as fast as fingernails grow). The Australian plate moves north about 7 cm a year.',
        'Plates move because of convection currents in the mantle: heat from the core makes hot rock rise, spread out and sink as it cools, dragging the plates along.',
        'Alfred Wegener (1912) proposed continental drift: all continents were once joined in a supercontinent, Pangaea (about 250–300 million years ago).',
        'Evidence: the coastlines of South America and Africa fit like a jigsaw; matching fossils on different continents (Mesosaurus, Glossopteris in Australia, India, Antarctica, Africa and South America); matching rock types and mountain ranges across oceans; earthquakes and volcanoes in narrow belts along plate edges; sea-floor spreading: rock is youngest at mid-ocean ridges and older further away, with matching magnetic stripes on both sides.',
      ] },
      { code: 'P3', name: 'Plate boundaries', notes: [
        'Divergent: plates move apart. Magma rises and makes new crust, forming mid-ocean ridges and rift valleys. e.g. the Mid-Atlantic Ridge (Iceland), the East African Rift.',
        'Convergent: plates move together. Oceanic + continental: the denser oceanic plate subducts (sinks) under the other, forming a trench, volcanoes and earthquakes, e.g. the Andes. Oceanic + oceanic: a trench and volcanic islands, e.g. Japan. Continental + continental: crust crumples into fold mountains, e.g. the Himalayas.',
        'Transform: plates slide past each other. Crust is neither made nor destroyed, but plates lock and slip, causing earthquakes, e.g. the San Andreas Fault, the Alpine Fault in New Zealand.',
      ] },
      { code: 'P4', name: 'Tectonic hazards', notes: [
        'Earthquakes: stress builds up where plates lock, then is released suddenly as seismic waves. The focus is where it starts underground; the epicentre is on the surface directly above. Measured with seismometers; magnitude scales: each whole number is about 32 times more energy.',
        'Volcanoes: magma rises through the crust and erupts as lava, ash and gas. Hazards: lava flows, ash clouds, pyroclastic flows, mudflows (lahars).',
        'Tsunamis: a sudden movement of the sea floor in an undersea earthquake pushes up a huge volume of water, making fast waves that grow tall near the coast (e.g. 2004 Indian Ocean, 2011 Japan).',
        'Monitoring and predicting: seismometers, GPS and tiltmeters (ground swelling), gas sensors, satellites, deep-ocean tsunami buoys and sea-level gauges. Volcanoes often give warning signs; earthquakes cannot be predicted exactly, but hazard maps use past data to estimate the risk.',
        'Reducing harm: warning systems (e.g. the Joint Australian Tsunami Warning Centre), evacuation plans and drills, earthquake-resistant building codes, land-use planning, education.',
        'Australia sits in the middle of the Indo-Australian plate, so it has fewer large earthquakes and no active mainland volcanoes, but intraplate earthquakes still happen (Newcastle 1989, magnitude 5.6, 13 deaths).',
      ] },
    ],
    cards: [
      ['Crust', 'Thin, solid outer layer. Oceanic (thin, dense) and continental (thick, less dense).'],
      ['Mantle', 'Thick layer of hot rock that flows slowly; convection currents here move the plates.'],
      ['Outer core', 'Liquid iron and nickel.'],
      ['Inner core', 'Solid iron and nickel; solid because of huge pressure.'],
      ['Lithosphere', 'The crust plus the top of the mantle; broken into tectonic plates.'],
      ['Rocky (terrestrial) planets', 'Mercury, Venus, Earth, Mars.'],
      ['Gas giants', 'Jupiter and Saturn: mostly hydrogen and helium.'],
      ['Ice giants', 'Uranus and Neptune: water, ammonia and methane ices.'],
      ['Plate tectonics', 'The theory that Earth’s lithosphere is made of moving plates.'],
      ['Pangaea', 'Supercontinent that existed about 250–300 million years ago.'],
      ['Evidence for plate tectonics', 'Jigsaw fit, matching fossils, matching rocks/mountains, earthquake and volcano patterns, sea-floor spreading.'],
      ['Sea-floor spreading', 'New crust forms at mid-ocean ridges and moves outwards; rocks get older away from the ridge.'],
      ['Divergent boundary', 'Plates move apart; new crust; ridges and rift valleys. e.g. Mid-Atlantic Ridge.'],
      ['Convergent boundary', 'Plates move together; subduction, trenches, volcanoes, fold mountains. e.g. Himalayas, Andes.'],
      ['Transform boundary', 'Plates slide past; earthquakes. e.g. San Andreas Fault.'],
      ['Subduction', 'A denser oceanic plate sinks under another plate into the mantle.'],
      ['Focus vs epicentre', 'Focus: where the earthquake starts underground. Epicentre: point on the surface above it.'],
      ['Seismometer', 'Instrument that detects and records earthquake waves.'],
      ['Tsunami', 'Huge waves caused by sudden movement of the sea floor, usually an undersea earthquake.'],
      ['Monitoring volcanoes', 'Ground swelling (GPS/tiltmeters), small earthquakes, gas emissions, temperature.'],
      ['Why few big quakes in Australia?', 'Australia is in the middle of a plate, far from boundaries.'],
    ],
    concepts: [
      ['Which layer of Earth is the thickest?', ['Mantle', 'Crust', 'Outer core', 'Inner core'], 0, ''],
      ['Why is the inner core solid even though it is extremely hot?', ['The pressure is enormous', 'It is cold', 'It is made of rock', 'It is frozen water'], 0, ''],
      ['Which is NOT evidence for plate tectonics?', ['Changes in the weather', 'Matching fossils on different continents', 'Continents fitting together', 'Sea-floor magnetic stripes'], 0, ''],
      ['Plates move at about…', ['A few centimetres per year', 'A few metres per day', 'A few kilometres per year', 'They do not move'], 0, ''],
      ['The Andes formed at which type of boundary?', ['Convergent (oceanic–continental)', 'Divergent', 'Transform', 'Continental–continental'], 0, ''],
      ['New crust forms at…', ['Divergent boundaries', 'Convergent boundaries', 'Transform boundaries', 'The inner core'], 0, ''],
      ['The point on the surface directly above where an earthquake starts is the…', ['Epicentre', 'Focus', 'Fault', 'Crater'], 0, ''],
      ['Which is a gas giant?', ['Saturn', 'Venus', 'Mars', 'Mercury'], 0, ''],
      ['The San Andreas Fault is a…', ['Transform boundary', 'Divergent boundary', 'Subduction zone', 'Mid-ocean ridge'], 0, ''],
      ['Which best reduces deaths from a tsunami?', ['A warning system and evacuation to high ground', 'Building closer to the beach', 'Planting flowers', 'Measuring rainfall'], 0, ''],
      ['Magnetic stripes on the sea floor are…', ['Mirror images on each side of a mid-ocean ridge', 'Only on one side of a ridge', 'Random', 'Caused by ships'], 0, ''],
      ['The 1989 Newcastle earthquake happened…', ['In the middle of a plate', 'On a transform boundary', 'At a mid-ocean ridge', 'On a subduction zone'], 0, 'An intraplate earthquake.'],
    ],
    short: [
      { q: 'Describe TWO pieces of evidence that support the theory of plate tectonics.', marks: 4, tags: ['P2'], criteria: ['Names one valid piece of evidence, e.g. jigsaw fit of continents, matching fossils, matching rocks, sea-floor spreading, earthquake/volcano patterns', 'Explains how the first piece of evidence shows the continents/plates have moved', 'Names a second, different piece of evidence', 'Explains how the second piece of evidence supports plate movement'], model: 'First, fossils of the same freshwater reptile, Mesosaurus, are found in both South America and Africa. It could not have swum across the Atlantic Ocean, so the continents must once have been joined and have since moved apart. Second, rocks on the sea floor are youngest at mid-ocean ridges and get older further away, with matching magnetic stripes on each side. This shows new crust is being made at the ridges and the plates are spreading apart.' },
      { q: 'Explain how convection currents in the mantle cause tectonic plates to move.', marks: 3, tags: ['P2'], criteria: ['Heat from the core heats mantle rock, which becomes less dense and rises', 'It spreads out under the lithosphere, cools, becomes denser and sinks, forming a convection current', 'The moving mantle drags the plates above it along (a few cm per year)'], model: 'Heat from the core warms the rock in the lower mantle, which expands, becomes less dense and slowly rises. Near the top it spreads sideways under the lithosphere, cools, becomes denser and sinks again, forming a convection current. As the mantle moves sideways it drags the tectonic plates above it, moving them a few centimetres each year.' },
      { q: 'Compare divergent and convergent plate boundaries. Include an example of each.', marks: 4, tags: ['P3'], criteria: ['Divergent: plates move apart and new crust forms as magma rises', 'Divergent example, e.g. the Mid-Atlantic Ridge or East African Rift', 'Convergent: plates move towards each other; subduction/fold mountains, volcanoes, earthquakes', 'Convergent example, e.g. the Andes, Himalayas or Japan'], model: 'At a divergent boundary plates move apart; magma rises into the gap and cools to form new crust, making ridges and rift valleys, for example the Mid-Atlantic Ridge. At a convergent boundary plates move towards each other; one plate may subduct, forming trenches and volcanoes, or the crust crumples into fold mountains, for example the Himalayas where India meets Asia.' },
      { q: 'Explain how scientists monitor volcanoes and why this helps reduce harm to people.', marks: 3, tags: ['P4'], criteria: ['Names a monitoring method, e.g. seismometers for small earthquakes, GPS/tiltmeters for ground swelling, gas sensors', 'Changes in these readings can warn that magma is rising and an eruption is likely', 'Early warning allows evacuation/exclusion zones, reducing deaths and injuries'], model: 'Scientists use seismometers to detect swarms of small earthquakes, GPS and tiltmeters to measure the ground swelling, and gas sensors to measure increases in gases such as sulfur dioxide. These changes show that magma is rising, so an eruption may be close. This gives authorities time to warn people and evacuate the area, which reduces deaths and injuries.' },
      { q: 'Explain how an undersea earthquake can cause a tsunami, and describe one way the risk to coastal communities can be reduced.', marks: 4, tags: ['P4'], criteria: ['At a plate boundary the sea floor moves suddenly up or down in an earthquake', 'This displaces a huge volume of water, sending fast waves across the ocean', 'The waves slow and grow much taller as they reach shallow coastal water', 'A valid way to reduce risk, e.g. warning systems (buoys/sea-level gauges), evacuation routes and drills, sea walls, land-use planning'], model: 'When plates suddenly slip in an undersea earthquake, the sea floor is pushed up or down. This displaces a huge volume of water above it, creating waves that travel very fast across the ocean. As the waves reach shallow water near the coast they slow down and grow much taller, flooding the land. Warning systems such as deep-ocean buoys and sea-level gauges, linked to evacuation plans, give people time to move to high ground.' },
      { q: 'Explain why mainland Australia has no active volcanoes but New Zealand does.', marks: 2, tags: ['P3', 'P4'], criteria: ['New Zealand lies on a convergent plate boundary (Pacific and Australian plates) where subduction produces magma', 'Australia is in the middle of the Indo-Australian plate, far from any boundary'], model: 'New Zealand sits on the boundary between the Pacific and Australian plates, where one plate subducts under the other and melts to form magma that feeds volcanoes. Mainland Australia is in the middle of the Indo-Australian plate, far from any boundary, so there is no subduction to make magma.' },
    ],
    bank: [tectMC, boundaryQ, spreadQ, quakeDataQ],
  });

  /* =====================================================================
     DECK 4: ROCKS, THE ROCK CYCLE AND FOSSILS
     ===================================================================== */
  const ROCK_POOL = [
    Q('F', 'R1', 'Igneous rocks form when…', 'Magma or lava cools and hardens', ['Sediments are pressed together', 'Rocks are changed by heat and pressure without melting', 'Shells pile up on the sea floor'], 'Igneous = “from fire”.'),
    Q('F', 'R1', 'Which is an extrusive igneous rock?', 'Basalt', ['Granite', 'Sandstone', 'Marble'], 'Basalt forms from lava that cools quickly at the surface.'),
    Q('F', 'R2', 'Sandstone, shale and limestone are…', 'Sedimentary rocks', ['Igneous rocks', 'Metamorphic rocks', 'Minerals'], 'They form from layers of sediment.'),
    Q('F', 'R3', 'Marble is a metamorphic rock that forms from…', 'Limestone', ['Granite', 'Shale', 'Basalt'], 'Heat and pressure change limestone into marble.'),
    Q('F', 'R3', 'Slate forms from…', 'Shale', ['Limestone', 'Sandstone', 'Granite'], 'Shale + heat and pressure → slate.'),
    Q('F', 'R4', 'The breaking down of rock into smaller pieces by wind, water, ice, plants or chemicals is called…', 'Weathering', ['Deposition', 'Compaction', 'Melting'], 'Erosion then carries the pieces away.'),
    Q('F', 'R5', 'In undisturbed rock layers, where are the oldest layers?', 'At the bottom', ['At the top', 'In the middle', 'It is random'], 'The law of superposition.'),
    Q('F', 'R5', 'Fossils are most commonly found in…', 'Sedimentary rock', ['Igneous rock', 'Metamorphic rock', 'Magma'], 'Heat would destroy remains in igneous and most metamorphic rock.'),
    Q('F', 'R5', 'A footprint or burrow preserved in rock is a…', 'Trace fossil', ['Mould', 'Index fossil', 'Mineral'], 'Trace fossils show the activity of an organism, not its body.'),
    Q('S', 'R1', 'Granite has large crystals and basalt has tiny crystals. Why?', 'Granite cooled slowly underground; basalt cooled quickly at the surface', ['Granite cooled quickly; basalt cooled slowly', 'Granite is metamorphic', 'Basalt was squashed more'], 'Slow cooling gives crystals time to grow.'),
    Q('S', 'R2', 'What is the correct order of sedimentary rock formation?', 'Weathering → erosion → deposition → compaction and cementation', ['Deposition → weathering → erosion → melting', 'Erosion → weathering → cooling → deposition', 'Compaction → weathering → deposition → erosion'], 'Break down, carry away, settle in layers, squeeze and glue.'),
    Q('S', 'R2', 'Which sedimentary rock fizzes when a drop of dilute acid is added?', 'Limestone', ['Sandstone', 'Shale', 'Conglomerate'], 'Limestone is calcium carbonate: acid + carbonate makes carbon dioxide.'),
    Q('S', 'R3', 'Metamorphic rocks form when existing rocks are…', 'Changed by heat and pressure without melting', ['Melted and cooled', 'Weathered and eroded', 'Dissolved in water'], 'If they melted, they would become magma and then igneous rock.'),
    Q('S', 'R4', 'What drives the rock cycle?', 'Heat from inside the Earth and energy from the Sun (weather and water cycle)', ['The Moon only', 'Human mining', 'Earth’s magnetic field'], 'Internal heat melts and changes rock; the Sun drives weathering and erosion.'),
    Q('S', 'R5', 'An index fossil is useful because the organism…', 'Lived for a short time and was widespread, so it dates rock layers in different places', ['Lived for a very long time in one place', 'Is still alive today', 'Was very rare'], 'Finding it tells you the age of the layer.'),
    Q('S', 'R5', 'Permineralisation happens when…', 'Minerals in groundwater fill the spaces in buried bones or wood and harden', ['An animal is frozen in ice', 'An insect is trapped in tree sap', 'A footprint is filled with mud'], 'Lightning Ridge (NSW) opalised fossils formed when opal replaced bone and shell.'),
    Q('S', 'R5', 'Relative dating tells us…', 'Whether a rock layer is older or younger than another', ['The exact age in years', 'How hot the rock was', 'The rock’s mass'], 'Absolute (radiometric) dating gives an age in years.'),
    Q('S', 'R5', 'Absolute (radiometric) dating works by…', 'Measuring how much of a radioactive element has decayed, at a known rate', ['Counting rock layers', 'Comparing fossils', 'Measuring the rock’s colour'], 'It gives an age in years, usually for igneous rocks.'),
    Q('C', 'R5', 'A layer of igneous rock cuts through layers A, B and C of sedimentary rock. What can you conclude?', 'The igneous rock is younger than layers A, B and C', ['The igneous rock is older than all three layers', 'The igneous rock is the same age as layer A', 'Nothing about age can be concluded'], 'Something that cuts through rock must be younger than the rock it cuts (cross-cutting).'),
    Q('C', 'R5', 'Why are fossils of soft-bodied animals, like jellyfish, very rare?', 'Soft tissue usually decays before it can be buried and mineralised', ['They lived only in the air', 'They were too large to fossilise', 'They lived after rocks formed'], 'Hard parts (bones, shells, teeth) fossilise far more often.'),
    Q('C', 'R4', 'A piece of granite is weathered, the grains are deposited and become sandstone, and then sandstone becomes quartzite. Which rock types appear in order?', 'Igneous → sedimentary → metamorphic', ['Metamorphic → igneous → sedimentary', 'Sedimentary → metamorphic → igneous', 'Igneous → metamorphic → sedimentary'], 'Any rock type can change into any other in the rock cycle.'),
    Q('C', 'R2', 'A rock contains rounded pebbles cemented together. What does this suggest?', 'It is conglomerate, and the pebbles were rounded by being carried by fast-flowing water', ['It is granite that cooled slowly', 'It is marble from a mountain', 'It is basalt from a volcano'], 'Rounded fragments show erosion and transport.'),
  ];
  function rockMC(L) { return ask(ROCK_POOL, lvl(L)); }

  const ROCKS = [
    ['Granite', 'Igneous (intrusive)', 'Large interlocking crystals; cooled slowly underground'],
    ['Basalt', 'Igneous (extrusive)', 'Dark, tiny crystals; lava cooled quickly at the surface'],
    ['Pumice', 'Igneous (extrusive)', 'Full of gas holes; light enough to float'],
    ['Obsidian', 'Igneous (extrusive)', 'Black volcanic glass; cooled so fast no crystals formed'],
    ['Sandstone', 'Sedimentary', 'Sand grains cemented together; often in layers (like Sydney’s Hawkesbury sandstone)'],
    ['Shale', 'Sedimentary', 'Very fine mud or clay pressed into thin layers'],
    ['Limestone', 'Sedimentary', 'Made of shells and calcium carbonate; fizzes in acid'],
    ['Conglomerate', 'Sedimentary', 'Rounded pebbles cemented together'],
    ['Marble', 'Metamorphic', 'Formed from limestone by heat and pressure'],
    ['Slate', 'Metamorphic', 'Formed from shale; splits into flat sheets'],
    ['Quartzite', 'Metamorphic', 'Formed from sandstone; very hard'],
    ['Gneiss', 'Metamorphic', 'Banded rock formed from granite under high heat and pressure'],
  ];
  function rockIdQ(L) {
    L = lvl(L);
    const [name, type, desc] = pick(ROCKS);
    const fam = (t) => t.split(' ')[0];
    if (L === 'F') return { level: 'F', tags: ['R1', 'R2', 'R3'], stem: '', parts: [CH('', `What type of rock is ${name.toLowerCase()}?`, fam(type), ['Igneous', 'Sedimentary', 'Metamorphic'], [`${name}: ${type}. ${desc}.`])] };
    const others = ROCKS.filter(r => fam(r[1]) !== fam(type)).map(r => r[0]);
    return { level: 'S', tags: [{ Igneous: 'R1', Sedimentary: 'R2', Metamorphic: 'R3' }[fam(type)]], stem: '', parts: [
      CH('a', `A geologist describes a rock: “${desc}.” Which rock is it most likely to be?`, name, shuffle(others).slice(0, 3), [`${name}: ${type}.`]),
      CH('b', 'Which rock group does it belong to?', fam(type), ['Igneous', 'Sedimentary', 'Metamorphic'], [type + '.'])] };
  }

  // Rock strata: the law of superposition, index fossils and cross-cutting.
  function strataQ(L) {
    L = lvl(L);
    const rocks = shuffle(['Sandstone', 'Shale', 'Limestone', 'Conglomerate', 'Siltstone', 'Mudstone']).slice(0, 5);
    const fos = shuffle(['Trilobite', 'Ammonite', 'Fern (Glossopteris)', 'Fish teeth', 'Shell fragments', 'None']);
    const layers = rocks.map((r, i) => ({ id: 'ABCDE'[i], rock: r, fossil: fos[i] })); // A = top
    const rows = layers.map(l => [l.id, l.rock, l.fossil]);
    const visual = { type: 'table', head: ['Layer (top to bottom)', 'Rock', 'Fossils found'], rows, cap: 'The layers have not been overturned.' };
    const old = layers[4], young = layers[0];
    const parts = [CH(L === 'F' ? '' : 'a', 'Which layer is the oldest?', `Layer ${old.id}`, layers.map(l => `Layer ${l.id}`), ['Law of superposition: in undisturbed layers the oldest is at the bottom.', `The bottom layer is ${old.id}.`])];
    if (L !== 'F') {
      const i = ri(1, 3);
      parts.push(CH('b', `Is layer ${layers[i].id} older or younger than layer ${layers[i + 1].id}?`, 'Younger', ['Older', 'The same age', 'Impossible to tell'], [`Layer ${layers[i].id} is above layer ${layers[i + 1].id}, so it was deposited later: younger.`]));
      parts.push(CH('c', 'This kind of dating (older or younger) is called…', 'Relative dating', ['Absolute (radiometric) dating', 'Carbon counting', 'Index dating'], ['Relative dating puts events in order without giving an age in years.']));
    }
    if (L === 'C') {
      parts.push(CH('d', `A vertical band of basalt (igneous rock) cuts through layers ${layers[4].id} to ${layers[2].id} but not ${layers[1].id} or ${layers[0].id}. When did it form?`, `After layer ${layers[2].id} was deposited but before layer ${layers[1].id}`, [`Before layer ${layers[4].id}`, `After layer ${layers[0].id}`, `At the same time as layer ${layers[3].id}`], ['It must be younger than the layers it cuts and older than the layers on top of it.']));
      parts.push(CH('e', 'Which method could give the actual age of the basalt in years?', 'Radiometric (absolute) dating', ['The law of superposition', 'Index fossils in the basalt', 'Counting the layers'], ['Igneous rocks contain radioactive elements that decay at a known rate.']));
    }
    return { level: L, tags: ['R5'], stem: 'The table shows rock layers in a cliff face, listed from the top (A) to the bottom.', visual, parts };
  }
  function oldestMC() {
    const n = ri(4, 5), ids = 'PQRSTU'.slice(0, n).split(''), order = shuffle(ids); // order[0] is top
    return { level: 'F', tags: ['R5'], stem: '', parts: [CH('', `Undisturbed rock layers, from top to bottom, are: ${order.join(', ')}. Which layer is the youngest?`, order[0], ids, ['Law of superposition: youngest at the top, oldest at the bottom.'])] };
  }

  const FOSSIL_STEPS = ['The organism dies and sinks to the bottom of a lake or sea', 'It is quickly buried by sediment, which slows decay', 'Soft parts decay, leaving bones or shell', 'More layers build up and compact the sediment into rock', 'Minerals in groundwater replace or fill the bones (permineralisation)', 'Erosion or uplift exposes the fossil at the surface'];
  function fossilQ(L) {
    L = lvl(L);
    const i = ri(1, FOSSIL_STEPS.length - 2);
    const p1 = CH(L === 'F' ? '' : 'a', `Fossil formation. Step ${i}: “${FOSSIL_STEPS[i - 1]}.” What happens next?`, FOSSIL_STEPS[i], FOSSIL_STEPS.filter((_, k) => k !== i).slice(0, 5), [FOSSIL_STEPS.map((s, k) => `${k + 1}. ${s}`).join('; ')]);
    if (L === 'F') return { level: 'F', tags: ['R5'], stem: '', parts: [p1] };
    const kinds = [['Mould', 'An imprint left in rock after the remains dissolve'], ['Cast', 'A mould that has been filled in with minerals, making a copy of the shape'], ['Amber', 'An insect trapped and preserved whole in hardened tree resin'], ['Frozen', 'A woolly mammoth preserved whole in ice']];
    const [k, d] = pick(kinds);
    return { level: 'S', tags: ['R5'], stem: '', parts: [p1, CH('b', `Which kind of fossil is described: “${d}”?`, k === 'Frozen' ? 'Preserved in ice' : k === 'Amber' ? 'Preserved in amber' : k, ['Mould', 'Cast', 'Preserved in amber', 'Preserved in ice', 'Trace fossil'], [`${d}.`])] };
  }

  const rocks = finish({
    id: 'scirocks', subject: SUBJECT, title: 'Rocks, the rock cycle and fossils', chapter: 'Change · Earth', hue: 'green',
    blurb: 'Igneous, sedimentary and metamorphic rocks, the rock cycle, fossils, superposition, index fossils and dating rocks.',
    sections: [
      { code: 'R1', name: 'Igneous rocks', notes: [
        'Igneous rocks form when molten rock cools and hardens. Magma is molten rock underground; lava is molten rock at the surface.',
        'Intrusive (plutonic): magma cools slowly underground, so large crystals have time to grow, e.g. granite.',
        'Extrusive (volcanic): lava cools quickly at the surface, so crystals are tiny, e.g. basalt. Very fast cooling makes glass (obsidian); trapped gas makes pumice.',
        'Rule: slow cooling = large crystals; fast cooling = small (or no) crystals.',
      ] },
      { code: 'R2', name: 'Sedimentary rocks', notes: [
        'Weathering breaks rock into small pieces (physical: ice wedging, temperature changes; chemical: acid rain; biological: plant roots).',
        'Erosion carries the pieces away (water, wind, ice, gravity). Deposition: the sediment settles in layers, usually in water.',
        'Compaction (the weight of layers above squeezes out water) and cementation (minerals glue the grains together) turn sediment into rock.',
        'Examples: sandstone (sand; Sydney’s Hawkesbury sandstone), shale (mud and clay), conglomerate (rounded pebbles), limestone (shells and calcium carbonate; fizzes in acid), coal (plant remains).',
        'Sedimentary rocks form in layers (strata) and are where most fossils are found.',
      ] },
      { code: 'R3', name: 'Metamorphic rocks', notes: [
        'Metamorphic rocks form when existing rock is changed by great heat and/or pressure, without melting (deep underground or near magma, often where plates collide).',
        'The minerals recrystallise; the rock often becomes harder and may form bands or flat sheets.',
        'Examples: limestone → marble; shale → slate; sandstone → quartzite; granite → gneiss.',
      ] },
      { code: 'R4', name: 'The rock cycle', notes: [
        'The rock cycle shows how rocks change from one type to another over very long times. Any rock can become any other type.',
        'Melting → magma; cooling → igneous rock; weathering, erosion, deposition, compaction and cementation → sedimentary rock; heat and pressure → metamorphic rock.',
        'It is driven by energy from inside Earth (heat, plate movement) and energy from the Sun (weather and the water cycle that weather and erode rocks).',
      ] },
      { code: 'R5', name: 'Fossils and dating rocks', notes: [
        'A fossil is the preserved remains (bones, shells, teeth, wood) or traces (footprints, burrows, droppings) of an ancient organism, usually in sedimentary rock.',
        'Formation: the organism dies and is buried quickly by sediment (little oxygen, so slow decay); soft parts decay; layers build up and become rock; minerals in groundwater fill or replace the hard parts (permineralisation, or petrification); the fossil is later exposed by erosion or uplift.',
        'Other types: a mould is a hollow imprint left when remains dissolve; a cast forms when the mould fills with minerals; whole organisms can be preserved in amber (tree resin), ice or tar. Lightning Ridge in NSW is famous for opalised fossils.',
        'Law of superposition: in undisturbed layers, the oldest rocks are at the bottom and the youngest at the top. Anything that cuts across layers (a fault or igneous intrusion) is younger than the layers it cuts.',
        'Index fossils come from organisms that lived for a short time but were widespread, so they can date and match layers in different places.',
        'Relative dating puts rocks and fossils in order (older/younger). Absolute (radiometric) dating measures how much of a radioactive element has decayed at a known rate, giving an age in years. Earth is about 4.6 billion years old.',
      ] },
    ],
    cards: [
      ['Igneous rock', 'Formed when magma or lava cools and hardens.'],
      ['Intrusive igneous', 'Cooled slowly underground: large crystals, e.g. granite.'],
      ['Extrusive igneous', 'Cooled quickly at the surface: small crystals, e.g. basalt.'],
      ['Crystal size rule', 'Slow cooling = large crystals; fast cooling = small crystals.'],
      ['Sedimentary rock', 'Formed from layers of sediment that are compacted and cemented.'],
      ['Weathering', 'Breaking rock down into smaller pieces in place.'],
      ['Erosion', 'Carrying weathered pieces away (water, wind, ice, gravity).'],
      ['Deposition', 'Sediment settling in layers.'],
      ['Compaction and cementation', 'Layers squeezed together and glued by minerals into rock.'],
      ['Sedimentary examples', 'Sandstone, shale, limestone, conglomerate, coal.'],
      ['Metamorphic rock', 'Existing rock changed by heat and pressure without melting.'],
      ['Metamorphic pairs', 'Limestone → marble; shale → slate; sandstone → quartzite; granite → gneiss.'],
      ['Rock cycle drivers', 'Earth’s internal heat and the Sun’s energy.'],
      ['Fossil', 'Preserved remains or traces of an ancient organism.'],
      ['Permineralisation', 'Minerals from groundwater fill or replace buried bones/wood.'],
      ['Mould and cast', 'Mould: hollow imprint. Cast: mould filled with minerals.'],
      ['Trace fossil', 'Evidence of activity: footprints, burrows, droppings.'],
      ['Law of superposition', 'In undisturbed layers, oldest at the bottom, youngest at the top.'],
      ['Index fossil', 'Lived for a short time but widespread; used to date layers.'],
      ['Relative dating', 'Puts rocks in order: older or younger.'],
      ['Absolute (radiometric) dating', 'Uses radioactive decay at a known rate to give an age in years.'],
      ['Age of the Earth', 'About 4.6 billion years.'],
    ],
    concepts: [
      ['Which rock has the largest crystals?', ['Granite', 'Basalt', 'Obsidian', 'Pumice'], 0, 'Cooled slowly underground.'],
      ['Which process turns loose sediment into sedimentary rock?', ['Compaction and cementation', 'Melting', 'Weathering', 'Erosion'], 0, ''],
      ['Which rock type forms from heat and pressure without melting?', ['Metamorphic', 'Igneous', 'Sedimentary', 'Volcanic'], 0, ''],
      ['Shale changes into which metamorphic rock?', ['Slate', 'Marble', 'Granite', 'Quartzite'], 0, ''],
      ['Which rock type is most likely to contain fossils?', ['Sedimentary', 'Igneous', 'Metamorphic', 'All equally'], 0, ''],
      ['The law of superposition helps scientists…', ['Work out the relative age of rock layers', 'Find the exact age of rocks', 'Predict earthquakes', 'Measure crystal size'], 0, ''],
      ['Which would make the best index fossil?', ['A species that lived for a short time all over the world', 'A species that lived for a very long time', 'A species found in only one cave', 'A species alive today'], 0, ''],
      ['A dinosaur footprint in rock is a…', ['Trace fossil', 'Cast', 'Index fossil', 'Mineral'], 0, ''],
      ['Which gives the age of a rock in years?', ['Radiometric dating', 'Superposition', 'Index fossils', 'Relative dating'], 0, ''],
      ['Rapid burial helps fossils form because it…', ['Protects remains from scavengers and slows decay', 'Heats them up', 'Adds oxygen', 'Melts them'], 0, ''],
      ['Which is the correct link in the rock cycle?', ['Igneous rock → weathering → sediment', 'Sediment → melting → sedimentary rock', 'Magma → compaction → metamorphic rock', 'Metamorphic rock → cementation → magma'], 0, ''],
      ['Which energy source drives weathering and erosion?', ['The Sun', 'Earth’s core only', 'Nuclear power stations', 'The Moon'], 0, 'The Sun drives weather and the water cycle.'],
    ],
    short: [
      { q: 'Explain how sedimentary rock forms. Name one example.', marks: 4, tags: ['R2'], criteria: ['Weathering breaks rock into small pieces (sediment)', 'Erosion transports the sediment and it is deposited in layers (usually in water)', 'Compaction (weight of layers) and cementation (minerals glue grains) turn sediment into rock', 'A correct example, e.g. sandstone, shale, limestone, conglomerate'], model: 'Rocks at the surface are weathered into small pieces by water, wind, ice and temperature changes. These sediments are eroded (carried away) by rivers, wind or ice and deposited in layers, often at the bottom of lakes or the sea. Over time the weight of new layers compacts the sediment and dissolved minerals cement the grains together, forming sedimentary rock such as sandstone.' },
      { q: 'Granite and basalt are both igneous rocks, but granite has large crystals and basalt has small crystals. Explain why.', marks: 3, tags: ['R1'], criteria: ['Granite is intrusive: magma cooled slowly deep underground', 'Basalt is extrusive: lava cooled quickly at the surface', 'Slow cooling gives crystals time to grow large; fast cooling leaves little time, so crystals are small'], model: 'Granite is an intrusive igneous rock that formed when magma cooled slowly, deep underground. Basalt is an extrusive igneous rock that formed when lava cooled quickly at the surface. Slow cooling gives the crystals a long time to grow, so granite has large crystals, while fast cooling gives little time, so basalt has small crystals.' },
      { q: 'Describe how a bone could become a fossil.', marks: 4, tags: ['R5'], criteria: ['The animal dies and is quickly buried by sediment (protects it, slows decay)', 'Soft parts decay, leaving hard parts such as bone', 'Layers build up and the sediment becomes rock', 'Minerals from groundwater fill or replace the bone (permineralisation), making a fossil that may later be exposed by erosion'], model: 'An animal dies and its body is quickly buried by mud or sand, for example at the bottom of a lake, which protects it from scavengers and slows decay. The soft parts rot away, leaving the bones. More layers of sediment build up and are compacted into rock. Groundwater carrying dissolved minerals seeps through the bone, and the minerals fill the spaces and replace the bone material, turning it to stone. Millions of years later, erosion may expose the fossil.' },
      { q: 'Explain how the law of superposition and index fossils help scientists work out the age of rock layers.', marks: 4, tags: ['R5'], criteria: ['Superposition: in undisturbed layers the oldest is at the bottom and the youngest at the top', 'This gives a relative age (order) of layers, not an age in years', 'Index fossils come from organisms that lived for a short time and were widespread', 'Finding the same index fossil lets scientists match layers of the same age in different places / date the layer'], model: 'The law of superposition states that in undisturbed rock, the oldest layers are at the bottom and the youngest are at the top, so scientists can put layers in order of age. This is relative dating, as it does not give an age in years. Index fossils are fossils of organisms that lived for a short time but were widespread, so if the same index fossil is found in layers in different places, those layers are the same age, and the known age of the organism dates the layer.' },
      { q: 'Using the rock cycle, describe how a granite mountain could eventually become a metamorphic rock.', marks: 3, tags: ['R4', 'R3'], criteria: ['Granite is weathered and eroded into sediment that is deposited', 'Sediment is compacted and cemented into sedimentary rock (e.g. sandstone)', 'Buried deep, heat and pressure change it without melting into metamorphic rock (e.g. quartzite)'], model: 'The granite is weathered and eroded into sand, which rivers carry away and deposit in layers. The layers are compacted and cemented into sandstone, a sedimentary rock. If the sandstone is buried deep underground, for example where plates collide, heat and pressure change it without melting into quartzite, a metamorphic rock.' },
      { q: 'Distinguish between relative dating and absolute dating of rocks.', marks: 2, tags: ['R5'], criteria: ['Relative dating puts rocks/fossils in order (older or younger), e.g. using superposition or index fossils', 'Absolute (radiometric) dating gives the actual age in years by measuring radioactive decay at a known rate'], model: 'Relative dating only tells us whether a rock or fossil is older or younger than another, for example using the law of superposition. Absolute (radiometric) dating gives the actual age in years by measuring how much of a radioactive element in the rock has decayed, because it decays at a known rate.' },
    ],
    bank: [rockMC, rockIdQ, strataQ, fossilQ, oldestMC],
  });

  /* =====================================================================
     DECK 5: WORKING SCIENTIFICALLY AND DATA (Data Science 1)
     ===================================================================== */
  // Investigations used for data questions. f(x) is the "true" relationship; results are made from it with noise.
  const INVESTIGATIONS = [
    { id: 'sugar', aim: 'how the temperature of water affects the time taken for a sugar cube to dissolve', iv: 'Temperature of the water', ivU: '°C', dv: 'Time to dissolve', dvU: 's', xs: [20, 30, 40, 50, 60, 70], f: (x) => 150 - 1.8 * x, dp: 0,
      trend: 'As the temperature of the water increases, the time taken for the sugar to dissolve decreases', ctrl: ['Mass (size) of the sugar cube', 'Volume of water', 'Whether or how much the water is stirred'], notCtrl: ['Temperature of the water', 'Time to dissolve'],
      hyp: 'If the temperature of the water increases, then the sugar will dissolve faster, because the water particles move faster and collide with the sugar more often', why: 'water particles have more kinetic energy and move faster, so they break the sugar apart more quickly' },
    { id: 'ramp', aim: 'how the height of a ramp affects how far a toy car rolls along the floor', iv: 'Height of the ramp', ivU: 'cm', dv: 'Distance travelled', dvU: 'cm', xs: [10, 20, 30, 40, 50, 60], f: (x) => 4 * x + 12, dp: 0,
      trend: 'As the height of the ramp increases, the distance the car travels increases', ctrl: ['The same toy car', 'The same floor surface', 'Releasing the car from rest without pushing'], notCtrl: ['Height of the ramp', 'Distance travelled'],
      hyp: 'If the ramp is higher, then the car will travel further, because it has more gravitational potential energy to turn into kinetic energy', why: 'a higher start gives more gravitational potential energy, which becomes more kinetic energy' },
    { id: 'band', aim: 'how far a rubber band is stretched affects how far it flies', iv: 'Stretch of the rubber band', ivU: 'cm', dv: 'Distance flown', dvU: 'cm', xs: [2, 4, 6, 8, 10, 12], f: (x) => 42 * x + 10, dp: 0,
      trend: 'As the stretch of the rubber band increases, the distance it flies increases', ctrl: ['The same rubber band', 'The same launch angle', 'The same launch height'], notCtrl: ['Stretch of the rubber band', 'Distance flown'],
      hyp: 'If the rubber band is stretched further, then it will fly further, because it stores more elastic potential energy', why: 'more stretch stores more elastic potential energy, which becomes kinetic energy' },
    { id: 'insul', aim: 'how the thickness of wool insulation around a cup affects how much hot water cools in 10 minutes', iv: 'Thickness of insulation', ivU: 'mm', dv: 'Temperature drop in 10 minutes', dvU: '°C', xs: [0, 5, 10, 15, 20, 25], f: (x) => 32 - 0.8 * x, dp: 1,
      trend: 'As the thickness of the insulation increases, the temperature drop decreases (the water stays hotter)', ctrl: ['Starting temperature of the water', 'Volume of water', 'Type of cup'], notCtrl: ['Thickness of insulation', 'Temperature drop in 10 minutes'],
      hyp: 'If the insulation is thicker, then the water will lose less heat, because the trapped air reduces conduction and convection', why: 'thicker insulation traps more air, which slows conduction and convection' },
  ];
  // Results with three trials and one outlier (in a middle row).
  function makeResults(inv) {
    const r = (v) => rnd(v, inv.dp), oRow = ri(1, inv.xs.length - 2), oTrial = ri(0, 2), up = Math.random() < 0.5;
    const rows = inv.xs.map((x, i) => {
      const base = inv.f(x), tr = [0, 1, 2].map(() => r(base * (1 + (Math.random() - 0.5) * 0.06)));
      if (i === oRow) tr[oTrial] = r(base * (up ? 1.45 : 0.6));
      const good = i === oRow ? tr.filter((_, k) => k !== oTrial) : tr;
      return { x, tr, avg: rnd(good.reduce((a, b) => a + b, 0) / good.length, 1) };
    });
    return { rows, oRow, oTrial };
  }
  const resultsTable = (inv, res, hideAvg) => ({ type: 'table', head: [`${inv.iv} (${inv.ivU})`, `Trial 1 (${inv.dvU})`, `Trial 2 (${inv.dvU})`, `Trial 3 (${inv.dvU})`, `Average (${inv.dvU})`], rows: res.rows.map((r, i) => [String(r.x), ...r.tr.map(String), hideAvg && i === res.oRow ? '?' : String(r.avg)]), cap: `${inv.dv} for each ${inv.iv.toLowerCase()}` });
  const predict = (inv, res) => {
    const i = ri(1, res.rows.length - 2), xm = (res.rows[i].x + res.rows[i + 1].x) / 2, v = Math.round(inv.f(xm));
    return CH('', `Predict the ${inv.dv.toLowerCase()} for ${xm} ${inv.ivU}.`, `About ${v} ${inv.dvU}`, [Math.round(v * 1.5), Math.round(v * 0.55), Math.round(inv.f(res.rows[res.rows.length - 1].x)) + 1].map(n => `About ${n} ${inv.dvU}`), [`${xm} ${inv.ivU} is halfway between ${res.rows[i].x} and ${res.rows[i + 1].x} ${inv.ivU}, so read halfway between their averages (${res.rows[i].avg} and ${res.rows[i + 1].avg}): interpolation.`]);
  };
  const outlierPart = (inv, res, label) => {
    const o = res.rows[res.oRow], val = o.tr[res.oTrial];
    const opts = [`${o.x} ${inv.ivU}, trial ${res.oTrial + 1} (${val} ${inv.dvU})`];
    for (let k = 0; k < 6 && opts.length < 4; k++) { const rr = res.rows[ri(0, res.rows.length - 1)], t = ri(0, 2); if (rr === o && t === res.oTrial) continue; const s = `${rr.x} ${inv.ivU}, trial ${t + 1} (${rr.tr[t]} ${inv.dvU})`; if (!opts.includes(s)) opts.push(s); }
    return CH(label, 'Which result is an outlier (does not fit the pattern)?', opts[0], opts.slice(1), [`At ${o.x} ${inv.ivU} the other trials are ${o.tr.filter((_, k) => k !== res.oTrial).join(' and ')} ${inv.dvU}; ${val} ${inv.dvU} is very different.`]);
  };
  const GRAPH_RIGHT = 'A line graph (or scatter graph with a line of best fit), because both variables are numerical and continuous';
  const GRAPH_WRONG = ['A bar graph, because the independent variable is a category', 'A pie chart, because the data are parts of a whole', 'A table is enough; no graph is needed'];

  // Multi-part results-table question (all auto-marked). Used in the deck's question bank.
  function resultsQ(L) {
    L = lvl(L);
    const inv = pick(INVESTIGATIONS), res = makeResults(inv), o = res.rows[res.oRow];
    const stem = `A student investigated ${inv.aim}. The results are in the table.`;
    const pIV = CH('a', 'What is the independent variable?', inv.iv, [inv.dv, inv.ctrl[0], 'The number of trials'], ['The independent variable is the one the student changes on purpose.']);
    if (L === 'F') return { level: 'F', tags: ['W2', 'W4'], stem, visual: resultsTable(inv, res), parts: [pIV, CH('b', 'What is the dependent variable?', inv.dv, [inv.iv, inv.ctrl[1], 'The temperature of the room'], ['The dependent variable is what is measured.'])] };
    const avg = o.avg;
    const parts = [pIV, outlierPart(inv, res, 'b'),
      num('c', `Calculate the average for ${o.x} ${inv.ivU}, leaving out the outlier (to 1 decimal place).`, avg, [`Leave out ${o.tr[res.oTrial]}.`, `(${o.tr.filter((_, k) => k !== res.oTrial).join(' + ')}) ÷ 2 = ${avg}`], { round: 1 }),
      { ...predict(inv, res), label: 'd' }];
    if (L === 'C') parts.push(CH('e', 'Which graph should the student draw?', GRAPH_RIGHT, GRAPH_WRONG, ['Continuous numerical IV and DV: line graph or scatter graph with a line of best fit. IV on the x-axis.']), CH('f', 'Which conclusion is best supported?', inv.trend + '.', [inv.trend.replace('increases', 'XX').replace('decreases', 'increases').replace('XX', 'decreases') + '.', 'There is no relationship between the variables.', `The ${inv.dv.toLowerCase()} stays the same.`].filter(w => w !== inv.trend + '.'), ['Describe the trend: “As X increases, Y …”.']));
    return { level: L, tags: ['W4', 'W5'], stem, visual: resultsTable(inv, res, L !== 'F'), parts };
  }

  // Graph-reading question with a line of best fit.
  function trendQ(L) {
    L = lvl(L);
    const inv = pick(INVESTIGATIONS), res = makeResults(inv);
    const pts = res.rows.map(r => [r.x, r.avg]), x0 = inv.xs[0], x1 = inv.xs[inv.xs.length - 1];
    const visual = { type: 'xy', pts, xl: `${inv.iv} (${inv.ivU})`, yl: `${inv.dv} (${inv.dvU})`, fit: [[x0, rnd(inv.f(x0), 1)], [x1, rnd(inv.f(x1), 1)]], title: `${inv.dv} vs ${inv.iv.toLowerCase()}`, cap: 'Crosses are average results; the dashed line is the line of best fit.' };
    const rising = inv.f(x1) > inv.f(x0);
    const p1 = CH(L === 'F' ? '' : 'a', 'Which statement describes the trend in the graph?', inv.trend, [rising ? `As the ${inv.iv.toLowerCase()} increases, the ${inv.dv.toLowerCase()} decreases` : `As the ${inv.iv.toLowerCase()} increases, the ${inv.dv.toLowerCase()} increases`, `The ${inv.dv.toLowerCase()} does not change`, 'There is no pattern'], ['Follow the line of best fit from left to right.']);
    if (L === 'F') return { level: 'F', tags: ['W5'], stem: `A student investigated ${inv.aim}.`, visual, parts: [p1] };
    const parts = [p1, { ...predict(inv, res), label: 'b' },
      CH('c', 'Where should a line of best fit be drawn?', 'Through the middle of the points, with about as many above as below', ['Joining every point dot-to-dot', 'Through the first and last points only', 'Above all the points'], ['A line of best fit shows the overall trend.'])];
    if (L === 'C') {
      const xe = x1 + (inv.xs[1] - inv.xs[0]) * 2;
      parts.push(CH('d', `Predicting the result for ${xe} ${inv.ivU} (outside the tested range) is called extrapolation. Why is it less reliable than interpolation?`, 'The pattern may not continue beyond the range that was tested', ['There are no data points inside the range', 'Extrapolation always gives zero', 'Graphs cannot be extended'], ['Within the range = interpolation (more reliable). Beyond the range = extrapolation (the relationship might change).']));
    }
    return { level: L, tags: ['W5', 'W6'], stem: `A student investigated ${inv.aim}.`, visual, parts };
  }

  const SCENARIOS = [
    ['Students test whether the mass of a paper plane affects how far it flies.', 'Mass of the paper plane', 'Distance the plane flies', 'The person throwing it and the throwing force'],
    ['A class tests how the amount of fertiliser affects the height of bean plants after 3 weeks.', 'Amount of fertiliser', 'Height of the bean plants', 'Type of plant, water given and amount of light'],
    ['A student measures how the length of a pendulum affects the time for 10 swings.', 'Length of the pendulum', 'Time for 10 swings', 'Mass of the bob and the starting angle'],
    ['A group tests how the concentration of acid affects how fast a magnesium strip fizzes away.', 'Concentration of acid', 'Time for the magnesium to disappear', 'Length of magnesium and volume of acid'],
    ['Students test how the surface a ball is dropped onto affects how high it bounces.', 'Type of surface', 'Bounce height', 'The ball used and the drop height'],
    ['A student tests how the number of coils in an electromagnet affects how many paper clips it picks up.', 'Number of coils', 'Number of paper clips picked up', 'Battery voltage and type of nail'],
  ];
  function variablesQ(L) {
    L = lvl(L);
    const [sc, iv, dv, cv] = pick(SCENARIOS), others = SCENARIOS.filter(s => s[0] !== sc);
    const parts = [CH(L === 'F' ? '' : 'a', 'What is the independent variable?', iv, [dv, cv, others[0][1]], ['Independent = the variable you change on purpose.'])];
    if (L === 'F') return { level: 'F', tags: ['W2'], stem: sc, parts };
    parts.push(CH('b', 'What is the dependent variable?', dv, [iv, cv, others[1][2]], ['Dependent = the variable you measure.']),
      CH('c', 'Which should be kept the same (controlled)?', cv, [iv, dv, 'Nothing; it is a fair test anyway'], ['Controlled variables are kept the same so only the independent variable affects the results: a fair test.']));
    if (L === 'C') parts.push(CH('d', 'Why should each test be repeated at least three times and averaged?', 'To make the results more reliable and reduce the effect of random errors', ['To make the experiment longer', 'To change the independent variable', 'Because the first result is always wrong'], ['Repeating shows whether results are consistent and lets you spot outliers.']));
    return { level: L, tags: ['W2', 'W3'], stem: sc, parts };
  }

  const GRAPHS = [
    ['The number of students in Year 8 who prefer each sport (soccer, netball, swimming, basketball).', 'Bar graph (column graph)', 'The sports are categories, not numbers.'],
    ['The temperature of a cup of tea measured every minute for 20 minutes.', 'Line graph', 'Shows how something changes over time; both variables are continuous.'],
    ['The percentage of each gas in the air (nitrogen 78%, oxygen 21%, other 1%).', 'Pie chart', 'Parts of a whole adding to 100%.'],
    ['The height and arm span of 30 students, to see if they are related.', 'Scatter graph with a line of best fit', 'Looks for a relationship between two numerical variables.'],
    ['The average rainfall for each month at a weather station.', 'Bar graph (column graph)', 'Months are separate categories; rainfall totals are shown as columns.'],
    ['The distance a toy car travels for different ramp heights (5 heights, 3 trials each).', 'Scatter graph with a line of best fit', 'Two numerical variables in an experiment: plot the averages and draw a line of best fit.'],
  ];
  function graphChoiceQ(L) {
    const [data, ans, why] = pick(GRAPHS);
    return { level: 'F', tags: ['W4'], stem: '', parts: [CH('', `Which type of graph is best for this data? ${data}`, ans, ['Bar graph (column graph)', 'Line graph', 'Pie chart', 'Scatter graph with a line of best fit'], [why])] };
  }
  function measureQ(L) {
    L = lvl(L);
    const v = ri(12, 88), parts = [CH(L === 'F' ? '' : 'a', `Water in a measuring cylinder curves up at the edges. The bottom of the curve is level with the ${v} mL mark and the edges reach ${v + 1} mL. What is the volume?`, `${v} mL`, [`${v + 1} mL`, `${v + 0.5} mL`, `${v - 1} mL`], ['Read the bottom of the meniscus, with your eye level with it.'])];
    if (L === 'F') return { level: 'F', tags: ['W3'], stem: '', parts };
    parts.push(CH('b', 'Why should your eye be level with the meniscus?', 'To avoid parallax error from reading at an angle', ['To make the water level rise', 'Because the scale is printed upside down', 'To keep the cylinder warm'], ['Looking from above or below makes the reading too high or too low.']));
    const eq = pick([['the mass of a sample', 'Electronic balance (g)'], ['the time for a reaction', 'Stopwatch (s)'], ['the temperature of water', 'Thermometer or temperature probe (°C)'], ['the volume of a liquid', 'Measuring cylinder (mL)'], ['the length of a spring', 'Ruler (cm)']]);
    parts.push(CH('c', `Which equipment should be used to measure ${eq[0]}?`, eq[1], ['Electronic balance (g)', 'Stopwatch (s)', 'Thermometer or temperature probe (°C)', 'Measuring cylinder (mL)', 'Ruler (cm)'], [eq[1] + '.']));
    if (L === 'C') parts.push(CH('d', 'A balance reads 0.4 g with nothing on it, and the student does not zero it. What kind of error affects all the results?', 'A systematic error, which makes every reading 0.4 g too high', ['A random error that averaging will remove', 'A parallax error', 'No error, because the balance is digital'], ['Systematic errors shift every result the same way and affect accuracy; zero (tare) the balance first.']));
    return { level: L, tags: ['W3'], stem: '', parts };
  }

  const WS_POOL = [
    Q('F', 'W1', 'Which is a testable scientific question?', 'How does the temperature of water affect how fast sugar dissolves?', ['Is chemistry more interesting than physics?', 'What is the best colour?', 'Why is my dog the cutest?'], 'A testable question has a variable you can change and one you can measure.'),
    Q('F', 'W1', 'A hypothesis is…', 'A testable prediction with a reason, e.g. “If… then… because…”', ['The results of an experiment', 'A list of equipment', 'A final conclusion'], ''),
    Q('F', 'W2', 'The variable you change on purpose is the…', 'Independent variable', ['Dependent variable', 'Controlled variable', 'Outlier'], ''),
    Q('F', 'W2', 'In a fair test…', 'Only one variable is changed and all others are kept the same', ['Every variable is changed', 'The test is done once', 'The results are guessed'], ''),
    Q('F', 'W3', 'Before lighting a Bunsen burner you should…', 'Put on safety glasses, tie back long hair and close the air hole', ['Open the air hole fully and turn the gas on high', 'Light it on the bench without a heatproof mat', 'Lean over it to look at the flame'], 'Light it with the air hole closed (yellow safety flame).'),
    Q('F', 'W3', 'The yellow Bunsen burner flame is used as…', 'The safety flame, because it is easy to see', ['The hottest heating flame', 'A flame for cooking food', 'A test for oxygen'], 'Open the air hole for the blue heating flame.'),
    Q('F', 'W4', 'In a results table, units should be written…', 'In the column headings, e.g. Time (s)', ['After every number', 'Nowhere', 'Only in the title'], ''),
    Q('F', 'W4', 'On a graph, the independent variable goes on the…', 'x-axis (horizontal)', ['y-axis (vertical)', 'Title', 'Key'], 'IV on x, DV on y.'),
    Q('F', 'W5', 'A result that does not fit the pattern is called…', 'An outlier (anomaly)', ['An average', 'A controlled variable', 'A hypothesis'], ''),
    Q('S', 'W3', 'Results that are very close to the true value are…', 'Accurate', ['Precise', 'Reliable', 'Valid'], 'Precise = close to each other. Accurate = close to the true value.'),
    Q('S', 'W3', 'Three readings are 20.1, 20.2 and 20.1 s, but the true value is 25 s. The readings are…', 'Precise but not accurate', ['Accurate but not precise', 'Both accurate and precise', 'Neither, because there are only three'], 'They agree with each other but are far from the true value.'),
    Q('S', 'W3', 'An experiment is valid when…', 'It actually tests what it claims to, as a fair test with controlled variables', ['It is repeated many times', 'It uses expensive equipment', 'The results support the hypothesis'], 'Repeating makes results reliable; fair testing makes the experiment valid.'),
    Q('S', 'W3', 'Repeating an experiment and getting similar results shows the results are…', 'Reliable', ['Accurate', 'Valid', 'Biased'], ''),
    Q('S', 'W2', 'A control in an experiment is…', 'A set-up without the independent variable change, used for comparison', ['A variable that is changed', 'The person in charge', 'The result you expect'], 'e.g. a plant given no fertiliser.'),
    Q('S', 'W4', 'Which graph scale is correct?', 'Even steps that use more than half of the grid', ['Steps that change size along the axis', 'A scale that squeezes the data into a corner', 'No numbers on the axis'], ''),
    Q('S', 'W5', 'Which is the best way to describe a trend?', '“As the temperature increases, the dissolving time decreases.”', ['“The graph goes down.”', '“It changes.”', '“The results are good.”'], 'Name both variables and the direction.'),
    Q('S', 'W5', 'A good conclusion should…', 'Answer the aim, say whether the hypothesis was supported, and refer to the data', ['List the equipment', 'Repeat the method', 'Only say if the experiment was fun'], ''),
    Q('S', 'W6', 'Scientists use models to…', 'Explain and predict things that are too big, small, fast or slow to study directly', ['Prove theories are always true', 'Avoid collecting data', 'Make experiments unnecessary'], 'e.g. the particle model, plate tectonics maps, weather models.'),
    Q('C', 'W6', 'Earthquake hazard maps are made from data about past earthquakes. What is a limitation of this model?', 'It shows the likelihood of earthquakes but cannot predict exactly when or where the next one will happen', ['It is always exactly right', 'It uses no data', 'It shows the weather instead'], 'Models simplify reality and are only as good as their data.'),
    Q('C', 'W5', 'One trial is much higher than the other two. What should the student do?', 'Check or repeat that trial, and leave the outlier out of the average if it is a mistake', ['Delete all the results', 'Include it and ignore the others', 'Change the hypothesis to fit it'], ''),
    Q('C', 'W2', 'Two students test sugar dissolving at different temperatures, but one stirs and one does not. Why is this a problem?', 'Stirring is an uncontrolled variable, so the test is not fair (not valid)', ['It makes the results more accurate', 'It changes the dependent variable to temperature', 'There is no problem'], ''),
    Q('C', 'W7', 'A design for an egg-drop protector fails the first test. Which is the best next step in the problem-solving process?', 'Evaluate why it failed, change one thing, and test again', ['Give up', 'Change everything at once', 'Report that it worked'], 'Define → plan → build → test → evaluate → improve.'),
  ];
  function wsMC(L) { return ask(WS_POOL, lvl(L)); }

  // ---------- written-response data task for the practice exam (auto-marked parts + short answers) ----------
  function dataTask() {
    const inv = pick(INVESTIGATIONS), res = makeResults(inv), o = res.rows[res.oRow], first = res.rows[0], last = res.rows[res.rows.length - 1];
    const otherAvg = o.avg, ctrlWrong = inv.notCtrl.concat(['The number of trials']);
    return {
      level: 'C', tags: ['W2', 'W4', 'W5'],
      stem: `Data analysis. A student investigated ${inv.aim}. Hypothesis: “${inv.hyp}.” The results are shown in the table (the average for ${o.x} ${inv.ivU} is missing).`,
      visual: resultsTable(inv, res, true),
      parts: [
        CH('a', 'What is the independent variable?', inv.iv, [inv.dv, inv.ctrl[0], 'The number of trials']),
        CH('b', 'Which of these is a controlled variable?', inv.ctrl[0], ctrlWrong),
        outlierPart(inv, res, 'c'),
        num('d', `Calculate the missing average for ${o.x} ${inv.ivU}, leaving out the outlier (to 1 decimal place).`, otherAvg, [`(${o.tr.filter((_, k) => k !== res.oTrial).join(' + ')}) ÷ 2 = ${otherAvg}`], { round: 1 }),
        CH('e', 'Which type of graph should the student use to show these results?', GRAPH_RIGHT, GRAPH_WRONG),
        SA('f', 'Describe the trend shown by the results. Use data from the table.', 2, [`States the direction of the trend: ${inv.trend.toLowerCase()}`, `Quotes data, e.g. the average at ${first.x} ${inv.ivU} is ${first.avg} ${inv.dvU} and at ${last.x} ${inv.ivU} it is ${last.avg} ${inv.dvU}`], `${inv.trend}. For example, at ${first.x} ${inv.ivU} the average ${inv.dv.toLowerCase()} was ${first.avg} ${inv.dvU}, but at ${last.x} ${inv.ivU} it was ${last.avg} ${inv.dvU}.`),
        { ...predict(inv, res), label: 'g' },
        SA('h', 'Do the results support the hypothesis? Suggest a possible cause of the outlier and one way to improve the reliability of the investigation.', 3, ['Says the hypothesis is supported, linking it to the trend in the data', `Gives a plausible cause of the outlier, e.g. a measuring or timing mistake, misreading the scale, or a controlled variable (such as ${inv.ctrl[0].toLowerCase()}) not kept the same`, 'Gives a valid improvement to reliability, e.g. more repeat trials and averaging, or repeating the outlier trial'], `Yes, the results support the hypothesis: ${inv.trend.toLowerCase()}, as predicted, because ${inv.why}. The outlier (trial ${res.oTrial + 1} at ${o.x} ${inv.ivU}) may have been caused by a timing or reading mistake, or by ${inv.ctrl[0].toLowerCase()} not being kept the same. Doing more trials at each value and averaging them, and repeating any result that does not fit, would make the results more reliable.`),
      ],
    };
  }

  // Investigation design questions (6 marks each), one criterion per mark.
  const designQ = (topic, iv, dv, how, ctrl, hyp, safety, tags) => ({
    q: `Design an investigation to test ${topic}. Include a hypothesis, the variables, how you will measure the results, how you will make the results reliable, and one safety precaution.`,
    marks: 6, tags, design: true,
    criteria: [`A testable hypothesis in “If… then… because…” form, e.g. ${hyp}`, `Identifies the independent variable (${iv}) and how it will be changed (at least 3 to 5 values)`, `Identifies the dependent variable (${dv}) and how it will be measured: ${how}`, `Names at least two controlled variables, e.g. ${ctrl}`, 'Repeats each test at least three times and calculates an average (reliability)', `A relevant safety precaution, e.g. ${safety}`],
    model: `Hypothesis: ${hyp}. Independent variable: ${iv}, tested at five different values. Dependent variable: ${dv}, measured ${how}. Controlled variables: ${ctrl}, which are kept the same so it is a fair test. Each value is tested three times and the average is calculated to make the results reliable, and any outliers are repeated. Safety: ${safety}. The results are recorded in a table with units in the headings and graphed with the independent variable on the x-axis.`,
  });
  const DESIGN = [
    designQ('how the temperature of water affects the time taken for sugar to dissolve', 'water temperature', 'time for the sugar to dissolve', 'with a stopwatch (s), using a thermometer to check the temperature (°C)', 'the mass of sugar, the volume of water and the amount of stirring', 'if the water temperature increases, then the sugar will dissolve faster, because the particles move faster', 'handle hot water with care, using a heatproof mat and safety glasses', ['W1', 'W2', 'W3']),
    designQ('which material is the best insulator for keeping a cup of hot water warm', 'the type of insulating material wrapped around the cup', 'the temperature drop of the water after 10 minutes', 'with a thermometer or temperature probe (°C) at the start and after 10 minutes', 'the starting temperature of the water, the volume of water, the thickness of material and the type of cup', 'if the cup is wrapped in wool, then the water will cool the least, because wool traps air which slows conduction and convection', 'use warm, not boiling, water and wipe up spills', ['W1', 'W2', 'W3']),
    designQ('how the height of a ramp affects the distance a toy car travels', 'the height of the ramp', 'the distance the car rolls along the floor', 'with a tape measure or metre ruler (cm) from the bottom of the ramp', 'the same car, the same floor surface and releasing the car from rest without pushing', 'if the ramp is higher, then the car will travel further, because it has more gravitational potential energy to turn into kinetic energy', 'keep the area clear so no one trips over the ramp or car', ['W1', 'W2', 'W3']),
    designQ('how the amount of baking soda affects the temperature change when it reacts with vinegar', 'the mass of baking soda', 'the change in temperature of the mixture', 'with a thermometer (°C) before and after the reaction, using a balance (g) to measure the baking soda', 'the volume and type of vinegar, the starting temperature and the container', 'if more baking soda is added, then the temperature will drop more, because the endothermic reaction absorbs more energy', 'wear safety glasses as the mixture can fizz and splash', ['W1', 'W2', 'W3']),
  ];

  const ws = finish({
    id: 'scidata', subject: SUBJECT, title: 'Working scientifically and data', chapter: 'Data Science 1', hue: 'cyan',
    blurb: 'Questions and hypotheses, variables and fair tests, accuracy and reliability, equipment and safety, tables and graphs, trends, outliers, predictions and conclusions.',
    sections: [
      { code: 'W1', name: 'Questioning and predicting', notes: [
        'A testable question links something you can change to something you can measure: “How does the temperature of water affect the time taken for sugar to dissolve?”',
        'A hypothesis is a testable prediction with a reason: “If… then… because…”. e.g. If the water temperature increases, then the sugar will dissolve faster, because the particles move faster and collide more often.',
        'The aim says what you are trying to find out: “To investigate how… affects…”.',
      ] },
      { code: 'W2', name: 'Planning a fair investigation: variables', notes: [
        'Independent variable (IV): the one thing you change on purpose (temperature of the water).',
        'Dependent variable (DV): what you measure to see the effect (time to dissolve).',
        'Controlled variables: everything else kept the same (mass of sugar, volume of water, stirring) so it is a fair test.',
        'A control (control group) is a set-up for comparison where the IV is not applied, e.g. a plant with no fertiliser.',
        'Teacher’s example: sugar dissolving. IV = water temperature; DV = time to dissolve; controlled = same sugar, same volume of water, same stirring.',
      ] },
      { code: 'W3', name: 'Conducting: equipment, accuracy, reliability, validity, safety', notes: [
        'Equipment: measuring cylinder (mL, read the bottom of the meniscus with your eye level to avoid parallax error); thermometer or temperature probe (°C); electronic balance (g, zero/tare it first); stopwatch (s); ruler or tape measure (cm, m); data loggers record automatically.',
        'Accuracy: how close a measurement is to the true value. Precision: how close repeated measurements are to each other.',
        'Reliability: getting consistent results when the experiment is repeated. Improve it by doing at least three trials and averaging.',
        'Validity: the experiment fairly tests what it claims to (only the IV changes; all other variables controlled).',
        'Errors: random errors (unpredictable, e.g. reaction time) are reduced by repeats and averages; systematic errors (the same every time, e.g. an un-zeroed balance) affect accuracy.',
        'Risk assessment: identify each hazard, the risk and how to reduce it. Bunsen burner: safety glasses, tie back hair, heatproof mat, light with the air hole closed (yellow safety flame), open it for the blue heating flame, never leave it unattended.',
      ] },
      { code: 'W4', name: 'Processing data: tables and graphs', notes: [
        'Results table: IV in the first column, then the trials and the average; units in the headings, not after each number.',
        'Average (mean) = sum of the trials ÷ number of trials (leave out any outlier).',
        'Choosing a graph: line graph for continuous data and changes over time; scatter graph with a line of best fit for the relationship between two numerical variables; bar (column) graph when the IV is a category; pie chart for parts of a whole (percentages).',
        'Drawing a graph: a title (“The effect of IV on DV”); IV on the x-axis and DV on the y-axis; axis labels with units; an even scale that uses more than half the grid; plot points neatly (small crosses).',
        'A line of best fit is a smooth straight line or curve through the middle of the points (about as many above as below), not dot-to-dot. Ignore outliers when drawing it.',
      ] },
      { code: 'W5', name: 'Analysing data and drawing conclusions', notes: [
        'Describe trends with both variables: “As the temperature increases, the time taken decreases.” Quote data from the table or graph.',
        'Outliers (anomalies) are results that do not fit the pattern. Possible causes: misreading a scale, timing errors, a controlled variable changing. Check or repeat them and leave them out of averages.',
        'Interpolation: reading a value between tested points (more reliable). Extrapolation: extending the line beyond the tested range (less reliable, the pattern may change).',
        'A conclusion answers the aim, says whether the hypothesis was supported, and refers to the data. Then evaluate: suggest improvements (more trials, a wider range, better control of variables, more precise equipment).',
        'Teacher’s example: vinegar + baking soda. The temperature-time graph falls then levels off, so the reaction is endothermic.',
      ] },
      { code: 'W6', name: 'Using data to model and predict', notes: [
        'Scientists collect data to find patterns, then build models to explain and predict: physical models, diagrams, mathematical rules and computer simulations.',
        'Examples: the particle model explains states of matter and reactions; plate movement rates (cm per year) predict how far continents will move; earthquake hazard maps and tsunami travel-time models predict risk; weather models predict rain.',
        'Models are simplified, so they have limitations; more and better data make predictions more reliable.',
      ] },
      { code: 'W7', name: 'Problem-solving strategies', notes: [
        'Define the problem, research, brainstorm ideas, plan and build, test, evaluate and improve (and repeat).',
        'Useful strategies: break a big problem into smaller parts, change one thing at a time, use data from tests to decide, work backwards from the goal, learn from failed designs.',
      ] },
    ],
    cards: [
      ['Testable question', 'Links a variable you change to one you can measure.'],
      ['Hypothesis', 'A testable prediction with a reason: If… then… because…'],
      ['Independent variable', 'The variable you change on purpose (x-axis).'],
      ['Dependent variable', 'The variable you measure (y-axis).'],
      ['Controlled variables', 'Variables kept the same to make a fair test.'],
      ['Fair test', 'Only the independent variable is changed; everything else is controlled.'],
      ['Control group', 'A set-up without the change, used for comparison.'],
      ['Accuracy', 'How close a measurement is to the true value.'],
      ['Precision', 'How close repeated measurements are to each other.'],
      ['Reliability', 'Getting consistent results when repeated; improve with repeat trials and averages.'],
      ['Validity', 'The experiment fairly tests what it claims to test.'],
      ['Reading a measuring cylinder', 'Bottom of the meniscus, eye level (avoid parallax error).'],
      ['Bunsen safety flame', 'Yellow flame, air hole closed. Blue heating flame: air hole open.'],
      ['Average', 'Sum of trials ÷ number of trials (leave out outliers).'],
      ['Units in tables', 'Go in the column headings, e.g. Temperature (°C).'],
      ['Line graph', 'Continuous data or changes over time.'],
      ['Scatter graph', 'Relationship between two numerical variables; add a line of best fit.'],
      ['Bar graph', 'The independent variable is a category.'],
      ['Pie chart', 'Parts of a whole (percentages).'],
      ['Line of best fit', 'Through the middle of the points, not dot-to-dot.'],
      ['Outlier', 'A result that does not fit the pattern; check, repeat, leave out of the average.'],
      ['Describing a trend', '“As X increases, Y increases/decreases”, plus data.'],
      ['Interpolate vs extrapolate', 'Within the tested range vs beyond it (less reliable).'],
      ['Conclusion', 'Answers the aim, says if the hypothesis is supported, uses data.'],
      ['Random vs systematic error', 'Random: unpredictable, reduce by averaging. Systematic: same every time, affects accuracy.'],
      ['Model', 'A simplified representation used to explain and predict.'],
    ],
    concepts: [
      ['Which part of an investigation says what you expect to happen and why?', ['Hypothesis', 'Aim', 'Method', 'Conclusion'], 0, ''],
      ['A student tests how the length of a ruler hanging off a desk affects the pitch of the sound. The independent variable is…', ['The length of ruler hanging off the desk', 'The pitch of the sound', 'The type of desk', 'The loudness'], 0, ''],
      ['Which graph should show how the temperature of a cooling drink changes over 30 minutes?', ['Line graph', 'Pie chart', 'Bar graph', 'Picture graph'], 0, ''],
      ['Which graph best compares the number of insects found in four different habitats?', ['Bar graph', 'Line graph', 'Scatter graph', 'Pie chart'], 0, 'The habitats are categories.'],
      ['The dependent variable is plotted on the…', ['y-axis', 'x-axis', 'Title', 'Key'], 0, ''],
      ['Trials: 12 s, 13 s, 11 s. The average is…', ['12 s', '13 s', '36 s', '11 s'], 0, '(12 + 13 + 11) ÷ 3 = 12.'],
      ['Which improves reliability?', ['Repeating the experiment and averaging', 'Changing two variables at once', 'Doing only one trial', 'Rounding all results to zero'], 0, ''],
      ['Reading a measuring cylinder from above gives a…', ['Parallax error', 'Systematic success', 'Precise result', 'Valid result'], 0, ''],
      ['Which is the safety flame on a Bunsen burner?', ['Yellow flame with the air hole closed', 'Blue flame with the air hole open', 'No flame', 'A roaring blue flame'], 0, ''],
      ['A line of best fit should…', ['Go through the middle of the points', 'Join every point', 'Start at the last point', 'Always pass through zero'], 0, ''],
      ['Predicting a value between two tested points is…', ['Interpolation', 'Extrapolation', 'Hypothesis', 'Validation'], 0, ''],
      ['A conclusion should…', ['Answer the aim using the data', 'List the equipment', 'Describe the method', 'Include the risk assessment'], 0, ''],
      ['Which is a controlled variable when testing how fertiliser affects plant growth?', ['Amount of water given', 'Amount of fertiliser', 'Height of the plants', 'Number of leaves'], 0, ''],
      ['Results that are close together but far from the true value are…', ['Precise but not accurate', 'Accurate but not precise', 'Valid', 'Reliable and accurate'], 0, ''],
    ],
    short: [
      ...DESIGN,
      { q: 'Explain the difference between accuracy and reliability, and describe how each can be improved.', marks: 4, tags: ['W3'], criteria: ['Accuracy: how close a result is to the true value', 'Improve accuracy with more precise/calibrated equipment, zeroing instruments, reading at eye level', 'Reliability: getting consistent results when the experiment is repeated', 'Improve reliability by repeating trials (at least three) and averaging, removing outliers'], model: 'Accuracy is how close a measurement is to the true value; it can be improved by using more precise, calibrated equipment, zeroing balances and reading scales at eye level. Reliability is whether the experiment gives consistent results when repeated; it can be improved by doing at least three trials for each value, averaging them and repeating any outliers.' },
      { q: 'List FOUR rules for drawing a good line graph of experimental results.', marks: 4, tags: ['W4'], criteria: ['A title that describes the graph (e.g. The effect of IV on DV)', 'Independent variable on the x-axis and dependent variable on the y-axis', 'Axes labelled with units', 'An even scale that uses most of the grid, and/or a line of best fit through the middle of the points'], model: 'Give the graph a title such as “The effect of water temperature on dissolving time”. Put the independent variable on the x-axis and the dependent variable on the y-axis. Label both axes with the variable and its unit, e.g. Time (s). Use an even scale that covers more than half of the grid, plot points as small crosses and draw a line of best fit through the middle of the points.' },
      { q: 'A student’s hypothesis is: “If a toy car is released from a higher ramp, then it will travel further.” Explain why this is a good hypothesis and how it could be improved.', marks: 3, tags: ['W1'], criteria: ['It is testable: it names the IV (ramp height) and DV (distance) and predicts a direction', 'It can be improved by adding a scientific reason (a “because” statement)', 'A correct reason, e.g. because a higher ramp gives more gravitational potential energy that becomes kinetic energy'], model: 'It is a good hypothesis because it is testable: it names what will be changed (ramp height) and what will be measured (distance travelled), and predicts what will happen. It could be improved by adding a reason: “…because a higher ramp gives the car more gravitational potential energy, which is transformed into more kinetic energy.”' },
      { q: 'Explain why scientists use models to predict natural events, using an example. Identify one limitation of the model.', marks: 3, tags: ['W6'], criteria: ['Models use patterns in data to explain and predict events that are hard to observe directly', 'A relevant example, e.g. earthquake hazard maps, tsunami travel-time models, plate movement rates, weather forecasts', 'A limitation, e.g. models are simplified, cannot give exact timing, depend on the quality and amount of data'], model: 'Scientists use data to find patterns and build models that explain and predict events that are too large, slow or dangerous to study directly. For example, earthquake hazard maps use records of past earthquakes along plate boundaries to predict which areas are most at risk. A limitation is that the model can only give a probability: it cannot say exactly when the next earthquake will happen, and it is only as good as the data used.' },
    ],
    bank: [wsMC, variablesQ, resultsQ, trendQ, graphChoiceQ, measureQ],
  });

  const DECKS = [energy, chem, geol, rocks, ws];

  /* ================= PRACTICE PAPER =================
     60 minutes. Section I: 18 multiple choice (Change: energy, chemical, geological and rocks; Working
     scientifically). Section II: written responses: a data-analysis task, an investigation design, and one
     short answer each from energy, chemical change, geological change and rocks. */
  const MC_PLAN = [['scienergy', 3, efficiencyMC], ['scichem', 3, massMC], ['scigeo', 3, null], ['scirocks', 2, oldestMC], ['scidata', 3, graphChoiceQ]];
  function buildPaper() {
    const byId = Object.fromEntries(DECKS.map(d => [d.id, d])), items = [];
    MC_PLAN.forEach(([id, n, gen]) => {
      shuffle(byId[id].concepts).slice(0, n).forEach(c => items.push({ deckId: id, kind: 'mc', mc: c, section: 'I' }));
      if (gen) items.push({ deckId: id, kind: 'bank', fn: gen, section: 'I' });
    });
    const mcItems = shuffle(items);
    const written = [
      { deckId: 'scidata', kind: 'data', block: dataTask(), section: 'II' },
      { deckId: 'scidata', kind: 'short', short: pick(DESIGN), section: 'II' },
      ...['scienergy', 'scichem', 'scigeo', 'scirocks'].map(id => ({ deckId: id, kind: 'short', short: pick(byId[id].short.filter(s => s.marks <= 4)), section: 'II' })),
    ];
    return { minutes: 60, reading: 5, items: [...mcItems, ...written] };
  }

  return { DECKS, BANK: Object.fromEntries(DECKS.map(d => [d.id, d.bank])), INVESTIGATIONS, makeResults, dataTask, DESIGN, buildPaper };
})();
if (typeof module !== 'undefined') module.exports = SC;
