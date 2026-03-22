// --- Quiz Data ---
// "KVizzing Funda" Edition
const quizData = [
    {
        question: "In 1993, a programmer named Lou Montulli invented a new HTML tag to enliven the early web. It caused text to toggle visibility rapidly and is now universally despised by web designers. The tag was famously used on poorly designed 90s Geocities pages. What is the name of this deprecated tag, which shares its name with a reflexive, involuntary eyelid movement?",
        answer: "Blink",
        hint: "It happens when your eyes are dry or something gets too close."
    },
    {
        question: "The name of this ubiquitous painkiller has a fascinating origin. It comes from a mispronunciation of the Greek word for 'salicylic acid', its active ingredient which was originally extracted from willow tree bark. The German pharmaceutical giant Bayer officially trademarked the name in 1899. What is this medicine, technically called acetylsalicylic acid?",
        answer: "Aspirin",
        hint: "Take two of these and call me in the morning."
    },
    {
        question: "In chess strategy, there is a specific and unique condition where a pawn captures an opponent's pawn without ever landing on the square that the captured piece occupied. It can only occur immediately after an opponent moves their pawn two squares forward from its starting position. What is the French term for this move, translating literally to 'in passing'?",
        answer: "En Passant",
        hint: "Holy hell."
    },
    {
        question: "Rooted in Zen Buddhism, this Japanese aesthetic philosophy is centered on the acceptance of transience and imperfection. It embraces the beauty of things that are modest, humble, and unconventional. It is perfectly illustrated by the art of 'kintsugi', where broken pottery is repaired with gold, making the flaws part of the object's history rather than something to hide. What is this two-word rhyming term?",
        answer: "Wabi Sabi",
        hint: "Sounds like a spicy green condiment, but repeated."
    },
    {
        question: "In the 1890s, the 'Automatic Booth Company' created the first mechanical voting machines used in US elections. Over time, when the machines broke down, polling places would descend into chaos. Legend says this gave rise to an English word denoting total disorder and confusion. Even though this origin story is a myth (the word actually comes from the Latin for 'footstool' and later meat benches), what word is this?",
        answer: "Shambles",
        hint: "When my room is profoundly messy, it is in a state of..."
    },
    {
        question: "When the US Department of Defense needed a unified programming language in the 1970s, they hosted an international competition. The winning language, chosen in 1983, was eventually used for the Space Shuttle, commercial aviation, and high-speed rail. It was named in honor of a 19th-century English mathematician—the daughter of Lord Byron—who is widely considered to have written the world's first computer algorithm for Charles Babbage's Analytical Engine. What is the name of this language?",
        answer: "Ada",
        hint: "A three-letter palindrome."
    },
    {
        question: "In 1994, Vincent Connare, a typographic engineer at Microsoft, noticed that a beta release of the program 'Microsoft Bob' used Times New Roman in the comic balloons of its cartoon dog assistant. Feeling it was inappropriate, he designed a new, friendly font based on the lettering found in Batman and Watchmen graphic novels. Today, it is widely considered the most hated font in professional design. What is it?",
        answer: "Comic Sans",
        hint: "The name literally means 'humorous without serifs'."
    },
    {
        question: "In 1901, a sponge diver seeking shelter from a storm anchored near a small Greek island. Exploring the sea floor, he discovered a 2,000-year-old shipwreck containing a heavily encrusted, geared bronze mechanism. Dated to roughly 100 BC, it is now famous as the world's first analog computer, capable of predicting eclipses and tracking the four-year cycle of athletic games. What is this device named after the island where it was found?",
        answer: "Antikythera Mechanism",
        hint: "Indiana Jones searched for the 'Dial of Destiny', which was based on this real artifact."
    },
    {
        question: "The history of the telephone keypad is full of strange design choices. When Bell Labs added the asterisk and the pound sign to their keypads in the 1960s, a researcher named Don MacPherson needed a formal name for the pound symbol (#) to use in manuals. He allegedly coined an absurd word combining the prefix for 'eight' (referring to the symbol's eight points) with the last name of athlete Jim Thorpe. What is this obscure cartographic name for the hashtag symbol?",
        answer: "Octothorpe",
        hint: "Octo-(something)."
    },
    {
        question: "The standard gauge width for railway tracks across North America and much of Europe is an oddly specific 4 feet, 8.5 inches. Historians trace this peculiar dimension back centuries to the design of Roman war chariots. The chariots were built to this exact width to accommodate the side-by-side rear ends of two of which specific, large domesticated animals?",
        answer: "Horses",
        hint: "They pull carts."
    },
    {
        question: "In December 1872, an American merchant brigantine was discovered drifting aimlessly in the mid-Atlantic Ocean. Strikingly, the cargo of denatured alcohol was untouched, a meal was set on the table, and six month's worth of food remained. However, the entire crew, along with the captain's wife and daughter, had vanished without a trace, and no one from the ship was ever seen again. What is the famous name of this quintessential 'ghost ship'?",
        answer: "Mary Celeste",
        hint: "Two names: A common biblical female name, followed by a word meaning 'heavenly'."
    },
    {
        question: "Before it dominated the internet, the search engine developed by Larry Page and Sergey Brin at Stanford was originally called 'BackRub', a nod to the way the engine checked back-links to estimate a site's importance. When they finally rebranded, they chose a name inspired by a mathematical term (suggested by Milton Sirotta) for the number 1 followed by 100 zeros. What company is this?",
        answer: "Google",
        hint: "The mathematical term is spelled 'googol'."
    },
    {
        question: "The recognizable 'swoosh' logo of an iconic sportswear brand was designed in 1971 by Carolyn Davidson, a graphic design student at Portland State University. She billed the company a mere $35 for her work. The fluid shape is meant to convey motion and is said to represent the wing of the Greek goddess of victory, from whom the company takes its name. What is the brand?",
        answer: "Nike",
        hint: "Just do it."
    },
    {
        question: "In 1941, during a walk in the Swiss Alps, electrical engineer George de Mestral grew frustrated picking cocklebur seeds off his clothes and his dog's fur. Examining the burrs under a microscope, he discovered they were covered in hundreds of tiny, resilient hooks that snagged onto the small loops of thread in fabric. Inspired, he spent the next decade patenting a two-sided hook-and-loop fastening system. What did he invent?",
        answer: "Velcro",
        hint: "A portmanteau of the French words 'velours' (velvet) and 'crochet' (hook)."
    },
    {
        question: "The term for a bakers' batch of thirteen (instead of twelve) wasn't an act of generosity, but of fear. In medieval England, the Assize of Bread and Ale strictly regulated the price and weight of bread. If a baker sold a loaf that was underweight, the penalty was severe, often involving fines or a public flogging. To avoid any risk of being short-weight, bakers began throwing in an extra loaf with every order of twelve. What is the three-word phrase for this practice?",
        answer: "Bakers Dozen",
        hint: "Thirteen baked goods."
    },
    {
        question: "In 1816, a group of famous writers, including Lord Byron and Percy Shelley, were trapped inside a Swiss villa during a torrential rainstorm—the dreary 'Year Without a Summer'. To pass the time, they held a competition to see who could write the best horror story. Percy's 18-year-old future wife, Mary, won the contest by writing a tale about an ambitious scientist who creates a sapient creature in an unorthodox scientific experiment. What is the name of the novel?",
        answer: "Frankenstein",
        hint: "The monster is explicitly left unnamed in the novel; the title refers to the Doctor."
    },
    {
        question: "During World War II, the British military needed top-secret code names to hide the development of their terrifying new armored combat vehicles from enemy spies. Factory workers were told they were simply constructing mobile, motorized water receptacles for troops on the front lines. This deception was so successful that the fake cover name stuck permanently. What is the common, everyday name for these heavily armored track-laying vehicles?",
        answer: "Tank",
        hint: "It holds a large volume of liquid, or fires a large cannon."
    },
    {
        question: "The word for this popular geometric shape—used notably as the main die (d20) in tabletop games like Dungeons & Dragons—comes directly from Greek roots. The suffix '-hedron' means 'face' or 'seat'. The prefix comes from the Greek word 'eikosi'. Knowing the shape has exactly 20 equilateral triangular faces, what is the geometric name of this solid?",
        answer: "Icosahedron",
        hint: "Starts with an 'I' and ends with 'hedron'."
    },
    {
        question: "In the 1630s, the Dutch Republic experienced one of the first recorded speculative economic bubbles in history. The contract prices for the bulbs of a recently introduced, vibrant, and incredibly fashionable flower reached extraordinarily high levels. At the peak, a single bulb sold for more than ten times the annual income of a skilled craftsman, before the market abruptly crashed. What is this famous historical period known as?",
        answer: "Tulip Mania",
        hint: "Involves Amsterdam's favorite flower."
    },
    {
        question: "Originally debuting in 1981 in a massive arcade hit, this iconic video game protagonist wasn't named after his profession. He was originally known simply as 'Jumpman'. However, during localization in America, Nintendo of America's Seattle warehouse was visited by their angry landlord demanding overdue rent. The developers cheekily decided to name the hero after this landlord. What is the character's name?",
        answer: "Mario",
        hint: "He wears a red hat and has a brother named Luigi."
    },
    {
        question: "In medieval markets, a common scam involved farmers substituting a cheap animal—like a stray feline—inside a tied burlap sack instead of the expensive suckling pig the customer thought they were buying. If the customer wised up and opened the sack before paying, the scam was revealed. This historical fraud gives us what common English idiom meaning 'to accidentally reveal a secret'?",
        answer: "Let the cat out of the bag",
        hint: "Meow."
    },
    {
        question: "In 1945, engineer Percy Spencer was working on active radar sets for the defense contractor Raytheon. One day, he noticed that a peanut cluster candy bar in his shirt pocket had mysteriously softened and melted while he was standing near an active magnetron. Intrigued, he placed popcorn kernels in front of the tube, and they successfully popped. What ubiquitous kitchen appliance did this accidental discovery lead to?",
        answer: "Microwave Oven",
        hint: "It uses electromagnetic radiation to heat food."
    },
    {
        question: "The origin of this English word meaning 'sinister' or 'inauspicious' reflects extreme historical prejudice. It comes directly from the Latin word meaning 'left' or 'on the left side'. Because left-handed people were statistically rare, the Romans associated the left side with evil omens and untrustworthiness. What is the word?",
        answer: "Sinister",
        hint: "The opposite of 'dexter' (right-handed/skillful)."
    },
    {
        question: "This specific smell—the earthy, distinctly pleasant scent that fills the air when rain falls on dry soil—is caused by an organic byproduct of soil bacteria called geosmin. The actual term for the smell was coined in 1964 by two Australian researchers who combined the Greek word for 'stone' (petra) with the mythical, golden fluid that flowed in the veins of the Greek gods (ichor). What is the word?",
        answer: "Petrichor",
        hint: "It sounds vaguely like a spell from Harry Potter."
    },
    {
        question: "This punctuation mark combines the functions of two common symbols. It is used to end a sentence that is simultaneously a question and an exclamation, conveying surprised disbelief (e.g., 'What are those!?'). It was invented in 1962 by advertising executive Martin Speckter, who named it by combining the Latin word for 'question' with printer's slang for an exclamation mark. What is this hybrid punctuation mark called?",
        answer: "Interrobang",
        hint: "Looks like ‽"
    }
];
