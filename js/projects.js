/* MAZE archive data.
   To add a project: copy one object, change the fields, put images in assets/projects/<id>/.

   cats: any of 'branding', 'digital', 'print' (the archive filters)
   type  (layout of the tile):
     A  featured case (large)       B  single deliverable (tall)
     C  digital set (wide)          D  typographic / experimental
   soon:   true  -> shown as a "Coming soon" tile, not clickable
   images: [{ src: 'assets/projects/<id>/01.webp', alt: 'what the image shows' }]
   sections: [['האתגר', 'text'], ['הפתרון', 'text']]  -> shown inside the case file
   client: fill in only after the client approved showing the name.
   notes:  internal reminders for you. Never shown on the site. */
window.MAZE_PROJECTS = [
  {
    id: 'law-firm', n: '01', type: 'A', cats: ['branding', 'digital'],
    title: 'Law firm - full identity',
    label: 'Branding · Visual language · Website · Digital business card',
    desc: 'מיתוג מלא למשרד עורכת דין: לוגו, שפה גרפית, אתר וכרטיס ביקור דיגיטלי.',
    deliverables: ['Logo', 'Visual language', 'Website', 'Digital business card'],
    sections: [], images: [], client: null,
    notes: ['Add identity boards, website screenshots and the digital card', 'Ask the client before showing the name']
  },
  {
    id: 'door-sticker', n: '02', type: 'B', cats: ['print'],
    title: 'Glass door sticker',
    label: 'Print · Door graphic',
    desc: 'מדבקה לדלת שקופה במשרד עורך דין.',
    deliverables: ['Door sticker'],
    sections: [], images: [], client: null,
    notes: ['A real photo of the sticker on the door works better than a mockup']
  },
  {
    id: 'law-banner', n: '03', type: 'C', cats: ['digital'],
    title: 'Rotating banner',
    label: 'Digital · Banner set',
    desc: 'באנר מתחלף למשרד עורך דין.',
    deliverables: ['Rotating banner'],
    sections: [], images: [], client: null,
    notes: ['Add each banner frame as a separate image (3-6)']
  }
];

/* Instagram strip in the contact section.
   profile: your Instagram profile picture, e.g. 'assets/instagram/profile.webp' (empty = MAZE icon).
   posts:   images saved from your feed, in order, e.g. { img: 'assets/instagram/01.webp', alt: 'what the post shows' }.
   Posts are a visual preview only; the round profile picture is the link to Instagram. */
window.MAZE_INSTAGRAM = {
  profile: 'assets/instagram/profile.webp',
  // The 4 posts currently on @bymazedesign, newest first. Add the image file names when the images are in assets/instagram/.
  posts: [
    { img: '', alt: 'MAZE Instagram post, 7 September 2026' },
    { img: '', alt: 'MAZE Instagram post, 6 September 2026' },
    { img: '', alt: 'MAZE Instagram post, 30 August 2026' },
    { img: '', alt: 'MAZE Instagram post, 25 August 2026' }
  ]
};
