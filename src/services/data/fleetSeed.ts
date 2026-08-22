// Real competitor barge fleet, extracted from BARGE_TRACKING-2026 (14 Aug).
// Every IMO here passed check-digit validation against the source file.
export interface FleetBargeSeed { name: string; imo: string }
export interface FleetCompetitorSeed { name: string; code: string; barges: FleetBargeSeed[] }

export const FLEET_SEED: FleetCompetitorSeed[] = [
  {
    name: "OMTI",
    code: "OMTI",
    barges: [
      { name: "Amal", imo: "9239953" },
      { name: "Al Mira", imo: "9399973" },
      { name: "Dorian", imo: "9190834" },
      { name: "Chiwetalu", imo: "9164213" },
      { name: "Zuma", imo: "9568471" },
      { name: "Coya", imo: "9524786" },
      { name: "Gaia", imo: "9661417" },
      { name: "Verde", imo: "9661429" },
      { name: "Hide", imo: "9661364" },
      { name: "Sal", imo: "9661405" },
      { name: "Amber", imo: "9604031" },
      { name: "Simran", imo: "9136644" },
    ],
  },
  {
    name: "Pearl Marine / PC",
    code: "PMP",
    barges: [
      { name: "Heredia Sea", imo: "9387188" },
      { name: "Casper", imo: "9408815" },
      { name: "Kronos", imo: "9439280" },
      { name: "Puffin Two", imo: "9438274" },
    ],
  },
  {
    name: "Mediterranean Oil",
    code: "MEDOIL",
    barges: [
      { name: "Rosetta", imo: "9353888" },
      { name: "Alejandrina 1", imo: "9377028" },
      { name: "Eastern Eagle", imo: "9353905" },
      { name: "Maturity One", imo: "9661388" },
      { name: "Maturity Two", imo: "9661390" },
    ],
  },
  {
    name: "ABC",
    code: "ABC",
    barges: [
      { name: "Star Z", imo: "9164524" },
      { name: "Apriba", imo: "9200146" },
      { name: "Abc Trader", imo: "9340922" },
      { name: "Abc Iris", imo: "9514195" },
      { name: "Abc Am Moon", imo: "9416317" },
      { name: "Abc Sun", imo: "9416329" },
    ],
  },
  {
    name: "International Supply",
    code: "INTSUP",
    barges: [
      { name: "Miraj", imo: "9394741" },
      { name: "Daisy", imo: "9516545" },
      { name: "Andes", imo: "9411719" },
      { name: "Encelia", imo: "9240172" },
    ],
  },
  {
    name: "Petrochina",
    code: "PETRO",
    barges: [
    ],
  },
  {
    name: "Akron",
    code: "AKRON",
    barges: [
      { name: "Siene", imo: "9357640" },
      { name: "Cecile", imo: "9357676" },
      { name: "Silva", imo: "9357573" },
      { name: "Sorrelle", imo: "9357626" },
      { name: "Celesta", imo: "9357664" },
      { name: "Cora", imo: "9519705" },
      { name: "Vista Lll", imo: "9056806" },
      { name: "Francie", imo: "9546760" },
      { name: "Falda", imo: "9357585" },
    ],
  },
  {
    name: "Global",
    code: "GLOBA",
    barges: [
      { name: "Swan", imo: "9502386" },
      { name: "Nile", imo: "9552745" },
      { name: "Rhine", imo: "9502374" },
    ],
  },
  {
    name: "VTTI",
    code: "VTTI",
    barges: [
      { name: "Quinn", imo: "9538842" },
      { name: "Marine Xena", imo: "9438195" },
      { name: "Island Ruby", imo: "9578488" },
      { name: "Marine Ista", imo: "9422823" },
    ],
  },
  {
    name: "Minerva",
    code: "MINER",
    barges: [
      { name: "Paros 1", imo: "9371323" },
      { name: "Tilos", imo: "9417945" },
      { name: "Ithaki", imo: "9382176" },
    ],
  },
  {
    name: "Montfort",
    code: "MONTF",
    barges: [
      { name: "Amelia", imo: "9427263" },
      { name: "Blue Alliance", imo: "9471173" },
      { name: "Maximus", imo: "9387164" },
    ],
  },
  {
    name: "Peninsula",
    code: "PENIN",
    barges: [
      { name: "Hercules Star", imo: "9916135" },
      { name: "Vemagrace", imo: "9553282" },
      { name: "Hercules Comet", imo: "9825087" },
    ],
  },
  {
    name: "Overseas Petroleum & Trading",
    code: "OPT",
    barges: [
      { name: "Elena 1", imo: "9286451" },
      { name: "Bravo", imo: "9305403" },
    ],
  },
  {
    name: "Petrogulf",
    code: "PETRO2",
    barges: [
      { name: "Somdos", imo: "9268186" },
    ],
  },
  {
    name: "OPL Tankers DMCC",
    code: "OPLTK",
    barges: [
      { name: "Ardbeg", imo: "9190315" },
      { name: "Talisker", imo: "9190327" },
    ],
  },
  {
    name: "Arya Commodities",
    code: "ARYA",
    barges: [
      { name: "P 5", imo: "9228590" },
    ],
  },
  {
    name: "1Energin",
    code: "1ENER",
    barges: [
      { name: "Casper", imo: "9408815" },
    ],
  },
  {
    name: "Tigonic",
    code: "TIGON",
    barges: [
      { name: "Iconic 1", imo: "9342621" },
    ],
  },
  {
    name: "IME",
    code: "IME",
    barges: [
      { name: "Chapparel 3", imo: "9054951" },
      { name: "Eton", imo: "9542910" },
      { name: "Mt Kurt Mas", imo: "9387176" },
      { name: "Sea Shore", imo: "9510553" },
      { name: "Mt Cavendish", imo: "9489120" },
      { name: "H415", imo: "9142320" },
    ],
  },
  {
    name: "Monjasa",
    code: "MONJA",
    barges: [
      { name: "Chaser", imo: "9439292" },
      { name: "Monjasa Server", imo: "9510577" },
      { name: "Monjasa Shaker", imo: "9510591" },
      { name: "Green Zeebrugge", imo: "9750024" },
      { name: "Clio", imo: "9833450" },
      { name: "Monjasa Shipper", imo: "9825025" },
      { name: "Shandong Juniper", imo: "9253222" },
      { name: "Monjasa Master", imo: "9461659" },
    ],
  },
  {
    name: "Sea Leader",
    code: "SEALDR",
    barges: [
      { name: "Nyala", imo: "9424223" },
      { name: "Dalia", imo: "9322982" },
      { name: "Nermeen", imo: "9322097" },
      { name: "Skylight", imo: "9330020" },
      { name: "Kawa Kawa", imo: "9660413" },
      { name: "Dorian", imo: "9190834" },
    ],
  },
  {
    name: "Fratelli Cosulich",
    code: "FRATCO",
    barges: [
      { name: "Margherita Cosulich", imo: "9825051" },
    ],
  },
  {
    name: "SPR Global",
    code: "SPRGLB",
    barges: [
      { name: "Intan Glory", imo: "9358814" },
      { name: "Khadiga", imo: "9321469" },
      { name: "Nermeen", imo: "9322097" },
      { name: "Arabian Energy", imo: "9417490" },
      { name: "Maro", imo: "9115432" },
    ],
  },
]
