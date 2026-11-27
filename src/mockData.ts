export interface Question {
  id: string
  text: string
  marks: number
  priority: 1 | 2 | 3
  answer: string
}

export interface Unit {
  id: string
  title: string
  fileName: string
  pageCount: number
  questions: Question[]
}

export interface Subject {
  id: string
  name: string
  units: Unit[]
}

export const subjects: Subject[] = [
  {
    id: 'physics',
    name: 'Physics',
    units: [
      {
        id: 'wave-optics',
        title: 'Unit 1: Wave optics',
        fileName: 'unit1- wave optics (1).pdf',
        pageCount: 18,
        questions: [
          {
            id: 'wavefront',
            text: 'State Huygens’ principle and explain how a wavefront propagates.',
            marks: 4,
            priority: 3,
            answer: 'Every point on a wavefront acts as a source of secondary wavelets. The new wavefront is the forward envelope of these wavelets.',
          },
          {
            id: 'youngs-fringe',
            text: 'Obtain the expression for fringe width in Young’s double-slit experiment.',
            marks: 5,
            priority: 3,
            answer: 'For slit separation d, screen distance D and wavelength λ, the fringe width is β = λD/d.',
          },
          {
            id: 'coherent',
            text: 'What are coherent sources? Why are they needed for sustained interference?',
            marks: 2,
            priority: 2,
            answer: 'Coherent sources have the same frequency and a constant phase difference. This keeps the positions of constructive and destructive interference stable.',
          },
          {
            id: 'diffraction',
            text: 'Distinguish between interference and diffraction.',
            marks: 3,
            priority: 1,
            answer: 'Interference is typically produced by waves from separate coherent sources. Diffraction is the spreading and superposition of wavelets from different parts of the same wavefront.',
          },
        ],
      },
      {
        id: 'laser',
        title: 'Unit 2: Laser',
        fileName: 'Unit 2 - Laser (1).pdf',
        pageCount: 14,
        questions: [
          {
            id: 'laser-properties',
            text: 'List the main properties of laser light.',
            marks: 3,
            priority: 2,
            answer: 'Laser light is highly monochromatic, coherent, directional and intense.',
          },
          {
            id: 'stimulated-emission',
            text: 'Explain stimulated emission of radiation.',
            marks: 4,
            priority: 3,
            answer: 'An incident photon can cause an excited atom to emit a second photon identical in energy, phase, direction and polarization.',
          },
          {
            id: 'population-inversion',
            text: 'Define population inversion and state why it is required in a laser.',
            marks: 2,
            priority: 3,
            answer: 'Population inversion occurs when more atoms occupy an excited energy state than a lower one. It allows stimulated emission to exceed absorption.',
          },
          {
            id: 'ruby-laser',
            text: 'Describe the construction and working of a ruby laser.',
            marks: 5,
            priority: 1,
            answer: 'A ruby laser uses a chromium-doped ruby rod between a fully reflecting and a partially reflecting mirror. Flash-lamp pumping creates population inversion; stimulated emission produces a pulsed red beam.',
          },
        ],
      },
    ],
  },
  {
    id: 'c-programming',
    name: 'C Programming',
    units: [
      {
        id: 'programming-basics',
        title: 'Unit 1: Programming basics',
        fileName: 'Unit 1 notes _CPC.docx.pdf',
        pageCount: 22,
        questions: [
          {
            id: 'algorithm',
            text: 'Define an algorithm and list two characteristics of a good algorithm.',
            marks: 3,
            priority: 2,
            answer: 'An algorithm is a finite sequence of unambiguous steps for solving a problem. It should be definite and terminate, and its steps should be effective.',
          },
          {
            id: 'c-program',
            text: 'Write the general structure of a C program.',
            marks: 4,
            priority: 3,
            answer: 'A C program commonly contains documentation, preprocessor directives, global declarations, the main function, local declarations, executable statements and user-defined functions.',
          },
          {
            id: 'data-types',
            text: 'Explain the basic data types available in C.',
            marks: 4,
            priority: 2,
            answer: 'C provides char for characters, int for integers, float and double for real numbers, and void for no value. Integer and floating types have modifiers such as short, long, signed and unsigned.',
          },
          {
            id: 'format-specifiers',
            text: 'What is the purpose of format specifiers in input and output functions?',
            marks: 2,
            priority: 1,
            answer: 'Format specifiers tell functions such as printf and scanf how to interpret or display a value, for example %d for an integer and %f for a floating-point value.',
          },
        ],
      },
      {
        id: 'operators',
        title: 'Unit 2: Operators',
        fileName: 'Unit 2 Operators.docx',
        pageCount: 16,
        questions: [
          {
            id: 'operator-types',
            text: 'Classify the operators available in C with examples.',
            marks: 5,
            priority: 2,
            answer: 'Common groups include arithmetic (+), relational (<), logical (&&), assignment (=), increment/decrement (++), bitwise (&), conditional (?:) and special operators such as sizeof.',
          },
          {
            id: 'precedence',
            text: 'What is operator precedence? Give one example.',
            marks: 3,
            priority: 3,
            answer: 'Precedence determines which operator is evaluated first. In 2 + 3 * 4, multiplication has higher precedence, so the result is 14.',
          },
          {
            id: 'logical-operators',
            text: 'Explain the logical AND and logical OR operators.',
            marks: 3,
            priority: 2,
            answer: 'The && operator is true only when both operands are true. The || operator is true when at least one operand is true. Both use short-circuit evaluation.',
          },
          {
            id: 'increment',
            text: 'Differentiate between pre-increment and post-increment.',
            marks: 2,
            priority: 1,
            answer: 'Pre-increment (++i) increments before its value is used in the expression. Post-increment (i++) uses the current value first, then increments.',
          },
        ],
      },
    ],
  },
  {
    id: 'bee',
    name: 'BEE',
    units: [
      {
        id: 'electrical-basics',
        title: 'Unit 1: Electrical basics',
        fileName: 'FEE-BEE Handbook - RSG - FEBTech 2026 - Circulation.pdf',
        pageCount: 20,
        questions: [
          {
            id: 'ohms-law',
            text: 'State Ohm’s law and write its mathematical form.',
            marks: 2,
            priority: 3,
            answer: 'At constant temperature, current through a conductor is directly proportional to the voltage across it. V = IR.',
          },
          {
            id: 'kirchhoff-laws',
            text: 'State Kirchhoff’s current law and voltage law.',
            marks: 4,
            priority: 3,
            answer: 'KCL: the algebraic sum of currents at a node is zero. KVL: the algebraic sum of voltages around a closed loop is zero.',
          },
          {
            id: 'power-factor',
            text: 'Define power factor in an AC circuit.',
            marks: 2,
            priority: 2,
            answer: 'Power factor is the ratio of real power to apparent power. For a sinusoidal circuit, it equals cos φ, where φ is the phase angle between voltage and current.',
          },
          {
            id: 'series-resistors',
            text: 'How do you calculate the equivalent resistance of resistors in series?',
            marks: 2,
            priority: 1,
            answer: 'Add the individual resistances: Rₑq = R₁ + R₂ + … + Rₙ.',
          },
        ],
      },
      {
        id: 'dc-circuits',
        title: 'Unit 2: DC circuits',
        fileName: 'FEE-BEE Handbook - RSG - FEBTech 2026 - Circulation.pdf',
        pageCount: 18,
        questions: [
          {
            id: 'thevenin',
            text: 'State Thevenin’s theorem for a linear network.',
            marks: 4,
            priority: 3,
            answer: 'Any linear two-terminal network can be replaced by an equivalent voltage source in series with a resistance, as seen from the terminals.',
          },
          {
            id: 'nodal-analysis',
            text: 'Outline the steps used in nodal analysis.',
            marks: 5,
            priority: 2,
            answer: 'Choose a reference node, assign voltages to the remaining nodes, apply KCL at each non-reference node, express branch currents using node voltages, then solve the simultaneous equations.',
          },
          {
            id: 'series-parallel',
            text: 'Find the equivalent resistance of a series-parallel resistor network.',
            marks: 3,
            priority: 2,
            answer: 'Reduce parallel groups using 1/Rₑq = Σ(1/Rᵢ), reduce series groups using Rₑq = ΣRᵢ, and repeat until one equivalent resistance remains.',
          },
          {
            id: 'maximum-power',
            text: 'State the maximum power transfer condition for a DC network.',
            marks: 2,
            priority: 1,
            answer: 'Maximum power is delivered to the load when its resistance equals the Thevenin resistance of the source network.',
          },
        ],
      },
    ],
  },
]
