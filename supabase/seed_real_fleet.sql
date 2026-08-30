-- BunkerWatch: bulk load real fleet (23 competitors, 90 barges)
-- Barge inserts are safe to re-run (ON CONFLICT DO NOTHING on IMO).
-- Competitor inserts are NOT idempotent — only run this once. If you
-- need to re-run after a partial failure, delete any partially
-- inserted competitors first (their barges cascade-delete with them).
--
-- Three barges appear under two competitors in the source spreadsheet
-- (chartered/shared vessels). Each is kept on its first-listed
-- competitor, with a note recording the other charter relationship,
-- since a barge can only belong to one competitor in the schema.

do $$
declare
  comp_0_id uuid;
  comp_1_id uuid;
  comp_2_id uuid;
  comp_3_id uuid;
  comp_4_id uuid;
  comp_5_id uuid;
  comp_6_id uuid;
  comp_7_id uuid;
  comp_8_id uuid;
  comp_9_id uuid;
  comp_10_id uuid;
  comp_11_id uuid;
  comp_12_id uuid;
  comp_13_id uuid;
  comp_14_id uuid;
  comp_15_id uuid;
  comp_16_id uuid;
  comp_17_id uuid;
  comp_18_id uuid;
  comp_19_id uuid;
  comp_20_id uuid;
  comp_21_id uuid;
  comp_22_id uuid;
begin
  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'OMTI', 'OMTI', true) returning id into comp_0_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_0_id, 'Amal', '9239953', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_0_id, 'Al Mira', '9399973', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active, notes) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_0_id, 'Dorian', '9190834', true, 'Also chartered by Sea Leader per 14 Aug source sheet') on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_0_id, 'Chiwetalu', '9164213', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_0_id, 'Zuma', '9568471', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_0_id, 'Coya', '9524786', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_0_id, 'Gaia', '9661417', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_0_id, 'Verde', '9661429', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_0_id, 'Hide', '9661364', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_0_id, 'Sal', '9661405', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_0_id, 'Amber', '9604031', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_0_id, 'Simran', '9136644', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'Pearl Marine / PC', 'PMP', true) returning id into comp_1_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_1_id, 'Heredia Sea', '9387188', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active, notes) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_1_id, 'Casper', '9408815', true, 'Also chartered by 1Energin per 14 Aug source sheet') on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_1_id, 'Kronos', '9439280', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_1_id, 'Puffin Two', '9438274', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'Mediterranean Oil', 'MEDOIL', true) returning id into comp_2_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_2_id, 'Rosetta', '9353888', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_2_id, 'Alejandrina 1', '9377028', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_2_id, 'Eastern Eagle', '9353905', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_2_id, 'Maturity One', '9661388', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_2_id, 'Maturity Two', '9661390', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'ABC', 'ABC', true) returning id into comp_3_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_3_id, 'Star Z', '9164524', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_3_id, 'Apriba', '9200146', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_3_id, 'Abc Trader', '9340922', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_3_id, 'Abc Iris', '9514195', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_3_id, 'Abc Am Moon', '9416317', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_3_id, 'Abc Sun', '9416329', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'International Supply', 'INTSUP', true) returning id into comp_4_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_4_id, 'Miraj', '9394741', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_4_id, 'Daisy', '9516545', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_4_id, 'Andes', '9411719', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_4_id, 'Encelia', '9240172', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'Petrochina', 'PETRO', true) returning id into comp_5_id;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'Akron', 'AKRON', true) returning id into comp_6_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_6_id, 'Siene', '9357640', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_6_id, 'Cecile', '9357676', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_6_id, 'Silva', '9357573', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_6_id, 'Sorrelle', '9357626', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_6_id, 'Celesta', '9357664', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_6_id, 'Cora', '9519705', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_6_id, 'Vista Lll', '9056806', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_6_id, 'Francie', '9546760', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_6_id, 'Falda', '9357585', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'Global', 'GLOBA', true) returning id into comp_7_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_7_id, 'Swan', '9502386', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_7_id, 'Nile', '9552745', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_7_id, 'Rhine', '9502374', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'VTTI', 'VTTI', true) returning id into comp_8_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_8_id, 'Quinn', '9538842', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_8_id, 'Marine Xena', '9438195', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_8_id, 'Island Ruby', '9578488', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_8_id, 'Marine Ista', '9422823', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'Minerva', 'MINER', true) returning id into comp_9_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_9_id, 'Paros 1', '9371323', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_9_id, 'Tilos', '9417945', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_9_id, 'Ithaki', '9382176', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'Montfort', 'MONTF', true) returning id into comp_10_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_10_id, 'Amelia', '9427263', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_10_id, 'Blue Alliance', '9471173', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_10_id, 'Maximus', '9387164', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'Peninsula', 'PENIN', true) returning id into comp_11_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_11_id, 'Hercules Star', '9916135', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_11_id, 'Vemagrace', '9553282', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_11_id, 'Hercules Comet', '9825087', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'Overseas Petroleum & Trading', 'OPT', true) returning id into comp_12_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_12_id, 'Elena 1', '9286451', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_12_id, 'Bravo', '9305403', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'Petrogulf', 'PETRO2', true) returning id into comp_13_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_13_id, 'Somdos', '9268186', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'OPL Tankers DMCC', 'OPLTK', true) returning id into comp_14_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_14_id, 'Ardbeg', '9190315', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_14_id, 'Talisker', '9190327', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'Arya Commodities', 'ARYA', true) returning id into comp_15_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_15_id, 'P 5', '9228590', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', '1Energin', '1ENER', true) returning id into comp_16_id;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'Tigonic', 'TIGON', true) returning id into comp_17_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_17_id, 'Iconic 1', '9342621', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'IME', 'IME', true) returning id into comp_18_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_18_id, 'Chapparel 3', '9054951', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_18_id, 'Eton', '9542910', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_18_id, 'Mt Kurt Mas', '9387176', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_18_id, 'Sea Shore', '9510553', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_18_id, 'Mt Cavendish', '9489120', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_18_id, 'H415', '9142320', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'Monjasa', 'MONJA', true) returning id into comp_19_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_19_id, 'Chaser', '9439292', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_19_id, 'Monjasa Server', '9510577', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_19_id, 'Monjasa Shaker', '9510591', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_19_id, 'Green Zeebrugge', '9750024', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_19_id, 'Clio', '9833450', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_19_id, 'Monjasa Shipper', '9825025', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_19_id, 'Shandong Juniper', '9253222', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_19_id, 'Monjasa Master', '9461659', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'Sea Leader', 'SEALDR', true) returning id into comp_20_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_20_id, 'Nyala', '9424223', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_20_id, 'Dalia', '9322982', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active, notes) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_20_id, 'Nermeen', '9322097', true, 'Also chartered by SPR Global per 14 Aug source sheet') on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_20_id, 'Skylight', '9330020', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_20_id, 'Kawa Kawa', '9660413', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'Fratelli Cosulich', 'FRATCO', true) returning id into comp_21_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_21_id, 'Margherita Cosulich', '9825051', true) on conflict (organization_id, imo) do nothing;

  insert into competitors (organization_id, name, code, active) values ('1c9acd49-103b-4455-aaae-f96933896350', 'SPR Global', 'SPRGLB', true) returning id into comp_22_id;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_22_id, 'Intan Glory', '9358814', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_22_id, 'Khadiga', '9321469', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_22_id, 'Arabian Energy', '9417490', true) on conflict (organization_id, imo) do nothing;
  insert into barges (organization_id, competitor_id, name, imo, active) values ('1c9acd49-103b-4455-aaae-f96933896350', comp_22_id, 'Maro', '9115432', true) on conflict (organization_id, imo) do nothing;

end $$;
