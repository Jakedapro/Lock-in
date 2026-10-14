/* ===== Lock In — HSC Physics (Year 12 modules 5–8) =====
   Modelled on the style of recent HSC papers: calculations with data-sheet constants and
   extended-response questions with marking criteria. All questions are original. */

const PH = (() => {
  const T = typeof TK !== 'undefined' ? TK : require('./texkit.js');
  const { ri, pick, rnd, P, CH, finish, m, sci } = T;
  const SUBJECT = 'phys';
  // HSC data sheet values
  const g = 9.8, G = 6.67e-11, c = 3.0e8, h = 6.626e-34, e = 1.602e-19, me = 9.109e-31, mp = 1.673e-27, ME = 6.0e24, RE = 6.371e6, b = 2.898e-3, Ryd = 1.097e7;
  const TOL = { tol: 0.01 }; // answers accepted within 1% (3 significant figures)
  const deg = (x) => x * Math.PI / 180;
  const S3 = (x, unit = '') => `${m(sci(x))}${unit ? ' ' + unit : ''}`;

  /* ================= MODULE 5: ADVANCED MECHANICS ================= */
  const m5 = finish({
    id: 'phm5', subject: SUBJECT, title: 'Advanced Mechanics', chapter: 'Module 5', hue: 'coral',
    blurb: 'Projectile motion, circular motion, and motion in gravitational fields.',
    sections: [
      { code: '5.1', name: 'Projectile motion', notes: ['Treat horizontal and vertical motion separately. Horizontal velocity $u_x = u\\cos\\theta$ is constant (no air resistance).', 'Vertically: $v_y = u_y - gt$, $\\Delta y = u_yt - \\frac{1}{2}gt^2$, with $g = 9.8\\text{ m s}^{-2}$.', 'Time of flight on level ground $t = \\frac{2u\\sin\\theta}{g}$; maximum height $\\frac{u^2\\sin^2\\theta}{2g}$; range $\\frac{u^2\\sin 2\\theta}{g}$.'], ex: ['$u = 20$ m/s at $30^\\circ$: maximum height', '$u_y = 10$ m/s; $v_y^2 = u_y^2 - 2g\\Delta y$ with $v_y = 0$', '$\\Delta y = \\frac{100}{19.6} \\approx 5.1$ m'] },
      { code: '5.2', name: 'Circular motion', notes: ['Uniform circular motion needs a net force towards the centre: $F_c = \\frac{mv^2}{r}$, $a_c = \\frac{v^2}{r}$.', '$v = \\frac{2\\pi r}{T}$ and $\\omega = \\frac{\\Delta\\theta}{t}$, with $v = \\omega r$.', 'On a banked track with no friction, the design speed satisfies $\\tan\\theta = \\frac{v^2}{rg}$.', 'Torque $\\tau = r_{\\perp}F = rF\\sin\\theta$.'], ex: ['1.2 kg ball, $r = 0.8$ m, $v = 4$ m/s', '$F_c = \\frac{1.2 \\times 16}{0.8}$', '$= 24$ N towards the centre'] },
      { code: '5.3', name: 'Gravitational fields and orbits', notes: ['$g = \\frac{GM}{r^2}$ and $F = \\frac{GMm}{r^2}$, where $r$ is measured from the centre of the planet.', 'For a circular orbit, gravity provides the centripetal force: $v = \\sqrt{\\frac{GM}{r}}$.', 'Kepler\'s third law: $\\frac{r^3}{T^2} = \\frac{GM}{4\\pi^2}$. Geostationary orbits have $T = 24$ h.', 'Gravitational potential energy $U = -\\frac{GMm}{r}$; the total energy of an orbit is $-\\frac{GMm}{2r}$.'], ex: ['Orbit 400 km above Earth: speed', '$r = 6.371 \\times 10^6 + 4 \\times 10^5$ m', '$v = \\sqrt{\\frac{GM}{r}} \\approx 7.69 \\times 10^3$ m/s'] },
    ],
    cards: [
      ['Horizontal velocity of a projectile', 'Constant: $u\\cos\\theta$'], ['Range on level ground', '$\\frac{u^2\\sin 2\\theta}{g}$'], ['Centripetal force', '$F_c = \\frac{mv^2}{r}$, towards the centre'], ['$v$ in terms of period', '$v = \\frac{2\\pi r}{T}$'],
      ['Banked track design speed', '$\\tan\\theta = \\frac{v^2}{rg}$'], ['Field strength at distance $r$', '$g = \\frac{GM}{r^2}$'], ['Orbital speed', '$v = \\sqrt{\\frac{GM}{r}}$'], ['Kepler\'s third law', '$\\frac{r^3}{T^2} = \\frac{GM}{4\\pi^2}$'],
      ['Gravitational potential energy', '$U = -\\frac{GMm}{r}$'], ['Geostationary orbit', 'Period 24 h, above the equator, about 36 000 km up'],
    ],
    concepts: [
      ['At the highest point of a projectile\'s path, its acceleration is…', ['$9.8\\text{ m s}^{-2}$ downwards', 'zero', 'horizontal', 'upwards'], 0, 'Gravity acts the whole time.'],
      ['For a car turning on a flat road, the centripetal force comes from…', ['Friction between tyres and road', 'The engine', 'Gravity', 'The normal force'], 0, ''],
      ['If a satellite moves to a higher circular orbit, its speed…', ['Decreases', 'Increases', 'Stays the same', 'Becomes zero'], 0, '$v = \\sqrt{GM/r}$.'],
      ['Doubling the radius of an orbit multiplies the period by…', ['$2\\sqrt{2}$', '2', '4', '$\\sqrt{2}$'], 0, '$T^2 \\propto r^3$.'],
      ['Doubling speed in circular motion (same radius) multiplies the centripetal force by…', ['4', '2', '$\\frac{1}{2}$', '8'], 0, '$F \\propto v^2$.'],
      ['Gravitational potential energy is negative because…', ['Zero is defined at infinite separation', 'Mass can be negative', 'Gravity repels', 'Energy is lost to heat'], 0, ''],
    ],
    short: [
      { q: 'An astronaut on the International Space Station feels weightless, even though gravity there is about 90% of its value at Earth\'s surface. Explain why.', marks: 3, tags: ['5.3'], criteria: ['The station and astronaut are both in free fall (in orbit) around Earth', 'Gravity provides the centripetal force for both, so they accelerate together at the same rate', 'So there is no normal (contact) force on the astronaut, which is what we feel as weight'], model: 'The space station and the astronaut are both in orbit, which means they are in free fall towards Earth while also moving sideways fast enough to keep missing it. Gravity provides the centripetal force for both of them, so they accelerate at the same rate. Because the astronaut and the floor fall together, the floor exerts no normal force on the astronaut, and the absence of that contact force is what we experience as weightlessness.' },
      { q: 'A ball rolls off a horizontal table. Describe the horizontal and vertical components of its motion, and explain why they are independent.', marks: 4, tags: ['5.1'], criteria: ['Horizontal velocity stays constant (no horizontal force, ignoring air resistance)', 'Vertical velocity starts at zero and increases at $9.8\\text{ m s}^{-2}$ downwards', 'The path is a parabola', 'They are independent because gravity only acts vertically, so it cannot change the horizontal velocity'], model: 'Horizontally, no force acts on the ball once it leaves the table (ignoring air resistance), so its horizontal velocity stays constant and it covers equal horizontal distances in equal times. Vertically, it starts with zero vertical velocity and accelerates downwards at 9.8 m s⁻² because of gravity, so it falls faster and faster. Combining the two gives a parabolic path. The components are independent because the only force, gravity, acts vertically and therefore cannot change the horizontal component.' },
      { q: 'Explain how the orbital speed, period and total energy of a satellite change if it is moved to a higher circular orbit.', marks: 3, tags: ['5.3'], criteria: ['Speed decreases because $v = \\sqrt{GM/r}$', 'Period increases (Kepler\'s third law, $T^2 \\propto r^3$)', 'Total energy $-\\frac{GMm}{2r}$ increases (becomes less negative), so work must be done to raise it'], model: 'In a circular orbit gravity provides the centripetal force, giving $v = \\sqrt{GM/r}$, so a larger radius means a lower orbital speed. By Kepler\'s third law $r^3/T^2$ is constant, so the period increases. The total energy of the orbit is $-\\frac{GMm}{2r}$, which becomes less negative as $r$ increases, so the satellite has more total energy and work (from its rockets) is needed to move it up.' },
    ],
  });
  m5.bank = [
    function projectile() {
      const u = pick([12, 15, 18, 20, 25, 30]), th = pick([25, 30, 35, 40, 45, 50, 60]), s = Math.sin(deg(th));
      const t = 2 * u * s / g, H = (u * s) ** 2 / (2 * g), R = u * u * Math.sin(deg(2 * th)) / g;
      return {
        level: 'S', tags: ['5.1'], stem: `A ball is launched from level ground at ${u} m/s, ${m(`${th}^\\circ`)} above the horizontal. Ignore air resistance.`,
        parts: [
          P('a', 'Find the time of flight (s).', 'num', t, S3(t, 's'), [m(`t = \\frac{2u\\sin\\theta}{g} = \\frac{2(${u})\\sin ${th}^\\circ}{9.8}`), m(`\\approx ${sci(t)}`)], 2, TOL),
          P('b', 'Find the maximum height (m).', 'num', H, S3(H, 'm'), [m(`H = \\frac{(u\\sin\\theta)^2}{2g} = \\frac{(${rnd(u * s, 2)})^2}{19.6}`), m(`\\approx ${sci(H)}`)], 2, TOL),
          P('c', 'Find the range (m).', 'num', R, S3(R, 'm'), [m(`R = u\\cos\\theta \\times t = ${rnd(u * Math.cos(deg(th)), 2)} \\times ${rnd(t, 3)}`), m(`\\approx ${sci(R)}`)], 2, TOL),
        ],
      };
    },
    function circular() {
      const mass = pick([0.2, 0.5, 0.8, 1.2, 1.5, 2.0]), r = pick([0.5, 0.8, 1.0, 1.5, 2.0, 2.5]), v = ri(2, 9), F = mass * v * v / r, Tp = 2 * Math.PI * r / v;
      return {
        level: 'F', tags: ['5.2'], stem: `A ${mass} kg mass moves in a horizontal circle of radius ${r} m at ${v} m/s.`,
        parts: [
          P('a', 'Find the centripetal force (N).', 'num', F, S3(F, 'N'), [m(`F_c = \\frac{mv^2}{r} = \\frac{${mass} \\times ${v * v}}{${r}}`), m(`\\approx ${sci(F)}`)], 1, TOL),
          P('b', 'Find the period (s).', 'num', Tp, S3(Tp, 's'), [m(`T = \\frac{2\\pi r}{v} = \\frac{2\\pi(${r})}{${v}} \\approx ${sci(Tp)}`)], 1, TOL),
          CH('c', 'Which way does the net force point?', 'Towards the centre of the circle', ['Along the direction of motion', 'Away from the centre', 'Vertically upwards'], ['Centripetal means centre-seeking']),
        ],
      };
    },
    function banked() {
      const kmh = pick([50, 60, 72, 80, 90, 100]), v = kmh / 3.6, r = pick([60, 80, 100, 120, 150, 200]), th = Math.atan(v * v / (r * g)) * 180 / Math.PI;
      return {
        level: 'C', tags: ['5.2'], stem: `A curve of radius ${r} m is banked so cars can take it at ${kmh} km/h with no sideways friction.`,
        parts: [
          P('a', 'Convert the speed to m/s.', 'num', v, S3(v, 'm/s'), [m(`${kmh} \\div 3.6 \\approx ${sci(v)}`)], 1, TOL),
          P('b', 'Find the banking angle (degrees).', 'num', th, m(`${sci(th)}^\\circ`), [m(`\\tan\\theta = \\frac{v^2}{rg} = \\frac{(${rnd(v, 2)})^2}{${r} \\times 9.8}`), m(`\\theta \\approx ${sci(th)}^\\circ`)], 2, TOL),
        ],
      };
    },
    function orbit() {
      const hkm = pick([300, 400, 550, 800, 1200, 2000, 20200, 35800]), r = RE + hkm * 1e3, v = Math.sqrt(G * ME / r), Th = 2 * Math.PI * Math.sqrt(r ** 3 / (G * ME)) / 3600;
      return {
        level: 'C', tags: ['5.3'], stem: `A satellite is in a circular orbit ${hkm} km above Earth's surface. (${m('M_E = 6.0 \\times 10^{24}')} kg, ${m('r_E = 6.371 \\times 10^{6}')} m)`,
        parts: [
          P('a', 'Find its orbital speed (m/s).', 'num', v, S3(v, 'm/s'), [m(`r = 6.371 \\times 10^6 + ${sci(hkm * 1e3)} = ${sci(r, 4)}\\text{ m}`), m(`v = \\sqrt{\\frac{GM}{r}} \\approx ${sci(v)}`)], 2, TOL),
          P('b', 'Find its period in hours.', 'num', Th, S3(Th, 'h'), [m('T = 2\\pi\\sqrt{\\frac{r^3}{GM}}'), m(`\\approx ${sci(Th * 3600)}\\text{ s} = ${sci(Th)}\\text{ h}`)], 2, TOL),
        ],
      };
    },
    function fieldStrength() {
      const hkm = pick([200, 500, 1000, 3000, 6400]), r = RE + hkm * 1e3, gh = G * ME / (r * r), mass = pick([60, 70, 500, 1200]);
      return {
        level: 'F', tags: ['5.3'], stem: `A probe is ${hkm} km above Earth's surface.`,
        parts: [
          P('a', `Find the gravitational field strength there (${m('\\text{N kg}^{-1}')}).`, 'num', gh, S3(gh, 'N/kg'), [m(`g = \\frac{GM}{r^2} = \\frac{6.67 \\times 10^{-11} \\times 6.0 \\times 10^{24}}{(${sci(r, 4)})^2}`), m(`\\approx ${sci(gh)}`)], 1, TOL),
          P('b', `Find the gravitational force on a ${mass} kg mass there (N).`, 'num', gh * mass, S3(gh * mass, 'N'), [m(`F = mg = ${mass} \\times ${sci(gh)} \\approx ${sci(gh * mass)}`)], 1, TOL),
        ],
      };
    },
  ];

  /* ================= MODULE 6: ELECTROMAGNETISM ================= */
  const m6 = finish({
    id: 'phm6', subject: SUBJECT, title: 'Electromagnetism', chapter: 'Module 6', hue: 'cyan',
    blurb: 'Charged particles in fields, the motor effect, induction, motors, generators and transformers.',
    sections: [
      { code: '6.1', name: 'Charged particles in fields', notes: ['Between parallel plates: $E = \\frac{V}{d}$ and $F = qE$.', 'Work done on a charge: $W = qV$, so $\\frac{1}{2}mv^2 = qV$ when accelerated from rest.', 'A charge moving across a magnetic field: $F = qvB\\sin\\theta$, which gives circular motion with $r = \\frac{mv}{qB}$.'], ex: ['Electron between plates 2 cm apart, 500 V', '$E = \\frac{500}{0.02} = 2.5 \\times 10^4\\text{ V m}^{-1}$', '$F = eE = 4.0 \\times 10^{-15}$ N'] },
      { code: '6.2', name: 'The motor effect', notes: ['A current-carrying wire in a magnetic field feels $F = lIB\\sin\\theta$.', 'Direction: right-hand palm rule (fingers $B$, thumb $I$, palm pushes $F$).', 'Two parallel wires: $\\frac{F}{l} = \\frac{\\mu_0 I_1I_2}{2\\pi r}$; same direction currents attract.'], ex: ['0.25 m wire, 4 A, 0.5 T, perpendicular', '$F = 0.25 \\times 4 \\times 0.5$', '$= 0.5$ N'] },
      { code: '6.3', name: 'Electromagnetic induction', notes: ['Magnetic flux $\\Phi = BA\\cos\\theta$ (in Wb).', 'Faraday\'s law: $\\varepsilon = -N\\frac{\\Delta\\Phi}{\\Delta t}$.', 'Lenz\'s law: the induced current opposes the change that caused it (the minus sign).'], ex: ['100 turns, area 0.02 m², $B$ drops from 0.5 T to 0 in 0.1 s', '$\\Delta\\Phi = 0.01$ Wb', '$\\varepsilon = 100 \\times \\frac{0.01}{0.1} = 10$ V'] },
      { code: '6.4', name: 'Motors, generators and transformers', notes: ['Torque on a coil: $\\tau = nIAB\\sin\\theta$; maximum when the plane of the coil is parallel to $B$.', 'A DC motor uses a split-ring commutator to reverse the current every half turn; AC generators use slip rings.', 'Ideal transformer: $\\frac{V_p}{V_s} = \\frac{N_p}{N_s}$ and $V_pI_p = V_sI_s$.', 'Back emf in a motor increases with speed, reducing the current.'], ex: ['240 V, 1000 primary turns, 50 secondary turns', '$V_s = 240 \\times \\frac{50}{1000}$', '$= 12$ V'] },
    ],
    cards: [
      ['Field between plates', '$E = \\frac{V}{d}$'], ['Force on a charge in $E$', '$F = qE$'], ['Force on a charge in $B$', '$F = qvB\\sin\\theta$'], ['Radius in a magnetic field', '$r = \\frac{mv}{qB}$'],
      ['Motor effect', '$F = lIB\\sin\\theta$'], ['Magnetic flux', '$\\Phi = BA\\cos\\theta$'], ['Faraday\'s law', '$\\varepsilon = -N\\frac{\\Delta\\Phi}{\\Delta t}$'], ['Lenz\'s law', 'Induced current opposes the change in flux'],
      ['Transformer ratio', '$\\frac{V_p}{V_s} = \\frac{N_p}{N_s}$'], ['Split-ring commutator', 'Reverses the coil current every half turn so a DC motor keeps turning'],
    ],
    concepts: [
      ['A charge moving parallel to a magnetic field experiences…', ['No force', 'Maximum force', 'A force along $B$', 'Circular motion'], 0, '$\\sin 0^\\circ = 0$.'],
      ['Increasing $B$ for a charge in circular motion makes the radius…', ['Smaller', 'Larger', 'Unchanged', 'Infinite'], 0, '$r = mv/(qB)$.'],
      ['A step-down transformer has…', ['More primary turns than secondary', 'More secondary turns', 'Equal turns', 'No iron core'], 0, ''],
      ['The work done by a magnetic force on a moving charge is…', ['Zero', 'qvB', 'qV', 'mv²'], 0, 'The force is always perpendicular to the velocity.'],
      ['Back emf in a DC motor is greatest when the motor…', ['Spins fastest', 'Starts up', 'Is stalled', 'Is switched off'], 0, ''],
      ['Lenz\'s law is a consequence of…', ['Conservation of energy', 'Conservation of charge', 'Newton\'s first law', 'Coulomb\'s law'], 0, ''],
    ],
    short: [
      { q: 'Explain the role of the split-ring commutator in a DC motor.', marks: 3, tags: ['6.4'], criteria: ['It reverses the direction of current in the coil every half turn', 'This happens as the coil passes the vertical position (plane perpendicular to the field)', 'So the torque keeps acting in the same rotational direction and the motor rotates continuously'], model: 'The split-ring commutator connects the rotating coil to the DC supply through brushes. Every half turn, as the coil passes the position where its plane is perpendicular to the magnetic field, the commutator swaps which brush touches which side of the coil, reversing the current in the coil. Without this, the torque would reverse and the coil would just oscillate; with it, the torque always acts in the same rotational direction, so the motor keeps turning.' },
      { q: 'A strong magnet falls much more slowly through a vertical copper pipe than through an identical plastic pipe. Explain why.', marks: 4, tags: ['6.3'], criteria: ['The falling magnet changes the magnetic flux through sections of the copper pipe', 'This induces eddy currents in the copper (Faraday\'s law); plastic is an insulator, so no current flows', 'By Lenz\'s law the eddy currents create magnetic fields that oppose the change, so they repel/attract the magnet upwards', 'The opposing force reduces the magnet\'s acceleration; energy is converted to heat in the pipe'], model: 'As the magnet falls, the magnetic flux through each section of the pipe changes. In copper, a conductor, this changing flux induces circulating eddy currents (Faraday\'s law). By Lenz\'s law these currents produce magnetic fields that oppose the change in flux: the section below the magnet repels it and the section above attracts it, so there is an upward force on the magnet and it falls slowly, with its kinetic energy turned into heat in the pipe. Plastic is an insulator, so no currents are induced and the magnet falls freely.' },
      { q: 'Explain why electricity is transmitted over long distances at very high voltages.', marks: 3, tags: ['6.4'], criteria: ['Power lost in the lines is $P = I^2R$', 'For the same power $P = VI$, a higher voltage means a lower current', 'Step-up transformers raise the voltage at the power station, greatly reducing energy losses; step-down transformers lower it near homes'], model: 'Transmission lines have resistance, so power is lost as heat at a rate $P = I^2R$. Since power delivered is $P = VI$, transmitting the same power at a much higher voltage requires a much smaller current, which reduces the losses dramatically (they depend on the square of the current). Step-up transformers raise the voltage at the power station, and step-down transformers lower it again before it reaches homes.' },
    ],
  });
  m6.bank = [
    function plates() {
      const V = pick([100, 200, 250, 500, 1000, 1500]), dcm = pick([0.5, 1, 2, 2.5, 4, 5]), d = dcm / 100, E = V / d, F = e * E, a = F / me;
      return {
        level: 'F', tags: ['6.1'], stem: `Two parallel plates ${dcm} cm apart have a potential difference of ${V} V. An electron is between them.`,
        parts: [
          P('a', `Find the electric field strength (${m('\\text{V m}^{-1}')}).`, 'num', E, S3(E), [m(`E = \\frac{V}{d} = \\frac{${V}}{${d}} = ${sci(E)}`)], 1, TOL),
          P('b', 'Find the force on the electron (N).', 'num', F, S3(F, 'N'), [m(`F = qE = 1.602 \\times 10^{-19} \\times ${sci(E)} \\approx ${sci(F)}`)], 1, TOL),
          P('c', `Find its acceleration (${m('\\text{m s}^{-2}')}).`, 'num', a, S3(a), [m(`a = \\frac{F}{m_e} = \\frac{${sci(F)}}{9.109 \\times 10^{-31}} \\approx ${sci(a)}`)], 1, TOL),
        ],
      };
    },
    function chargeInB() {
      const isE = Math.random() < 0.5, mass = isE ? me : mp, name = isE ? 'An electron' : 'A proton', v = pick([2, 3, 5, 8]) * 10 ** (isE ? 6 : 5), B = pick([0.002, 0.005, 0.01, 0.05, 0.1, 0.2]), r = mass * v / (e * B), F = e * v * B;
      return {
        level: 'S', tags: ['6.1'], stem: `${name} moves at ${m(sci(v))} m/s perpendicular to a ${B} T magnetic field.`,
        parts: [
          P('a', 'Find the magnetic force on it (N).', 'num', F, S3(F, 'N'), [m(`F = qvB = 1.602 \\times 10^{-19} \\times ${sci(v)} \\times ${B} \\approx ${sci(F)}`)], 1, TOL),
          P('b', 'Find the radius of its circular path (m).', 'num', r, S3(r, 'm'), [m(`r = \\frac{mv}{qB} = \\frac{${sci(mass, 4)} \\times ${sci(v)}}{1.602 \\times 10^{-19} \\times ${B}}`), m(`\\approx ${sci(r)}`)], 2, TOL),
        ],
      };
    },
    function motorEffect() {
      const l = pick([0.1, 0.2, 0.25, 0.4, 0.5]), I = ri(2, 12), B = pick([0.1, 0.2, 0.4, 0.5, 0.8]), th = pick([30, 45, 60, 90]), F = l * I * B * Math.sin(deg(th));
      const n = pick([50, 100, 200]), A = pick([0.01, 0.02, 0.05]), tau = n * I * A * B;
      return {
        level: 'S', tags: ['6.2', '6.4'], stem: 'The motor effect.',
        parts: [
          P('a', `A ${l} m wire carries ${I} A at ${m(`${th}^\\circ`)} to a ${B} T field. Find the force on it (N).`, 'num', F, S3(F, 'N'), [m(`F = lIB\\sin\\theta = ${l} \\times ${I} \\times ${B} \\times \\sin ${th}^\\circ \\approx ${sci(F)}`)], 1, TOL),
          P('b', `A coil of ${n} turns, area ${A} m², carries ${I} A with its plane parallel to a ${B} T field. Find the torque (N m).`, 'num', tau, S3(tau, 'N m'), [m(`\\tau = nIAB = ${n} \\times ${I} \\times ${A} \\times ${B} = ${sci(tau)}`)], 2, TOL),
        ],
      };
    },
    function induction() {
      const N = pick([50, 100, 200, 500]), A = pick([0.01, 0.02, 0.04, 0.05]), B1 = pick([0.2, 0.4, 0.5, 0.8]), B2 = pick([0, 0.1]), t = pick([0.05, 0.1, 0.2, 0.5]), emf = N * A * (B1 - B2) / t;
      return {
        level: 'S', tags: ['6.3'], stem: `A coil of ${N} turns and area ${A} m² sits perpendicular to a magnetic field that falls from ${B1} T to ${B2} T in ${t} s.`,
        parts: [
          P('a', 'Find the change in flux through one turn (Wb).', 'num', A * (B1 - B2), S3(A * (B1 - B2), 'Wb'), [m(`\\Delta\\Phi = A\\Delta B = ${A} \\times ${rnd(B1 - B2, 2)} = ${sci(A * (B1 - B2))}`)], 1, TOL),
          P('b', 'Find the size of the average induced emf (V).', 'num', emf, S3(emf, 'V'), [m(`\\varepsilon = N\\frac{\\Delta\\Phi}{\\Delta t} = ${N} \\times \\frac{${sci(A * (B1 - B2))}}{${t}} = ${sci(emf)}`)], 2, TOL),
        ],
      };
    },
    function transformer() {
      const Vp = pick([240, 11000, 330000, 415]), Np = pick([500, 1000, 2000, 4000]), Ns = pick([50, 100, 250, 8000, 20000]), Vs = Vp * Ns / Np, Is = pick([0.5, 1, 2, 5, 10]), Ip = Vs * Is / Vp;
      return {
        level: 'F', tags: ['6.4'], stem: `An ideal transformer has ${Np} primary turns and ${Ns} secondary turns, with ${Vp} V on the primary.`,
        parts: [
          P('a', 'Find the secondary voltage (V).', 'num', Vs, S3(Vs, 'V'), [m(`V_s = V_p\\frac{N_s}{N_p} = ${Vp} \\times \\frac{${Ns}}{${Np}} = ${sci(Vs)}`)], 1, TOL),
          CH('b', 'Is it a step-up or step-down transformer?', Ns > Np ? 'Step-up' : 'Step-down', [Ns > Np ? 'Step-down' : 'Step-up'], [`${Ns} secondary turns vs ${Np} primary turns`]),
          P('c', `If the secondary current is ${Is} A, find the primary current (A).`, 'num', Ip, S3(Ip, 'A'), [m(`V_pI_p = V_sI_s \\Rightarrow I_p = \\frac{${sci(Vs)} \\times ${Is}}{${Vp}} = ${sci(Ip)}`)], 1, TOL),
        ],
      };
    },
  ];

  /* ================= MODULE 7: THE NATURE OF LIGHT ================= */
  const m7 = finish({
    id: 'phm7', subject: SUBJECT, title: 'The Nature of Light', chapter: 'Module 7', hue: 'gold',
    blurb: 'Maxwell and the EM spectrum, wave and quantum models of light, and special relativity.',
    sections: [
      { code: '7.1', name: 'Electromagnetic spectrum', notes: ['Maxwell predicted EM waves travelling at $c = \\frac{1}{\\sqrt{\\mu_0\\varepsilon_0}} \\approx 3.00 \\times 10^8$ m/s.', 'All EM waves obey $c = f\\lambda$.', 'Spectra of stars give their surface temperature, composition, rotation and motion (Doppler shift).'], ex: ['Frequency of 600 nm light', '$f = \\frac{3.00 \\times 10^8}{600 \\times 10^{-9}}$', '$= 5.0 \\times 10^{14}$ Hz'] },
      { code: '7.2', name: 'Light: wave model', notes: ['Double slit: bright fringes where $d\\sin\\theta = m\\lambda$; fringe spacing $\\Delta y = \\frac{\\lambda L}{d}$.', 'Diffraction gratings give sharper, brighter maxima using the same equation.', 'Polarisation (Malus\'s law): $I = I_{\\max}\\cos^2\\theta$. Only transverse waves can be polarised.'], ex: ['$\\lambda = 650$ nm, $d = 0.25$ mm, $L = 2$ m', '$\\Delta y = \\frac{650 \\times 10^{-9} \\times 2}{0.25 \\times 10^{-3}}$', '$= 5.2$ mm'] },
      { code: '7.3', name: 'Light: quantum model', notes: ['Black body radiation: Wien\'s law $\\lambda_{\\max} = \\frac{b}{T}$, $b = 2.898 \\times 10^{-3}$ m K. Planck explained it with quantised energy $E = hf$.', 'Photoelectric effect: $K_{\\max} = hf - \\phi$. Below the threshold frequency $f_0 = \\frac{\\phi}{h}$ no electrons are emitted, however bright the light.', 'Einstein used photons to explain it, supporting the particle model.'], ex: ['300 nm light on a metal with $\\phi = 2.3$ eV', '$E = \\frac{hc}{\\lambda} = 4.14$ eV', '$K_{\\max} = 4.14 - 2.3 = 1.84$ eV'] },
      { code: '7.4', name: 'Light and special relativity', notes: ['Postulates: the laws of physics are the same in all inertial frames, and the speed of light is the same for all observers.', 'Time dilation $t = \\frac{t_0}{\\sqrt{1 - v^2/c^2}}$; length contraction $l = l_0\\sqrt{1 - v^2/c^2}$.', 'Relativistic momentum $p = \\frac{m_0v}{\\sqrt{1 - v^2/c^2}}$; mass-energy $E = mc^2$.', 'Evidence: muons reaching the ground, atomic clocks on aircraft, particle accelerators.'], ex: ['Muon lifetime $2.2\\ \\mu$s at $0.99c$', '$\\gamma = \\frac{1}{\\sqrt{1 - 0.99^2}} \\approx 7.09$', '$t \\approx 15.6\\ \\mu$s in Earth\'s frame'] },
    ],
    cards: [
      ['Wave equation', '$c = f\\lambda$'], ['Double slit maxima', '$d\\sin\\theta = m\\lambda$'], ['Fringe spacing', '$\\Delta y = \\frac{\\lambda L}{d}$'], ['Malus\'s law', '$I = I_{\\max}\\cos^2\\theta$'],
      ['Wien\'s law', '$\\lambda_{\\max} = \\frac{b}{T}$'], ['Photon energy', '$E = hf = \\frac{hc}{\\lambda}$'], ['Photoelectric equation', '$K_{\\max} = hf - \\phi$'], ['Threshold frequency', '$f_0 = \\frac{\\phi}{h}$'],
      ['Time dilation', '$t = \\frac{t_0}{\\sqrt{1 - v^2/c^2}}$'], ['Length contraction', '$l = l_0\\sqrt{1 - v^2/c^2}$'], ['Michelson–Morley result', 'Null result: no evidence for an aether'],
    ],
    concepts: [
      ['Increasing the intensity of light below the threshold frequency…', ['Still emits no electrons', 'Emits more electrons', 'Emits faster electrons', 'Lowers the work function'], 0, ''],
      ['Moving the screen further from a double slit makes the fringes…', ['Further apart', 'Closer together', 'Brighter only', 'Disappear'], 0, '$\\Delta y \\propto L$.'],
      ['A hotter star\'s peak wavelength is…', ['Shorter', 'Longer', 'The same', 'Infrared'], 0, 'Wien\'s law.'],
      ['Polarisation shows that light is…', ['A transverse wave', 'A longitudinal wave', 'Made of particles', 'Slower than sound'], 0, ''],
      ['To an observer on Earth, a fast-moving clock runs…', ['Slow', 'Fast', 'At the same rate', 'Backwards'], 0, ''],
      ['The stopping voltage in a photoelectric experiment measures…', ['$K_{\\max}$ of the electrons', 'The work function', 'The intensity', 'The threshold wavelength'], 0, ''],
    ],
    short: [
      { q: 'Describe how Young\'s double-slit experiment supports the wave model of light.', marks: 3, tags: ['7.2'], criteria: ['Light through two narrow slits produces alternating bright and dark fringes', 'Bright fringes are constructive interference (path difference $m\\lambda$), dark fringes destructive', 'Interference is a wave property that a particle model (Newton\'s corpuscles) could not explain'], model: 'When light passes through two narrow, closely spaced slits it produces a pattern of alternating bright and dark bands on a screen. The bands form where waves from the two slits interfere: constructively where the path difference is a whole number of wavelengths, giving bright fringes, and destructively where it is a half-wavelength out, giving dark fringes. Interference is a property of waves, and a particle model would predict only two bright bands, so the experiment supports the wave model.' },
      { q: 'Explain how the photoelectric effect supports the particle model of light. Refer to threshold frequency in your answer.', marks: 4, tags: ['7.3'], criteria: ['No electrons are emitted below a threshold frequency, however intense the light', 'Above it, the maximum kinetic energy depends on frequency, not intensity ($K_{\\max} = hf - \\phi$)', 'Emission is instant, with no time to build up energy', 'Explained by photons of energy $hf$ each giving all their energy to one electron; intensity only changes the number of photons'], model: 'Light only ejects electrons from a metal if its frequency is above a threshold value, no matter how intense it is, and the maximum kinetic energy of the electrons depends on the frequency, not the intensity. Electrons are also emitted instantly. The wave model predicts that bright light of any frequency should eventually give electrons enough energy. Einstein explained the results with photons: each photon carries energy $E = hf$ and gives it all to one electron, so if $hf$ is less than the work function nothing happens, and above that $K_{\\max} = hf - \\phi$. Brighter light just means more photons, so more electrons but not faster ones.' },
      { q: 'Explain the significance of the Michelson–Morley experiment for the development of physics.', marks: 3, tags: ['7.4'], criteria: ['It tried to detect Earth\'s motion through the aether by comparing the speed of light in perpendicular directions', 'It found a null result (no difference in the speed of light)', 'This undermined the aether model and was consistent with Einstein\'s postulate that the speed of light is constant for all observers'], model: 'Scientists thought light travelled through a medium called the aether, so Earth\'s motion through it should change the measured speed of light in different directions. Michelson and Morley used an interferometer to compare light travelling in perpendicular directions, but found no change in the interference pattern: a null result. This undermined the aether model and was later consistent with Einstein\'s special relativity, which states that the speed of light is the same for all observers.' },
    ],
  });
  const METALS = [['sodium', 2.3], ['potassium', 2.3], ['calcium', 2.9], ['zinc', 4.3], ['copper', 4.7]];
  m7.bank = [
    function wien() {
      const T = pick([3000, 3500, 4500, 5800, 7500, 10000, 20000]), lam = b / T;
      return {
        level: 'F', tags: ['7.3'], stem: `A star has a surface temperature of ${T} K.`,
        parts: [
          P('a', 'Find the wavelength of its peak emission (nm).', 'num', lam * 1e9, S3(lam * 1e9, 'nm'), [m(`\\lambda_{\\max} = \\frac{b}{T} = \\frac{2.898 \\times 10^{-3}}{${T}} = ${sci(lam)}\\text{ m}`), m(`= ${sci(lam * 1e9)}\\text{ nm}`)], 2, TOL),
          CH('b', 'In which part of the spectrum is that peak?', lam < 380e-9 ? 'Ultraviolet' : lam <= 750e-9 ? 'Visible' : 'Infrared', ['Ultraviolet', 'Visible', 'Infrared', 'X-ray'], ['Visible light is about 380 to 750 nm']),
        ],
      };
    },
    function doubleSlit() {
      const lnm = pick([450, 500, 550, 600, 633, 650, 700]), dmm = pick([0.1, 0.2, 0.25, 0.3, 0.5]), L = pick([1.0, 1.5, 2.0, 2.5, 3.0]), mm = ri(1, 3);
      const dy = lnm * 1e-9 * L / (dmm * 1e-3) * 1e3, th = Math.asin(mm * lnm * 1e-9 / (dmm * 1e-3)) * 180 / Math.PI;
      return {
        level: 'S', tags: ['7.2'], stem: `Light of wavelength ${lnm} nm passes through two slits ${dmm} mm apart onto a screen ${L} m away.`,
        parts: [
          P('a', 'Find the spacing between bright fringes (mm).', 'num', dy, S3(dy, 'mm'), [m(`\\Delta y = \\frac{\\lambda L}{d} = \\frac{${lnm} \\times 10^{-9} \\times ${L}}{${dmm} \\times 10^{-3}}`), m(`= ${sci(dy)}\\text{ mm}`)], 2, TOL),
          P('b', `Find the angle to the order ${mm} bright fringe (degrees).`, 'num', th, m(`${sci(th)}^\\circ`), [m(`\\sin\\theta = \\frac{m\\lambda}{d} = \\frac{${mm} \\times ${lnm} \\times 10^{-9}}{${dmm} \\times 10^{-3}}`), m(`\\theta \\approx ${sci(th)}^\\circ`)], 1, TOL),
        ],
      };
    },
    function photoelectric() {
      const [metal, phi] = pick(METALS), lnm = pick(phi > 4 ? [150, 180, 200, 220, 250] : [200, 250, 300, 350, 400]), E = h * c / (lnm * 1e-9) / e, K = E - phi, f0 = phi * e / h;
      return {
        level: 'S', tags: ['7.3'], stem: `Light of wavelength ${lnm} nm shines on ${metal} (work function ${phi} eV).`,
        parts: [
          P('a', 'Find the energy of each photon (eV).', 'num', E, S3(E, 'eV'), [m(`E = \\frac{hc}{\\lambda} = \\frac{6.626 \\times 10^{-34} \\times 3.00 \\times 10^8}{${lnm} \\times 10^{-9}} = ${sci(E * e)}\\text{ J}`), m(`\\div 1.602 \\times 10^{-19} = ${sci(E)}\\text{ eV}`)], 2, TOL),
          P('b', 'Find the maximum kinetic energy of the photoelectrons (eV).', 'num', K, S3(K, 'eV'), [m(`K_{\\max} = hf - \\phi = ${sci(E)} - ${phi} = ${sci(K)}`)], 1, TOL),
          P('c', 'Find the threshold frequency (Hz).', 'num', f0, S3(f0, 'Hz'), [m(`f_0 = \\frac{\\phi}{h} = \\frac{${phi} \\times 1.602 \\times 10^{-19}}{6.626 \\times 10^{-34}} = ${sci(f0)}`)], 1, TOL),
        ],
      };
    },
    function relativity() {
      const k = pick([0.6, 0.8, 0.9, 0.95, 0.98, 0.99]), gam = 1 / Math.sqrt(1 - k * k), t0 = pick([2.2, 5, 10, 26]), L0 = pick([100, 50, 30, 10]);
      return {
        level: 'C', tags: ['7.4'], stem: `A spacecraft travels past Earth at ${m(`${k}c`)}.`,
        parts: [
          P('a', `Find the Lorentz factor ${m('\\gamma')}.`, 'num', gam, S3(gam), [m(`\\gamma = \\frac{1}{\\sqrt{1 - ${k}^2}} = ${sci(gam)}`)], 1, TOL),
          P('b', `A clock on board ticks ${t0} s. How long does that take as measured from Earth (s)?`, 'num', t0 * gam, S3(t0 * gam, 's'), [m(`t = \\gamma t_0 = ${sci(gam)} \\times ${t0} = ${sci(t0 * gam)}`)], 2, TOL),
          P('c', `The craft is ${L0} m long at rest. How long is it as measured from Earth (m)?`, 'num', L0 / gam, S3(L0 / gam, 'm'), [m(`l = \\frac{l_0}{\\gamma} = \\frac{${L0}}{${sci(gam)}} = ${sci(L0 / gam)}`)], 1, TOL),
        ],
      };
    },
    function malus() {
      const I0 = pick([20, 40, 60, 80, 120]), th = pick([20, 30, 45, 60, 75]), I = I0 * Math.cos(deg(th)) ** 2;
      return {
        level: 'F', tags: ['7.2'], stem: `Polarised light of intensity ${I0} ${m('\\text{W m}^{-2}')} passes through a polariser at ${m(`${th}^\\circ`)} to its plane of polarisation.`,
        parts: [P('a', `Find the transmitted intensity (${m('\\text{W m}^{-2}')}).`, 'num', I, S3(I), [m(`I = I_{\\max}\\cos^2\\theta = ${I0}\\cos^2 ${th}^\\circ = ${sci(I)}`)], 2, TOL)],
      };
    },
  ];

  /* ================= MODULE 8: FROM THE UNIVERSE TO THE ATOM ================= */
  const m8 = finish({
    id: 'phm8', subject: SUBJECT, title: 'From the Universe to the Atom', chapter: 'Module 8', hue: 'lilac',
    blurb: 'The expanding universe, stars, the Bohr model, matter waves, radioactivity and the nucleus.',
    sections: [
      { code: '8.1', name: 'Origins of the elements', notes: ['Hubble\'s law $v = H_0d$: distant galaxies are redshifted and recede faster the further away they are.', 'Evidence for the Big Bang: expansion (redshift), the cosmic microwave background, and the abundance of light elements.', 'Main-sequence stars fuse hydrogen: the proton–proton chain in smaller stars, the CNO cycle in more massive ones. $E = mc^2$ gives the energy released.', 'The Hertzsprung–Russell diagram plots luminosity against temperature.'], ex: ['Galaxy at 150 Mpc, $H_0 = 70$ km/s/Mpc', '$v = 70 \\times 150$', '$= 10\\,500$ km/s'] },
      { code: '8.2', name: 'Structure of the atom', notes: ['Thomson measured the charge-to-mass ratio of electrons with crossed $E$ and $B$ fields.', 'Millikan\'s oil drop experiment found the charge on an electron.', 'Rutherford\'s gold foil experiment: most alpha particles passed through, a few bounced back, so atoms have a small dense positive nucleus.', 'Chadwick discovered the neutron.'], ex: ['Why did a few alpha particles bounce back?', 'They came close to a small, massive, positive nucleus', 'Strong repulsion turned them around'] },
      { code: '8.3', name: 'Quantum model of the atom', notes: ['Bohr: electrons occupy fixed energy levels; photons are emitted or absorbed when they jump, $E = hf$.', 'Hydrogen: $\\frac{1}{\\lambda} = R\\left(\\frac{1}{n_f^2} - \\frac{1}{n_i^2}\\right)$ with $R = 1.097 \\times 10^7\\text{ m}^{-1}$. Lyman ($n_f = 1$, UV), Balmer ($n_f = 2$, visible), Paschen ($n_f = 3$, IR).', 'de Broglie: matter has wavelength $\\lambda = \\frac{h}{mv}$; electron diffraction confirmed it.', 'Schrödinger replaced orbits with probability clouds (orbitals).'], ex: ['Hydrogen $n = 3 \\to 2$', '$\\frac{1}{\\lambda} = 1.097 \\times 10^7\\left(\\frac{1}{4} - \\frac{1}{9}\\right)$', '$\\lambda \\approx 656$ nm (red)'] },
      { code: '8.4', name: 'Properties of the nucleus', notes: ['Alpha ($^4_2\\text{He}$), beta ($e^-$ or $e^+$) and gamma decay; balance mass and atomic numbers.', 'Half-life: $N = N_0\\left(\\frac{1}{2}\\right)^{t/t_{1/2}} = N_0e^{-\\lambda t}$ with $\\lambda = \\frac{\\ln 2}{t_{1/2}}$.', 'Mass defect and binding energy: $E = \\Delta mc^2$, with $1\\text{ u} = 931.5\\text{ MeV}$.', 'Fission splits heavy nuclei and fusion joins light ones; both release energy as binding energy per nucleon increases.'], ex: ['80 g of an isotope, half-life 5 days, after 15 days', '$80 \\times \\left(\\frac{1}{2}\\right)^3$', '$= 10$ g'] },
      { code: '8.5', name: 'Deep inside the atom', notes: ['The Standard Model: quarks and leptons (fermions) and force-carrying bosons.', 'Protons are $uud$ and neutrons are $udd$.', 'Particle accelerators confirm predictions such as the Higgs boson.'], ex: ['Charge of a proton from quarks', '$u = +\\frac{2}{3}$, $d = -\\frac{1}{3}$', '$\\frac{2}{3} + \\frac{2}{3} - \\frac{1}{3} = +1$'] },
    ],
    cards: [
      ['Hubble\'s law', '$v = H_0d$'], ['Evidence for the Big Bang', 'Redshift / expansion, cosmic microwave background, light element abundance'], ['Main sequence fusion', 'Proton–proton chain (smaller stars), CNO cycle (larger stars)'], ['Rydberg equation', '$\\frac{1}{\\lambda} = R\\left(\\frac{1}{n_f^2} - \\frac{1}{n_i^2}\\right)$'],
      ['Balmer series', 'Transitions to $n = 2$: visible light'], ['de Broglie wavelength', '$\\lambda = \\frac{h}{mv}$'], ['Decay law', '$N = N_0e^{-\\lambda t}$, $\\lambda = \\frac{\\ln 2}{t_{1/2}}$'], ['1 u of mass', '931.5 MeV'],
      ['Rutherford\'s conclusion', 'A small, dense, positive nucleus'], ['Proton quark content', '$uud$'],
    ],
    concepts: [
      ['Redshift of distant galaxies shows that they are…', ['Moving away from us', 'Moving towards us', 'Getting hotter', 'Made of hydrogen'], 0, ''],
      ['After three half-lives, the fraction remaining is…', ['$\\frac{1}{8}$', '$\\frac{1}{3}$', '$\\frac{1}{6}$', '$\\frac{1}{9}$'], 0, ''],
      ['In beta-minus decay, the atomic number…', ['Increases by 1', 'Decreases by 1', 'Decreases by 2', 'Stays the same'], 0, 'A neutron turns into a proton.'],
      ['Electron diffraction is evidence that electrons…', ['Have wave properties', 'Have no mass', 'Are positive', 'Orbit in circles'], 0, ''],
      ['The Balmer series is in the…', ['Visible region', 'Ultraviolet', 'Infrared', 'X-ray region'], 0, ''],
      ['Fusion releases energy because the products have…', ['Higher binding energy per nucleon', 'More mass', 'More protons', 'Lower binding energy per nucleon'], 0, ''],
    ],
    short: [
      { q: 'Explain how the emission spectrum of hydrogen provides evidence for the Bohr model of the atom.', marks: 3, tags: ['8.3'], criteria: ['Hydrogen emits only specific wavelengths (a line spectrum), not a continuous spectrum', 'Bohr proposed electrons occupy fixed energy levels and emit a photon of energy $E = hf$ equal to the level difference when they drop', 'The Rydberg equation (from Bohr\'s levels) predicts the observed wavelengths, e.g. the Balmer series'], model: 'Excited hydrogen gas emits light only at certain wavelengths, giving a line spectrum rather than a continuous rainbow. Bohr explained this by proposing that electrons can only occupy fixed energy levels, and when an electron drops from a higher level to a lower one it emits a single photon whose energy $E = hf$ equals the difference between the levels. Because only certain level differences exist, only certain wavelengths appear, and the wavelengths calculated from Bohr\'s levels match the measured lines such as the visible Balmer series.' },
      { q: 'Describe the evidence that the universe is expanding.', marks: 3, tags: ['8.1'], criteria: ['Light from distant galaxies is redshifted, so they are moving away', 'Hubble found recession speed is proportional to distance ($v = H_0d$)', 'The cosmic microwave background, cooled radiation from the early universe, supports expansion from a hot dense state'], model: 'Light from distant galaxies is redshifted, meaning their spectral lines are shifted to longer wavelengths because they are moving away from us. Hubble showed that the further away a galaxy is, the faster it recedes ($v = H_0d$), which is what we expect if space itself is expanding. The cosmic microwave background, faint radiation coming from every direction, is the cooled remnant of the hot early universe, which also supports an expanding universe that began in a hot, dense state.' },
      { q: 'Explain how main-sequence stars produce energy, and how the process differs in more massive stars.', marks: 4, tags: ['8.1'], criteria: ['Hydrogen nuclei fuse into helium in the core', 'The mass of the products is less than the reactants; the mass defect is released as energy ($E = mc^2$)', 'Lower-mass stars like the Sun mainly use the proton–proton chain', 'More massive stars have hotter cores and mainly use the CNO cycle, with carbon acting as a catalyst'], model: 'Main-sequence stars produce energy by nuclear fusion of hydrogen into helium in their cores. The helium nucleus has slightly less mass than the four protons that formed it, and this mass defect is released as energy according to $E = mc^2$. Stars around the mass of the Sun mainly use the proton–proton chain. More massive stars have hotter cores, so the CNO cycle dominates, in which carbon, nitrogen and oxygen nuclei act as catalysts for turning hydrogen into helium.' },
    ],
  });
  m8.bank = [
    function hubble() {
      const H0 = 70, d = pick([20, 50, 120, 250, 400, 800]), v = H0 * d, v2 = pick([3500, 7000, 14000, 21000]);
      return {
        level: 'F', tags: ['8.1'], stem: `Take ${m('H_0 = 70')} km/s/Mpc.`,
        parts: [
          P('a', `How fast is a galaxy ${d} Mpc away receding (km/s)?`, 'num', v, S3(v, 'km/s'), [m(`v = H_0d = 70 \\times ${d} = ${v}`)], 1, TOL),
          P('b', `How far away is a galaxy receding at ${v2} km/s (Mpc)?`, 'num', v2 / H0, S3(v2 / H0, 'Mpc'), [m(`d = \\frac{v}{H_0} = \\frac{${v2}}{70} = ${sci(v2 / H0)}`)], 1, TOL),
        ],
      };
    },
    function bohr() {
      const nf = pick([1, 2, 2, 3]), ni = nf + ri(1, 3), inv = Ryd * (1 / nf ** 2 - 1 / ni ** 2), lam = 1 / inv, E = h * c / lam / e;
      const series = { 1: 'Lyman (ultraviolet)', 2: 'Balmer (visible)', 3: 'Paschen (infrared)' };
      return {
        level: 'S', tags: ['8.3'], stem: `An electron in a hydrogen atom drops from ${m(`n = ${ni}`)} to ${m(`n = ${nf}`)}.`,
        parts: [
          P('a', 'Find the wavelength of the emitted photon (nm).', 'num', lam * 1e9, S3(lam * 1e9, 'nm'), [m(`\\frac{1}{\\lambda} = 1.097 \\times 10^7\\left(\\frac{1}{${nf * nf}} - \\frac{1}{${ni * ni}}\\right) = ${sci(inv)}`), m(`\\lambda = ${sci(lam)}\\text{ m} = ${sci(lam * 1e9)}\\text{ nm}`)], 2, TOL),
          P('b', 'Find the photon energy (eV).', 'num', E, S3(E, 'eV'), [m(`E = \\frac{hc}{\\lambda} = ${sci(E * e)}\\text{ J} = ${sci(E)}\\text{ eV}`)], 1, TOL),
          CH('c', 'Which series is this line in?', series[nf], Object.values(series), [`Transitions down to ${m(`n = ${nf}`)}`]),
        ],
      };
    },
    function deBroglie() {
      const isE = Math.random() < 0.6, mass = isE ? me : mp, v = pick([1, 2, 4, 6]) * 10 ** (isE ? 6 : 4), lam = h / (mass * v);
      return {
        level: 'S', tags: ['8.3'], stem: `${isE ? 'An electron' : 'A proton'} travels at ${m(sci(v))} m/s.`,
        parts: [P('a', 'Find its de Broglie wavelength (m).', 'num', lam, S3(lam, 'm'), [m(`\\lambda = \\frac{h}{mv} = \\frac{6.626 \\times 10^{-34}}{${sci(mass, 4)} \\times ${sci(v)}}`), m(`= ${sci(lam)}\\text{ m}`)], 2, TOL)],
      };
    },
    function halfLife() {
      const m0 = pick([40, 64, 80, 120, 200]), th = pick([2, 5, 8, 12, 30]), t = th * pick([1.5, 2, 2.5, 3, 4]), mt = m0 * 0.5 ** (t / th), lam = Math.log(2) / th;
      return {
        level: 'F', tags: ['8.4'], stem: `A sample contains ${m0} g of an isotope with a half-life of ${th} days.`,
        parts: [
          P('a', `How much is left after ${t} days (g)?`, 'num', mt, S3(mt, 'g'), [m(`m = ${m0}\\left(\\frac{1}{2}\\right)^{${t}/${th}} = ${sci(mt)}`)], 2, TOL),
          P('b', `Find the decay constant (per day).`, 'num', lam, S3(lam, 'day⁻¹'), [m(`\\lambda = \\frac{\\ln 2}{t_{1/2}} = \\frac{0.693}{${th}} = ${sci(lam)}`)], 1, TOL),
        ],
      };
    },
    function bindingEnergy() {
      const A = pick([4, 7, 12, 16, 56]), dm = { 4: 0.0304, 7: 0.0421, 12: 0.0990, 16: 0.1370, 56: 0.5285 }[A], E = dm * 931.5;
      const name = { 4: 'helium-4', 7: 'lithium-7', 12: 'carbon-12', 16: 'oxygen-16', 56: 'iron-56' }[A];
      return {
        level: 'C', tags: ['8.4'], stem: `The mass defect of a ${name} nucleus is ${dm} u.`,
        parts: [
          P('a', 'Find its binding energy (MeV).', 'num', E, S3(E, 'MeV'), [m(`E = \\Delta m \\times 931.5 = ${dm} \\times 931.5 = ${sci(E)}`)], 2, TOL),
          P('b', 'Find the binding energy per nucleon (MeV).', 'num', E / A, S3(E / A, 'MeV'), [m(`\\frac{${sci(E)}}{${A}} = ${sci(E / A)}`)], 1, TOL),
        ],
      };
    },
  ];

  return { DECKS: [m5, m6, m7, m8] };
})();
if (typeof module !== 'undefined') module.exports = PH;
