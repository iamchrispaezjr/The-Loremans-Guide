/**
 * Loreman's Spellbook — spell catalog
 * Tiers run 1–100. Classifications are stubs until lore is filled in.
 */
window.SPELLBOOK = {
  wikiName: "The Loreman's Spellbook",
  wikiTagline: "A compendium of the spoken arts, ordered by tier.",
  maxTier: 100,
  classificationSlots: ["School", "Casting Method", "Alignment", "Rarity"],
  spells: [
    {
      id: "fire",
      name: "Fire",
      tier: 1,
      incantation: "Ignis",
      incantationGloss: "fire",
      element: "Fire",
      classifications: {
        School: "",
        "Casting Method": "",
        Alignment: "",
        Rarity: "",
      },
      categories: ["Elemental", "Primordial", "Offensive"],
      effects: [
        {
          name: "Spark",
          summary: "A candle-sized flame appears in the caster's palm or at a nearby point.",
        },
        {
          name: "Ignite",
          summary: "Dry tinder, cloth, or oil catches fire on contact with the conjured flame.",
        },
        {
          name: "Emberlight",
          summary: "The flame sheds a warm glow sufficient to read by in darkness.",
        },
      ],
      description:
        "Fire is the first of the four primordial workings and the simplest expression of heat given will. Spoken as Ignis, it draws a thread of combustion from the caster and pins it in the air as true flame. Novices learn it as a light and a warning; later tiers of the same lineage are said to swell from this single word.",
    },
    {
      id: "earth",
      name: "Earth",
      tier: 1,
      incantation: "Terra",
      incantationGloss: "earth / ground",
      element: "Earth",
      classifications: {
        School: "",
        "Casting Method": "",
        Alignment: "",
        Rarity: "",
      },
      categories: ["Elemental", "Primordial", "Defensive"],
      effects: [
        {
          name: "Settle",
          summary: "Loose soil packs firm underfoot, steadying the caster's stance.",
        },
        {
          name: "Mound",
          summary: "A small rise of dirt or gravel heaves up, enough to trip or to kneel behind.",
        },
        {
          name: "Grasp of Dust",
          summary: "A handful of earth lifts and hangs in the air until the word is released.",
        },
      ],
      description:
        "Earth is the grounding art among the four foundations. The incantation Terra calls on weight, grain, and stone as they already lie in the world, asking them to move rather than creating them from nothing. It is the first lesson in solidity: a spell that answers slowly, then holds.",
    },
    {
      id: "air",
      name: "Air",
      tier: 1,
      incantation: "Ventus",
      incantationGloss: "wind",
      element: "Air",
      classifications: {
        School: "",
        "Casting Method": "",
        Alignment: "",
        Rarity: "",
      },
      categories: ["Elemental", "Primordial", "Utility"],
      effects: [
        {
          name: "Gust",
          summary: "A short burst of wind shoves smoke, papers, or a light object aside.",
        },
        {
          name: "Breath",
          summary: "Stale air in a small space is exchanged for a clean current.",
        },
        {
          name: "Veil",
          summary: "A ribbon of moving air can nudge a falling leaf or turn a thrown dart.",
        },
      ],
      description:
        "Air is the lightest of the primordial four, spoken as Ventus — wind, not merely the empty sky. The working does not summon a storm; it borrows a breath already in the room and gives it direction. Casters use it to clear a workspace, fill a sail a few yards, or feel the pull of later, harsher winds.",
    },
    {
      id: "water",
      name: "Water",
      tier: 1,
      incantation: "Aqua",
      incantationGloss: "water",
      element: "Water",
      classifications: {
        School: "",
        "Casting Method": "",
        Alignment: "",
        Rarity: "",
      },
      categories: ["Elemental", "Primordial", "Support"],
      effects: [
        {
          name: "Draught",
          summary: "A cupful of clean water gathers in a vessel or in the caster's hands.",
        },
        {
          name: "Douse",
          summary: "The conjured water can smother a small flame or wet a patch of ground.",
        },
        {
          name: "Slick",
          summary: "A thin film of moisture makes a smooth surface treacherous for a few paces.",
        },
      ],
      description:
        "Water is the flowing foundation, called with Aqua. It answers as a stream, a veil, or a draught, and it will not stay still for long. Of the four first spells it is the one most often turned toward mercy — thirst, fever, fire — though the same word that fills a cup can also steal a foothold.",
    },
  ],
};
