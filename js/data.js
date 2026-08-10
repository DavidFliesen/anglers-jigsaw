const waters = [
  {
    "id": "farm-pond",
    "name": "Farm Pond",
    "tagline": "Cast around weed edges, docks, and quiet water for classic pond fish.",
    "species": [
      "largemouth-bass",
      "bluegill",
      "channel-catfish"
    ],
    "hotspots": [
      "Lily Pads",
      "Dock Corner",
      "Open Water"
    ]
  },
  {
    "id": "mountain-stream",
    "name": "Mountain Stream",
    "tagline": "Cool runs, pocket water, and deep bends hold trout in the current.",
    "species": [
      "rainbow-trout",
      "brook-trout"
    ],
    "hotspots": [
      "Current Seam",
      "Pool Tailout",
      "Under the Bank"
    ]
  },
  {
    "id": "coastal-marsh",
    "name": "Coastal Marsh",
    "tagline": "Sight-cast the edges for tailing fish and marsh ambush predators.",
    "species": [
      "red-drum"
    ],
    "hotspots": [
      "Oyster Edge",
      "Grass Line",
      "Tidal Cut"
    ]
  }
];

const speciesData = {

  "largemouth-bass": {
    id: "largemouth-bass",
    commonName: "Largemouth Bass",
    scientificName: "Micropterus salmoides",
    description: "A powerful freshwater predator known for explosive strikes and life around cover like weeds, timber, and docks.",
    history: "Native mostly to eastern and central North America, largemouth bass helped shape modern recreational and tournament fishing in the United States.",
    water: "Farm Pond",
    image: "assets/fish/largemouth-bass.svg"
  },
  "bluegill": {
    id: "bluegill",
    commonName: "Bluegill",
    scientificName: "Lepomis macrochirus",
    description: "A favorite panfish with a deep body, eager bite, and blue-tinted gill cover.",
    history: "Bluegill have long been one of the gateway species for young anglers and remain one of the most common and beloved freshwater fish in America.",
    water: "Farm Pond",
    image: "assets/fish/bluegill.svg"
  },
  "channel-catfish": {
    id: "channel-catfish",
    commonName: "Channel Catfish",
    scientificName: "Ictalurus punctatus",
    description: "A whiskered bottom-dweller prized for both sport and the table, often found in rivers, lakes, and ponds.",
    history: "Channel catfish became one of the most widely stocked and harvested catfish species in the United States because of their adaptability and popularity.",
    water: "Farm Pond",
    image: "assets/fish/channel-catfish.svg"
  },
  "rainbow-trout": {
    id: "rainbow-trout",
    commonName: "Rainbow Trout",
    scientificName: "Oncorhynchus mykiss",
    description: "A cold-water trout known for its sleek body, rosy stripe, and love of clear, oxygen-rich streams.",
    history: "Originally native to Pacific drainage waters in western North America, rainbow trout were spread widely through stocking and became one of the world's best-known sportfish.",
    water: "Mountain Stream",
    image: "assets/fish/rainbow-trout.svg"
  },
  "brook-trout": {
    id: "brook-trout",
    commonName: "Brook Trout",
    scientificName: "Salvelinus fontinalis",
    description: "A beautifully marked native char of cool creeks and forested streams.",
    history: "Brook trout are native to the eastern United States and Canada and are especially treasured in Appalachian waters for their beauty and heritage.",
    water: "Mountain Stream",
    image: "assets/fish/brook-trout.svg"
  },
  "red-drum": {
    id: "red-drum",
    commonName: "Red Drum",
    scientificName: "Sciaenops ocellatus",
    description: "An iconic inshore gamefish known as redfish, often found cruising marshes, flats, and coastal shallows.",
    history: "Red drum are a hallmark species along the Atlantic and Gulf coasts, deeply tied to southern coastal angling culture and estuary conservation.",
    water: "Coastal Marsh",
    image: "assets/fish/red-drum.svg"
  }
};
