/**
 * Pronunciation utilities: IPA transcription + simplified pronunciation guides.
 *
 * Lookup order:
 *   1. Static dictionary (covers the most common English words used in Filipino education)
 *   2. Rule-based fallback for unknown words
 */

interface PronunciationEntry {
  ipa: string;       // e.g. /noʊdz/
  simplified: string; // e.g. "nohds"
}

// ---------------------------------------------------------------------------
// Static dictionary — sorted alphabetically for readability
// Covers Foundations → Advanced reader levels in Filipino education context
// ---------------------------------------------------------------------------
const PRONUNCIATION_DICT: Record<string, PronunciationEntry> = {
  // A
  a:            { ipa: '/eɪ/',       simplified: 'ay' },
  able:         { ipa: '/ˈeɪ.bəl/',  simplified: 'AY-bul' },
  about:        { ipa: '/əˈbaʊt/',   simplified: 'uh-BOWT' },
  above:        { ipa: '/əˈbʌv/',    simplified: 'uh-BUV' },
  abstract:     { ipa: '/ˈæb.strækt/', simplified: 'AB-strakt' },
  academic:     { ipa: '/ˌæk.əˈdem.ɪk/', simplified: 'ak-uh-DEM-ik' },
  accept:       { ipa: '/əkˈsɛpt/',  simplified: 'ak-SEPT' },
  access:       { ipa: '/ˈæk.sɛs/',  simplified: 'AK-ses' },
  across:       { ipa: '/əˈkrɒs/',   simplified: 'uh-KROS' },
  action:       { ipa: '/ˈæk.ʃən/',  simplified: 'AK-shun' },
  adapt:        { ipa: '/əˈdæpt/',   simplified: 'uh-DAPT' },
  add:          { ipa: '/æd/',       simplified: 'ad' },
  address:      { ipa: '/əˈdrɛs/',   simplified: 'uh-DRES' },
  after:        { ipa: '/ˈæf.tər/',  simplified: 'AF-ter' },
  again:        { ipa: '/əˈɡɛn/',    simplified: 'uh-GEN' },
  age:          { ipa: '/eɪdʒ/',     simplified: 'ayj' },
  air:          { ipa: '/ɛr/',       simplified: 'air' },
  all:          { ipa: '/ɔːl/',      simplified: 'awl' },
  allow:        { ipa: '/əˈlaʊ/',    simplified: 'uh-LOW' },
  also:         { ipa: '/ˈɔːl.soʊ/', simplified: 'AWL-soh' },
  always:       { ipa: '/ˈɔːl.weɪz/', simplified: 'AWL-wayz' },
  am:           { ipa: '/æm/',       simplified: 'am' },
  among:        { ipa: '/əˈmʌŋ/',    simplified: 'uh-MUNG' },
  an:           { ipa: '/æn/',       simplified: 'an' },
  and:          { ipa: '/ænd/',      simplified: 'and' },
  animal:       { ipa: '/ˈæn.ɪ.məl/', simplified: 'AN-uh-mul' },
  answer:       { ipa: '/ˈæn.sər/',  simplified: 'AN-ser' },
  any:          { ipa: '/ˈɛn.i/',    simplified: 'EN-ee' },
  apply:        { ipa: '/əˈplaɪ/',   simplified: 'uh-PLY' },
  are:          { ipa: '/ɑːr/',      simplified: 'ar' },
  around:       { ipa: '/əˈraʊnd/',  simplified: 'uh-ROWND' },
  ask:          { ipa: '/æsk/',      simplified: 'ask' },
  at:           { ipa: '/æt/',       simplified: 'at' },
  away:         { ipa: '/əˈweɪ/',    simplified: 'uh-WAY' },

  // B
  back:         { ipa: '/bæk/',      simplified: 'bak' },
  ball:         { ipa: '/bɔːl/',     simplified: 'bawl' },
  be:           { ipa: '/biː/',      simplified: 'bee' },
  because:      { ipa: '/bɪˈkɒz/',  simplified: 'bih-KOZ' },
  been:         { ipa: '/bɪn/',      simplified: 'bin' },
  before:       { ipa: '/bɪˈfɔːr/', simplified: 'bih-FOR' },
  big:          { ipa: '/bɪɡ/',      simplified: 'big' },
  bird:         { ipa: '/bɜːrd/',    simplified: 'berd' },
  book:         { ipa: '/bʊk/',      simplified: 'buk' },
  boy:          { ipa: '/bɔɪ/',      simplified: 'boy' },
  bring:        { ipa: '/brɪŋ/',     simplified: 'bring' },
  build:        { ipa: '/bɪld/',     simplified: 'bild' },
  but:          { ipa: '/bʌt/',      simplified: 'but' },
  by:           { ipa: '/baɪ/',      simplified: 'by' },

  // C
  call:         { ipa: '/kɔːl/',     simplified: 'kawl' },
  came:         { ipa: '/keɪm/',     simplified: 'kaym' },
  can:          { ipa: '/kæn/',      simplified: 'kan' },
  cause:        { ipa: '/kɔːz/',     simplified: 'kawz' },
  change:       { ipa: '/tʃeɪndʒ/', simplified: 'chaynj' },
  character:    { ipa: '/ˈkær.ɪk.tər/', simplified: 'KAR-ik-ter' },
  children:     { ipa: '/ˈtʃɪl.drən/', simplified: 'CHIL-dren' },
  city:         { ipa: '/ˈsɪt.i/',   simplified: 'SIT-ee' },
  class:        { ipa: '/klæs/',     simplified: 'klas' },
  clean:        { ipa: '/kliːn/',    simplified: 'kleen' },
  clear:        { ipa: '/klɪr/',     simplified: 'kleer' },
  close:        { ipa: '/kloʊz/',    simplified: 'klohz' },
  cold:         { ipa: '/koʊld/',    simplified: 'kohld' },
  come:         { ipa: '/kʌm/',      simplified: 'kum' },
  community:    { ipa: '/kəˈmjuː.nɪ.ti/', simplified: 'kuh-MYOO-nih-tee' },
  complete:     { ipa: '/kəmˈpliːt/', simplified: 'kum-PLEET' },
  complex:      { ipa: '/ˈkɒm.plɛks/', simplified: 'KOM-pleks' },
  concept:      { ipa: '/ˈkɒn.sɛpt/', simplified: 'KON-sept' },
  connect:      { ipa: '/kəˈnɛkt/',  simplified: 'kuh-NEKT' },
  continue:     { ipa: '/kənˈtɪn.juː/', simplified: 'kun-TIN-yoo' },
  country:      { ipa: '/ˈkʌn.tri/',  simplified: 'KUN-tree' },
  create:       { ipa: '/kriːˈeɪt/', simplified: 'kree-AYT' },
  culture:      { ipa: '/ˈkʌl.tʃər/', simplified: 'KUL-cher' },

  // D
  day:          { ipa: '/deɪ/',      simplified: 'day' },
  decide:       { ipa: '/dɪˈsaɪd/', simplified: 'dih-SYD' },
  define:       { ipa: '/dɪˈfaɪn/', simplified: 'dih-FYN' },
  describe:     { ipa: '/dɪˈskraɪb/', simplified: 'dih-SKRYB' },
  develop:      { ipa: '/dɪˈvɛl.əp/', simplified: 'dih-VEL-up' },
  different:    { ipa: '/ˈdɪf.ər.ənt/', simplified: 'DIF-er-ent' },
  do:           { ipa: '/duː/',      simplified: 'doo' },
  does:         { ipa: '/dʌz/',      simplified: 'duz' },
  dog:          { ipa: '/dɒɡ/',      simplified: 'dog' },
  down:         { ipa: '/daʊn/',     simplified: 'down' },
  draw:         { ipa: '/drɔː/',     simplified: 'draw' },

  // E
  each:         { ipa: '/iːtʃ/',     simplified: 'eech' },
  earth:        { ipa: '/ɜːrθ/',     simplified: 'erth' },
  eat:          { ipa: '/iːt/',      simplified: 'eet' },
  education:    { ipa: '/ˌɛd.jʊˈkeɪ.ʃən/', simplified: 'ed-yoo-KAY-shun' },
  effect:       { ipa: '/ɪˈfɛkt/',  simplified: 'ih-FEKT' },
  end:          { ipa: '/ɛnd/',      simplified: 'end' },
  environment:  { ipa: '/ɪnˈvaɪ.rən.mənt/', simplified: 'in-VY-run-ment' },
  equal:        { ipa: '/ˈiː.kwəl/', simplified: 'EE-kwul' },
  even:         { ipa: '/ˈiː.vən/',  simplified: 'EE-vun' },
  every:        { ipa: '/ˈɛv.ri/',   simplified: 'EV-ree' },
  example:      { ipa: '/ɪɡˈzæm.pəl/', simplified: 'ig-ZAM-pul' },
  experience:   { ipa: '/ɪkˈspɪr.i.əns/', simplified: 'ik-SPEER-ee-uns' },
  explain:      { ipa: '/ɪkˈspleɪn/', simplified: 'ik-SPLAYN' },

  // F
  family:       { ipa: '/ˈfæm.ɪ.li/', simplified: 'FAM-ih-lee' },
  far:          { ipa: '/fɑːr/',     simplified: 'far' },
  fast:         { ipa: '/fæst/',     simplified: 'fast' },
  father:       { ipa: '/ˈfɑː.ðər/', simplified: 'FAH-ther' },
  feel:         { ipa: '/fiːl/',     simplified: 'feel' },
  few:          { ipa: '/fjuː/',     simplified: 'fyoo' },
  find:         { ipa: '/faɪnd/',    simplified: 'fynd' },
  fish:         { ipa: '/fɪʃ/',      simplified: 'fish' },
  follow:       { ipa: '/ˈfɒl.oʊ/', simplified: 'FOL-oh' },
  food:         { ipa: '/fuːd/',     simplified: 'food' },
  for:          { ipa: '/fɔːr/',     simplified: 'for' },
  form:         { ipa: '/fɔːrm/',    simplified: 'form' },
  found:        { ipa: '/faʊnd/',    simplified: 'fownd' },
  freedom:      { ipa: '/ˈfriː.dəm/', simplified: 'FREE-dum' },
  friend:       { ipa: '/frɛnd/',    simplified: 'frend' },
  from:         { ipa: '/frɒm/',     simplified: 'from' },
  front:        { ipa: '/frʌnt/',    simplified: 'frunt' },
  full:         { ipa: '/fʊl/',      simplified: 'ful' },

  // G
  get:          { ipa: '/ɡɛt/',      simplified: 'get' },
  girl:         { ipa: '/ɡɜːrl/',    simplified: 'gerl' },
  give:         { ipa: '/ɡɪv/',      simplified: 'giv' },
  go:           { ipa: '/ɡoʊ/',      simplified: 'goh' },
  good:         { ipa: '/ɡʊd/',      simplified: 'gud' },
  government:   { ipa: '/ˈɡʌv.ərn.mənt/', simplified: 'GUV-ern-ment' },
  great:        { ipa: '/ɡreɪt/',    simplified: 'grayt' },
  group:        { ipa: '/ɡruːp/',    simplified: 'groop' },
  grow:         { ipa: '/ɡroʊ/',     simplified: 'groh' },

  // H
  hand:         { ipa: '/hænd/',     simplified: 'hand' },
  happen:       { ipa: '/ˈhæp.ən/',  simplified: 'HAP-un' },
  hard:         { ipa: '/hɑːrd/',    simplified: 'hard' },
  have:         { ipa: '/hæv/',      simplified: 'hav' },
  he:           { ipa: '/hiː/',      simplified: 'hee' },
  health:       { ipa: '/hɛlθ/',     simplified: 'helth' },
  hear:         { ipa: '/hɪr/',      simplified: 'heer' },
  heart:        { ipa: '/hɑːrt/',    simplified: 'hart' },
  help:         { ipa: '/hɛlp/',     simplified: 'help' },
  her:          { ipa: '/hɜːr/',     simplified: 'her' },
  here:         { ipa: '/hɪr/',      simplified: 'heer' },
  high:         { ipa: '/haɪ/',      simplified: 'hy' },
  him:          { ipa: '/hɪm/',      simplified: 'him' },
  his:          { ipa: '/hɪz/',      simplified: 'hiz' },
  history:      { ipa: '/ˈhɪs.tər.i/', simplified: 'HIS-ter-ee' },
  home:         { ipa: '/hoʊm/',     simplified: 'hohm' },
  house:        { ipa: '/haʊs/',     simplified: 'howss' },
  how:          { ipa: '/haʊ/',      simplified: 'how' },
  human:        { ipa: '/ˈhjuː.mən/', simplified: 'HYOO-mun' },

  // I
  idea:         { ipa: '/aɪˈdɪə/',  simplified: 'eye-DEE-uh' },
  if:           { ipa: '/ɪf/',       simplified: 'if' },
  important:    { ipa: '/ɪmˈpɔːr.tənt/', simplified: 'im-POR-tant' },
  in:           { ipa: '/ɪn/',       simplified: 'in' },
  include:      { ipa: '/ɪnˈkluːd/', simplified: 'in-KLOOD' },
  information:  { ipa: '/ˌɪn.fərˈmeɪ.ʃən/', simplified: 'in-fer-MAY-shun' },
  into:         { ipa: '/ˈɪn.tuː/',  simplified: 'IN-too' },
  is:           { ipa: '/ɪz/',       simplified: 'iz' },
  it:           { ipa: '/ɪt/',       simplified: 'it' },
  its:          { ipa: '/ɪts/',      simplified: 'its' },

  // J
  just:         { ipa: '/dʒʌst/',    simplified: 'just' },

  // K
  keep:         { ipa: '/kiːp/',     simplified: 'keep' },
  kind:         { ipa: '/kaɪnd/',    simplified: 'kynd' },
  know:         { ipa: '/noʊ/',      simplified: 'noh' },
  knowledge:    { ipa: '/ˈnɒl.ɪdʒ/', simplified: 'NOL-ij' },

  // L
  language:     { ipa: '/ˈlæŋ.ɡwɪdʒ/', simplified: 'LANG-gwij' },
  large:        { ipa: '/lɑːrdʒ/',   simplified: 'larj' },
  last:         { ipa: '/læst/',     simplified: 'last' },
  later:        { ipa: '/ˈleɪ.tər/', simplified: 'LAY-ter' },
  learn:        { ipa: '/lɜːrn/',    simplified: 'lern' },
  leave:        { ipa: '/liːv/',     simplified: 'leev' },
  left:         { ipa: '/lɛft/',     simplified: 'left' },
  letter:       { ipa: '/ˈlɛt.ər/',  simplified: 'LET-er' },
  life:         { ipa: '/laɪf/',     simplified: 'lyf' },
  light:        { ipa: '/laɪt/',     simplified: 'lyt' },
  like:         { ipa: '/laɪk/',     simplified: 'lyk' },
  line:         { ipa: '/laɪn/',     simplified: 'lyn' },
  list:         { ipa: '/lɪst/',     simplified: 'list' },
  little:       { ipa: '/ˈlɪt.əl/',  simplified: 'LIT-ul' },
  live:         { ipa: '/lɪv/',      simplified: 'liv' },
  long:         { ipa: '/lɒŋ/',      simplified: 'long' },
  look:         { ipa: '/lʊk/',      simplified: 'luk' },
  love:         { ipa: '/lʌv/',      simplified: 'luv' },

  // M
  made:         { ipa: '/meɪd/',     simplified: 'mayd' },
  make:         { ipa: '/meɪk/',     simplified: 'mayk' },
  man:          { ipa: '/mæn/',      simplified: 'man' },
  many:         { ipa: '/ˈmɛn.i/',   simplified: 'MEN-ee' },
  may:          { ipa: '/meɪ/',      simplified: 'may' },
  me:           { ipa: '/miː/',      simplified: 'mee' },
  mean:         { ipa: '/miːn/',     simplified: 'meen' },
  might:        { ipa: '/maɪt/',     simplified: 'myt' },
  more:         { ipa: '/mɔːr/',     simplified: 'mor' },
  most:         { ipa: '/moʊst/',    simplified: 'mohst' },
  mother:       { ipa: '/ˈmʌð.ər/', simplified: 'MUTH-er' },
  move:         { ipa: '/muːv/',     simplified: 'moov' },
  much:         { ipa: '/mʌtʃ/',     simplified: 'much' },
  music:        { ipa: '/ˈmjuː.zɪk/', simplified: 'MYOO-zik' },
  must:         { ipa: '/mʌst/',     simplified: 'must' },
  my:           { ipa: '/maɪ/',      simplified: 'my' },

  // N
  name:         { ipa: '/neɪm/',     simplified: 'naym' },
  nature:       { ipa: '/ˈneɪ.tʃər/', simplified: 'NAY-cher' },
  need:         { ipa: '/niːd/',     simplified: 'need' },
  new:          { ipa: '/njuː/',     simplified: 'nyoo' },
  next:         { ipa: '/nɛkst/',    simplified: 'nekst' },
  night:        { ipa: '/naɪt/',     simplified: 'nyt' },
  no:           { ipa: '/noʊ/',      simplified: 'noh' },
  nodes:        { ipa: '/noʊdz/',    simplified: 'nohdz' },
  not:          { ipa: '/nɒt/',      simplified: 'not' },
  now:          { ipa: '/naʊ/',      simplified: 'now' },
  number:       { ipa: '/ˈnʌm.bər/', simplified: 'NUM-ber' },

  // O
  of:           { ipa: '/ɒv/',       simplified: 'ov' },
  off:          { ipa: '/ɒf/',       simplified: 'of' },
  often:        { ipa: '/ˈɒf.ən/',   simplified: 'OF-un' },
  old:          { ipa: '/oʊld/',     simplified: 'ohld' },
  on:           { ipa: '/ɒn/',       simplified: 'on' },
  one:          { ipa: '/wʌn/',      simplified: 'wun' },
  only:         { ipa: '/ˈoʊn.li/',  simplified: 'OHN-lee' },
  open:         { ipa: '/ˈoʊ.pən/',  simplified: 'OH-pun' },
  or:           { ipa: '/ɔːr/',      simplified: 'or' },
  order:        { ipa: '/ˈɔːr.dər/', simplified: 'OR-der' },
  other:        { ipa: '/ˈʌð.ər/',   simplified: 'UTH-er' },
  our:          { ipa: '/aʊər/',     simplified: 'ow-er' },
  out:          { ipa: '/aʊt/',      simplified: 'owt' },
  over:         { ipa: '/ˈoʊ.vər/',  simplified: 'OH-ver' },
  own:          { ipa: '/oʊn/',      simplified: 'ohn' },

  // P
  paragraph:    { ipa: '/ˈpær.ə.ɡræf/', simplified: 'PAR-uh-graf' },
  part:         { ipa: '/pɑːrt/',    simplified: 'part' },
  people:       { ipa: '/ˈpiː.pəl/', simplified: 'PEE-pul' },
  place:        { ipa: '/pleɪs/',    simplified: 'plays' },
  plant:        { ipa: '/plænt/',    simplified: 'plant' },
  play:         { ipa: '/pleɪ/',     simplified: 'play' },
  point:        { ipa: '/pɔɪnt/',    simplified: 'poynt' },
  power:        { ipa: '/ˈpaʊ.ər/',  simplified: 'POW-er' },
  problem:      { ipa: '/ˈprɒb.ləm/', simplified: 'PROB-lum' },
  process:      { ipa: '/ˈprɒs.ɛs/', simplified: 'PROS-es' },
  pronunciation: { ipa: '/prəˌnʌn.siˈeɪ.ʃən/', simplified: 'pruh-NUN-see-AY-shun' },
  public:       { ipa: '/ˈpʌb.lɪk/', simplified: 'PUB-lik' },
  put:          { ipa: '/pʊt/',      simplified: 'put' },

  // Q
  question:     { ipa: '/ˈkwɛs.tʃən/', simplified: 'KWES-chun' },

  // R
  read:         { ipa: '/riːd/',     simplified: 'reed' },
  reading:      { ipa: '/ˈriː.dɪŋ/', simplified: 'REE-ding' },
  right:        { ipa: '/raɪt/',     simplified: 'ryt' },
  river:        { ipa: '/ˈrɪv.ər/',  simplified: 'RIV-er' },
  road:         { ipa: '/roʊd/',     simplified: 'rohd' },
  run:          { ipa: '/rʌn/',      simplified: 'run' },

  // S
  said:         { ipa: '/sɛd/',      simplified: 'sed' },
  same:         { ipa: '/seɪm/',     simplified: 'saym' },
  saw:          { ipa: '/sɔː/',      simplified: 'saw' },
  say:          { ipa: '/seɪ/',      simplified: 'say' },
  school:       { ipa: '/skuːl/',    simplified: 'skool' },
  science:      { ipa: '/ˈsaɪ.əns/', simplified: 'SY-uns' },
  sea:          { ipa: '/siː/',      simplified: 'see' },
  second:       { ipa: '/ˈsɛk.ənd/', simplified: 'SEK-und' },
  see:          { ipa: '/siː/',      simplified: 'see' },
  seem:         { ipa: '/siːm/',     simplified: 'seem' },
  sentence:     { ipa: '/ˈsɛn.təns/', simplified: 'SEN-tens' },
  set:          { ipa: '/sɛt/',      simplified: 'set' },
  she:          { ipa: '/ʃiː/',      simplified: 'shee' },
  should:       { ipa: '/ʃʊd/',      simplified: 'shud' },
  show:         { ipa: '/ʃoʊ/',      simplified: 'shoh' },
  side:         { ipa: '/saɪd/',     simplified: 'syd' },
  small:        { ipa: '/smɔːl/',    simplified: 'smawl' },
  social:       { ipa: '/ˈsoʊ.ʃəl/', simplified: 'SOH-shul' },
  some:         { ipa: '/sʌm/',      simplified: 'sum' },
  something:    { ipa: '/ˈsʌm.θɪŋ/', simplified: 'SUM-thing' },
  sometimes:    { ipa: '/ˈsʌm.taɪmz/', simplified: 'SUM-tymz' },
  sound:        { ipa: '/saʊnd/',    simplified: 'sownd' },
  speak:        { ipa: '/spiːk/',    simplified: 'speek' },
  start:        { ipa: '/stɑːrt/',   simplified: 'start' },
  state:        { ipa: '/steɪt/',    simplified: 'stayt' },
  still:        { ipa: '/stɪl/',     simplified: 'stil' },
  story:        { ipa: '/ˈstɔːr.i/', simplified: 'STOR-ee' },
  student:      { ipa: '/ˈstjuː.dənt/', simplified: 'STYOO-dent' },
  study:        { ipa: '/ˈstʌd.i/',  simplified: 'STUD-ee' },
  such:         { ipa: '/sʌtʃ/',     simplified: 'such' },
  sun:          { ipa: '/sʌn/',      simplified: 'sun' },
  syllable:     { ipa: '/ˈsɪl.ə.bəl/', simplified: 'SIL-uh-bul' },
  system:       { ipa: '/ˈsɪs.təm/', simplified: 'SIS-tum' },

  // T
  take:         { ipa: '/teɪk/',     simplified: 'tayk' },
  talk:         { ipa: '/tɔːk/',     simplified: 'tawk' },
  teach:        { ipa: '/tiːtʃ/',    simplified: 'teech' },
  teacher:      { ipa: '/ˈtiː.tʃər/', simplified: 'TEE-cher' },
  tell:         { ipa: '/tɛl/',      simplified: 'tel' },
  than:         { ipa: '/ðæn/',      simplified: 'than' },
  that:         { ipa: '/ðæt/',      simplified: 'that' },
  the:          { ipa: '/ðə/',       simplified: 'thuh' },
  their:        { ipa: '/ðɛr/',      simplified: 'thair' },
  them:         { ipa: '/ðɛm/',      simplified: 'them' },
  then:         { ipa: '/ðɛn/',      simplified: 'then' },
  there:        { ipa: '/ðɛr/',      simplified: 'thair' },
  these:        { ipa: '/ðiːz/',     simplified: 'theez' },
  they:         { ipa: '/ðeɪ/',      simplified: 'thay' },
  thing:        { ipa: '/θɪŋ/',      simplified: 'thing' },
  think:        { ipa: '/θɪŋk/',     simplified: 'think' },
  this:         { ipa: '/ðɪs/',      simplified: 'this' },
  thought:      { ipa: '/θɔːt/',     simplified: 'thawt' },
  three:        { ipa: '/θriː/',     simplified: 'three' },
  through:      { ipa: '/θruː/',     simplified: 'throo' },
  time:         { ipa: '/taɪm/',     simplified: 'tym' },
  to:           { ipa: '/tuː/',      simplified: 'too' },
  together:     { ipa: '/təˈɡɛð.ər/', simplified: 'tuh-GETH-er' },
  too:          { ipa: '/tuː/',      simplified: 'too' },
  tree:         { ipa: '/triː/',     simplified: 'tree' },
  try:          { ipa: '/traɪ/',     simplified: 'try' },
  turn:         { ipa: '/tɜːrn/',    simplified: 'tern' },
  two:          { ipa: '/tuː/',      simplified: 'too' },

  // U
  under:        { ipa: '/ˈʌn.dər/',  simplified: 'UN-der' },
  understand:   { ipa: '/ˌʌn.dərˈstænd/', simplified: 'un-der-STAND' },
  until:        { ipa: '/ʌnˈtɪl/',  simplified: 'un-TIL' },
  up:           { ipa: '/ʌp/',       simplified: 'up' },
  use:          { ipa: '/juːz/',     simplified: 'yooz' },

  // V
  value:        { ipa: '/ˈvæl.juː/', simplified: 'VAL-yoo' },
  very:         { ipa: '/ˈvɛr.i/',   simplified: 'VER-ee' },
  voice:        { ipa: '/vɔɪs/',     simplified: 'voys' },
  vowel:        { ipa: '/ˈvaʊ.əl/',  simplified: 'VOW-ul' },

  // W
  walk:         { ipa: '/wɔːk/',     simplified: 'wawk' },
  want:         { ipa: '/wɒnt/',     simplified: 'wont' },
  was:          { ipa: '/wɒz/',      simplified: 'woz' },
  water:        { ipa: '/ˈwɔː.tər/', simplified: 'WAW-ter' },
  way:          { ipa: '/weɪ/',      simplified: 'way' },
  we:           { ipa: '/wiː/',      simplified: 'wee' },
  well:         { ipa: '/wɛl/',      simplified: 'wel' },
  went:         { ipa: '/wɛnt/',     simplified: 'went' },
  were:         { ipa: '/wɜːr/',     simplified: 'wer' },
  what:         { ipa: '/wɒt/',      simplified: 'wot' },
  when:         { ipa: '/wɛn/',      simplified: 'wen' },
  where:        { ipa: '/wɛr/',      simplified: 'wair' },
  which:        { ipa: '/wɪtʃ/',     simplified: 'wich' },
  while:        { ipa: '/waɪl/',     simplified: 'wyl' },
  who:          { ipa: '/huː/',      simplified: 'hoo' },
  why:          { ipa: '/waɪ/',      simplified: 'wy' },
  will:         { ipa: '/wɪl/',      simplified: 'wil' },
  with:         { ipa: '/wɪð/',      simplified: 'with' },
  word:         { ipa: '/wɜːrd/',    simplified: 'werd' },
  work:         { ipa: '/wɜːrk/',    simplified: 'werk' },
  world:        { ipa: '/wɜːrld/',   simplified: 'werld' },
  would:        { ipa: '/wʊd/',      simplified: 'wud' },
  write:        { ipa: '/raɪt/',     simplified: 'ryt' },

  // X / Y / Z
  year:         { ipa: '/jɪr/',      simplified: 'yeer' },
  you:          { ipa: '/juː/',      simplified: 'yoo' },
  young:        { ipa: '/jʌŋ/',      simplified: 'yung' },
  your:         { ipa: '/jɔːr/',     simplified: 'yor' },
};

// ---------------------------------------------------------------------------
// Rule-based fallback: generates a rough simplified pronunciation.
// Not IPA — returns a friendly respelling instead of /ɪ/ symbols.
// ---------------------------------------------------------------------------

/** Remove punctuation and lowercase for dictionary lookup. */
function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z']/g, '');
}

/**
 * Very simple English phonetic respelling rules.
 * Handles the most common digraphs and silent letters for learners.
 */
function ruleBased(word: string): string {
  let w = word.toLowerCase();
  // common digraphs first (order matters)
  w = w.replace(/ough/g, 'oh');
  w = w.replace(/tion/g, 'shun');
  w = w.replace(/sion/g, 'zhun');
  w = w.replace(/ture/g, 'cher');
  w = w.replace(/ph/g, 'f');
  w = w.replace(/gh/g, '');
  w = w.replace(/kn/g, 'n');
  w = w.replace(/wr/g, 'r');
  w = w.replace(/mb$/g, 'm');  // silent b at end (lamb)
  w = w.replace(/ea/g, 'ee');
  w = w.replace(/ee/g, 'ee');
  w = w.replace(/ai/g, 'ay');
  w = w.replace(/ay/g, 'ay');
  w = w.replace(/oa/g, 'oh');
  w = w.replace(/oo/g, 'oo');
  // Process ow → oh FIRST (e.g. "know" → "noh"), then ou → ow (e.g. "out" → "owt").
  // Reversing this order would double-transform ou→ow→oh, producing wrong guides.
  w = w.replace(/ow/g, 'oh');
  w = w.replace(/ou/g, 'ow');
  w = w.replace(/ie/g, 'ee');
  w = w.replace(/ue/g, 'yoo');
  w = w.replace(/ui/g, 'oo');
  w = w.replace(/au/g, 'aw');
  w = w.replace(/aw/g, 'aw');
  w = w.replace(/ew/g, 'yoo');
  w = w.replace(/ch/g, 'ch');
  w = w.replace(/sh/g, 'sh');
  w = w.replace(/th/g, 'th');
  w = w.replace(/wh/g, 'w');
  w = w.replace(/ng/g, 'ng');
  // silent e at end
  w = w.replace(/e$/g, '');
  return w;
}

/** Build a fallback IPA-style representation using the simplified respelling. */
function ruleBasedIPA(word: string): string {
  const simplified = ruleBased(word);
  return `/${simplified}/`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the IPA transcription string for a word.
 * Falls back to a rule-based approximation if the word is not in the dictionary.
 */
export function getIPA(word: string): string {
  const key = normalizeWord(word);
  return PRONUNCIATION_DICT[key]?.ipa ?? ruleBasedIPA(key);
}

/**
 * Returns a simplified (respelled) pronunciation guide for a word.
 * Falls back to a rule-based approximation if the word is not in the dictionary.
 */
export function getSimplifiedPronunciation(word: string): string {
  const key = normalizeWord(word);
  return PRONUNCIATION_DICT[key]?.simplified ?? ruleBased(key);
}

export interface PronunciationResult extends PronunciationEntry {
  /** True if the entry came from the curated dictionary; false = rule-based approximation */
  fromDictionary: boolean;
}

/**
 * Returns both IPA and simplified pronunciation for a word.
 * `fromDictionary` is true when the word is in the curated dict, false when rule-based.
 * Callers should avoid labeling rule-based results as "IPA" — they are respelling guides only.
 */
export function getPronunciation(word: string): PronunciationResult {
  const key = normalizeWord(word);
  const entry = PRONUNCIATION_DICT[key];
  if (entry) {
    return { ...entry, fromDictionary: true };
  }
  return {
    ipa: ruleBasedIPA(key),
    simplified: ruleBased(key),
    fromDictionary: false,
  };
}
