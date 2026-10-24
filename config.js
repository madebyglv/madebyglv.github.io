/* =====================================================================
   config.js  —  THE ONLY FILE YOU NEED TO EDIT FOR DAILY UPDATES
   Everything here is shown on the website. Save the file (Ctrl+S),
   then refresh the page in your browser to see the change.

   IMAGES / AUDIO: put them in the same folder as index.html
   (for example inside "img" and "audio" folders) and write the path,
   e.g.  "img/cover1.jpg"  or  "audio/preview1.mp3".
   Use lowercase names with no spaces.
   ===================================================================== */


/* ---------- 1. YOUR LINKS --------------------------------------------- */
const EMAIL             = "glvproduction@gmail.com";
const YOUTUBE_CHANNEL   = "https://www.youtube.com/@prodglv";
const BEATSTARS_STORE   = "https://www.beatstars.com/prodglv";


/* ---------- 2. HERO BACKGROUND VIDEO -----------------------------------
   1) Put your video in the "video" folder and name it bg.mp4
   2) Tips: H.264 .mp4, muted, loop of 10-20 seconds, under 10 MB.
   Change the path below if you use another name.
   Leave "" for a plain dark background (no video).                       */
const VIDEO_SRC = "video/backgroundvideo.mp4";


/* ---------- 3. BEAT OF THE WEEK  (edit every week) ------------------- */
const BEAT_OF_THE_WEEK = {
  title:     "This week’s pick",          // beat name
  text:      "One beat from my BeatStars collection “Beat of the Week”, discounted 40%. The pick changes weekly.",
  discount:  40,                          // shows "−40%"
  beatstars: "https://www.beatstars.com/collection/210759",             // paste the link of the collection / beat here
  youtube:   "https://www.youtube.com/watch?v=DIeacGJNjn8",             // paste the YouTube link of the beat here
  colors:    ["#ff2626", "#8f2626"],      // cover gradient (used if no image)
  cover:     "images/BOTW3.png"                           // optional image, e.g. "img/botw.jpg"
};


/* ---------- 4. BEATS  (one block per beat, copy & paste to add more) --
   title / bpm / key / genre : text shown on the card
   colors    : cover gradient, used when "cover" is empty
   cover     : optional image, e.g. "img/2am.jpg"
   audio     : optional mp3 preview, e.g. "audio/2am.mp3"
   youtube   : link of the YouTube video of this beat
   beatstars : link of this beat on BeatStars                             */
const BEATS = [
  {
  title:     "Barbados",
  bpm:       80,
  key:       "Bm",
  genre:     "Drake & JCole",
  tags:      ["Drake", "J Cole", "Sample"],
  colors:    ["#26308f", "#ff2bd6"],
  cover:     "images/barbadoscover.png",
  audio:     "audio/barbadospreviewprodglv.mp3",
  youtube:   "https://youtu.be/OeXvLvYcDbw",
  beatstars: "https://bsta.rs/95r2zP"
  }
  ,{
    title:     "Love Me",
    bpm:       135,
    key:       "Am",
    genre:     "Travis Scott & Don Toliver",
    tags:      ["Don Toliver", "Travis Scott", "Hyperpop"],
    colors:    ["#26308f", "#ff2bd6"],
    cover:     "images/lovemecover1.jpg",
    audio:     "audio/lovemepreview.mp3",
    youtube:   "https://youtu.be/dQ2LXXoEAUs",
    beatstars: "https://bsta.rs/95r2zP"
  }
  ,{
    title:     "2 AM In Toronto",
    bpm:       140,
    key:       "Cm",
    genre:     "Drake",
    tags:      ["Drake", "OVO", "Soul"],
    colors:    ["#26308f", "#ff2bd6"],
    cover:     "images/2amcover.png",
    audio:     "audio/2ampreviewprodglv.mp3",
    youtube:   "https://www.youtube.com/watch?v=DIeacGJNjn8",
    beatstars: "https://bsta.rs/kWeyJ"
  }
  ,{
    title:     "I Guess Maybe",
    bpm:       126,
    key:       "F#m",
    genre:     "Drake",
    tags:      ["Drake", "interlude", "R&B"],
    colors:    ["#26308f", "#ff2bd6"],
    cover:     "images/igmcover.png",
    audio:     "audio/interludemaybepreview.mp3",
    youtube:   "https://youtu.be/5yqHTdL1xpo",
    beatstars: "https://bsta.rs/18KQU"
  }
  ,{
    title:     "Hold On Me",
    bpm:       160,
    key:       "Fm",
    genre:     "Drake & Don Toliver",
    tags:      ["Drake", "Don Toliver", "R&B"],
    colors:    ["#26308f", "#ff2bd6"],
    cover:     "images/holdonme.png",
    audio:     "audio/holdonmepreviewprodglv.mp3",
    youtube:   "https://youtu.be/sLB5TkHMD4o",
    beatstars: "https://bsta.rs/rPCKf"
  }
  ,{
    title:     "Calling For You",
    bpm:       86,
    key:       "Cm",
    genre:     "Drake",
    tags:      ["Drake", "OVO", "R&B"],
    colors:    ["#26308f", "#ff2bd6"],
    cover:     "images/cfucover.jpg",
    audio:     "audio/cfupreviewprodglv.mp3",
    youtube:   "https://www.youtube.com/watch?v=h6q3BEhxZLY",
    beatstars: "https://bsta.rs/ih1xU"
  }
  ,{
    title:     "Need Me",
    bpm:       117,
    key:       "F#m",
    genre:     "Drake",
    tags:      ["Drake", "FOMO", "R&B"],
    colors:    ["#26308f", "#ff2bd6"],
    cover:     "images/fomocover.png",
    audio:     "audio/needmepreviewprodglv.mp3",
    youtube:   "https://youtu.be/Wosnpx7pqJs",
    beatstars: "https://bsta.rs/s5Gmw"
  }
  ,{
    title:     "Damage Done",
    bpm:       70,
    key:       "Cm",
    genre:     "Drake",
    tags:      ["Drake", "R&B", "FOMO"],
    colors:    ["#26308f", "#ff2bd6"],
    cover:     "images/fomocover.png",
    audio:     "audio/damagedonepreviewprodglv.mp3",
    youtube:   "https://youtu.be/ILfQ52BdK5s",
    beatstars: "https://bsta.rs/1PuDR"
  }
  ,{
    title:     "Felt right",
    bpm:       138,
    key:       "Fm",
    genre:     "Drake",
    tags:      ["Drake", "R&B", "FOMO"],
    colors:    ["#26308f", "#ff2bd6"],
    cover:     "images/fomocover.png",
    audio:     "audio/feltrightpreviewprodglv.mp3",
    youtube:   "https://youtu.be/SGhYwXnw8CU",
    beatstars: "https://bsta.rs/B7zLB"
  }
  

  /* ↓↓ copy this block (with the comma before it) to add a beat ↓↓
  ,{
    title:     "Beat name",
    bpm:       140,
    key:       "Am",
    genre:     "R&B",
    colors:    ["#3a0f4d", "#9ff4ff"],
    cover:     "img/beat2.jpg",
    audio:     "audio/beat2.mp3",
    youtube:   "https://www.youtube.com/watch?v=XXXXXXXXXXX",
    beatstars: "https://www.beatstars.com/beat/..."
  }
  */
];


/* ---------- 5. ARTWORK  (6 covers = 3 columns of 2) ------------------
   colors : gradient shown until you add an image
   img    : your image, e.g. "img/art1.jpg"  (leave "" for the gradient) */
const ARTWORK = [
  { colors: ["#4b57ff", "#050507"], img: "images/artwork/beforeus.png" },
  { colors: ["#ff2bd6", "#0b0c12"], img: "images/artwork/callinforu.png" },
  { colors: ["#9ff4ff", "#26308f"], img: "images/artwork/dontcollection.png" },
  { colors: ["#15161c", "#ff2bd6"], img: "images/artwork/drakecollection.png" },
  { colors: ["#26308f", "#9ff4ff"], img: "images/artwork/habibtiv2.png" },
  { colors: ["#a77bff", "#15161c"], img: "images/artwork/lastofferglv.png" }
];


/* ---------- 6. NEWS ---------------------------------------------------- */
const NEWS = [
  { date: "OCT 2026",    title: "New website is live", text: "Here you can find beats, links and my artworks such as covers and posters." },
  { date: "WEEKLY PICK", title: "Beat of the Week",    text: "A BeatStars collection with one beat discounted 40%! Better not make this offer escape! Make it yours today before next Friday!" }
];


/* ---------- 7. SCROLLING WORDS UNDER THE HERO ------------------------- */
const MARQUEE = ["TYPE BEATS", "BEAT SWITCH", "OUTRO LOVER", "DRAKE", "R&B", "prodGLV"];


   const HERO_LOGOS = ["images/imglogoglv2.png", "images/imglogoglv.png"];

   const ARTWORK_WORDS = ["Artwork", "Blankos"];
   
const BEHANCE_URL = "https://www.behance.net/blankitos";

const BEATS_BANNER = {
  label:    "10PGLV",
  badge:    "",                                   // "" = nessun badge
  text:     "Use this code to get 10% off on BeatStars",
  linkText: "Discover now",
  link:     "https://www.beatstars.com/prodglv"
};

   const BOTW_TIMER = {
     enabled:  true,
     weekday:  5,              // 0 = domenica, 1 = lunedì ... 5 = venerdì ... 6 = sabato
     time:     "00:00",        // a che ora parte la nuova settimana, es. "18:00"
     timeZone: "Europe/Rome",
     endsAt:   ""              // facoltativo, vedi sotto
   };

   const PROMO = {
     enabled:  true,
     code:     "10PGLV",
     title:    "Special offer",
     text:     "10% off on Premium & Stems licenses.",
     image:    "images/promoimg.jpg",
     link:     "https://www.beatstars.com/prodglv",
     linkText: "Go to BeatStars"
   };