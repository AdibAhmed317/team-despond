// Seed content. Shaped like the D1 rows the admin will manage later
// (services, projects, project_images), so src/server/content.ts is the only
// file that changes when the data moves to the database.

export type Photo = {
  /** 1280px Commons thumbnail (or, later, a Firebase Storage URL). */
  src: string
  width: number
  height: number
  alt: string
  position?: string
  /** Library stand-ins carry a credit; the client's own photos do not. */
  credit?: { name: string; href: string; license: string }
}

export type CategorySlug = 'film' | 'real-estate' | 'restaurants-cafes' | 'products'

export type Service = {
  slug: CategorySlug
  name: string
  /** The short name used in filters and the hero switcher. */
  short: string
  summary: string
  deliverables: string[]
  photo: Photo
}

export type Project = {
  slug: string
  title: string
  category: CategorySlug
  summary: string
  cover: Photo
  gallery: Photo[]
  video?: { provider: 'youtube' | 'vimeo'; id: string }
  client?: string
  location?: string
  services?: string[]
  year?: number
  featured: boolean
  /** Stand-in entry until Team Despond publishes real work from the admin. */
  sample: boolean
}

// Stand-ins are Wikimedia Commons files, downloaded into public/photos at
// 960/1280/1920 as `<key>-<width>.jpg` (file and path say where each came
// from). `src` is filled in below from the object key.
const commons = (
  _file: string,
  _path: string,
  width: number,
  height: number,
  alt: string,
  credit: Photo['credit'],
  position?: string,
): Photo => ({ src: `https://upload.wikimedia.org/wikipedia/commons/thumb/${_path}/${_file}/1280px-${_file}`, width, height, alt, position, credit })

/** srcset for the local stand-ins; other hosts (Firebase uploads) get none. */
export function srcSet(src: string): string | undefined {
  if (!src.includes('/1280px-')) return undefined
  return [960, 1280, 1920].map((w) => `${src.replace('/1280px-', `/${w}px-`)} ${w}w`).join(', ')
}

export const photos = {
  filmNight: commons(
    '1975_Plymouth_Valiant_Brougham_in_brown%2C_by_night.jpg', 'd/d2', 5400, 3228,
    "A 1970s sedan parked on a lit street at night, at the site of a film shoot",
    { name: "Mr.choppers", href: "https://commons.wikimedia.org/wiki/File:1975_Plymouth_Valiant_Brougham_in_brown,_by_night.jpg", license: 'CC BY-SA 3.0' },
    '55% 60%',
  ),
  cinemaCamera: commons(
    'Blackmagic_Design_Pocket_Cinema_Camera_4K_%2849140283266%29.jpg', 'c/c5', 5472, 3648,
    "A compact cinema camera body in close-up on a dark ground",
    { name: "Dennis Dudda", href: "https://commons.wikimedia.org/wiki/File:Blackmagic_Design_Pocket_Cinema_Camera_4K_(49140283266).jpg", license: 'CC BY 2.0' },
  ),
  clapper: commons(
    '11_fifty_9.jpg', '9/9b', 5472, 3648,
    "A clapperboard held up on the set of a short film",
    { name: "Chris K Udoh", href: "https://commons.wikimedia.org/wiki/File:11_fifty_9.jpg", license: 'CC BY-SA 4.0' },
  ),
  cameraCrew: commons(
    'Filming_of_Transformers_at_Edwards_AFB_2007-02-28_1.jpg', '2/29', 2448, 1944,
    "A camera assistant reloading a rigged cinema camera between shots",
    { name: "1st Lt. Brad Kimberly, USAF", href: "https://commons.wikimedia.org/wiki/File:Filming_of_Transformers_at_Edwards_AFB_2007-02-28_1.jpg", license: 'Public domain' },
  ),
  bondi: commons(
    'Bondi_from_above.jpg', '7/79', 3838, 2156,
    "Bondi Beach and its suburb seen from a drone above the water",
    { name: "Nick Ang", href: "https://commons.wikimedia.org/wiki/File:Bondi_from_above.jpg", license: 'CC BY-SA 4.0' },
    '50% 55%',
  ),
  kitchen: commons(
    'Modern_luxury_living_room_with_kitchen_interior.jpg', 'a/a0', 7360, 4912,
    "An open-plan living room and kitchen with dark joinery",
    { name: "Shixart1985", href: "https://commons.wikimedia.org/wiki/File:Modern_luxury_living_room_with_kitchen_interior.jpg", license: 'CC BY 2.0' },
  ),
  livingRoom: commons(
    'Living_Room%2C_Paul_Schweiker_House_and_Studio%2C_Meacham_Road%2C_Schaumburg%2C_IL_-_54210620494.jpg', '0/0b', 5712, 4284,
    "A modernist living room with timber ceiling beams and a long window",
    { name: "w_lemay", href: "https://commons.wikimedia.org/wiki/File:Living_Room,_Paul_Schweiker_House_and_Studio,_Meacham_Road,_Schaumburg,_IL_-_54210620494.jpg", license: 'CC BY-SA 2.0' },
  ),
  nswHouse: commons(
    'Minimalist_Modern_Residential_Architecture_in_Flemington%2C_New_South_Wales.jpg', '2/27', 5231, 3712,
    "A minimalist two-storey house in Flemington, New South Wales",
    { name: "Sardaka", href: "https://commons.wikimedia.org/wiki/File:Minimalist_Modern_Residential_Architecture_in_Flemington,_New_South_Wales.jpg", license: 'CC BY-SA 4.0' },
  ),
  dessert: commons(
    'Dessert_Mango_Sorbet_%26_Chocolate_Musse_Timbal_%288695093975%29.jpg', 'c/c5', 4047, 2698,
    "A plated dessert of mango sorbet and chocolate mousse on a dark table",
    { name: "Prayitno", href: "https://commons.wikimedia.org/wiki/File:Dessert_Mango_Sorbet_%26_Chocolate_Musse_Timbal_(8695093975).jpg", license: 'CC BY 2.0' },
  ),
  diningRoom: commons(
    'Interior_of_restaurant_Faro_in_Ruoholahti%2C_Helsinki.jpg', 'c/cf', 4032, 3024,
    "A restaurant dining room lit for a November evening",
    { name: "JIP", href: "https://commons.wikimedia.org/wiki/File:Interior_of_restaurant_Faro_in_Ruoholahti,_Helsinki.jpg", license: 'CC BY-SA 4.0' },
  ),
  lattePour: commons(
    'Latte_art_3.jpg', 'c/c6', 3442, 2290,
    "Milk poured into a latte, the rosetta forming",
    { name: "Kim Sanso", href: "https://commons.wikimedia.org/wiki/File:Latte_art_3.jpg", license: 'CC0' },
  ),
  latteHands: commons(
    'Latte_art_4.jpg', '8/8a', 3827, 2547,
    "Two hands holding a finished latte",
    { name: "Kim Sanso", href: "https://commons.wikimedia.org/wiki/File:Latte_art_4.jpg", license: 'CC0' },
  ),
  goldWatch: commons(
    'Corum_Coin_Watch-P5200012-black.jpg', '4/40', 3000, 3000,
    "A gold coin watch lit on a black ground",
    { name: "Rama", href: "https://commons.wikimedia.org/wiki/File:Corum_Coin_Watch-P5200012-black.jpg", license: 'CC BY-SA 3.0 fr' },
    '50% 50%',
  ),
  watch: commons(
    'Fashion-wristwatch-time-watch_%2824217032812%29.jpg', '0/04', 5616, 3744,
    "A steel wristwatch lying on dark wood",
    { name: "Pixel.la", href: "https://commons.wikimedia.org/wiki/File:Fashion-wristwatch-time-watch_(24217032812).jpg", license: 'CC0' },
  ),
  perfume: commons(
    'Perfume_glass_bottle.jpg', '7/79', 3648, 2736,
    "A ribbed glass perfume bottle with a black cap",
    { name: "Santeri Viinamäki", href: "https://commons.wikimedia.org/wiki/File:Perfume_glass_bottle.jpg", license: 'CC BY-SA 4.0' },
  ),
  cosmetics: commons(
    'Sada_LOBEY_2019.jpg', 'c/c8', 4360, 3352,
    "A skincare range of bottles and jars shot in the studio",
    { name: "LobeyLabs", href: "https://commons.wikimedia.org/wiki/File:Sada_LOBEY_2019.jpg", license: 'CC BY-SA 4.0' },
  ),
} satisfies Record<string, Photo>

export const services: Service[] = [
  {
    slug: 'film',
    name: 'Film production',
    short: 'Film',
    summary: 'Short films, commercials and promotional video, told as stories.',
    deliverables: [
      'Short films and cinematic filmmaking',
      'Commercial films and promotional videos',
      'Creative storytelling and visual production',
    ],
    photo: photos.filmNight,
  },
  {
    slug: 'real-estate',
    name: 'Real estate',
    short: 'Real estate',
    summary: 'Property photography, drone work and cinematic walkthroughs.',
    deliverables: [
      'Property, interior and exterior photography',
      'Drone photography and videography',
      'Property walkthroughs and cinematic tours',
      'Floor plans, where available',
    ],
    photo: photos.bondi,
  },
  {
    slug: 'restaurants-cafes',
    name: 'Restaurants & cafés',
    short: 'Restaurants & cafés',
    summary: 'Food, menus and rooms, plus the reels that fill a table.',
    deliverables: [
      'Food, menu and venue photography',
      'Restaurant and café promotional videos',
      'Social media reels and commercial ads',
    ],
    photo: photos.dessert,
  },
  {
    slug: 'products',
    name: 'Product',
    short: 'Product',
    summary: 'Studio stills and commercial video for the things you sell.',
    deliverables: [
      'Product and studio photography',
      'Commercial product videos and ads',
      'Promotional content for social media',
    ],
    photo: photos.goldWatch,
  },
]

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug)

// Stand-in projects: no clients, no claims. Replaced from the admin.
export const projects: Project[] = [
  {
    slug: 'evening-sitting',
    title: 'The evening sitting',
    category: 'restaurants-cafes',
    summary: "A dining room lit for its last sitting: venue stills, plated dishes and a short reel for social.",
    cover: photos.diningRoom,
    gallery: [photos.dessert, photos.lattePour],
    location: 'Sydney',
    services: ['Venue photography', 'Menu photography', 'Social reel'],
    featured: true,
    sample: true,
  },
  {
    slug: 'above-bondi',
    title: 'Above Bondi',
    category: 'real-estate',
    summary: "Drone stills and a slow aerial pass placing a listing against the beach around it.",
    cover: photos.bondi,
    gallery: [photos.nswHouse, photos.kitchen, photos.livingRoom],
    location: 'Bondi, Sydney',
    services: ['Drone photography', 'Drone video', 'Exterior photography'],
    featured: true,
    sample: true,
  },
  {
    slug: 'gold-on-black',
    title: 'Gold on black',
    category: 'products',
    summary: "Studio stills of small objects on black, lit to show the metal.",
    cover: photos.goldWatch,
    gallery: [photos.watch, photos.perfume, photos.cosmetics],
    services: ['Studio photography', 'Product video'],
    featured: true,
    sample: true,
  },
  {
    slug: 'night-exterior',
    title: 'Night exterior',
    category: 'film',
    summary: "A period street scene, shot after dark with practical light.",
    cover: photos.filmNight,
    gallery: [photos.cinemaCamera, photos.clapper, photos.cameraCrew],
    services: ['Short film'],
    featured: true,
    sample: true,
  },
  {
    slug: 'first-pour',
    title: 'First pour',
    category: 'restaurants-cafes',
    summary: "A café menu and its coffee, shot one cup at a time.",
    cover: photos.lattePour,
    gallery: [photos.latteHands],
    location: 'Sydney',
    services: ['Menu photography', 'Social reel'],
    featured: false,
    sample: true,
  },
  {
    slug: 'open-plan',
    title: 'Open plan',
    category: 'real-estate',
    summary: "Interiors for a listing: the kitchen, the living room and the light between them.",
    cover: photos.kitchen,
    gallery: [photos.livingRoom, photos.nswHouse],
    location: 'Sydney',
    services: ['Interior photography', 'Walkthrough video'],
    featured: false,
    sample: true,
  },
];

/** Facts the brief did not give. null renders as a marked gap, never a guess. */
export const contact = {
  email: null as string | null,
  phone: null as string | null,
  instagram: null as string | null,
  facebook: null as string | null,
  city: 'Sydney, Australia',
}

export const credits = (): Photo['credit'][] => {
  const seen = new Set<string>()
  return Object.values(photos)
    .map((p) => p.credit)
    .filter((c): c is NonNullable<Photo['credit']> => !!c && !seen.has(c.href) && !!seen.add(c.href))
}
