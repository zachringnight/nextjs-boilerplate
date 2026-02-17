-- Add social handles and location columns to athletes table
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/rnfvmqflktghriqefatc/sql

ALTER TABLE athletes ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS x_handle TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS team_city TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS team_state TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS hometown_city TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS hometown_state TEXT;

-- Batch 1: Athletes 1-25
UPDATE athletes SET instagram_handle='nazshiftyy', x_handle='canttstop3', team_city='Napa', team_state='California', hometown_city='Savannah', hometown_state='Georgia' WHERE id=1;
UPDATE athletes SET instagram_handle='hugoglezz_', x_handle='hugoglezz_', team_city='Boston', team_state='Massachusetts', hometown_city='Madrid', hometown_state='Spain' WHERE id=2;
UPDATE athletes SET instagram_handle='d1nkpate', x_handle='IAMTHESHOOTER1', team_city='New York', team_state='New York', hometown_city='Dallas', hometown_state='Texas' WHERE id=3;
UPDATE athletes SET instagram_handle='vj.edgecombe', x_handle='vj_edgecombe', team_city='Philadelphia', team_state='Pennsylvania', hometown_city='Bimini', hometown_state='Bahamas' WHERE id=4;
UPDATE athletes SET instagram_handle='captainjack.22', x_handle='22_captainjack', team_city='Queens', team_state='New York', hometown_city='Bronx', hometown_state='New York' WHERE id=5;
UPDATE athletes SET instagram_handle='haad.0', x_handle='tahaadpettiford', team_city='Auburn', team_state='Alabama', hometown_city='Jersey City', hometown_state='New Jersey' WHERE id=6;
UPDATE athletes SET instagram_handle='qjay_21', x_handle='qjayhoops', team_city='Lexington', team_state='Kentucky', hometown_city='Cleveland', hometown_state='Ohio' WHERE id=7;
UPDATE athletes SET instagram_handle='iamtre20', x_handle='iamtrejohnson1', team_city='Washington', team_state='District of Columbia', hometown_city='Dallas', hometown_state='Texas' WHERE id=8;
UPDATE athletes SET instagram_handle='mercymiller', x_handle='mercymiller25', team_city='Houston', team_state='Texas', hometown_city='Sherman Oaks', hometown_state='California' WHERE id=9;
UPDATE athletes SET instagram_handle='iluvjamari', x_handle='iluvjamari', team_city='Eugene', team_state='Oregon', hometown_city='Modesto', hometown_state='California' WHERE id=10;
UPDATE athletes SET instagram_handle='alijah0arenas', x_handle='alijah0arenas', team_city='Los Angeles', team_state='California', hometown_city='Chatsworth', hometown_state='California' WHERE id=11;
UPDATE athletes SET instagram_handle='_thetyranstokes', x_handle='tyran_stokes', team_city='Seattle', team_state='Washington', hometown_city='Louisville', hometown_state='Kentucky' WHERE id=12;
UPDATE athletes SET instagram_handle='carterdbryant', x_handle='carterdbryant', team_city='Tucson', team_state='Arizona', hometown_city='Riverside', hometown_state='California' WHERE id=13;
UPDATE athletes SET instagram_handle='vazoomana', x_handle='r2rzoom', team_city='Seattle', team_state='Washington', hometown_city='Tacoma', hometown_state='Washington' WHERE id=14;
UPDATE athletes SET instagram_handle='leek', x_handle='ThomasMeleek', team_city='Fayetteville', team_state='Arkansas', hometown_city='Pittsburgh', hometown_state='Pennsylvania' WHERE id=15;
UPDATE athletes SET instagram_handle='lukadoncic', x_handle='luka7doncic', team_city='Dallas', team_state='Texas', hometown_city='Ljubljana', hometown_state='Slovenia' WHERE id=16;
UPDATE athletes SET instagram_handle='poisonivey', x_handle='IveyJaden', team_city='Detroit', team_state='Michigan', hometown_city='South Bend', hometown_state='Indiana' WHERE id=17;
UPDATE athletes SET instagram_handle='amen.thompson', x_handle='amen_thompson', team_city='Houston', team_state='Texas', hometown_city='San Leandro', hometown_state='California' WHERE id=18;
UPDATE athletes SET instagram_handle='ausarthompson', x_handle='ThompsonAusar', team_city='Detroit', team_state='Michigan', hometown_city='San Leandro', hometown_state='California' WHERE id=19;
UPDATE athletes SET instagram_handle='keyonte1george', x_handle='keyonte1george', team_city='Salt Lake City', team_state='Utah', hometown_city='Lewisville', hometown_state='Texas' WHERE id=20;
UPDATE athletes SET instagram_handle='cason.wallace', x_handle='wallace_cason', team_city='Oklahoma City', team_state='Oklahoma', hometown_city='Richardson', hometown_state='Texas' WHERE id=21;
UPDATE athletes SET instagram_handle='chet_holmgren', x_handle='ChetHolmgren', team_city='Oklahoma City', team_state='Oklahoma', hometown_city='Minneapolis', hometown_state='Minnesota' WHERE id=22;
UPDATE athletes SET instagram_handle='shai', x_handle='shaiglalex', team_city='Oklahoma City', team_state='Oklahoma', hometown_city='Hamilton', hometown_state='Ontario, Canada' WHERE id=23;
UPDATE athletes SET instagram_handle='reedsheppard3', x_handle='reed_sheppard', team_city='Houston', team_state='Texas', hometown_city='London', hometown_state='Kentucky' WHERE id=24;
UPDATE athletes SET instagram_handle='donovanclingan', x_handle='clingan_donovan', team_city='Portland', team_state='Oregon', hometown_city='Bristol', hometown_state='Connecticut' WHERE id=25;

-- Batch 2: Athletes 26-50
UPDATE athletes SET instagram_handle='_wubbs', x_handle='JaKobeWalter1', team_city='Toronto', team_state='Canada', hometown_city='McKinney', hometown_state='Texas' WHERE id=26;
UPDATE athletes SET instagram_handle='jmac', x_handle='J_mccain_24', team_city='Philadelphia', team_state='Pennsylvania', hometown_city='Sacramento', hometown_state='California' WHERE id=27;
UPDATE athletes SET instagram_handle='matasbuzelis', x_handle='BuzelisMatas', team_city='Chicago', team_state='Illinois', hometown_city='Chicago', hometown_state='Illinois' WHERE id=28;
UPDATE athletes SET instagram_handle='noigbub', x_handle='bmoreelite', team_city='Washington', team_state='District of Columbia', hometown_city='Baltimore', hometown_state='Maryland' WHERE id=29;
UPDATE athletes SET instagram_handle='daltonknecht', x_handle='DaltonKnecht3', team_city='Los Angeles', team_state='California', hometown_city='Thornton', hometown_state='Colorado' WHERE id=30;
UPDATE athletes SET instagram_handle='bobiklintman', x_handle='Klintman14', team_city='Detroit', team_state='Michigan', hometown_city='Malmö', hometown_state='Sweden' WHERE id=31;
UPDATE athletes SET instagram_handle='kwamevansjr', x_handle='kwameevansjr', team_city='Eugene', team_state='Oregon', hometown_city='Baltimore', hometown_state='Maryland' WHERE id=32;
UPDATE athletes SET instagram_handle='omahabiliew', x_handle='BiliewOmaha', team_city='Winston-Salem', team_state='North Carolina', hometown_city='West Des Moines', hometown_state='Iowa' WHERE id=33;
UPDATE athletes SET instagram_handle='elmarkojackson', x_handle='ElmarkoJ', team_city='Lawrence', team_state='Kansas', hometown_city='Marlton', hometown_state='New Jersey' WHERE id=34;
UPDATE athletes SET instagram_handle='elllio', x_handle='ElliotCadeau', team_city='Ann Arbor', team_state='Michigan', hometown_city='West Orange', hometown_state='New Jersey' WHERE id=35;
UPDATE athletes SET instagram_handle='roccozikarsky', x_handle='RoccoZikarsky', team_city='Brisbane', team_state='Australia', hometown_city='Sunshine Coast', hometown_state='Australia' WHERE id=36;
UPDATE athletes SET instagram_handle='caitlinclark22', x_handle='CaitlinClark22', team_city='Indianapolis', team_state='Indiana', hometown_city='Des Moines', hometown_state='Iowa' WHERE id=37;
UPDATE athletes SET instagram_handle='angelreese5', x_handle='Reese10Angel', team_city='Chicago', team_state='Illinois', hometown_city='Randallstown', hometown_state='Maryland' WHERE id=38;
UPDATE athletes SET instagram_handle='aidanhutch97', x_handle='aidanhutch97', team_city='Detroit', team_state='Michigan', hometown_city='Plymouth', hometown_state='Michigan' WHERE id=39;
UPDATE athletes SET instagram_handle='jjmccarthy', x_handle='jjmccarthy09', team_city='Minneapolis', team_state='Minnesota', hometown_city='La Grange Park', hometown_state='Illinois' WHERE id=40;
UPDATE athletes SET instagram_handle='themp9', x_handle='themikepenix', team_city='Atlanta', team_state='Georgia', hometown_city='Dade City', hometown_state='Florida' WHERE id=41;
UPDATE athletes SET instagram_handle='romeodunze', x_handle='RomeOdunze', team_city='Chicago', team_state='Illinois', hometown_city='Las Vegas', hometown_state='Nevada' WHERE id=42;
UPDATE athletes SET instagram_handle='joemilton5', x_handle='Qbjayy7', team_city='Dallas', team_state='Texas', hometown_city='Pahokee', hometown_state='Florida' WHERE id=43;
UPDATE athletes SET instagram_handle='brian.thomas11', x_handle='BrianThomas_11', team_city='Jacksonville', team_state='Florida', hometown_city='Walker', hometown_state='Louisiana' WHERE id=44;
UPDATE athletes SET instagram_handle='brae1on', x_handle='BraelonAllen', team_city='New York', team_state='New York', hometown_city='Fond du Lac', hometown_state='Wisconsin' WHERE id=45;
UPDATE athletes SET instagram_handle='tlawrence16', x_handle='Trevorlawrencee', team_city='Jacksonville', team_state='Florida', hometown_city='Cartersville', hometown_state='Georgia' WHERE id=46;
UPDATE athletes SET instagram_handle='archmanning', x_handle='ArchManning', team_city='Austin', team_state='Texas', hometown_city='New Orleans', hometown_state='Louisiana' WHERE id=47;
UPDATE athletes SET instagram_handle='quinn_ewers', x_handle='QuinnEwers', team_city='Austin', team_state='Texas', hometown_city='Southlake', hometown_state='Texas' WHERE id=48;
UPDATE athletes SET instagram_handle='dylan.raiola', x_handle='RaiolaDylan', team_city='Lincoln', team_state='Nebraska', hometown_city='Buford', hometown_state='Georgia' WHERE id=49;
UPDATE athletes SET instagram_handle='juliansayin', x_handle='juliansayin2', team_city='Columbus', team_state='Ohio', hometown_city='Carlsbad', hometown_state='California' WHERE id=50;

-- Batch 3: Athletes 51-75
UPDATE athletes SET instagram_handle='milticketfour', x_handle='JalenMilroe', team_city='Seattle', team_state='Washington', hometown_city='Katy', hometown_state='Texas' WHERE id=51;
UPDATE athletes SET instagram_handle='justinherbert', x_handle=NULL, team_city='Los Angeles', team_state='California', hometown_city='Eugene', hometown_state='Oregon' WHERE id=52;
UPDATE athletes SET instagram_handle='k.mbappe', x_handle='KMbappe', team_city='Madrid', team_state='Spain', hometown_city='Bondy', hometown_state='France' WHERE id=53;
UPDATE athletes SET instagram_handle='cmpulisic', x_handle='cpulisic_10', team_city='Milan', team_state='Italy', hometown_city='Hershey', hometown_state='Pennsylvania' WHERE id=54;
UPDATE athletes SET instagram_handle='janniksin', x_handle='janniksin', team_city=NULL, team_state=NULL, hometown_city='San Candido', hometown_state='Italy' WHERE id=55;
UPDATE athletes SET instagram_handle='lexi.rodriguez__', x_handle='Alexis14Rod', team_city='Lincoln', team_state='Nebraska', hometown_city='Sterling', hometown_state='Illinois' WHERE id=56;
UPDATE athletes SET instagram_handle='ryhamp', x_handle='ryhamp14', team_city='Rockwall', team_state='Texas', hometown_city='Rockwall', hometown_state='Texas' WHERE id=57;
UPDATE athletes SET instagram_handle='lily.yohannes', x_handle='LilyYohannes10', team_city='Amsterdam', team_state='Netherlands', hometown_city='Springfield', hometown_state='Virginia' WHERE id=58;
UPDATE athletes SET instagram_handle='_pres1dentkee', x_handle='Pres1dential', team_city='Tuscaloosa', team_state='Alabama', hometown_city='Duncanville', hometown_state='Texas' WHERE id=59;
UPDATE athletes SET instagram_handle='wingo.4', x_handle='_Ryanwingo1', team_city='Austin', team_state='Texas', hometown_city='St. Louis', hometown_state='Missouri' WHERE id=60;
UPDATE athletes SET instagram_handle='_jeremiahfears', x_handle='jeremiahfears2', team_city='New Orleans', team_state='Louisiana', hometown_city='Joliet', hometown_state='Illinois' WHERE id=61;
UPDATE athletes SET instagram_handle='devshowtimee', x_handle='devdorrough4', team_city='Henderson', team_state='Nevada', hometown_city='Elk Grove', hometown_state='California' WHERE id=62;
UPDATE athletes SET instagram_handle='killakam2028', x_handle='kameron_mercer', team_city='Cincinnati', team_state='Ohio', hometown_city='Cincinnati', hometown_state='Ohio' WHERE id=63;
UPDATE athletes SET instagram_handle='tajhariza', x_handle='_theetajhariza', team_city='Los Angeles', team_state='California', hometown_city='Playa Del Rey', hometown_state='California' WHERE id=64;
UPDATE athletes SET instagram_handle='bmull24', x_handle='mullins_braylon', team_city='Storrs', team_state='Connecticut', hometown_city='Greenfield', hometown_state='Indiana' WHERE id=65;
UPDATE athletes SET instagram_handle='nik.khamenia', x_handle='NikolasKhamenia', team_city='Durham', team_state='North Carolina', hometown_city='North Hollywood', hometown_state='California' WHERE id=66;
UPDATE athletes SET instagram_handle='muurinen.miikka', x_handle='mmuurinen1', team_city='Belgrade', team_state='Serbia', hometown_city='Jarvenpaa', hometown_state='Finland' WHERE id=67;
UPDATE athletes SET instagram_handle='travbazzana', x_handle='tbazzana', team_city='Cleveland', team_state='Ohio', hometown_city='Sydney', hometown_state='Australia' WHERE id=68;
UPDATE athletes SET instagram_handle='nickkurtz_8', x_handle='nickkurtz23', team_city='Oakland', team_state='California', hometown_city='Lancaster', hometown_state='Pennsylvania' WHERE id=69;
UPDATE athletes SET instagram_handle='seaverking', x_handle='Seaver_2_', team_city='Washington', team_state='D.C.', hometown_city='Athens', hometown_state='Georgia' WHERE id=70;
UPDATE athletes SET instagram_handle='hagensmith33', x_handle='hagensmith32', team_city='Chicago', team_state='Illinois', hometown_city='Bullard', hometown_state='Texas' WHERE id=71;
UPDATE athletes SET instagram_handle='konnorgriffin', x_handle='KonnorGriffin22', team_city='Pittsburgh', team_state='Pennsylvania', hometown_city='Florence', hometown_state='Mississippi' WHERE id=72;
UPDATE athletes SET instagram_handle='_cmo1', x_handle='Moore10Chris', team_city='Los Angeles', team_state='California', hometown_city='Brooklyn', hometown_state='New York' WHERE id=73;
UPDATE athletes SET instagram_handle='braden_montgomery_', x_handle='B_mont_', team_city='Boston', team_state='Massachusetts', hometown_city='Madison', hometown_state='Mississippi' WHERE id=74;
UPDATE athletes SET instagram_handle='camsmith11', x_handle='cameron_smith24', team_city='Chicago', team_state='Illinois', hometown_city='Lake Worth', hometown_state='Florida' WHERE id=75;

-- Batch 4: Athletes 76-102
UPDATE athletes SET instagram_handle='xavier_legette', x_handle='XavierLegette', team_city='Charlotte', team_state='North Carolina', hometown_city='Mullins', hometown_state='South Carolina' WHERE id=76;
UPDATE athletes SET instagram_handle='omarion.hampton', x_handle='OmarionHampton', team_city='Chapel Hill', team_state='North Carolina', hometown_city='Clayton', hometown_state='North Carolina' WHERE id=77;
UPDATE athletes SET instagram_handle='zachh.branch', x_handle='zachariahb03', team_city='Los Angeles', team_state='California', hometown_city='Las Vegas', hometown_state='Nevada' WHERE id=78;
UPDATE athletes SET instagram_handle='toryhorton_', x_handle='toryhorton11', team_city='Fort Collins', team_state='Colorado', hometown_city='Fresno', hometown_state='California' WHERE id=79;
UPDATE athletes SET instagram_handle='mpratt__', x_handle='Mpratt_', team_city='Green Bay', team_state='Wisconsin', hometown_city='Boca Raton', hometown_state='Florida' WHERE id=80;
UPDATE athletes SET instagram_handle='spencer_rattler', x_handle='SpencerRattler', team_city='New Orleans', team_state='Louisiana', hometown_city='Phoenix', hometown_state='Arizona' WHERE id=81;
UPDATE athletes SET instagram_handle='keoncoleman3', x_handle='keoncoleman6', team_city='Buffalo', team_state='New York', hometown_city='Opelousas', hometown_state='Louisiana' WHERE id=82;
UPDATE athletes SET instagram_handle='malachicorley', x_handle='CorleyMalachi', team_city='New York', team_state='New York', hometown_city='Campbellsville', hometown_state='Kentucky' WHERE id=83;
UPDATE athletes SET instagram_handle='koolaid.glizxzy', x_handle='GaQMcK1', team_city='New Orleans', team_state='Louisiana', hometown_city='Pinson', hometown_state='Alabama' WHERE id=84;
UPDATE athletes SET instagram_handle='garrettwilson', x_handle='GarrettWilson_V', team_city='New York', team_state='New York', hometown_city='Columbus', hometown_state='Ohio' WHERE id=85;
UPDATE athletes SET instagram_handle='juicew3lls', x_handle='juicew3lls', team_city='Oxford', team_state='Mississippi', hometown_city='Richmond', hometown_state='Virginia' WHERE id=86;
UPDATE athletes SET instagram_handle='orondegii', x_handle='Orondegii', team_city='Syracuse', team_state='New York', hometown_city='Fort Lauderdale', hometown_state='Florida' WHERE id=87;
UPDATE athletes SET instagram_handle='djlagway', x_handle='DerekLagway', team_city='Gainesville', team_state='Florida', hometown_city='Willis', hometown_state='Texas' WHERE id=88;
UPDATE athletes SET instagram_handle='willhoward', x_handle='whoward_', team_city='Columbus', team_state='Ohio', hometown_city='Downingtown', hometown_state='Pennsylvania' WHERE id=89;
UPDATE athletes SET instagram_handle='hm_son7', x_handle='Sonny7', team_city='London', team_state='England', hometown_city='Chuncheon', hometown_state='South Korea' WHERE id=90;
UPDATE athletes SET instagram_handle='ethanhollidayy', x_handle='ethanholliday2', team_city=NULL, team_state=NULL, hometown_city='Stillwater', hometown_state='Oklahoma' WHERE id=91;
UPDATE athletes SET instagram_handle='riley.jleonard', x_handle='rileyleonard13_', team_city='Notre Dame', team_state='Indiana', hometown_city='Fairhope', hometown_state='Alabama' WHERE id=92;
UPDATE athletes SET instagram_handle='babatheballer10', x_handle='babaoladotun_', team_city='Silver Spring', team_state='Maryland', hometown_city='Silver Spring', hometown_state='Maryland' WHERE id=93;
UPDATE athletes SET instagram_handle='deuce', x_handle='AshtonJeanty2', team_city='Boise', team_state='Idaho', hometown_city='Frisco', hometown_state='Texas' WHERE id=94;
UPDATE athletes SET instagram_handle='gabrielbatistutaok', x_handle='GBatistutaOK', team_city='Buenos Aires', team_state='Argentina', hometown_city='Reconquista', hometown_state='Argentina' WHERE id=95;
UPDATE athletes SET instagram_handle='azzi35', x_handle='azzi_35', team_city='Storrs', team_state='Connecticut', hometown_city='Washington', hometown_state='District of Columbia' WHERE id=96;
UPDATE athletes SET instagram_handle='patrickmahomes', x_handle='PatrickMahomes', team_city='Kansas City', team_state='Missouri', hometown_city='Tyler', hometown_state='Texas' WHERE id=97;
UPDATE athletes SET instagram_handle='aja22wilson', x_handle='_ajawilson22', team_city='Las Vegas', team_state='Nevada', hometown_city='Columbia', hometown_state='South Carolina' WHERE id=98;
UPDATE athletes SET instagram_handle='jamie.arnold1', x_handle='_JamieArnold13', team_city='Tallahassee', team_state='Florida', hometown_city='Tampa', hometown_state='Florida' WHERE id=99;
UPDATE athletes SET instagram_handle='seth_hernandez_22', x_handle='s_hernandez_22', team_city=NULL, team_state=NULL, hometown_city='Chino', hometown_state='California' WHERE id=100;
UPDATE athletes SET instagram_handle='bcarlsonnnn', x_handle='bcarlsonn3', team_city=NULL, team_state=NULL, hometown_city='Corona', hometown_state='California' WHERE id=101;
UPDATE athletes SET instagram_handle='chriishenryjr', x_handle='ChrisHenryJr', team_city=NULL, team_state=NULL, hometown_city='Cincinnati', hometown_state='Ohio' WHERE id=102;
