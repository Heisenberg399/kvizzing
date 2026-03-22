// --- Quiz Data ---
// "KVizzing Funda" Edition
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
        question: "The code for the first space shuttle launch was written in a now-obscure programming language developed by NASA/JPL. It was named after the English mathematician who is considered the first computer programmer. What is the language?",
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
    },
    {
        question: "Derived from the Arabic word for 'the commander', this naval rank is the highest in many English-speaking navies. The word 'admiral' comes from a longer Arabic phrase meaning 'commander of the... what?",
        answer: "Sea",
        hint: "Think about where navies operate."
    },
    {
        question: "What ubiquitous household item, invented by Walter Hunt in 1849 to pay off a $15 debt, was originally called the 'dress pin' and is famous for its clasp that protects the user from the sharp point?",
        answer: "Safety Pin",
        hint: "It's safe because the pointy end is covered."
    },
    {
        question: "The name of this Italian pasta translates literally to 'little worms'. It is slightly thicker than spaghetti and often used in seafood dishes. What is it called?",
        answer: "Vermicelli",
        hint: "Think 'vermin' but pasta."
    },
    {
        question: "Created in 1937, this canned meat product became a staple for Allied troops during WWII. Its name is widely believed to be a portmanteau of 'Spiced Ham', though the company claims only a few executives know the real meaning. What is it?",
        answer: "Spam",
        hint: "It later became the word for junk email thanks to a Monty Python sketch."
    },
    {
        question: "This term for a deceptive or false maneuver to distract an opponent originally referred to a method of training hunting dogs. They would drag a strong-smelling smoked fish across the trail to see if the dogs would lose the scent. What is the term?",
        answer: "Red Herring",
        hint: "It's a color and a fish."
    },
    {
        question: "In the 1800s, this chemical element was used extensively in green dyes for wallpaper and dresses in Victorian England, leading to slow poisoning. It is famously rumored to have contributed to Napoleon's death in exile. What is it?",
        answer: "Arsenic",
        hint: "Atomic number 33, known as the 'king of poisons'."
    },
    {
        question: "This punctuation mark (‽) combines a question mark and an exclamation point, intended for rhetorical or exclamatory questions like 'What are you doing‽'. Invented by an ad agency head in 1962, what is it called?",
        answer: "Interrobang",
        hint: "Combines 'interrogation' and slang for an exclamation mark."
    },
    {
        question: "The origin of this word for 'left-handed' comes from Latin and historically carried connotations of evil, unlucky, or inauspicious, reflecting societal bias against left-handedness. What is the word?",
        answer: "Sinister",
        hint: "Opposite of 'Dexter'."
    },
    {
        question: "Named after the Greek goddess of retribution, this word describes an inescapable agent of someone's downfall or a long-standing rival. What is it?",
        answer: "Nemesis",
        hint: "Holmes to Moriarty, Batman to Joker."
    },
    {
        question: "During WWI, the British military needed a code name to disguise the development of their new armored fighting vehicles. They told workers they were building mobile water receptacles for the frontline, leading to what everyday name?",
        answer: "Tank",
        hint: "Like a water tank."
    },
    {
        question: "This phenomenon explains why you might learn a new obscure word or fact, and suddenly start seeing it everywhere. It is officially known as the frequency illusion, but more commonly goes by what hyphenated name?",
        answer: "Baader-Meinhof Phenomenon",
        hint: "Named after a German militant group, oddly enough."
    },
    {
        question: "In aviation, the acronym 'Mayday', used internationally as a distress signal, comes from the phonetic pronunciation of which French phrase?",
        answer: "M'aidez",
        hint: "It translates to 'help me'."
    },
    {
        question: "This famous 15th-century manuscript is written entirely in an unknown, unsolved language or cipher and is heavily illustrated with bizarre plants and astrological diagrams. It is currently held at Yale University. What is it called?",
        answer: "Voynich Manuscript",
        hint: "Named after the Polish book dealer who bought it in 1912."
    },
    {
        question: "The standard 'QWERTY' keyboard layout was designed in the 1870s not to speed up typing, but to slow it down. Why?",
        answer: "To prevent typewriter keys from jamming",
        hint: "Mechanical arms hitting each other was a problem."
    },
    {
        question: "This word, meaning a complete failure or disaster, comes from a 19th-century French term for a bottle wrapped in straw, which was notoriously fragile and prone to breaking. What is the word?",
        answer: "Fiasco",
        hint: "Rhymes with tabasco."
    },
    {
        question: "The popular game 'Jenga' gets its name from the Swahili word meaning what action?",
        answer: "To build",
        hint: "Which is ironic, since the game usually ends when it falls."
    },
    {
        question: "This term describes the metallic smell produced when skin touches coins or iron railings. Surprisingly, metals have no smell; the scent is actually a compound called 1-octen-3-one produced by what interacting with the metal?",
        answer: "Skin oils",
        hint: "Specifically, lipid peroxides breaking down on human skin."
    },
    {
        question: "In 1982, Scott Fahlman proposed using the sequence :-) to indicate a joke on a Carnegie Mellon message board, inadvertently creating what digital communication staple?",
        answer: "Emoticon",
        hint: "The precursor to the emoji."
    },
    {
        question: "This brand of adhesive bandage was invented by Earle Dickson in 1920 for his wife, who frequently burned and cut herself while cooking. He attached small pieces of sterile gauze to the center of surgical tape. What is the brand?",
        answer: "Band-Aid",
        hint: "It has become a genericized trademark for any adhesive bandage."
    },
    {
        question: "The name of this geometric shape, featuring 20 equal triangular faces, comes from the Greek prefixes for 'twenty' and 'seat/face'. It is famous as the shape of the d20 die in Dungeons & Dragons. What is it?",
        answer: "Icosahedron",
        hint: "Icosa- means twenty."
    },
    {
        question: "This 1999 sci-fi movie popularized 'bullet time' visual effects. The famous green cascading code shown on screens throughout the film was actually created by scanning recipes from what type of cookbook?",
        answer: "Sushi",
        hint: "Japanese cuisine."
    },
    {
        question: "The name of the Bluetooth wireless technology standard honors a 10th-century Scandinavian king who united divided Danish tribes, just as the technology was intended to unite different communication protocols. What was his name?",
        answer: "Harald Bluetooth",
        hint: "His actual surname was Gormsson; Bluetooth was his colorful nickname."
    },
    {
        question: "The phrase 'Rule of Thumb' is often falsely claimed to originate from an old English law allowing a man to beat his wife with a stick no thicker than his thumb. In reality, it likely relates to what common everyday activity?",
        answer: "Measurement",
        hint: "Using body parts as rough tools for carpentry or tailoring."
    },
    {
        question: "In Greek mythology, she was the first human woman created by the gods. Given a jar (mistranslated later as a box) and told not to open it, she did, releasing all evils into the world but leaving 'Hope' inside. Who is she?",
        answer: "Pandora",
        hint: "Her name means 'all-gifted'."
    },
    {
        question: "When you get 'goosebumps' from feeling cold or experiencing strong emotions, it is caused by the contraction of tiny muscles called arrectores pilorum at the base of hair follicles. This reflex, useful for animals to look larger or trap heat, is called what?",
        answer: "Piloerection",
        hint: "Pilo- refers to hair."
    },
    {
        question: "Before the invention of the eraser in 1770 by Edward Nairne, people commonly used what food item to rub out lead pencil marks?",
        answer: "Crustless bread",
        hint: "It involves dough."
    },
    {
        question: "In heraldry, a 'chevron' is an inverted V-shape. What architectural feature, essential for a house's structural integrity, shares this French-derived name because of its shape?",
        answer: "Rafter",
        hint: "Part of the framework for a roof."
    },
    {
        question: "This common phrase meaning 'to reveal a secret' has origins in medieval markets. Farmers would sometimes substitute a cheaper animal (like a cat) for a piglet inside a sack. If the sack was opened early, the scam was revealed. What is the phrase?",
        answer: "Let the cat out of the bag",
        hint: "Meow."
    },
    {
        question: "Which iconic Video Game character was originally known as 'Jumpman' in his 1981 arcade debut before being renamed after the landlord of Nintendo's American warehouse?",
        answer: "Mario",
        hint: "He's a famous plumber."
    },
    {
        question: "The medical term for an ice-cream headache or 'brain freeze' is sphenopalatine ganglioneuralgia. It occurs because the rapid cooling and warming of capillaries in the roof of your mouth sends pain signals to what major facial nerve bundle?",
        answer: "Trigeminal nerve",
        hint: "It handles sensation in the face."
    },
    {
        question: "The ubiquitous 'ZIP' code system introduced by the US Postal Service in 1963 was designed to speed up mail sorting. What does the acronym ZIP actually stand for?",
        answer: "Zone Improvement Plan",
        hint: "Z.I.P."
    },
    {
        question: "In the 1630s, the Dutch Republic experienced an economic bubble where the contract prices for bulbs of a recently introduced flower reached extraordinarily high levels before collapsing. What was this period called?",
        answer: "Tulip Mania",
        hint: "Involves a famous Dutch flower."
    },
    {
        question: "The name of this dinosaur translates to 'fast seizer' or 'swift thief'. Thanks to Jurassic Park, it is widely misunderstood; the real animal was roughly the size of a turkey and covered in feathers. What is it?",
        answer: "Velociraptor",
        hint: "Clever girl."
    },
    {
        question: "This everyday item was invented by George de Mestral in 1941 after he noticed how easily cocklebur seeds stuck to his dog’s fur during a walk. Under a microscope, he saw tiny hooks catching on loops of hair. What did he invent?",
        answer: "Velcro",
        hint: "Hook-and-loop fastener."
    },
    {
        question: "What extremely hard, dense form of carbon, scoring a perfect 10 on the Mohs hardness scale, gets its name from the ancient Greek word 'adamas', meaning 'unalterable' or 'unbreakable'?",
        answer: "Diamond",
        hint: "Often used in jewelry and cutting tools."
    },
    {
        question: "The term for a 'baker's dozen' (meaning 13 instead of 12) originated in medieval England to avoid severe punishment. What were bakers trying to prevent by throwing in an extra loaf?",
        answer: "Shortchanging customers",
        hint: "Laws strictly regulated the weight of bread; being under-weight resulted in fines or whippings."
    },
    {
        question: "This famous 1818 novel, subtitled 'The Modern Prometheus', was conceived by its 18-year-old author during a rainy summer in Switzerland as part of a ghost story competition among friends, including Lord Byron. What is the novel?",
        answer: "Frankenstein",
        hint: "Written by Mary Shelley."
    },
    {
        question: "The 'M's in M&M's stand for the last names of the two candy makers who created them in 1941. One was Forrest Mars. The other was the son of the president of the Hershey Company. What was his last name?",
        answer: "Murrie",
        hint: "Bruce ___"
    },
    {
        question: "A 'jiffy' is an actual unit of measurement, not just a casual expression. In physics and computer science, what does it measure?",
        answer: "Time",
        hint: "It generally refers to a very short duration, like the time it takes light to travel one centimeter."
    },
    {
        question: "Which popular snack food was originally created at Disneyland in the mid-1960s using leftover tortillas that were cut up, fried, and seasoned, saving the park money on food waste?",
        answer: "Doritos",
        hint: "Casa de Fritos produced them."
    },
    {
        question: "This English idiom meaning 'to be completely wrong' originally comes from archery, where missing the target entirely meant you failed to hit the central wooden peg holding the target together. What is the idiom?",
        answer: "Off the mark",
        hint: "Alternatively, 'missing the mark'."
    },
    {
        question: "In 1799, near a town in the Nile Delta, French soldiers discovered a granodiorite stele inscribed with three versions of a decree. It became the key to deciphering ancient Egyptian hieroglyphs. What is it known as?",
        answer: "Rosetta Stone",
        hint: "Named after the town, Rashid (Rosetta) in Egypt."
    },
    {
        question: "What is the only letter in the English alphabet that does not appear in the name of any US state?",
        answer: "Q",
        hint: "Check every state from Alabama to Wyoming."
    },
    {
        question: "The recognizable 'swoosh' logo of this massive sports apparel brand was designed in 1971 by a graphic design student named Carolyn Davidson. She was paid just $35 for it at the time. What is the brand?",
        answer: "Nike",
        hint: "The Greek goddess of victory."
    },
    {
        question: "What common kitchen appliance was accidentally invented by Percy Spencer in 1945 when he noticed a chocolate bar in his pocket had melted while he was working on active radar sets?",
        answer: "Microwave Oven",
        hint: "He used a magnetron to pop popcorn next."
    }
];
