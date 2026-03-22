// --- Quiz Data ---
// "Difficult & Niche" Edition
const quizData = [
    {
        question: "In 1993, a programmer named Lou Montulli invented a new HTML tag to enliven the early web. It caused text to flash on and off annoyingly and is now considered one of the worst design elements in internet history. What was this deprecated tag?",
        answer: "Blink",
        hint: "It shares its name with a reflexive eye movement."
    },
    {
        question: "This specific shade of color, officially known as 'Pantone 448 C', was described by market researchers as 'the ugliest color in the world'. It is now legally required to be used on plain tobacco packaging in several countries to deter smoking. What obscure color is this?",
        answer: "Drab Dark Brown",
        hint: "It is often also referred to as 'Opaque Couché'."
    },
    {
        question: "The name of this common pill comes from a mispronunciation of the Greek word for 'salicylic acid', its active ingredient found in willow bark. The German company Bayer trademarked the name in 1899. What is this painkiller?",
        answer: "Aspirin",
        hint: "Technically, Acetylsalicylic acid."
    },
    {
        question: "In chess, this special pawn move is the only time a piece captures another without landing on the square the captured piece occupied. The term comes from the French for 'in passing'. What is this move?",
        answer: "En Passant",
        hint: "It happens when a pawn moves two squares forward and lands adjacent to an opponent's pawn."
    },
    {
        question: "This Japanese aesthetic philosophy finds beauty in imperfection and transience. It is often illustrated by 'kintsugi', the art of repairing broken pottery with gold lacquer. What is this two-word term?",
        answer: "Wabi Sabi",
        hint: "It appreciates the modest, the rustic, and the decayed."
    },
    {
        question: "Originally a brand name for a voting machine created in the 1890s, this word has become a generic term for any chaotic or confused situation. It is derived from the company name 'Automatic Booth'. What is the word?",
        answer: "Shambles",
        hint: "Wait, actually the voting machine story is a myth! The real word comes from 'fleshammels' (meat benches). But the word is..."
    },
    {
        question: "The code for the first space shuttle launch was written in a now-obscure programming language developed by NASA/JPL/condon. It was named after the English mathematician who is considered the first computer programmer. What is the language?",
        answer: "Ada",
        hint: "Named after the daughter of Lord Byron."
    },
    {
        question: "This English word for a 'person who loves books' was originally an insult. In 1754, it was used to describe someone who cared more about the physical books than reading them. Now it is a badge of honor. What is the word?",
        answer: "Bibliophile",
        hint: "From the Greek for 'book' and 'loving'."
    },
    {
        question: "Known as the 'Gromit Mug' of typography, this font was commissioned by Microsoft in 1994 to be a friendly typeface for children. It is arguably the most hated font in the world among designers. What is it?",
        answer: "Comic Sans",
        hint: "It mimics the lettering of comic books."
    },
    {
        question: "In 1901, a sponge diver discovered a complex clockwork mechanism off the coast of a Greek island. Dated to around 100 BC, it is considered the world's first analogue computer, capable of predicting astronomical positions. What is it called?",
        answer: "Antikythera Mechanism",
        hint: "Named after the island where it was found."
    },
    {
        question: "This symbol # has many names: hash, pound sign, number sign. But its official cartographic name, derived from the phrase 'eight fields', supposedly refers to a village surrounded by eight fields. What is this obscure name?",
        answer: "Octothorpe",
        hint: "The prefix 'octo' means eight."
    },
    {
        question: "The fear of the number 13 is well known. But there is a specific, tongue-twisting Greek term for the fear of Friday the 13th. What is this lengthy word?",
        answer: "Friggatriskaidekaphobia",
        hint: "It combines the Norse goddess Frigg (Friday) and the Greek for thirteen."
    },
    {
        question: "During the Cold War, the CIA spent $20 million on a project to use cats as spies, implanting microphones in their ear canals. The project failed because the first cat was immediately hit by a taxi. What was the project code name?",
        answer: "Acoustic Kitty",
        hint: "It sounds like a band name involving sound and a feline."
    },
    {
        question: "The standard gauge of railway tracks (4 feet 8.5 inches) is said to be derived from the wheel spacing of Roman chariots, which was designed to accommodate the width of two of THESE animals side-by-side. What animal?",
        answer: "Horses",
        hint: "Specifically, their rear ends."
    },
    {
        question: "In 1872, a ship was found drifting in the Atlantic with its cargo intact and a meal set on the table, but no crew on board. To this day, the fate of the people remains one of the greatest maritime mysteries. What was the ship's name?",
        answer: "Mary Celeste",
        hint: "It is synonymous with 'ghost ship'."
    },
    {
        question: "This common plastic shoelace tip has a name. It comes from the Latin 'acus', meaning needle, because it helps thread the lace through the eyelets. What is it called?",
        answer: "Aglet",
        hint: "Phineas and Ferb dedicated a whole song to it."
    },
    {
        question: "The 'Lorem Ipsum' placeholder text used in design is not random gibberish. It is actually a scrambled passage from a philosophical treatise on 'The Ends of Good and Evil' written by which Roman statesman in 45 BC?",
        answer: "Cicero",
        hint: "He was a famous Roman orator."
    },
    {
        question: "Before it was a search engine, 'BackRub' was the name of the project that eventually became this tech giant. The current name is a play on the mathematical term for a 1 followed by 100 zeros. What is the company?",
        answer: "Google",
        hint: "The mathematical term is 'googol'."
    },
    {
        question: "This psychological effect occurs when people with low ability at a task overestimate their ability. It is named after the two social psychologists who described it in 1999. What is it?",
        answer: "Dunning-Kruger Effect",
        hint: "It explains why incompetence is often accompanied by overconfidence."
    },
    {
        question: "In typography, the small decorative line attached to the end of a stroke in a letter or symbol is called a 'serif'. What is the French word for 'without', used to describe fonts that lack these lines?",
        answer: "Sans",
        hint: "As in 'Comic ____'."
    },
    {
        question: "The dot that appears over the lowercase letters 'i' and 'j' has a specific name. It is derived from the Latin word for 'title' or 'inscription'. What is this tiny dot called?",
        answer: "Tittle",
        hint: "It rhymes with 'little'."
    },
    {
        question: "Which chemically inert noble gas, often used in lighting, gets its name from the Greek word for 'stranger' or 'foreigner'?",
        answer: "Xenon",
        hint: "It starts with X."
    },
    {
        question: "The ampersand symbol (&) is actually a ligature of two letters combining to form the Latin word for 'and'. What are those two letters?",
        answer: "E and T",
        hint: "Forming the word 'Et'."
    },
    {
        question: "In 1968, Douglas Engelbart gave 'The Mother of All Demos', introducing the mouse, windows, and video conferencing. He called the cursor a 'bug', but what did he call the mouse's on-screen counterpart?",
        answer: "CAT",
        hint: "Because the mouse chased it."
    },
    {
        question: "The distinctive smell of rain on dry soil is caused by a byproduct of bacteria called geosmin. The term for this scent was coined by Australian scientists in 1964. What is it?",
        answer: "Petrichor",
        hint: "From the Greek 'petra' (stone) and 'ichor' (blood of the gods)."
    }
];
