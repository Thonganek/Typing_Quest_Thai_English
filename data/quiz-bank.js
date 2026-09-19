/* Offline practice-question generators for AR Hero Typing Quest.
   These are original practice items, not official papers from any school. */
(function(){
  'use strict';

  function hash(text){
    let value = 2166136261;
    for(const char of String(text)){
      value ^= char.charCodeAt(0);
      value = Math.imul(value,16777619);
    }
    return value >>> 0;
  }

  function seededShuffle(values,seedText){
    const result = [...values];
    let seed = hash(seedText) || 1;
    for(let index=result.length-1;index>0;index--){
      seed = (Math.imul(seed,1664525) + 1013904223) >>> 0;
      const target = seed % (index + 1);
      [result[index],result[target]] = [result[target],result[index]];
    }
    return result;
  }

  function question(id,subject,level,category,prompt,correct,wrong,explanation,track='standard'){
    const options = [];
    [correct,...wrong].forEach(value => {
      const text = String(value);
      if(!options.includes(text)) options.push(text);
    });
    // ไม่เติมตัวเลือกปลอมที่ซ้ำกับคำตอบ ถ้าตัวลวงไม่พอก็แสดงเท่าที่มีจริง
    const choices = seededShuffle(options.slice(0,4),id);
    return {id,subject,level,category,question:prompt,choices,answer:choices.indexOf(String(correct)),explanation,track};
  }

  function pickWrong(correct,candidates){
    const seen = new Set([String(correct)]);
    const picked = [];
    candidates.forEach(candidate => {
      const text = String(candidate);
      if(seen.has(text)) return;
      seen.add(text);
      picked.push(text);
    });
    return picked.slice(0,3);
  }

  function gcdOf(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a || 1; }

  function lowestTerms(numerator,denominator){
    const divisor = gcdOf(numerator,denominator);
    const top = numerator / divisor, bottom = denominator / divisor;
    return bottom === 1 ? String(top) : `${top}/${bottom}`;
  }

  function fractionValue(text){
    const match = String(text).match(/^(-?\d+)\/(-?\d+)$/);
    return match ? Number(match[1]) / Number(match[2]) : NaN;
  }

  // ตัวลวงของโจทย์เศษส่วน ต้องไม่ "มีค่าเท่ากับ" คำตอบ ไม่ใช่แค่เขียนต่างกัน
  function pickWrongFraction(correct,candidates){
    const correctValue = fractionValue(correct);
    const seen = new Set([String(correct)]);
    const picked = [];
    candidates.forEach(candidate => {
      const text = String(candidate);
      if(seen.has(text)) return;
      const value = fractionValue(text);
      if(!Number.isNaN(correctValue) && value === correctValue) return;
      seen.add(text);
      picked.push(text);
    });
    return picked.slice(0,3);
  }

  function clockAt(totalMinutes){
    const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
    return `${Math.floor(wrapped / 60)}:${String(wrapped % 60).padStart(2,'0')} น.`;
  }

  function formatNumber(value){
    const rounded = Math.round((Number(value) + Number.EPSILON) * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  }

  function numericQuestion(id,grade,category,prompt,answer,distractors,explanation,track){
    const correct = formatNumber(answer);
    const wrong = distractors.map(formatNumber).filter(value => value !== correct);
    let step = 1;
    while(new Set([correct,...wrong]).size < 4){
      wrong.push(formatNumber(Number(answer) + step++));
    }
    return question(id,'math',grade,category,prompt,correct,wrong,explanation,track);
  }

  const englishLabels = {
    p1_3:'ป.1–ป.3',
    p4_6:'ป.4–ป.6',
    m1_3:'ม.1–ม.3',
    m4_6:'ม.4–ม.6',
    toefl:'TOEFL',
    toeic:'TOEIC',
    ielts:'IELTS',
    kku_aelt:'KKU-AELT',
    conversations:'บทสนทนา',
    tenses:'12 Tenses'
  };

  const foundationWords = [
    ['library','ห้องสมุด'],['hungry','หิว'],['teacher','ครู'],['market','ตลาด'],['careful','ระมัดระวัง'],['cloudy','มีเมฆมาก']
  ];
  const foundationRows = [
    {name:'Mina',thing:'a student',verb:'walks',base:'walk',place:'school',prep:'to',poss:'her'},
    {name:'Tom',thing:'my brother',verb:'plays',base:'play',place:'the park',prep:'in',poss:'his'},
    {name:'Nina',thing:'a nurse',verb:'works',base:'work',place:'a hospital',prep:'at',poss:'her'},
    {name:'Ben',thing:'my friend',verb:'reads',base:'read',place:'the library',prep:'in',poss:'his'},
    {name:'Jane',thing:'a singer',verb:'sings',base:'sing',place:'the stage',prep:'on',poss:'her'},
    {name:'Paul',thing:'a farmer',verb:'lives',base:'live',place:'a village',prep:'in',poss:'his'}
  ];

  function foundationQuestion(index){
    const variant = Math.floor(index/10);
    const type = index%10;
    const row = foundationRows[variant];
    const id = `en-foundation-${index+1}`;
    if(type===0){
      const word=foundationWords[variant];
      const wrong=foundationWords.filter((_,i)=>i!==variant).slice(0,3).map(item=>item[1]);
      return question(id,'english','foundation','Vocabulary',`What does “${word[0]}” mean in Thai?`,word[1],wrong,`“${word[0]}” แปลว่า “${word[1]}”`);
    }
    if(type===1) return question(id,'english','foundation','Verb to be',`${row.name} ___ ${row.thing}.`,'is',['am','are','be'],`ประธานเอกพจน์ใช้ is`);
    if(type===2) return question(id,'english','foundation','Present Simple',`${row.name} ___ ${row.prep} ${row.place} every day.`,row.verb,[row.base,`${row.base}ing`,`${row.base}ed`],`ประธานเอกพจน์ใน Present Simple เติม s/es: ${row.verb}`);
    if(type===3){
      const noun=['apple','orange','umbrella','egg','ant','idea'][variant];
      return question(id,'english','foundation','Articles',`I have ___ ${noun}.`,'an',['a','the','some'],`ใช้ an หน้าคำที่ขึ้นต้นด้วยเสียงสระ`);
    }
    if(type===4) return question(id,'english','foundation','Pronouns',`${row.name} has a bag. It is ___ bag.`,row.poss,['my','our','their'],`ใช้ ${row.poss} แสดงความเป็นเจ้าของของ ${row.name}`);
    if(type===5) return question(id,'english','foundation','Prepositions',`${row.name} is ${row.prep} ${row.place}.`,row.prep,['on','under','from'].filter(item=>item!==row.prep),`บุพบทที่เหมาะสมคือ ${row.prep}`);
    if(type===6){
      const pair=[['child','children'],['foot','feet'],['tooth','teeth'],['mouse','mice'],['person','people'],['woman','women']][variant];
      return question(id,'english','foundation','Plural nouns',`Choose the plural form of “${pair[0]}”.`,pair[1],[`${pair[0]}s`,`${pair[0]}es`,`${pair[0]}ren`],`${pair[0]} มีรูปพหูพจน์ว่า ${pair[1]}`);
    }
    if(type===7){
      const pair=[['big','small'],['hot','cold'],['fast','slow'],['happy','sad'],['early','late'],['clean','dirty']][variant];
      return question(id,'english','foundation','Opposites',`Which word is the opposite of “${pair[0]}”?`,pair[1],['good','long','new'].filter(item=>item!==pair[1]),`${pair[0]} ตรงข้ามกับ ${pair[1]}`);
    }
    if(type===8){
      const wh=[['___ is your name?','What'],['___ do you live?','Where'],['___ are you late?','Why'],['___ is your birthday?','When'],['___ is that boy?','Who'],['___ books do you have?','How many']][variant];
      return question(id,'english','foundation','Question words',wh[0],wh[1],['What','Where','Who','When','Why','How many'].filter(item=>item!==wh[1]).slice(0,3),`คำถามนี้ใช้ ${wh[1]}`);
    }
    const have = ['I','You','We','They'].includes(row.name) ? 'have' : 'has';
    return question(id,'english','foundation','Have / Has',`${row.name} ___ a new book.`,have,[have==='has'?'have':'has','having','had'],`ประธาน ${row.name} ใช้ ${have}`);
  }

  const primaryRows = [
    {name:'Anna',past:'visited',base:'visit',ing:'visiting',adj:'tall',more:'taller',noun:'water',quant:'much',place:'museum'},
    {name:'David',past:'bought',base:'buy',ing:'buying',adj:'easy',more:'easier',noun:'rice',quant:'much',place:'market'},
    {name:'Lucy',past:'wrote',base:'write',ing:'writing',adj:'beautiful',more:'more beautiful',noun:'books',quant:'many',place:'library'},
    {name:'Peter',past:'ran',base:'run',ing:'running',adj:'good',more:'better',noun:'chairs',quant:'many',place:'stadium'},
    {name:'Susan',past:'made',base:'make',ing:'making',adj:'busy',more:'busier',noun:'milk',quant:'much',place:'kitchen'},
    {name:'Kevin',past:'took',base:'take',ing:'taking',adj:'far',more:'farther',noun:'students',quant:'many',place:'school'}
  ];
  const primaryWords = [['borrow','ยืม'],['journey','การเดินทาง'],['repair','ซ่อมแซม'],['healthy','มีสุขภาพดี'],['environment','สิ่งแวดล้อม'],['invite','เชิญ']];

  function primaryQuestion(index){
    const variant=Math.floor(index/10),type=index%10,row=primaryRows[variant],id=`en-primary-${index+1}`;
    if(type===0) return question(id,'english','primary','Past Simple',`Yesterday, ${row.name} ___ the ${row.place}.`,row.past,[row.base,`${row.base}s`,`${row.base}ing`],`Yesterday บอกอดีต จึงใช้กริยาช่อง 2: ${row.past}`);
    if(type===1) return question(id,'english','primary','Comparatives',`${row.name}'s bag is ___ than mine.`,row.more,[row.adj,`most ${row.adj}`,`${row.adj}ly`],`มี than จึงใช้รูป comparative: ${row.more}`);
    if(type===2) return question(id,'english','primary','Present Continuous',`Look! ${row.name} ___ now.`,`is ${row.ing}`,[`${row.base}s`,`was ${row.ing}`,`has ${row.base}`],`เหตุการณ์ที่กำลังเกิดใช้ is/am/are + V-ing`);
    if(type===3) return question(id,'english','primary','Quantifiers',`How ___ ${row.noun} do we need?`,row.quant,[row.quant==='many'?'much':'many','few','little'],`${row.noun} ใช้กับ how ${row.quant}`);
    if(type===4) return question(id,'english','primary','Future',`${row.name} ___ the work tomorrow.`,`will ${row.base}`,[`${row.past}`,`${row.base}s`,`is ${row.base}`],`Tomorrow ใช้ will + กริยาช่อง 1`);
    if(type===5){
      const word=primaryWords[variant],wrong=primaryWords.filter((_,i)=>i!==variant).slice(0,3).map(item=>item[1]);
      return question(id,'english','primary','Vocabulary',`Choose the Thai meaning of “${word[0]}”.`,word[1],wrong,`“${word[0]}” แปลว่า “${word[1]}”`);
    }
    if(type===6){
      const connectors=[['It was raining, ___ we stayed home.','so'],['I was tired, ___ I finished my homework.','but'],['Wear a coat ___ it is cold.','because'],['Hurry up, ___ you will miss the bus.','or'],['I like tea ___ coffee.','and'],['___ he was sick, he went to school.','Although']][variant];
      return question(id,'english','primary','Connectors',connectors[0],connectors[1],['and','but','because','so','or','Although'].filter(item=>item!==connectors[1]).slice(0,3),`คำเชื่อมที่สื่อความหมายเหมาะสมคือ ${connectors[1]}`);
    }
    if(type===7){
      const modal=[['You ___ wear a helmet when riding a bike.','should'],['___ I borrow your pencil?','May'],['Students ___ run in the hallway.','must not'],['Birds ___ fly.','can'],['We ___ finish this today; it is required.','must'],['You ___ drink more water.','should']][variant];
      return question(id,'english','primary','Modal verbs',modal[0],modal[1],['can','should','must','may','must not'].filter(item=>item!==modal[1]).slice(0,3),`Modal ที่เหมาะกับบริบทคือ ${modal[1]}`);
    }
    if(type===8){
      const reading=[
        ['Nina feeds her cat every morning.','What does Nina do every morning?','She feeds her cat.'],
        ['Tom takes the bus because his school is far away.','Why does Tom take the bus?','His school is far away.'],
        ['The shop closes at eight o’clock.','When does the shop close?','At eight o’clock.'],
        ['Mali bought three red notebooks.','How many notebooks did Mali buy?','Three.'],
        ['The children planted trees behind the school.','Where did they plant the trees?','Behind the school.'],
        ['Ken was absent because he had a fever.','Why was Ken absent?','He had a fever.']
      ][variant];
      return question(id,'english','primary','Reading',`${reading[0]}\n\n${reading[1]}`,reading[2],['At noon.','By bicycle.','Two.'].filter(item=>item!==reading[2]),`คำตอบอยู่ในข้อความ: ${reading[2]}`);
    }
    return question(id,'english','primary','Subject–verb agreement',`${row.name} and I ___ English every week.`,`study`,['studies','studying','studied'],`ประธานสองคนเป็นพหูพจน์ ใช้กริยารูปพื้นฐาน`);
  }

  const juniorRows = [
    {name:'Maya',verb:'finish',v3:'finished',noun:'the project',place:'London',year:'2022'},
    {name:'James',verb:'write',v3:'written',noun:'the report',place:'Tokyo',year:'2021'},
    {name:'Linda',verb:'see',v3:'seen',noun:'that movie',place:'Paris',year:'2020'},
    {name:'Mark',verb:'build',v3:'built',noun:'the bridge',place:'Seoul',year:'2019'},
    {name:'Grace',verb:'choose',v3:'chosen',noun:'a new leader',place:'Sydney',year:'2018'},
    {name:'Henry',verb:'complete',v3:'completed',noun:'the assignment',place:'Bangkok',year:'2017'}
  ];
  const juniorWords = [['essential','necessary'],['rapid','fast'],['purchase','buy'],['assist','help'],['ancient','very old'],['observe','watch carefully']];

  function juniorQuestion(index){
    const variant=Math.floor(index/10),type=index%10,row=juniorRows[variant],id=`en-junior-${index+1}`;
    if(type===0) return question(id,'english','junior','Present Perfect',`${row.name} has already ___ ${row.noun}.`,row.v3,[row.verb,`${row.verb}ing`,`${row.verb}s`],`หลัง has ใช้ past participle (V3): ${row.v3}`);
    if(type===1) return question(id,'english','junior','Passive Voice',`${row.noun.replace(/^the /,'The ')} was ___ by ${row.name}.`,row.v3,[row.verb,`${row.verb}ing`,`${row.verb}s`],`Passive voice ใช้ was/were + V3`);
    if(type===2) return question(id,'english','junior','Conditionals',`If ${row.name} studies hard, ${row.name} ___ the test.`,'will pass',['passes','would pass','passed'],`First conditional: If + Present Simple, will + V1`);
    if(type===3) return question(id,'english','junior','Relative clauses',`${row.name} is the student ___ won the prize.`,'who',['which','where','whose'],`ใช้ who แทนบุคคลที่เป็นประธานของ relative clause`);
    if(type===4) return question(id,'english','junior','Reported Speech',`${row.name} said, “I am tired.” → ${row.name} said that ___ tired.`,`${row.name} was`,[`${row.name} is`,'I was','I am'],`Reported speech เปลี่ยน I ตามผู้พูดและ am เป็น was`);
    if(type===5){
      const word=juniorWords[variant];
      return question(id,'english','junior','Synonyms',`Which word or phrase is closest in meaning to “${word[0]}”?`,word[1],['unusual','difficult','quiet'].filter(item=>item!==word[1]),`${word[0]} มีความหมายใกล้เคียงกับ ${word[1]}`);
    }
    if(type===6){
      const phrasal=[['Please ___ the lights before leaving.','turn off'],['We need to ___ the meeting until Friday.','put off'],['She ___ her younger brother.','looks after'],['I want to ___ what happened.','find out'],['Do not ___ when the work is difficult.','give up'],['The plane will ___ at six.','take off']][variant];
      return question(id,'english','junior','Phrasal verbs',phrasal[0],phrasal[1],['look up','get over','take after'].filter(item=>item!==phrasal[1]),`Phrasal verb ที่ตรงความหมายคือ ${phrasal[1]}`);
    }
    if(type===7) return question(id,'english','junior','Question tags',`${row.name} has visited ${row.place}, ___?`,`hasn't ${row.name==='James'||row.name==='Mark'||row.name==='Henry'?'he':'she'}`,[`doesn't ${row.name==='James'||row.name==='Mark'||row.name==='Henry'?'he':'she'}`,`isn't ${row.name==='James'||row.name==='Mark'||row.name==='Henry'?'he':'she'}`,'has it'],`ประโยคหลักใช้ has จึงใช้ hasn't + pronoun`);
    if(type===8){
      const reading=[
        ['Although the road was flooded, the rescue team reached the village before dark.','What can be inferred?','The journey was difficult but successful.'],
        ['The library extended its hours during exam week so that students could study longer.','Why were the hours extended?','To give students more study time.'],
        ['Sara compared several sources before writing her report.','What skill did Sara demonstrate?','Careful research.'],
        ['The city added bicycle lanes to reduce traffic and air pollution.','What was the main purpose?','To improve transport and the environment.'],
        ['The experiment was repeated three times to confirm the result.','Why was it repeated?','To improve reliability.'],
        ['The team changed its plan after receiving new weather data.','What caused the change?','New weather information.']
      ][variant];
      return question(id,'english','junior','Reading inference',`${reading[0]}\n\n${reading[1]}`,reading[2],['The event was cancelled.','No evidence was used.','The task was easy.'],`คำตอบที่สอดคล้องกับข้อความที่สุดคือ ${reading[2]}`);
    }
    return question(id,'english','junior','Gerunds and infinitives',`${row.name} enjoys ___ new things.`,`learning`,['to learned','learned','learns'],`หลัง enjoy ใช้ gerund (V-ing)`);
  }

  const competitiveRows = [
    {topic:'the proposal',verb:'approve',noun:'approval',adj:'feasible',connector:'Nevertheless'},
    {topic:'the experiment',verb:'replicate',noun:'replication',adj:'reliable',connector:'Consequently'},
    {topic:'the policy',verb:'implement',noun:'implementation',adj:'controversial',connector:'Moreover'},
    {topic:'the evidence',verb:'evaluate',noun:'evaluation',adj:'compelling',connector:'However'},
    {topic:'the hypothesis',verb:'validate',noun:'validation',adj:'plausible',connector:'Therefore'},
    {topic:'the strategy',verb:'revise',noun:'revision',adj:'effective',connector:'Nonetheless'}
  ];
  const competitiveWords = [['mitigate','reduce the severity of'],['ambiguous','open to more than one interpretation'],['substantial','large or important'],['coherent','logical and consistent'],['inevitable','certain to happen'],['scrutinize','examine very carefully']];

  function competitiveQuestion(index){
    const variant=Math.floor(index/10),type=index%10,row=competitiveRows[variant],id=`en-competitive-${index+1}`;
    if(type===0) return question(id,'english','competitive','Inversion',`Rarely ___ such a well-designed solution.`,'have we seen',['we have seen','did we saw','we had see'],`เมื่อคำกริยาวิเศษณ์เชิงปฏิเสธขึ้นต้นประโยค ต้องใช้ inversion`,'competitive');
    if(type===1) return question(id,'english','competitive','Conditionals',`Had the committee examined ${row.topic} earlier, it ___ a better decision.`,'might have made',['might make','will have made','made'],`Third conditional แบบ inversion ใช้ Had + S + V3, ... might have + V3`,'competitive');
    if(type===2) return question(id,'english','competitive','Word forms',`The careful ___ of ${row.topic} took several weeks.`,row.noun,[row.verb,`${row.verb}ing`,row.adj],`ตำแหน่งหลัง adjective ต้องการคำนาม: ${row.noun}`,'competitive');
    if(type===3) return question(id,'english','competitive','Reduced clauses',`${row.topic.replace(/^the /,'The ')}, ___ by independent experts, was accepted.`,`${row.verb}d`.replace('approvedd','approved').replace('replicatedd','replicated').replace('implementedd','implemented').replace('evaluatedd','evaluated').replace('validatedd','validated').replace('revisedd','revised'),[row.verb,`${row.verb}ing`,`to ${row.verb}`],`วลีขยายมีความหมายถูกกระทำ จึงใช้ past participle`,'competitive');
    if(type===4){
      const word=competitiveWords[variant];
      return question(id,'english','competitive','Academic vocabulary',`Choose the best meaning of “${word[0]}”.`,word[1],['reject without evidence','repeat without change','describe briefly'],`${word[0]} หมายถึง ${word[1]}`,'competitive');
    }
    if(type===5) return question(id,'english','competitive','Subjunctive',`The panel recommended that ${row.topic} ___ immediately.`,`be ${row.verb}d`.replace('approvedd','approved').replace('replicatedd','replicated').replace('implementedd','implemented').replace('evaluatedd','evaluated').replace('validatedd','validated').replace('revisedd','revised'),[`is ${row.verb}d`,`was ${row.verb}d`,`${row.verb}s`],`หลัง recommend that ใช้ subjunctive: be + V3`,'competitive');
    if(type===6) return question(id,'english','competitive','Connectors',`The initial data appeared incomplete. ___, the researchers continued collecting evidence.`,row.connector,['For example','Similarly','In other words'].filter(item=>item!==row.connector),`${row.connector} เชื่อมความสัมพันธ์ของข้อความได้เหมาะสมที่สุด`,'competitive');
    if(type===7) return question(id,'english','competitive','Collocations',`The new findings ___ serious doubt on the earlier conclusion.`,'cast',['make','put','create'],`สำนวนที่ถูกต้องคือ cast doubt on`,'competitive');
    if(type===8){
      const reading=[
        ['A model can be highly accurate within the conditions for which it was designed yet unreliable when applied elsewhere.','Which conclusion is best supported?','A model’s usefulness depends on context.'],
        ['The absence of evidence is not always evidence of absence, particularly when measurement tools are limited.','What is the writer emphasizing?','A negative result may reflect limited detection.'],
        ['Innovation often emerges when constraints force researchers to question familiar assumptions.','What role can constraints play?','They can stimulate new approaches.'],
        ['Correlation may suggest a relationship, but it does not by itself establish a causal mechanism.','What caution is expressed?','Correlation alone cannot prove causation.'],
        ['A concise explanation is valuable only if it preserves the distinctions essential to the argument.','What is the main idea?','Brevity should not remove necessary nuance.'],
        ['Peer review improves research by exposing methods and claims to informed criticism, though it cannot guarantee perfection.','What does the sentence imply?','Peer review reduces error but has limits.']
      ][variant];
      return question(id,'english','competitive','Critical reading',`${reading[0]}\n\n${reading[1]}`,reading[2],['All models are useless.','More words always improve an argument.','Criticism guarantees perfect research.'],`ข้อสรุปที่มีหลักฐานรองรับคือ ${reading[2]}`,'competitive');
    }
    return question(id,'english','competitive','Concession',`${row.topic.replace(/^the /,'The ')} was considered ${row.adj}; ___, further testing was required.`,'even so',['because','for instance','therefore not'],`even so แสดงความขัดแย้งหรือการยอมรับข้อเท็จจริงก่อนหน้า`,'competitive');
  }

  function mathTrack(index){
    const slot=index%10;
    return slot<6?'standard':slot<8?'triam':'mwit';
  }

  function p3(index){
    const k=Math.floor(index/10),type=index%10,id=`math-p3-${index+1}`,track=mathTrack(index);
    const a=120+(k*37)%780,b=45+(k*23)%340;
    if(type===0) return numericQuestion(id,'p3','การบวก',`${a} + ${b} เท่ากับเท่าไร`,a+b,[a+b+10,a+b-10,a+b+1],`บวกหลักหน่วย หลักสิบ และหลักร้อย ได้ ${a+b}`,track);
    if(type===1){const x=a+b+50;return numericQuestion(id,'p3','การลบ',`${x} − ${b} เท่ากับเท่าไร`,x-b,[x-b+10,x-b-10,x-b+1],`${x} − ${b} = ${x-b}`,track)}
    if(type===2){const x=2+k%11,y=3+(k*3)%10;return numericQuestion(id,'p3','การคูณ',`${x} × ${y} = ?`,x*y,[x*(y+1),(x+1)*y,x+y],`${x} กลุ่ม กลุ่มละ ${y} มีทั้งหมด ${x*y}`,track)}
    if(type===3){const y=2+k%9,q=3+(k*5)%11,x=y*q;return numericQuestion(id,'p3','การหาร',`${x} ÷ ${y} = ?`,q,[q+1,q-1,y],`แบ่ง ${x} เป็นกลุ่มละ ${y} ได้ ${q} กลุ่ม`,track)}
    if(type===4){const x=80+(k*13)%220,y=35+(k*7)%90;return numericQuestion(id,'p3','โจทย์ปัญหา',`ร้านค้ามีดินสอ ${x} แท่ง รับมาเพิ่ม ${y} แท่ง ตอนนี้มีทั้งหมดกี่แท่ง`,x+y,[x-y,x+y+10,x+y-1],`นำจำนวนเดิมบวกจำนวนที่รับเพิ่ม: ${x} + ${y} = ${x+y}`,track)}
    if(type===5){const price=20+(k%8)*5,pay=100+(k%3)*100;return numericQuestion(id,'p3','เงิน',`ซื้อสมุดราคา ${price} บาท จ่าย ${pay} บาท จะได้เงินทอนกี่บาท`,pay-price,[price,pay+price,pay-price-5],`เงินทอน = ${pay} − ${price} = ${pay-price} บาท`,track)}
    if(type===6){const hour=1+k%10,mins=(k%4)*15,add=15+15*(k%3),total=hour*60+mins+add;const answer=clockAt(total);return question(id,'math','p3','เวลา',`เริ่มอ่านหนังสือเวลา ${hour}:${String(mins).padStart(2,'0')} น. อ่าน ${add} นาที จะเสร็จเวลาใด`,answer,pickWrong(answer,[clockAt(hour*60+((mins+add)%60)),clockAt(total+60),clockAt(total-60),clockAt(total+15),clockAt(total-30)]),`บวกเวลา ${add} นาที ได้ ${answer}`,track)}
    if(type===7){const w=3+k%12,h=2+(k*2)%9,ans=2*(w+h);return numericQuestion(id,'p3','เรขาคณิต',`สี่เหลี่ยมผืนผ้ากว้าง ${w} ซม. ยาว ${h} ซม. มีความยาวรอบรูปกี่ซม.`,ans,[w*h,w+h,ans+2],`รอบรูป = 2 × (${w} + ${h}) = ${ans} ซม.`,track)}
    if(type===8){const start=2+k%20,step=2+k%6;return numericQuestion(id,'p3','แบบรูป',`${start}, ${start+step}, ${start+step*2}, ${start+step*3}, ___`,start+step*4,[start+step*5,start+step*3+1,start+step*4-1],`เพิ่มครั้งละ ${step} จำนวนถัดไปคือ ${start+step*4}`,track)}
    const x=100+(k*19)%600,y=100+(k*31)%600,correct=x===y?'=':x>y?'>':'<';return question(id,'math','p3','การเปรียบเทียบ',`เติมเครื่องหมายให้ถูกต้อง: ${x} ___ ${y}`,correct,['>','<','='].filter(value=>value!==correct),`${x} ${correct} ${y}`,track);
  }

  function p4(index){
    const k=Math.floor(index/10),type=index%10,id=`math-p4-${index+1}`,track=mathTrack(index),a=1200+(k*137)%7000,b=230+(k*89)%1600;
    if(type===0) return numericQuestion(id,'p4','จำนวนและการบวก',`${a.toLocaleString()} + ${b.toLocaleString()} = ?`,a+b,[a+b+100,a+b-100,a+b+10],`${a} + ${b} = ${a+b}`,track);
    if(type===1) return numericQuestion(id,'p4','จำนวนและการลบ',`${a+b} − ${b} = ?`,a,[a+100,a-100,b],`${a+b} − ${b} = ${a}`,track);
    if(type===2){const x=12+k%38,y=3+k%7;return numericQuestion(id,'p4','การคูณ',`${x} × ${y} = ?`,x*y,[x*(y+1),(x+1)*y,x*y-10],`${x} × ${y} = ${x*y}`,track)}
    if(type===3){const divisor=3+k%9,q=12+(k*3)%45,dividend=divisor*q;return numericQuestion(id,'p4','การหาร',`${dividend} ÷ ${divisor} = ?`,q,[q+divisor,q-1,q+1],`${dividend} ÷ ${divisor} = ${q}`,track)}
    if(type===4){const d=2+k%8,n=1+k%d,m=n*2,dd=d*2;return question(id,'math','p4','เศษส่วน',`เศษส่วนใดเท่ากับ ${n}/${d}`,`${m}/${dd}`,[`${n+1}/${d}`,`${m+1}/${dd}`,`${n}/${dd}`],`คูณทั้งเศษและส่วนด้วย 2 ได้ ${m}/${dd}`,track)}
    if(type===5){const x=(10+k%80)/10,y=(5+(k*3)%30)/10,ans=x+y;return numericQuestion(id,'p4','ทศนิยม',`${formatNumber(x)} + ${formatNumber(y)} = ?`,ans,[ans+.1,ans-.1,x-y],`บวกตามหลักทศนิยม ได้ ${formatNumber(ans)}`,track)}
    if(type===6){const angle=[30,45,60,90,110,135][k%6],answer=angle<90?'มุมแหลม':angle===90?'มุมฉาก':'มุมป้าน';return question(id,'math','p4','มุม',`มุมขนาด ${angle}° เป็นมุมชนิดใด`,answer,['มุมแหลม','มุมฉาก','มุมป้าน','มุมตรง'].filter(value=>value!==answer),`${angle}° คือ${answer}`,track)}
    if(type===7){const w=5+k%16,h=4+(k*2)%13;return numericQuestion(id,'p4','พื้นที่',`สี่เหลี่ยมผืนผ้ากว้าง ${w} ม. ยาว ${h} ม. มีพื้นที่กี่ตร.ม.`,w*h,[2*(w+h),w+h,w*h+h],`พื้นที่ = กว้าง × ยาว = ${w*h} ตร.ม.`,track)}
    if(type===8){const x=4+k%12,answer=x*6;return numericQuestion(id,'p4','ตัวประกอบและพหุคูณ',`พหุคูณลำดับที่ 6 ของ ${x} คือเท่าไร`,answer,[x*5,x*7,x+6],`${x} × 6 = ${answer}`,track)}
    const boxes=3+k%8,each=12+(k*4)%30,sold=5+(k*3)%20,answer=boxes*each-sold;return numericQuestion(id,'p4','โจทย์หลายขั้นตอน',`มีขนม ${boxes} กล่อง กล่องละ ${each} ชิ้น ขายไป ${sold} ชิ้น เหลือกี่ชิ้น`,answer,[boxes*each+sold,boxes+each-sold,answer+boxes],`ทั้งหมด ${boxes*each} ชิ้น ลบที่ขาย ${sold} เหลือ ${answer}`,track);
  }

  function p5(index){
    const k=Math.floor(index/10),type=index%10,id=`math-p5-${index+1}`,track=mathTrack(index);
    if(type===0){const d=4+k%9,a=1+k%(d-1),b=1+(k*2)%(d-1),sum=a+b,answer=lowestTerms(sum,d);return question(id,'math','p5','เศษส่วน',`${a}/${d} + ${b}/${d} = ?`,answer,pickWrongFraction(answer,[`${sum}/${d*2}`,`${sum+1}/${d}`,`${a*b}/${d}`,`${Math.max(1,sum-1)}/${d}`,`${sum}/${d+1}`]),`ส่วนเท่ากัน บวกเฉพาะตัวเศษได้ ${sum}/${d} แล้วทำให้เป็นเศษส่วนอย่างต่ำ = ${answer}`,track)}
    if(type===1){const x=(15+k%70)/10,y=2+k%8,ans=x*y;return numericQuestion(id,'p5','ทศนิยม',`${formatNumber(x)} × ${y} = ?`,ans,[ans+.5,ans-.5,x+y],`${formatNumber(x)} × ${y} = ${formatNumber(ans)}`,track)}
    if(type===2){const base=(4+k%20)*20,rate=[10,20,25,50][k%4],ans=base*rate/100;return numericQuestion(id,'p5','ร้อยละ',`${rate}% ของ ${base} เท่ากับเท่าไร`,ans,[base-rate,base/rate,ans+rate],`${rate}/100 × ${base} = ${ans}`,track)}
    if(type===3){const w=3+k%8,l=4+(k*2)%9,h=2+(k*3)%7,ans=w*l*h;return numericQuestion(id,'p5','ปริมาตร',`ทรงสี่เหลี่ยมมุมฉากกว้าง ${w} ซม. ยาว ${l} ซม. สูง ${h} ซม. มีปริมาตรกี่ลบ.ซม.`,ans,[w*l,2*(w+l+h),ans+h],`ปริมาตร = ${w} × ${l} × ${h} = ${ans}`,track)}
    if(type===4){const b=6+(k%10)*2,h=3+k%9,ans=b*h/2;return numericQuestion(id,'p5','พื้นที่สามเหลี่ยม',`สามเหลี่ยมฐาน ${b} ซม. สูง ${h} ซม. มีพื้นที่กี่ตร.ซม.`,ans,[b*h,b+h,2*(b+h)],`พื้นที่สามเหลี่ยม = 1/2 × ${b} × ${h} = ${ans}`,track)}
    if(type===5){const a=20+k%30,b=a+4,c=a+8,d=a+12,ans=(a+b+c+d)/4;return numericQuestion(id,'p5','ค่าเฉลี่ย',`ค่าเฉลี่ยของ ${a}, ${b}, ${c}, ${d} เท่ากับเท่าไร`,ans,[ans+2,ans-2,a+b+c+d],`ผลรวม ${a+b+c+d} หาร 4 ได้ ${ans}`,track)}
    if(type===6){const x=2+k%7,y=3+(k*2)%8,m=2+k%6;return question(id,'math','p5','อัตราส่วน',`อัตราส่วน ${x}:${y} เมื่อคูณทั้งสองจำนวนด้วย ${m} เป็นข้อใด`,`${x*m}:${y*m}`,[`${x+m}:${y+m}`,`${x*m}:${y}`,`${x}:${y*m}`],`คูณทั้งสองพจน์ด้วย ${m} ได้ ${x*m}:${y*m}`,track)}
    if(type===7){const km=2+k%18,ans=km*1000;return numericQuestion(id,'p5','การแปลงหน่วย',`${km} กิโลเมตร เท่ากับกี่เมตร`,ans,[km*100,km*10,km*10000],`1 กิโลเมตร = 1,000 เมตร จึงได้ ${ans} เมตร`,track)}
    if(type===8){const first=3+k%12,step=3+k%7,n=8,ans=first+(n-1)*step;return numericQuestion(id,'p5','แบบรูป',`ลำดับเริ่มที่ ${first} และเพิ่มครั้งละ ${step} พจน์ที่ ${n} คือเท่าไร`,ans,[first+n*step,ans-step,ans+step],`${first} + (${n}−1)×${step} = ${ans}`,track)}
    const price=120+(k%15)*20,discount=[10,20,25][k%3],ans=price-price*discount/100;return numericQuestion(id,'p5','โจทย์ประยุกต์',`สินค้า ${price} บาท ลด ${discount}% ต้องจ่ายกี่บาท`,ans,[price*discount/100,price+discount,price-discount],`ส่วนลด ${price*discount/100} บาท จ่าย ${ans} บาท`,track);
  }

  function p6(index){
    const k=Math.floor(index/10),type=index%10,id=`math-p6-${index+1}`,track=mathTrack(index);
    if(type===0){const a=1+k%5,b=2+k%7,c=1+(k*2)%4;let d=3+(k*3)%8;if(d===b) d=3+((d-2)%8);const den=b*d,num=a*d+c*b,answer=lowestTerms(num,den);return question(id,'math','p6','เศษส่วนต่างส่วน',`${a}/${b} + ${c}/${d} = ?`,answer,pickWrongFraction(answer,[`${a+c}/${b+d}`,`${num+1}/${den}`,`${a*c}/${b*d}`,`${num}/${den+1}`,`${num-1}/${den}`]),`ทำส่วนให้เท่ากัน ได้ (${a}×${d}+${c}×${b})/${den} = ${num}/${den} แล้วทำให้เป็นเศษส่วนอย่างต่ำ = ${answer}`,track)}
    if(type===1){const base=200+(k%20)*50,rate=5+(k%8)*5,ans=base*rate/100;return numericQuestion(id,'p6','ร้อยละ',`โรงเรียนมีนักเรียน ${base} คน เป็นสมาชิกชมรม ${rate}% คิดเป็นกี่คน`,ans,[base-rate,base+rate,ans+10],`${rate}% ของ ${base} = ${ans}`,track)}
    if(type===2){const x=2+k%8,y=3+(k*2)%9,total=(x+y)*(5+k%8),part=total*x/(x+y);return numericQuestion(id,'p6','อัตราส่วน',`แบ่งเงิน ${total} บาท ในอัตราส่วน ${x}:${y} ส่วนแรกได้เงินกี่บาท`,part,[total*y/(x+y),total/(x+y),part+x],`ส่วนแรก = ${x}/${x+y} × ${total} = ${part}`,track)}
    if(type===3){const x=3+k%18,a=2+k%6,b=5+(k*3)%20,c=a*x+b;return numericQuestion(id,'p6','สมการ',`ถ้า ${a}x + ${b} = ${c} แล้ว x เท่ากับเท่าไร`,x,[x+1,x-1,c-b],`ย้าย ${b} แล้วหารด้วย ${a} ได้ x = ${x}`,track)}
    if(type===4){const r=7*(1+k%4),ans=2*(22/7)*r;return numericQuestion(id,'p6','วงกลม',`วงกลมรัศมี ${r} ซม. มีเส้นรอบวงกี่ซม. (ใช้ π = 22/7)`,ans,[22/7*r*r,2*r,ans+22],`เส้นรอบวง = 2πr = ${ans}`,track)}
    if(type===5){const w=4+k%8,l=5+(k*2)%9,h=3+(k*3)%7,ans=w*l*h;return numericQuestion(id,'p6','ปริมาตร',`กล่องกว้าง ${w} ซม. ยาว ${l} ซม. สูง ${h} ซม. จุได้กี่ลบ.ซม.`,ans,[w*l,2*(w+l+h),ans+w],`ปริมาตร = ${w}×${l}×${h} = ${ans}`,track)}
    if(type===6){const a=-20+k%15,b=5+(k*3)%18,ans=a+b;return numericQuestion(id,'p6','จำนวนเต็ม',`${a} + ${b} = ?`,ans,[a-b,-ans,ans+2],`เคลื่อนบนเส้นจำนวนจาก ${a} ไปทางขวา ${b} หน่วย ได้ ${ans}`,track)}
    if(type===7){const speed=30+(k%7)*10,time=2+k%5,ans=speed*time;return numericQuestion(id,'p6','อัตราเร็ว',`รถวิ่งด้วยความเร็ว ${speed} กม./ชม. เป็นเวลา ${time} ชม. เดินทางกี่กม.`,ans,[speed+time,speed/time,ans+speed],`ระยะทาง = ความเร็ว × เวลา = ${ans} กม.`,track)}
    if(type===8){const a=6+(k%7)*2,b=9+(k%6)*3;let x=a,y=b;while(y){[x,y]=[y,x%y]}return numericQuestion(id,'p6','ห.ร.ม.',`ห.ร.ม. ของ ${a} และ ${b} คือเท่าไร`,x,[x+1,Math.min(a,b),a+b],`ตัวหารร่วมมากของ ${a} และ ${b} คือ ${x}`,track)}
    const first=4+k%12,diff=2+k%8,n=12,ans=first+(n-1)*diff;return numericQuestion(id,'p6','ลำดับ',`ลำดับเลขคณิตเริ่ม ${first} เพิ่มครั้งละ ${diff} พจน์ที่ ${n} คือเท่าไร`,ans,[first+n*diff,ans-diff,ans+diff],`a₁₂ = ${first} + 11×${diff} = ${ans}`,track);
  }

  function m1(index){
    const k=Math.floor(index/10),type=index%10,id=`math-m1-${index+1}`,track=mathTrack(index);
    if(type===0){const a=-25+k%20,b=-12+(k*5)%25,ans=a-b;return numericQuestion(id,'m1','จำนวนเต็ม',`${a} − (${b}) = ?`,ans,[a+b,-ans,ans+2],`ลบจำนวนเต็ม ${b} ได้คำตอบ ${ans}`,track)}
    if(type===1){const base=2+k%5,power=2+k%4,ans=base**power;return numericQuestion(id,'m1','เลขยกกำลัง',`${base}^${power} = ?`,ans,[base*power,base**(power-1),ans+base],`คูณ ${base} ซ้ำ ${power} ครั้ง ได้ ${ans}`,track)}
    if(type===2){const x=4+k%17,a=2+k%8,b=3+(k*2)%16,c=a*x+b;return numericQuestion(id,'m1','สมการเชิงเส้น',`${a}x + ${b} = ${c} แล้ว x = ?`,x,[x+1,x-1,c/a],`ลบ ${b} แล้วหาร ${a} ได้ x = ${x}`,track)}
    if(type===3){const a=2+k%8,b=3+(k*2)%9;return question(id,'math','m1','พีชคณิต',`${a}x + ${b}x ลดรูปได้ข้อใด`,`${a+b}x`,[`${a*b}x`,`${a+b}x²`,`${a}${b}x`],`พจน์คล้ายกันบวกสัมประสิทธิ์: (${a}+${b})x = ${a+b}x`,track)}
    if(type===4){const x=2+k%7,y=3+(k*2)%8,m=4+k%6;return question(id,'math','m1','อัตราส่วน',`${x}:${y} เท่ากับอัตราส่วนใด`,`${x*m}:${y*m}`,[`${x+m}:${y+m}`,`${x*m}:${y}`,`${x}:${y*m}`],`คูณทั้งสองพจน์ด้วย ${m}`,track)}
    if(type===5){const cost=200+(k%20)*25,rate=10+(k%6)*5,ans=cost*(100+rate)/100;return numericQuestion(id,'m1','ร้อยละ',`สินค้าทุน ${cost} บาท บวกกำไร ${rate}% ราคาขายเท่าไร`,ans,[cost*rate/100,cost+rate,ans+rate],`กำไร ${cost*rate/100} บาท ราคาขาย ${ans} บาท`,track)}
    if(type===6){const x=-5+k%11,y=-4+(k*3)%9;return question(id,'math','m1','พิกัด',`จุด (${x}, ${y}) มีพิกัด x เท่าไร`,x,pickWrong(x,[y,-x,-y,x+1,x-1,y+1]),`พิกัดตัวหน้าเป็นค่า x จึงเท่ากับ ${x}`,track)}
    if(type===7){const angle=30+(k%6)*10,ans=180-angle;return numericQuestion(id,'m1','มุม',`มุมสองมุมบนเส้นตรง มุมหนึ่ง ${angle}° อีกมุมกี่องศา`,ans,[90-angle,180+angle,angle],`มุมบนเส้นตรงรวม 180° จึงได้ ${ans}°`,track)}
    if(type===8){const a=10+k%20,b=a+3,c=a+6,d=a+9,ans=(a+b+c+d)/4;return numericQuestion(id,'m1','สถิติ',`ค่าเฉลี่ยของ ${a}, ${b}, ${c}, ${d} คือเท่าไร`,ans,[ans+1.5,ans-1.5,a+b+c+d],`ผลรวมหารจำนวนข้อมูล: ${(a+b+c+d)}/4 = ${ans}`,track)}
    const red=2+k%6,blue=3+(k*2)%7,total=red+blue;return question(id,'math','m1','ความน่าจะเป็น',`ถุงมีลูกบอลแดง ${red} ลูก น้ำเงิน ${blue} ลูก หยิบ 1 ลูก ความน่าจะเป็นที่จะได้สีแดงคือเท่าไร`,lowestTerms(red,total),pickWrongFraction(lowestTerms(red,total),[`${blue}/${total}`,`1/${total}`,`${red}/${blue}`,`${red+1}/${total}`,`${total}/${red}`]),`กรณีที่ต้องการ ${red} จากทั้งหมด ${total} จึงเป็น ${red}/${total} = ${lowestTerms(red,total)}`,track);
  }

  function m2(index){
    const k=Math.floor(index/10),type=index%10,id=`math-m2-${index+1}`,track=mathTrack(index);
    if(type===0){const triple=[[3,4,5],[5,12,13],[6,8,10],[8,15,17],[9,12,15]][k%5];return numericQuestion(id,'m2','พีทาโกรัส',`สามเหลี่ยมมุมฉากมีด้านประกอบมุมฉาก ${triple[0]} และ ${triple[1]} หน่วย ด้านตรงข้ามมุมฉากยาวเท่าไร`,triple[2],[triple[0]+triple[1],triple[2]-1,triple[2]+1],`√(${triple[0]}²+${triple[1]}²) = ${triple[2]}`,track)}
    if(type===1){const root=2+k%18,n=root*root;return numericQuestion(id,'m2','รากที่สอง',`√${n} = ?`,root,[root+1,root-1,n/2],`${root}² = ${n}`,track)}
    if(type===2){const x=2+k%9,y=3+(k*2)%10,sum=x+y,diff=x-y;return numericQuestion(id,'m2','ระบบสมการ',`x + y = ${sum} และ x − y = ${diff} แล้ว x เท่ากับเท่าไร`,x,[y,sum,diff],`บวกสองสมการได้ 2x = ${2*x} ดังนั้น x = ${x}`,track)}
    if(type===3){const a=2+k%7,b=3+(k*2)%8;return question(id,'math','m2','พหุนาม',`กระจาย (${a}x + ${b})(x + 1) ได้ข้อใด`,`${a}x² + ${a+b}x + ${b}`,[`${a}x² + ${b}x + 1`,`${a}x² + ${a}x + ${b}`,`${a+b}x² + ${b}`],`คูณแจกแจงทุกพจน์แล้วรวมพจน์กลาง`,track)}
    if(type===4){const r=7*(1+k%3),h=2+k%8,ans=22/7*r*r*h;return numericQuestion(id,'m2','ทรงกระบอก',`ทรงกระบอกรัศมี ${r} ซม. สูง ${h} ซม. มีปริมาตรกี่ลบ.ซม. (π=22/7)`,ans,[2*22/7*r*h,22/7*r*r,ans+h],`V = πr²h = ${ans}`,track)}
    if(type===5){const x1=1+k%7,y1=2+(k*2)%8,x2=x1+4,y2=y1+8,ans=(y2-y1)/(x2-x1);return numericQuestion(id,'m2','ความชัน',`เส้นตรงผ่าน (${x1},${y1}) และ (${x2},${y2}) มีความชันเท่าไร`,ans,[1/ans,ans+1,y2-y1],`m = (${y2}−${y1})/(${x2}−${x1}) = ${ans}`,track)}
    if(type===6){const a=1+k%5,b=2+(k*2)%6,total=a+b;return question(id,'math','m2','ความน่าจะเป็น',`กล่องมีบัตรเลขคู่ ${a} ใบ และเลขคี่ ${b} ใบ สุ่ม 1 ใบ โอกาสได้เลขคู่คือ`,lowestTerms(a,total),pickWrongFraction(lowestTerms(a,total),[`${b}/${total}`,`1/${total}`,`${a}/${b}`,`${a+1}/${total}`,`${total}/${a}`]),`กรณีเลขคู่ ${a} จากทั้งหมด ${total} จึงเป็น ${a}/${total} = ${lowestTerms(a,total)}`,track)}
    if(type===7){const a=2+k%8,b=3+(k*3)%9;return question(id,'math','m2','การแยกตัวประกอบ',`x² + ${a+b}x + ${a*b} แยกตัวประกอบได้ข้อใด`,`(x + ${a})(x + ${b})`,[`(x − ${a})(x − ${b})`,`(x + ${a+b})(x + ${a*b})`,`(x + 1)(x + ${a*b})`],`หาสองจำนวนที่บวกได้ ${a+b} และคูณได้ ${a*b}`,track)}
    if(type===8){const x=3+k%12,a=2+k%6,b=4+(k*2)%13,c=a*x+b;return question(id,'math','m2','อสมการ',`${a}x + ${b} < ${c+a} ข้อใดถูกต้อง`,`x < ${x+1}`,[`x > ${x+1}`,`x < ${x}`,`x > ${x}`],`ลบ ${b} และหารด้วย ${a} ได้ x < ${x+1}`,track)}
    const sides=3+k%8,interior=(sides-2)*180;return numericQuestion(id,'m2','รูปหลายเหลี่ยม',`ผลรวมมุมภายในของรูป ${sides} เหลี่ยมเท่ากับกี่องศา`,interior,[sides*180,(sides-1)*180,interior-180],`(${sides}−2)×180 = ${interior}°`,track);
  }

  function m3(index){
    const k=Math.floor(index/10),type=index%10,id=`math-m3-${index+1}`,track=mathTrack(index);
    if(type===0){const a=2+k%8,b=3+(k*2)%9;return question(id,'math','m3','สมการกำลังสอง',`x² − ${a+b}x + ${a*b} = 0 มีคำตอบใด`,`x = ${a}, ${b}`,[`x = ${-a}, ${-b}`,`x = ${a+b}`,`x = ${a*b}`],`แยกเป็น (x−${a})(x−${b}) = 0`,track)}
    if(type===1){const x=2+k%9,y=3+(k*3)%10,a=2,b=3,c=a*x+b*y;return numericQuestion(id,'m3','ระบบสมการ',`x + y = ${x+y} และ ${a}x + ${b}y = ${c} แล้ว y เท่ากับเท่าไร`,y,[x,x+y,y+1],`แทน x = ${x+y}−y ในสมการที่สอง จะได้ y = ${y}`,track)}
    if(type===2){const small=3+k%9,scale=2+k%4,large=small*scale,other=4+(k*2)%10;return numericQuestion(id,'m3','รูปคล้าย',`รูปสามเหลี่ยมคล้ายกันมีอัตราส่วนด้านเล็ก:ใหญ่ = ${small}:${large} ถ้าด้านเล็กอีกด้านยาว ${other} ด้านใหญ่ยาวเท่าไร`,other*scale,[other+scale,other/scale,other*scale+small],`อัตราขยาย = ${scale} จึงได้ ${other*scale}`,track)}
    if(type===3){const triple=[[3,4,5],[5,12,13],[8,15,17],[7,24,25],[9,40,41]][k%5];return question(id,'math','m3','ตรีโกณมิติ',`สามเหลี่ยมมุมฉากมีด้านตรงข้ามมุม θ = ${triple[0]} และด้านตรงข้ามมุมฉาก = ${triple[2]} ค่า sin θ คือ`,`${triple[0]}/${triple[2]}`,[`${triple[1]}/${triple[2]}`,`${triple[0]}/${triple[1]}`,`${triple[2]}/${triple[0]}`],`sin θ = ด้านตรงข้าม/ด้านตรงข้ามมุมฉาก`,track)}
    if(type===4){const r=7*(1+k%4),ans=22/7*r*r;return numericQuestion(id,'m3','วงกลม',`วงกลมรัศมี ${r} ซม. มีพื้นที่เท่าไร (π=22/7)`,ans,[2*22/7*r,ans+r,2*r*r],`พื้นที่ = πr² = ${ans}`,track)}
    if(type===5){const red=2+k%5,blue=3+(k*2)%6,total=red+blue;return question(id,'math','m3','ความน่าจะเป็น',`ถุงมีแดง ${red} ลูก น้ำเงิน ${blue} ลูก หยิบ 2 ลูกโดยไม่คืน ความน่าจะเป็นที่ได้แดงทั้งคู่คือ`,`${red}/${total} × ${red-1}/${total-1}`,pickWrong(`${red}/${total} × ${red-1}/${total-1}`,[`${red}/${total} × ${red}/${total}`,`${blue}/${total} × ${red}/${total}`,`2/${total}`,`${red-1}/${total} × ${red}/${total-1}`,`${red}/${total-1} × ${red-1}/${total}`]),`ครั้งแรก ${red}/${total} และครั้งที่สองเหลือแดง ${red-1} จาก ${total-1}`,track)}
    if(type===6){const values=[4+k%8,8+k%8,12+k%8,16+k%8,20+k%8].sort((a,b)=>a-b);return numericQuestion(id,'m3','สถิติ',`มัธยฐานของ ${values.join(', ')} คือเท่าไร`,values[2],[values[1],values[3],values.reduce((a,b)=>a+b,0)/5],`ข้อมูล 5 ค่าเรียงแล้ว ค่ากลางคือ ${values[2]}`,track)}
    if(type===7){const a=2+k%5,m=2+k%4,n=1+(k*2)%4,ans=a**(m+n);return numericQuestion(id,'m3','เลขยกกำลัง',`${a}^${m} × ${a}^${n} = ?`,ans,[a**(m*n),a**(m-n),ans+a],`ฐานเดียวกันคูณกัน บวกเลขชี้กำลัง: ${a}^${m+n} = ${ans}`,track)}
    if(type===8){const first=2+k%9,diff=3+(k*2)%8,n=15,ans=first+(n-1)*diff;return numericQuestion(id,'m3','ลำดับเลขคณิต',`ลำดับเลขคณิตมี a₁=${first}, d=${diff} แล้ว a₁₅ เท่ากับเท่าไร`,ans,[first+n*diff,ans-diff,ans+diff],`a₁₅ = ${first} + 14(${diff}) = ${ans}`,track)}
    const chickens=10+k%20,rabbits=4+(k*3)%12,heads=chickens+rabbits,legs=2*chickens+4*rabbits;return numericQuestion(id,'m3','โจทย์เชาวน์แข่งขัน',`ในคอกมีไก่และกระต่ายรวม ${heads} ตัว นับขาได้ ${legs} ขา มีกระต่ายกี่ตัว`,rabbits,[chickens,heads-rabbits+2,rabbits+2],`ให้ r เป็นกระต่าย: 2(${heads}−r)+4r=${legs} จึงได้ r=${rabbits}`,track);
  }

  function markWordProblem(item){
    return {...item,questionType:'word_problem'};
  }

  function wordNumeric(id,grade,topic,prompt,answer,distractors,explanation,track){
    return markWordProblem(numericQuestion(id,grade,`โจทย์ปัญหา · ${topic}`,prompt,answer,distractors,explanation,track));
  }

  function wordChoice(id,grade,topic,prompt,answer,distractors,explanation,track){
    return markWordProblem(question(id,'math',grade,`โจทย์ปัญหา · ${topic}`,prompt,answer,distractors,explanation,track));
  }

  function p3WordProblem(index){
    const k=Math.floor(index/5),type=index%5,id=`math-p3-word-${index+1}`,track=mathTrack(250+index);
    if(type===0){const first=145+k*7,second=68+k*3,ans=first+second;return wordNumeric(id,'p3','การบวก',`ห้องสมุดมีหนังสือนิทาน ${first} เล่ม และหนังสือความรู้ ${second} เล่ม ห้องสมุดมีหนังสือสองประเภทนี้รวมกี่เล่ม`,ans,[first-second,ans+10,ans-10],`รวมจำนวนหนังสือ: ${first} + ${second} = ${ans} เล่ม`,track)}
    if(type===1){const total=520+k*11,given=75+k*2,ans=total-given;return wordNumeric(id,'p3','การลบ',`โรงเรียนมีสมุด ${total} เล่ม แจกให้นักเรียนไป ${given} เล่ม จะเหลือสมุดกี่เล่ม`,ans,[total+given,ans+10,ans-10],`จำนวนที่เหลือ = ${total} − ${given} = ${ans} เล่ม`,track)}
    if(type===2){const bags=3+k%8,each=6+k,ans=bags*each;return wordNumeric(id,'p3','การคูณ',`มีถุงลูกแก้ว ${bags} ถุง แต่ละถุงมี ${each} ลูก มีลูกแก้วทั้งหมดกี่ลูก`,ans,[bags+each,(bags+1)*each,ans-each],`${bags} ถุง × ${each} ลูก = ${ans} ลูก`,track)}
    if(type===3){const groups=3+k%7,each=5+k,total=groups*each;return wordNumeric(id,'p3','การหาร',`คุณครูแบ่งดินสอ ${total} แท่งให้นักเรียน ${groups} คนเท่า ๆ กัน นักเรียนแต่ละคนได้กี่แท่ง`,each,[groups,each+1,each-1],`${total} ÷ ${groups} = ${each} แท่ง`,track)}
    const notebooks=2+k%4,pencils=3+k%5,notebookPrice=15+(k%6)*5,pencilPrice=5+(k%4)*2,cost=notebooks*notebookPrice+pencils*pencilPrice,pay=Math.ceil(cost/100)*100+100,ans=pay-cost;return wordNumeric(id,'p3','เงิน',`ซื้อสมุด ${notebooks} เล่ม เล่มละ ${notebookPrice} บาท และดินสอ ${pencils} แท่ง แท่งละ ${pencilPrice} บาท จ่าย ${pay} บาท ได้เงินทอนเท่าไร`,ans,[cost,pay-cost+10,pay-cost-10],`จ่ายทั้งหมด ${cost} บาท เงินทอน = ${pay} − ${cost} = ${ans} บาท`,track);
  }

  function p4WordProblem(index){
    const k=Math.floor(index/5),type=index%5,id=`math-p4-word-${index+1}`,track=mathTrack(250+index);
    if(type===0){const boxes=4+k%9,each=24+k,loose=10+k%20,sold=15+k,ans=boxes*each+loose-sold;return wordNumeric(id,'p4','หลายขั้นตอน',`ร้านมีขนม ${boxes} กล่อง กล่องละ ${each} ชิ้น และมีขนมแยกอีก ${loose} ชิ้น ขายไป ${sold} ชิ้น เหลือกี่ชิ้น`,ans,[boxes*each+loose+sold,boxes+each+loose-sold,ans+boxes],`ทั้งหมด ${boxes*each+loose} ชิ้น ลบที่ขาย ${sold} ชิ้น เหลือ ${ans} ชิ้น`,track)}
    if(type===1){const first=12+k,second=8+k*2,third=5+k%9,ans=first+second+third;return wordNumeric(id,'p4','ระยะทาง',`นักปั่นจักรยานเดินทางช่วงแรก ${first} กม. ช่วงที่สอง ${second} กม. และช่วงสุดท้าย ${third} กม. เดินทางรวมกี่กิโลเมตร`,ans,[first+second,ans-third+1,ans+third],`ระยะทางรวม = ${first} + ${second} + ${third} = ${ans} กม.`,track)}
    if(type===2){const width=5+k%12,length=8+k,ans=width*length;return wordNumeric(id,'p4','พื้นที่',`แปลงผักรูปสี่เหลี่ยมผืนผ้ากว้าง ${width} เมตร ยาว ${length} เมตร มีพื้นที่กี่ตารางเมตร`,ans,[2*(width+length),width+length,ans+width],`พื้นที่ = กว้าง × ยาว = ${width} × ${length} = ${ans} ตารางเมตร`,track)}
    if(type===3){const denominator=[2,4,5,10][k%4],numerator=1+k%(denominator-1),total=denominator*(20+k),ans=total*numerator/denominator;return wordNumeric(id,'p4','เศษส่วน',`นักเรียนทั้งหมด ${total} คน เลือกชมรมดนตรี ${numerator}/${denominator} ของนักเรียนทั้งหมด มีนักเรียนเลือกชมรมดนตรีกี่คน`,ans,[total/denominator,total-ans,ans+denominator],`${numerator}/${denominator} × ${total} = ${ans} คน`,track)}
    const hour=7+k%6,minute=(k*7)%60,duration=35+(k%9)*5,total=hour*60+minute+duration,answer=clockAt(total);return wordChoice(id,'p4','เวลา',`รถออกเวลา ${hour}:${String(minute).padStart(2,'0')} น. ใช้เวลาเดินทาง ${duration} นาที รถจะถึงเวลาใด`,answer,pickWrong(answer,[clockAt(hour*60+((minute+duration)%60)),clockAt(total+60),clockAt(total-60),clockAt(total+20),clockAt(total-25)]),`นำเวลาเริ่มต้นบวก ${duration} นาที ได้ ${answer}`,track);
  }

  function p5WordProblem(index){
    const k=Math.floor(index/5),type=index%5,id=`math-p5-word-${index+1}`,track=mathTrack(250+index);
    if(type===0){const price=200+k*20,rate=[10,20,25,50][k%4],discount=price*rate/100,ans=price-discount;return wordNumeric(id,'p5','ร้อยละ',`กระเป๋าราคา ${price} บาท ลดราคา ${rate}% ต้องจ่ายเงินกี่บาท`,ans,[discount,price+discount,price-rate],`ส่วนลด ${discount} บาท จึงจ่าย ${price} − ${discount} = ${ans} บาท`,track)}
    if(type===1){const denominator=[3,4,5,6,10][k%5],numerator=1+k%(denominator-1),total=denominator*(18+k),ans=total*numerator/denominator;return wordNumeric(id,'p5','เศษส่วน',`ถังมีน้ำ ${total} ลิตร ใช้ไป ${numerator}/${denominator} ของทั้งหมด ใช้น้ำไปกี่ลิตร`,ans,[total/denominator,total-ans,ans+denominator],`${numerator}/${denominator} × ${total} = ${ans} ลิตร`,track)}
    if(type===2){const a=50+k,b=a+5,c=a+10,d=a+15,ans=(a+b+c+d)/4;return wordNumeric(id,'p5','ค่าเฉลี่ย',`คะแนนสี่ครั้งของมินคือ ${a}, ${b}, ${c} และ ${d} คะแนน ค่าเฉลี่ยเท่ากับเท่าไร`,ans,[ans+5,ans-5,a+b+c+d],`ผลรวม ${a+b+c+d} หาร 4 ได้ ${formatNumber(ans)} คะแนน`,track)}
    if(type===3){const width=10+(k%5)*10,length=20+Math.floor(k/5)*10,height=10+(k%4)*10,volume=width*length*height,ans=volume/1000;return wordNumeric(id,'p5','ปริมาตร',`ตู้ปลากว้าง ${width} ซม. ยาว ${length} ซม. สูง ${height} ซม. มีความจุกี่ลิตร (1,000 ลบ.ซม. = 1 ลิตร)`,ans,[volume,ans+10,ans-1],`ปริมาตร ${volume} ลบ.ซม. หาร 1,000 เท่ากับ ${formatNumber(ans)} ลิตร`,track)}
    const speed=40+(k%9)*5,time=2+Math.floor(k/9),ans=speed*time;return wordNumeric(id,'p5','อัตราเร็ว',`รถวิ่งด้วยความเร็ว ${speed} กิโลเมตรต่อชั่วโมง เป็นเวลา ${time} ชั่วโมง จะเดินทางได้กี่กิโลเมตร`,ans,[speed+time,speed/time,ans+speed],`ระยะทาง = ความเร็ว × เวลา = ${speed} × ${time} = ${ans} กม.`,track);
  }

  function p6WordProblem(index){
    const k=Math.floor(index/5),type=index%5,id=`math-p6-word-${index+1}`,track=mathTrack(250+index);
    if(type===0){const first=2+k%8,second=3+(k*2)%9,total=(first+second)*(12+k),ans=total*first/(first+second);return wordNumeric(id,'p6','อัตราส่วน',`แบ่งทุนการศึกษา ${total} บาท ในอัตราส่วน ${first}:${second} ส่วนแรกจะได้รับกี่บาท`,ans,[total*second/(first+second),total/(first+second),ans+first],`ส่วนแรก = ${first}/${first+second} × ${total} = ${ans} บาท`,track)}
    if(type===1){const total=400+k*40,rate=[10,20,25,40][k%4],ans=total*rate/100;return wordNumeric(id,'p6','ร้อยละ',`โรงเรียนมีนักเรียน ${total} คน เป็นสมาชิกชมรมวิทยาศาสตร์ ${rate}% มีสมาชิกกี่คน`,ans,[total-rate,total+rate,ans+10],`${rate}% ของ ${total} = ${ans} คน`,track)}
    if(type===2){const speed1=40+(k%6)*10,time1=2+k%3,speed2=30+(k%5)*10,time2=1+Math.floor(k/10),ans=speed1*time1+speed2*time2;return wordNumeric(id,'p6','ระยะทางหลายช่วง',`รถวิ่งช่วงแรกด้วยความเร็ว ${speed1} กม./ชม. นาน ${time1} ชม. แล้ววิ่งช่วงที่สองด้วยความเร็ว ${speed2} กม./ชม. นาน ${time2} ชม. เดินทางรวมกี่กิโลเมตร`,ans,[speed1+speed2,ans-speed2,ans+speed1],`ระยะทางรวม = ${speed1}×${time1} + ${speed2}×${time2} = ${ans} กม.`,track)}
    if(type===3){const width=20+(k%5)*10,length=30+Math.floor(k/5)*10,height=20+(k%4)*10,volume=width*length*height,ans=volume/1000;return wordNumeric(id,'p6','ปริมาตร',`ถังทรงสี่เหลี่ยมกว้าง ${width} ซม. ยาว ${length} ซม. สูง ${height} ซม. จุน้ำได้กี่ลิตร`,ans,[volume,ans+20,ans-2],`ปริมาตร ${volume} ลบ.ซม. เท่ากับ ${formatNumber(ans)} ลิตร`,track)}
    const coprime=[[2,3],[3,4],[4,5],[5,6],[5,7]][k%5],groups=4+Math.floor(k/5),apples=coprime[0]*groups,oranges=coprime[1]*groups;return wordNumeric(id,'p6','ห.ร.ม.',`มีแอปเปิล ${apples} ผล และส้ม ${oranges} ผล ต้องจัดตะกร้าเหมือนกันทุกใบโดยไม่เหลือ จะจัดได้มากที่สุดกี่ตะกร้า`,groups,[groups+1,Math.min(apples,oranges),coprime[0]+coprime[1]],`ห.ร.ม. ของ ${apples} และ ${oranges} คือ ${groups} จึงจัดได้ ${groups} ตะกร้า`,track);
  }

  function m1WordProblem(index){
    const k=Math.floor(index/5),type=index%5,id=`math-m1-word-${index+1}`,track=mathTrack(250+index);
    if(type===0){const distance=4+k,rate=6+k%7,base=35+(k%5)*5,total=base+rate*distance;return wordNumeric(id,'m1','สมการเชิงเส้น',`แท็กซี่คิดค่าเริ่มต้น ${base} บาท และคิดเพิ่มกิโลเมตรละ ${rate} บาท หากจ่ายทั้งหมด ${total} บาท เดินทางกี่กิโลเมตร`,distance,[distance+1,distance-1,total/rate],`ตั้งสมการ ${base} + ${rate}x = ${total} จึงได้ x = ${distance}`,track)}
    if(type===1){const cost=300+k*25,rate=10+(k%6)*5,ans=cost*(100+rate)/100;return wordNumeric(id,'m1','ร้อยละกำไร',`ร้านซื้อสินค้าในราคา ${cost} บาท ต้องการกำไร ${rate}% ควรตั้งราคาขายกี่บาท`,ans,[cost*rate/100,cost+rate,ans+rate],`กำไร ${cost*rate/100} บาท ราคาขายจึงเป็น ${formatNumber(ans)} บาท`,track)}
    if(type===2){const boys=2+k%7,girls=3+(k*2)%8,total=(boys+girls)*(10+k),ans=total*boys/(boys+girls);return wordNumeric(id,'m1','อัตราส่วน',`ห้องหนึ่งมีนักเรียนชายต่อนักเรียนหญิงเป็น ${boys}:${girls} ถ้ามีนักเรียนทั้งหมด ${total} คน จะมีนักเรียนชายกี่คน`,ans,[total*girls/(boys+girls),total/(boys+girls),ans+boys],`นักเรียนชาย = ${boys}/${boys+girls} × ${total} = ${ans} คน`,track)}
    if(type===3){const a=50+k,b=a+5,c=a+10,d=a+15,target=a+10,missing=target*5-(a+b+c+d);return wordNumeric(id,'m1','ค่าเฉลี่ย',`คะแนน 4 ครั้งแรกคือ ${a}, ${b}, ${c}, ${d} ถ้าต้องการค่าเฉลี่ย 5 ครั้งเป็น ${target} ครั้งที่ห้าต้องได้กี่คะแนน`,missing,[target,missing+5,missing-5],`คะแนนรวมที่ต้องการ ${target*5} ลบคะแนนเดิม ${a+b+c+d} เหลือ ${missing}`,track)}
    const red=2+k,blue=3+k,total=red+blue;return wordChoice(id,'m1','ความน่าจะเป็น',`กล่องมีลูกบอลแดง ${red} ลูก และน้ำเงิน ${blue} ลูก สุ่มหนึ่งลูก ความน่าจะเป็นที่จะได้สีแดงคือข้อใด`,lowestTerms(red,total),pickWrongFraction(lowestTerms(red,total),[`${blue}/${total}`,`1/${total}`,`${red}/${blue}`,`${red+1}/${total}`,`${total}/${red}`]),`กรณีที่ต้องการ ${red} จากทั้งหมด ${total} จึงเป็น ${red}/${total} = ${lowestTerms(red,total)}`,track);
  }

  function m2WordProblem(index){
    const k=Math.floor(index/5),type=index%5,id=`math-m2-word-${index+1}`,track=mathTrack(250+index);
    if(type===0){const base=[[3,4,5],[5,12,13],[8,15,17],[7,24,25],[9,40,41]][k%5],scale=1+Math.floor(k/5),a=base[0]*scale,b=base[1]*scale,c=base[2]*scale;return wordNumeric(id,'m2','พีทาโกรัส',`บันไดยาว ${c} เมตร วางห่างกำแพง ${a} เมตร ปลายบันไดแตะกำแพงสูงกี่เมตร`,b,[a,a+b,c-b],`ใช้พีทาโกรัส √(${c}²−${a}²) = ${b} เมตร`,track)}
    if(type===1){const adults=10+k,children=5+k%10,totalPeople=adults+children,revenue=adults*120+children*80;return wordNumeric(id,'m2','ระบบสมการ',`งานหนึ่งขายบัตรผู้ใหญ่ใบละ 120 บาท เด็กใบละ 80 บาท ขายรวม ${totalPeople} ใบ ได้เงิน ${revenue} บาท ขายบัตรผู้ใหญ่กี่ใบ`,adults,[children,totalPeople-adults+2,adults+2],`ให้ a+c=${totalPeople} และ 120a+80c=${revenue} แก้ระบบได้ a=${adults}`,track)}
    if(type===2){const radius=7*(1+k%5),height=3+Math.floor(k/5),ans=22/7*radius*radius*height;return wordNumeric(id,'m2','ทรงกระบอก',`ถังทรงกระบอกรัศมี ${radius} ซม. สูง ${height} ซม. มีปริมาตรกี่ลูกบาศก์เซนติเมตร (π=22/7)`,ans,[22/7*radius*radius,2*22/7*radius*height,ans+height],`V = πr²h = ${ans} ลบ.ซม.`,track)}
    if(type===3){const initial=10+k,rate=2+k%7,hours=3+k%5,final=initial+rate*hours;return wordNumeric(id,'m2','อัตราการเปลี่ยนแปลง',`ระดับน้ำเริ่มที่ ${initial} ซม. และเพิ่มสม่ำเสมอ หลัง ${hours} ชั่วโมงเป็น ${final} ซม. ระดับน้ำเพิ่มเฉลี่ยชั่วโมงละกี่เซนติเมตร`,rate,[hours,rate+1,final-initial],`อัตราเพิ่ม = (${final}−${initial})/${hours} = ${rate} ซม./ชม.`,track)}
    const price=12+k%9,count=5+k%10,remainder=k%price,budget=price*count+remainder;return wordNumeric(id,'m2','อสมการงบประมาณ',`มีเงิน ${budget} บาท สมุดเล่มละ ${price} บาท ซื้อได้มากที่สุดกี่เล่ม`,count,[count+1,count-1,budget-price],`${price}x ≤ ${budget} ดังนั้นจำนวนเต็มมากที่สุดคือ ${count} เล่ม`,track);
  }

  function m3WordProblem(index){
    const k=Math.floor(index/5),type=index%5,id=`math-m3-word-${index+1}`,track=mathTrack(250+index);
    if(type===0){const width=3+k,diff=2+k%7,length=width+diff,area=width*length;return wordNumeric(id,'m3','สมการกำลังสอง',`สวนรูปสี่เหลี่ยมผืนผ้ามีด้านยาวกว่าด้านกว้าง ${diff} เมตร และมีพื้นที่ ${area} ตร.ม. ด้านกว้างยาวกี่เมตร`,width,[length,width+1,width-1],`ตั้งสมการ x(x+${diff})=${area} จะได้ x=${width}`,track)}
    if(type===1){const rabbits=5+k%20,chickens=25+k,heads=rabbits+chickens,legs=4*rabbits+2*chickens;return wordNumeric(id,'m3','ระบบสมการ',`ในคอกมีไก่และกระต่ายรวม ${heads} ตัว นับขาได้ ${legs} ขา มีกระต่ายกี่ตัว`,rabbits,[chickens,rabbits+2,rabbits-2],`ให้ c+r=${heads} และ 2c+4r=${legs} แก้ระบบได้ r=${rabbits}`,track)}
    if(type===2){const person=150+k,personShadow=100,treeShadow=200+(k%10)*20,ans=person*treeShadow/personShadow;return wordNumeric(id,'m3','รูปคล้าย',`คนสูง ${person} ซม. มีเงายาว ${personShadow} ซม. ขณะเดียวกันต้นไม้มีเงายาว ${treeShadow} ซม. ต้นไม้สูงกี่เซนติเมตร`,ans,[treeShadow,person+treeShadow,ans-person],`รูปสามเหลี่ยมคล้ายกัน: ${person}/${personShadow} = h/${treeShadow} จึงได้ h=${ans} ซม.`,track)}
    if(type===3){const base=[[3,4,5],[5,12,13],[8,15,17],[7,24,25],[9,40,41]][k%5],scale=1+Math.floor(k/5),horizontal=base[1]*scale,height=base[0]*scale,cable=base[2]*scale;return wordNumeric(id,'m3','ตรีโกณมิติ',`สายเคเบิลยาว ${cable} เมตร พาดจากยอดเสาลงสู่พื้นห่างโคนเสา ${horizontal} เมตร เสาสูงกี่เมตร`,height,[horizontal,cable-height,height+scale],`ใช้ sin หรือพีทาโกรัส จะได้ความสูง ${height} เมตร`,track)}
    const first=20+k,difference=2+k%5,rows=10+k%6,ans=rows*(2*first+(rows-1)*difference)/2;return wordNumeric(id,'m3','ลำดับเลขคณิต',`หอประชุมแถวแรกมี ${first} ที่นั่ง แต่ละแถวถัดไปเพิ่ม ${difference} ที่นั่ง ถ้ามี ${rows} แถว จะมีที่นั่งทั้งหมดกี่ที่`,ans,[first+(rows-1)*difference,ans-difference,ans+rows],`ผลบวกลำดับเลขคณิต = ${rows}/2[2(${first})+(${rows}−1)${difference}] = ${ans}`,track);
  }

  const mathWordProblemFactories={p3:p3WordProblem,p4:p4WordProblem,p5:p5WordProblem,p6:p6WordProblem,m1:m1WordProblem,m2:m2WordProblem,m3:m3WordProblem};
  function completeMathBank(grade,skillFactory){
    const skillQuestions=Array.from({length:250},(_,index)=>skillFactory(index));
    const wordProblems=Array.from({length:250},(_,index)=>mathWordProblemFactories[grade](index));
    return seededShuffle([...skillQuestions,...wordProblems],`math-${grade}-half-word-problems`);
  }

  const examPeople = [
    {name:'Mia',pronoun:'she',possessive:'her'},{name:'Leo',pronoun:'he',possessive:'his'},
    {name:'Nora',pronoun:'she',possessive:'her'},{name:'Ben',pronoun:'he',possessive:'his'},
    {name:'Emma',pronoun:'she',possessive:'her'},{name:'Noah',pronoun:'he',possessive:'his'},
    {name:'Lily',pronoun:'she',possessive:'her'},{name:'Owen',pronoun:'he',possessive:'his'},
    {name:'Zoe',pronoun:'she',possessive:'her'},{name:'Ethan',pronoun:'he',possessive:'his'}
  ];
  const examActions = [
    {base:'read',third:'reads',past:'read',participle:'read',ing:'reading',object:'a science book'},
    {base:'write',third:'writes',past:'wrote',participle:'written',ing:'writing',object:'a short report'},
    {base:'visit',third:'visits',past:'visited',participle:'visited',ing:'visiting',object:'the city museum'},
    {base:'prepare',third:'prepares',past:'prepared',participle:'prepared',ing:'preparing',object:'a class presentation'},
    {base:'complete',third:'completes',past:'completed',participle:'completed',ing:'completing',object:'the assignment'},
    {base:'practice',third:'practices',past:'practiced',participle:'practiced',ing:'practicing',object:'the piano'},
    {base:'organize',third:'organizes',past:'organized',participle:'organized',ing:'organizing',object:'the school event'},
    {base:'study',third:'studies',past:'studied',participle:'studied',ing:'studying',object:'English grammar'},
    {base:'repair',third:'repairs',past:'repaired',participle:'repaired',ing:'repairing',object:'the old bicycle'},
    {base:'deliver',third:'delivers',past:'delivered',participle:'delivered',ing:'delivering',object:'the package'}
  ];
  const examPlaces=['library','community center','train station','science lab','school office','sports hall','bookstore','health clinic','city park','art gallery'];
  const examDays=['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const examObjects=['notebook','umbrella','orange','pencil case','lunch box','map','camera','backpack','ticket','water bottle'];
  const pluralPairs=[['child','children'],['person','people'],['tooth','teeth'],['mouse','mice'],['woman','women'],['leaf','leaves'],['box','boxes'],['baby','babies'],['foot','feet'],['knife','knives']];
  // เก็บคำนำหน้านามไว้กับวลีโดยตรง เพราะกฎสระตามตัวอักษรใช้ไม่ได้กับเสียง /juː/ เช่น useful
  const articlePhrases=[['small notebook','a'],['old umbrella','an'],['useful map','a'],['interesting book','an'],['blue backpack','a']];

  function englishContext(index){
    const type=index%10,variant=Math.floor(index/10),cycle=Math.floor(variant/10),slot=variant%10;
    return {type,variant,cycle,slot,person:examPeople[slot],action:examActions[(slot+cycle*3)%examActions.length],place:examPlaces[(slot+cycle*2)%examPlaces.length],day:examDays[cycle],number:12+variant*3};
  }
  function englishQuestion(key,index,category,prompt,correct,wrong,explanation,track=key){
    const id=`en-${key}-${index+1}`;
    const item=question(id,'english',key,category,prompt,correct,wrong,explanation,track);
    const correctChoice=item.choices[item.answer];
    const distractors=seededShuffle(item.choices.filter((_,choiceIndex)=>choiceIndex!==item.answer),`${id}-distractors`);
    const answerPosition=index%4;
    distractors.splice(answerPosition,0,correctChoice);
    item.choices=distractors;
    item.answer=answerPosition;
    return item;
  }
  function wrongOptions(values,correct){
    return [...new Set(values.map(String))].filter(value=>value!==String(correct)).slice(0,3);
  }
  function buildEnglishExam(key,factory){
    return seededShuffle(Array.from({length:500},(_,index)=>factory(key,index)),`english-exam-${key}-2026`);
  }

  function p13ExamQuestion(key,index){
    const c=englishContext(index),p=c.person,a=c.action,id=index;
    if(c.type===0) return englishQuestion(key,id,'Grammar · Be verb',`${p.name} ___ ready for class on ${c.day}.`,'is',['am','are','be'],'Use “is” with one person in the present tense.');
    if(c.type===1) return englishQuestion(key,id,'Grammar · Present simple',`${p.name} ___ ${a.object} every ${c.day}.`,a.third,wrongOptions([a.base,a.ing,a.past,`will ${a.base}`],a.third),`A singular subject takes “${a.third}” in the present simple.`);
    if(c.type===2){const [phrase,correct]=articlePhrases[c.cycle];return englishQuestion(key,id,'Grammar · Articles',`${p.name} has ___ ${phrase} in the ${c.place}.`,correct,wrongOptions(['a','an','the','some'],correct),`Use “${correct}” before the singular phrase “${phrase}.”`)}
    if(c.type===3) return englishQuestion(key,id,'Grammar · Possessives',`Before the ${c.day} class at the ${c.place}, ${p.name} shows a new ${examObjects[c.slot]}. It is ___ ${examObjects[c.slot]}.`,p.possessive,wrongOptions(['my','your','his','her','our','their'],p.possessive),`“${p.possessive}” shows that the ${examObjects[c.slot]} belongs to ${p.name}.`);
    if(c.type===4){const positions=['in','on','under','next to','behind'][c.cycle];return englishQuestion(key,id,'Grammar · Prepositions',`The ${examObjects[c.slot]} is ___ the desk in the ${c.place}.`,positions,wrongOptions(['in','on','under','next to','behind'],positions),`“${positions}” correctly describes the position of the object.`)}
    if(c.type===5){const pair=pluralPairs[c.slot];return englishQuestion(key,id,'Grammar · Plural nouns',`Complete the ${c.day} worksheet from the ${c.place}: one ${pair[0]}, ${2+c.cycle} ___.`,pair[1],wrongOptions([`${pair[0]}s`,`${pair[0]}es`,pair[0],`many ${pair[0]}`],pair[1]),`The plural form of “${pair[0]}” is “${pair[1]}.”`)}
    if(c.type===6){const prompts=[['___ is your art teacher?','Who'],['___ do you keep your books?','Where'],['___ does the class begin?','When'],['___ are you carrying an umbrella?','Why'],['___ pencils do you need?','How many']][c.cycle];return englishQuestion(key,id,'Language use · Question words',`${prompts[0]} (${p.name} asks on ${c.day}.)`,prompts[1],wrongOptions(['Who','Where','When','Why','How many'],prompts[1]),`“${prompts[1]}” asks for the information needed in this question.`)}
    if(c.type===7){const skill=['swim','ride a bicycle','use a computer','play chess','draw a map'][c.cycle];return englishQuestion(key,id,'Grammar · Can',`${p.name} knows how to ${skill}. Which sentence is correct?`,`${p.name} can ${skill}.`,[`${p.name} cans ${skill}.`,`${p.name} can to ${skill}.`,`${p.name} is can ${skill}.`],'Use “can” followed by the base form of the verb.')}
    if(c.type===8){const time=8+c.cycle;const passage=`${p.name} goes to the ${c.place} at ${time}:00 every ${c.day}. ${p.pronoun[0].toUpperCase()+p.pronoun.slice(1)} ${a.third} ${a.object} there.`;return englishQuestion(key,id,'Reading · Detail',`${passage}\n\nWhere does ${p.name} go?`,`To the ${c.place}.`,[`To the market.`,`To the airport.`,`To the beach.`],`The first sentence says that ${p.name} goes to the ${c.place}.`)}
    const exchanges=[['Thank you for helping me.','You are welcome.'],['May I borrow your ruler?','Of course. Here you are.'],['I am sorry I am late.','That is all right.'],['How are you today?','I am fine, thank you.'],['Would you like some water?','Yes, please.']][c.cycle];
    return englishQuestion(key,id,'Conversation · Everyday response',`${p.name}: “${exchanges[0]}”\nFriend: “___”`,exchanges[1],['It is on the desk.','At half past three.','I have two of them.'],`“${exchanges[1]}” is the natural response in this situation.`);
  }

  function p46ExamQuestion(key,index){
    const c=englishContext(index),p=c.person,a=c.action,id=index;
    if(c.type===0) return englishQuestion(key,id,'Grammar · Past simple',`Last ${c.day}, ${p.name} ___ ${a.object}.`,a.past,wrongOptions([a.base,a.third,a.ing,`will ${a.base}`],a.past),`The completed time “Last ${c.day}” requires the past form “${a.past}.”`);
    if(c.type===1) return englishQuestion(key,id,'Grammar · Present continuous',`Look! ${p.name} ___ ${a.object} now.`,`is ${a.ing}`,[a.third,`was ${a.ing}`,`has ${a.participle}`],'Use “is + verb-ing” for an action happening now.');
    if(c.type===2) return englishQuestion(key,id,'Grammar · Future forms',`${p.name} has made a plan. ${p.pronoun[0].toUpperCase()+p.pronoun.slice(1)} ___ ${a.object} next ${c.day}.`,`is going to ${a.base}`,[a.past,`has ${a.participle}`,`${a.third}`],'“Be going to” expresses a plan that has already been made.');
    if(c.type===3){const adjectives=[['tall','taller'],['easy','easier'],['careful','more careful'],['good','better'],['busy','busier']][c.cycle];return englishQuestion(key,id,'Grammar · Comparatives',`${p.name}'s project is ___ than the one displayed in the ${c.place}.`,adjectives[1],[adjectives[0],`most ${adjectives[0]}`,`${adjectives[0]}ly`],`The word “than” calls for the comparative form “${adjectives[1]}.”`)}
    if(c.type===4){const noun=c.slot%2===0?'information':'chairs',correct=c.slot%2===0?'much':'many';return englishQuestion(key,id,'Grammar · Quantifiers',`How ___ ${noun} does the ${c.place} need this ${c.day}?`,correct,wrongOptions(['much','many','few','little'],correct),`Use “${correct}” with the noun “${noun}.”`)}
    if(c.type===5){const rows=[['The bus was late, ___ we arrived after nine.','so'],['I was tired, ___ I finished the assignment.','but'],['Take an umbrella ___ it may rain.','because'],['Hurry up, ___ you will miss the train.','or'],['We packed sandwiches ___ fruit.','and']][c.cycle];return englishQuestion(key,id,'Grammar · Connectors',`${rows[0]} (${p.name}'s ${c.day} trip to the ${c.place})`,rows[1],wrongOptions(['and','but','because','so','or'],rows[1]),`“${rows[1]}” shows the correct relationship between the two ideas.`)}
    if(c.type===6){const rows=[['You ___ wear a helmet when cycling.','should'],['Visitors ___ touch the paintings.','must not'],['___ I use your phone for a moment?','May'],['We ___ submit the form today; it is required.','must'],['Birds ___ fly, but fish cannot.','can']][c.cycle];return englishQuestion(key,id,'Grammar · Modal verbs',`${rows[0]} (${p.name} is at the ${c.place}.)`,rows[1],wrongOptions(['can','should','must','may','must not'],rows[1]),`“${rows[1]}” matches the meaning of the sentence.`)}
    if(c.type===7){const time=9+c.cycle,items=2+c.slot%5;const passage=`On ${c.day}, the ${c.place} opens at ${time}:00. ${p.name} arrives thirty minutes later and borrows ${items} books.`;return englishQuestion(key,id,'Reading · Factual information',`${passage}\n\nWhat time does ${p.name} arrive?`,`${time}:30`,[`${time}:00`,`${time+1}:00`,`${time-1}:30`],`Thirty minutes after ${time}:00 is ${time}:30.`)}
    if(c.type===8){const steps=['First','Next','Then','Finally'];return englishQuestion(key,id,'Text organization',`While preparing meal number ${c.number} at the ${c.place} on ${c.day}, ${p.name} washed the vegetables. ___, ${p.pronoun} cut them into small pieces.`,steps[1],wrongOptions(steps,steps[1]),'“Next” shows the second step in a sequence.')}
    return englishQuestion(key,id,'Editing · Sentence correction',`Choose the correct sentence about ${p.name}'s visit to the ${c.place} on ${c.day}.`,`${p.name} went to the ${c.place}.`,[`${p.name} goed to the ${c.place}.`,`${p.name} go to the ${c.place}.`,`${p.name} going to the ${c.place}.`],'“Went” is the correct past form of “go.”');
  }

  function m13ExamQuestion(key,index){
    const c=englishContext(index),p=c.person,a=c.action,id=index;
    if(c.type===0) return englishQuestion(key,id,'Grammar · Present perfect',`${p.name} has already ___ ${a.object} for the ${c.day} review.`,a.participle,wrongOptions([a.base,a.past,a.ing,`will ${a.base}`,`does not ${a.base}`],a.participle),`Present perfect uses “has + past participle”: has ${a.participle}.`);
    if(c.type===1) return englishQuestion(key,id,'Grammar · Passive voice',`${a.object[0].toUpperCase()+a.object.slice(1)} was ___ by ${p.name} for session ${c.number}.`,a.participle,wrongOptions([a.base,a.ing,a.third,`will ${a.base}`,`is ${a.ing}`],a.participle),`The passive form is “was + past participle.”`);
    if(c.type===2) return englishQuestion(key,id,'Grammar · First conditional',`If ${p.name} ${a.third} ${a.object} every ${c.day}, ${p.pronoun} ___ the task on time.`,'will finish',['finishes','would finish','finished'],'The first conditional uses present simple after “if” and “will + base verb” in the result clause.');
    if(c.type===3) return englishQuestion(key,id,'Grammar · Relative clauses',`${p.name} is the student ___ organized the event at the ${c.place}.`,'who',['which','where','whose'],'Use “who” for a person who performs the action.');
    if(c.type===4) return englishQuestion(key,id,'Grammar · Reported speech',`At the ${c.place} on ${c.day}, ${p.name} said, “I am preparing report ${c.number}.” Which sentence reports this correctly?`,`${p.name} said that ${p.pronoun} was preparing report ${c.number}.`,[`${p.name} said that I am preparing report ${c.number}.`,`${p.name} says that ${p.pronoun} prepared report ${c.number} yesterday.`,`${p.name} said that ${p.pronoun} is prepare report ${c.number}.`],'Reported speech changes the pronoun and usually shifts “am/is” to “was.”');
    if(c.type===5){const verbs=[['enjoys','learning'],['decided','to study'],['avoids','wasting'],['plans','to visit'],['finished','writing']][c.cycle];return englishQuestion(key,id,'Grammar · Gerunds and infinitives',`${p.name} ${verbs[0]} ___ English at the ${c.place}.`,verbs[1],wrongOptions(['learning','to study','wasting','to visit','writing','learned'],verbs[1]),`The verb “${verbs[0]}” is followed by “${verbs[1]}” in this sentence.`)}
    if(c.type===6){const rows=[['Please ___ the lights before leaving.','turn off'],['We had to ___ the meeting until Friday.','put off'],['She ___ her younger brother after school.','looks after'],['The students want to ___ what happened.','find out'],['Do not ___ when the task becomes difficult.','give up']][c.cycle];return englishQuestion(key,id,'Language use · Phrasal verbs',`${rows[0]} (${c.place})`,rows[1],wrongOptions(['turn off','put off','looks after','find out','give up'],rows[1]),`“${rows[1]}” completes the sentence with the intended meaning.`)}
    if(c.type===7) return englishQuestion(key,id,'Grammar · Question tags',`${p.name} has visited the ${c.place}, ___?`,`hasn't ${p.pronoun}`,[`doesn't ${p.pronoun}`,`isn't ${p.pronoun}`,'has it'],`The statement uses “has,” so the negative tag is “hasn't ${p.pronoun}.”`);
    if(c.type===8){const passage=`Although heavy rain delayed bus ${c.number} on ${c.day}, ${p.name} reached the ${c.place} before it closed and submitted the required form.`;return englishQuestion(key,id,'Reading · Inference',`${passage}\n\nWhat can be inferred?`,`${p.name} completed the trip despite a delay.`,[`${p.name} decided to stay home.`,`The ${c.place} closed before ${p.name} arrived.`,`The weather caused no difficulty.`],'The contrast introduced by “although” shows difficulty followed by a successful result.')}
    return englishQuestion(key,id,'Editing · Error recognition',`During the ${c.day} review at the ${c.place}, identify the error in item ${c.number}: “${p.name} (A) has (B) finish (C) the assignment (D) already.”`,'(B) finish',['(A) has','(C) the assignment','(D) already'],'After “has,” use the past participle “finished.”');
  }

  function m46ExamQuestion(key,index){
    const c=englishContext(index),p=c.person,a=c.action,id=index;
    if(c.type===0) return englishQuestion(key,id,'Advanced grammar · Inversion',`Rarely during ${p.name}'s ${c.day} review of project ${c.number} at the ${c.place} ___ such a carefully designed solution.`,'have we seen',['we have seen','did we saw','we had see'],'A limiting adverb at the beginning requires auxiliary–subject inversion.');
    if(c.type===1) return englishQuestion(key,id,'Advanced grammar · Conditionals',`Had ${p.name} checked the schedule on ${c.day}, ${p.pronoun} ___ the delay.`,'would have avoided',['will avoid','would avoid','had avoided'],'This inverted third conditional requires “would have + past participle.”');
    if(c.type===2){const row=[{verb:'analyze',noun:'analysis',adjective:'analytical',adverb:'analytically'},{verb:'evaluate',noun:'evaluation',adjective:'evaluative',adverb:'evaluatively'},{verb:'implement',noun:'implementation',adjective:'practical',adverb:'practically'},{verb:'revise',noun:'revision',adjective:'revised',adverb:'repeatedly'},{verb:'approve',noun:'approval',adjective:'approved',adverb:'officially'}][c.cycle];return englishQuestion(key,id,'Academic English · Word forms',`The committee's careful ___ of the plan took ${c.number} minutes.`,row.noun,[row.verb,row.adjective,row.adverb],`A noun is required after the adjective “careful”; “${row.noun}” is the correct form.`)}
    if(c.type===3) return englishQuestion(key,id,'Advanced grammar · Reduced clauses',`Report ${c.number}, ___ by ${p.name} on ${c.day} at the ${c.place}, was accepted by the committee.`,a.participle,wrongOptions([a.base,a.ing,`to ${a.base}`,`will ${a.base}`],a.participle),'A past participle is used because the report receives the action.');
    if(c.type===4){const rows=[['The evidence was limited. ___, the researchers reported a clear trend.','Nevertheless'],['The sample was large. ___, the findings require replication.','Even so'],['The method was inexpensive. ___, it was highly accurate.','Moreover'],['The first trial failed. ___, the team revised the procedure.','Consequently'],['The results were promising. ___, several questions remained.','However']][c.cycle];return englishQuestion(key,id,'Cohesion · Linking devices',`${rows[0]} (${p.name}'s ${c.day} review at the ${c.place}, file ${c.number})`,rows[1],wrongOptions(['Nevertheless','Even so','Moreover','Consequently','However'],rows[1]),`“${rows[1]}” expresses the logical relationship between the statements.`)}
    if(c.type===5) return englishQuestion(key,id,'Grammar · Subjunctive',`At the ${c.place}, ${p.name}'s panel recommended that report ${c.number} ___ before ${c.day}.`,'be revised',['is revised','was revised','revises'],'After “recommended that,” formal English uses the base subjunctive “be revised.”');
    if(c.type===6){const passage=`A study of ${c.number} students found that short, frequent review sessions improved long-term recall more than one lengthy session. The researchers cautioned that the result may not apply to every subject.`;return englishQuestion(key,id,'Reading · Main idea',`${passage}\n\nWhat is the main idea?`,'Frequent review may support memory, although the finding has limits.',['One long session is always the best method.','The study proved that every subject is identical.','Memory cannot be improved through practice.'],'The best answer includes both the finding and the researchers’ caution.')}
    if(c.type===7){const sentence=`Proposal ${c.number} for the ${c.place} appears feasible, but its long-term costs after ${c.day} remain uncertain.`;return englishQuestion(key,id,'Reading · Paraphrase',`Which sentence best paraphrases this statement? “${sentence}”`,`The plan seems workable, although its future expenses are unclear.`,['The plan is impossible because all costs are known.','The proposal has already eliminated every expense.','The project is inexpensive and completely certain.'],'A good paraphrase preserves both feasibility and uncertainty about future costs.')}
    if(c.type===8){const passage=`At the ${c.place} on ${c.day}, ${p.name} described policy ${c.number} as “a useful first step rather than a complete solution.”`;return englishQuestion(key,id,'Reading · Tone and stance',`${passage}\n\nWhat is ${p.name}'s attitude?`,'Cautiously supportive',['Completely opposed','Uncritically enthusiastic','Entirely indifferent'],'The phrase supports the policy while clearly recognizing its limitations.')}
    return englishQuestion(key,id,'Editing · Error recognition',`In ${p.name}'s review at the ${c.place}, identify the error in item ${c.number}: “(A) Neither the manager nor the assistants (B) was (C) aware of (D) the revised schedule on ${c.day}.”`,'(B) was',['(A) Neither','(C) aware of','(D) the revised schedule'],'With the nearer plural subject “assistants,” the verb should be “were.”');
  }

  const academicTopics=[
    {subject:'urban trees',finding:'lower street temperatures',cause:'their leaves provide shade and release water',term:'moderate',meaning:'make less extreme',vocab:'Tree cover can moderate extreme temperatures during hot weather.'},
    {subject:'coral reefs',finding:'support diverse marine life',cause:'their complex structures create many habitats',term:'decline',meaning:'decrease',vocab:'Scientists recorded a decline in reef health after the disturbance.'},
    {subject:'migrating birds',finding:'adjust their routes',cause:'seasonal wind patterns change',term:'navigate',meaning:'find a route',vocab:'Migrating birds navigate by using several environmental signals.'},
    {subject:'volcanic soil',finding:'can become highly fertile',cause:'minerals are released as rock breaks down',term:'retain',meaning:'continue to hold',vocab:'Organic matter helps the soil retain water during dry periods.'},
    {subject:'sleep cycles',finding:'influence memory formation',cause:'the brain reorganizes recent information',term:'consolidate',meaning:'make stable',vocab:'Adequate sleep may help the brain consolidate new memories.'},
    {subject:'wetlands',finding:'reduce flood damage',cause:'they temporarily store excess water',term:'buffer',meaning:'protect from impact',vocab:'Coastal wetlands can buffer communities against storm damage.'},
    {subject:'pollinating insects',finding:'increase crop production',cause:'they transfer pollen between flowers',term:'facilitate',meaning:'make easier',vocab:'Pollinating insects facilitate reproduction in many plants.'},
    {subject:'ancient trade routes',finding:'spread technologies between regions',cause:'merchants exchanged ideas as well as goods',term:'disperse',meaning:'spread widely',vocab:'Trade networks helped disperse technologies across distant regions.'},
    {subject:'public libraries',finding:'strengthen access to information',cause:'shared resources reduce individual costs',term:'accessible',meaning:'easy to obtain or use',vocab:'Digital catalogs make library collections more accessible.'},
    {subject:'renewable energy storage',finding:'improves grid reliability',cause:'stored power can be used when demand rises',term:'fluctuate',meaning:'change irregularly',vocab:'Solar power output may fluctuate as cloud cover changes.'}
  ];
  function academicContext(index){const c=englishContext(index);return {...c,topic:academicTopics[c.slot],studyYear:2019+c.cycle,sample:80+c.variant*4}}

  function toeflExamQuestion(key,index){
    const c=academicContext(index),t=c.topic,id=index;
    const passage=`In a ${c.studyYear} study of ${c.sample} observations, researchers examined ${t.subject}. They found that ${t.subject} ${t.finding}. This finding was attributed largely to the fact that ${t.cause}. The authors noted that local conditions could moderate the effect.`;
    if(c.type===0) return englishQuestion(key,id,'TOEFL Reading · Factual information',`${passage}\n\nAccording to the passage, what did the researchers find?`,`${t.subject} ${t.finding}.`,['Local conditions had no influence.','The observations were removed from the study.','The proposed effect occurred for an unrelated reason.'],'The answer restates the finding reported in the second sentence.','TOEFL');
    if(c.type===1) return englishQuestion(key,id,'TOEFL Reading · Inference',`${passage}\n\nWhat can be inferred from the final sentence?`,'The strength of the effect may vary from place to place.',['The study produced exactly the same result everywhere.','Local conditions were excluded from the analysis.','The authors believed that observation was unnecessary.'],'If local conditions moderate an effect, the effect may not be equally strong everywhere.','TOEFL');
    if(c.type===2) return englishQuestion(key,id,'TOEFL Reading · Rhetorical purpose',`${passage}\n\nWhy does the author mention ${t.cause}?`,'To explain the mechanism behind the finding',['To reject the study’s main conclusion','To introduce an unrelated historical event','To argue that the sample was too small'],'The detail explains why the reported effect occurs.','TOEFL');
    if(c.type===3) return englishQuestion(key,id,'TOEFL Reading · Vocabulary in context',`A ${c.studyYear} paper based on ${c.sample} observations states: “${t.vocab}”\n\nThe word “${t.term}” is closest in meaning to:`,t.meaning,['measure precisely','remove completely','describe historically'],`In this context, “${t.term}” means “${t.meaning}.”`,'TOEFL');
    if(c.type===4) return englishQuestion(key,id,'TOEFL Reading · Reference',`${passage}\n\nThe phrase “This finding” in the third sentence refers to:`,`the result that ${t.subject} ${t.finding}`,['the number of researchers','the year of publication','the existence of local conditions alone'],`“This finding” refers to the result reported in the preceding sentence.`,'TOEFL');
    if(c.type===5) return englishQuestion(key,id,'TOEFL Reading · Sentence simplification',`${passage}\n\nWhich option best expresses the essential meaning of the final sentence?`,'The effect may become stronger or weaker depending on local circumstances.',['The effect completely removes all local conditions.','The authors studied only one location and rejected all others.','Local circumstances always produce an identical effect.'],'“Moderate” indicates that local circumstances can alter the degree of the effect.','TOEFL');
    if(c.type===6) return englishQuestion(key,id,'TOEFL Reading · Sentence insertion',`Study ${c.studyYear} included ${c.sample} observations. Where would this sentence best fit? “This mechanism helps explain the pattern recorded in the data.”\n[1] Researchers examined ${t.subject}. [2] They recorded a consistent pattern. [3] ${t.cause[0].toUpperCase()+t.cause.slice(1)}. [4] Local variation was also observed.`,'After sentence [3]',['Before sentence [1]','After sentence [1]','After sentence [4]'],'“This mechanism” clearly refers to the explanation in sentence [3].','TOEFL');
    if(c.type===7) return englishQuestion(key,id,'TOEFL Reading · Summary',`${passage}\n\nWhich statement best summarizes the passage?`,`A study identified how ${t.subject} ${t.finding}, while noting possible local variation.`,['The passage lists several unrelated studies without a conclusion.','Researchers proved that local conditions never matter.','The passage argues that observations should be avoided.'],'The correct summary combines the main finding, its explanation, and the stated limitation.','TOEFL');
    if(c.type===8){const lecture=`Professor: “In our ${c.studyYear} review of ${c.sample} observations, consider ${t.subject}. Evidence suggests that ${t.subject} ${t.finding}. What matters is the process: ${t.cause}.”`;return englishQuestion(key,id,'TOEFL Listening · Lecture purpose',`${lecture}\n\nWhat is the professor mainly explaining?`,`How a process involving ${t.subject} creates a particular effect`,['How to calculate the cost of a textbook','Why the class meeting was canceled','How to write a personal invitation'],'The professor introduces a finding and then explains its cause.','TOEFL')}
    return englishQuestion(key,id,'TOEFL Academic Discussion',`Professor: “Our ${c.studyYear} class is reviewing ${c.sample} observations. Should research on ${t.subject} guide public decisions?”\nStudent A: “Yes, one study is always enough.”\nStudent B: “Evidence is useful, but local conditions and repeated studies should also be considered.”\n\nWhich response is better supported by academic reasoning?`,'Student B, because the response considers evidence and limitations.',['Student A, because one study proves every case.','Student A, because local conditions never matter.','Neither student, because evidence has no value.'],'Strong academic reasoning uses evidence while recognizing uncertainty and the need for replication.','TOEFL');
  }

  const businessRows=[
    {department:'sales department',task:'review the quarterly figures',document:'sales report',client:'Northwind Ltd.'},
    {department:'human resources office',task:'confirm the interview schedule',document:'application form',client:'Ms. Rivera'},
    {department:'shipping department',task:'track the delayed order',document:'delivery notice',client:'Greenway Market'},
    {department:'finance team',task:'approve the travel expense',document:'expense claim',client:'Mr. Patel'},
    {department:'maintenance office',task:'inspect the air conditioner',document:'service request',client:'Oak Hotel'},
    {department:'marketing team',task:'finalize the product brochure',document:'campaign draft',client:'Bright Media'},
    {department:'customer service desk',task:'respond to the complaint',document:'support ticket',client:'Ms. Chen'},
    {department:'training unit',task:'reserve the conference room',document:'attendance list',client:'Apex Consulting'},
    {department:'purchasing office',task:'compare supplier quotations',document:'purchase order',client:'Metro Supplies'},
    {department:'IT help desk',task:'install the security update',document:'technical checklist',client:'Lakeview Bank'}
  ];
  function toeicExamQuestion(key,index){
    const c=englishContext(index),b=businessRows[c.slot],id=index,time=9+c.cycle;
    if(c.type===0) return englishQuestion(key,id,'TOEIC Part 5 · Verb tense',`The ${b.department} ___ the ${b.document} before the meeting begins at ${time}:00.`,'will review',['reviewing','has review','was reviewed by'],`“Will review” correctly describes an action to be completed in the future.`,'TOEIC');
    if(c.type===1) return englishQuestion(key,id,'TOEIC Part 5 · Prepositions',`Please submit the ${b.document} ___ ${c.day} at the latest.`,'by',['for','since','during'],'“By” introduces the deadline.','TOEIC');
    if(c.type===2) return englishQuestion(key,id,'TOEIC Part 5 · Conjunctions',`At ${time}:00 on ${c.day}, ${b.client} requested another copy ___ the original ${b.document} was incomplete.`,'because',['although','unless','while'],'“Because” introduces the reason for the request.','TOEIC');
    if(c.type===3) return englishQuestion(key,id,'TOEIC Part 5 · Word form',`On ${c.day}, the ${b.department} manager thanked the team for its ___ response to ${b.client} before ${time}:00.`,'prompt',['promptly','promptnessly','prompted'],'An adjective is needed before “response”; “prompt” is the correct form.','TOEIC');
    if(c.type===4){const email=`To: ${b.client}\nSubject: ${b.document}\nYour document has been received. Our ${b.department} will ${b.task} on ${c.day}, and we will contact you by ${time}:00.`;return englishQuestion(key,id,'TOEIC Part 7 · Email detail',`${email}\n\nWhat will the company do on ${c.day}?`,b.task,[`Cancel the ${b.document}`,'Close the office permanently','Send an unrelated advertisement'],'The email directly states the task scheduled for that day.','TOEIC')}
    if(c.type===5){const notice=`NOTICE: The ${b.department} will be closed from ${time}:00 to ${time+1}:00 on ${c.day} for staff training. Urgent requests should be sent by e-mail.`;return englishQuestion(key,id,'TOEIC Part 7 · Notice inference',`${notice}\n\nWhat should a customer do during the closure?`,'Send an urgent request by e-mail.',['Wait inside the closed office.','Call the training instructor.','Discard the request.'],'The notice provides e-mail as the method for urgent requests during the closure.','TOEIC')}
    if(c.type===6) return englishQuestion(key,id,'TOEIC Listening · Question–response',`Manager: “Could you ${b.task} before ${time}:00?”\nEmployee: “___”`,'Certainly. I will start right away.',['The office is on the second floor.','It was printed in blue.','About fifteen kilometers.'],'The response accepts the request and promises action.','TOEIC');
    if(c.type===7){const schedule=`${c.day} schedule — ${time}:00: call ${b.client}; ${time+1}:00: ${b.task}; ${time+2}:00: team briefing.`;return englishQuestion(key,id,'TOEIC Part 7 · Schedule',`${schedule}\n\nWhat is scheduled immediately after the call?`,b.task,['The team briefing','A lunch reservation','A building inspection not listed'],'The task at the next time slot follows the call.','TOEIC')}
    if(c.type===8) return englishQuestion(key,id,'TOEIC Part 6 · Reference',`${b.client} sent a revised ${b.document}. It will be reviewed by the ${b.department} on ${c.day}.\n\nWhat does “It” refer to?`,`the revised ${b.document}`,[b.client,`the ${b.department}`,c.day],'The singular pronoun “It” refers to the revised document.','TOEIC');
    return englishQuestion(key,id,'TOEIC Part 6 · Text completion',`Thank you for contacting the ${b.department}. We have received your ${b.document}. ___, a representative will reply by ${time}:00 on ${c.day}.`,'Next',['However','For example','In contrast'],'“Next” logically introduces the following step in the process.','TOEIC');
  }

  function ieltsExamQuestion(key,index){
    const c=academicContext(index),t=c.topic,id=index;
    const passage=`A local survey in ${c.studyYear} examined ${t.subject}. Of ${c.sample} participants, most agreed that ${t.subject} ${t.finding}. The report attributed this pattern mainly to the fact that ${t.cause}. It did not claim that the pattern occurs in every location.`;
    if(c.type===0) return englishQuestion(key,id,'IELTS Reading · True / False / Not Given',`${passage}\n\nStatement: The report claimed that the pattern was universal.`,'False',['True','Not Given','Both True and False'],'The passage explicitly says that the report did not claim the pattern occurs everywhere.','IELTS');
    if(c.type===1) return englishQuestion(key,id,'IELTS Reading · Matching heading',`${passage}\n\nChoose the best heading.`,'Evidence for a pattern and an important limitation',['A complete rejection of local research','Instructions for buying equipment','A biography of a single participant'],'The passage presents a finding, an explanation, and a limitation.','IELTS');
    if(c.type===2) return englishQuestion(key,id,'IELTS Reading · Detail',`${passage}\n\nWhat explanation did the report give for the pattern?`,t.cause,['A change in the survey deadline','A lack of any participants','An unrelated financial decision'],'The third sentence directly identifies the reported explanation.','IELTS');
    if(c.type===3) return englishQuestion(key,id,'IELTS Reading · Inference',`${passage}\n\nWhich conclusion is most reasonable?`,'The result may differ under other local conditions.',['The result must be identical in every country.','The survey contained no observations.','The researchers rejected their own data.'],'The stated limitation suggests that local context may affect the result.','IELTS');
    if(c.type===4) return englishQuestion(key,id,'IELTS Reading · Meaning in context',`A ${c.studyYear} report based on ${c.sample} participants states: “${t.vocab}”\n\nThe word “${t.term}” is closest in meaning to:`,t.meaning,['copy word for word','measure in kilograms','remove from history'],`The contextual meaning is “${t.meaning}.”`,'IELTS');
    if(c.type===5) return englishQuestion(key,id,'IELTS Listening · Form completion',`Receptionist: “The workshop on ${t.subject} begins at ${9+c.cycle}:30 in Room ${20+c.slot}.”\n\nComplete the form: Start time: ___`,`${9+c.cycle}:30`,[`${9+c.cycle}:00`,`${10+c.cycle}:30`,`${20+c.slot}:00`],'The speaker states the start time directly.','IELTS');
    if(c.type===6) return englishQuestion(key,id,'IELTS Listening · Multiple choice',`Speaker: “We first planned to meet at the ${examPlaces[c.slot]}, but it is closed on ${c.day}, so the group will meet at the community center instead.”\n\nWhere will the group meet?`,'At the community center.',['At the original location.','At the airport.','At a private home.'],'The speaker replaces the original location with the community center.','IELTS');
    if(c.type===7) return englishQuestion(key,id,'IELTS Reading · Writer’s view',`${passage}\n\nWhich statement best describes the writer’s position?`,'The finding is useful but should not be generalized without caution.',['The finding is worthless and should be ignored.','The finding proves a universal law.','The survey should replace all future research.'],'The passage reports useful evidence while clearly stating a limitation.','IELTS');
    if(c.type===8) return englishQuestion(key,id,'IELTS Reading · Sentence completion',`${passage}\n\nComplete the sentence: The pattern was mainly explained by ___.`,t.cause,['the year printed on the report','the number of pages in the survey','a decision to avoid local evidence'],'The required words express the cause given in the passage.','IELTS');
    return englishQuestion(key,id,'IELTS Academic task awareness',`A chart shows that participation in a program involving ${t.subject} rose from ${30+c.cycle*5}% to ${55+c.cycle*5}% between ${c.studyYear-5} and ${c.studyYear}. Which sentence reports the trend objectively?`,`Participation rose from ${30+c.cycle*5}% to ${55+c.cycle*5}% over the period.`,['The program was obviously the greatest success ever.','Everyone certainly preferred the program.','The chart proves why every participant joined.'],'An objective report describes the numerical trend without unsupported opinion.','IELTS');
  }

  function kkuAeltExamQuestion(key,index){
    const c=academicContext(index),t=c.topic,id=index;
    const passage=`At a university seminar in ${c.studyYear}, a team presented ${c.sample} observations concerning ${t.subject}. These observations indicated that ${t.subject} ${t.finding}; however, the speakers emphasized that ${t.cause} and that context must be considered.`;
    if(c.type===0) return englishQuestion(key,id,'KKU-AELT · Structure',`In the ${c.studyYear} study of ${c.sample} observations on ${t.subject}, the research team recommended that the data ___ again before publication.`,'be analyzed',['is analyzed','was analyzed','analyzes'],'The verb after “recommended that” takes the base subjunctive form.','KKU-AELT');
    if(c.type===1) return englishQuestion(key,id,'KKU-AELT · Cloze',`In seminar ${c.sample} on ${t.subject}, the presenter stated: “${t.subject[0].toUpperCase()+t.subject.slice(1)} may produce important benefits; ___, local conditions can alter the outcome.”`,'however',['therefore','for example','in addition'],'“However” signals contrast between the benefit and the limitation.','KKU-AELT');
    if(c.type===2) return englishQuestion(key,id,'KKU-AELT · Error recognition',`In the ${c.studyYear} report on ${t.subject}, identify the error in item ${c.sample}: “(A) The results (B) indicates (C) that local conditions (D) are important.”`,'(B) indicates',['(A) The results','(C) that local conditions','(D) are important'],'The plural subject “results” requires “indicate.”','KKU-AELT');
    if(c.type===3) return englishQuestion(key,id,'KKU-AELT · Reading detail',`${passage}\n\nWhat did the evidence indicate?`,`${t.subject} ${t.finding}.`,['The seminar was canceled.','Context never affects outcomes.','The team collected no observations.'],'The correct answer restates the central finding.','KKU-AELT');
    if(c.type===4) return englishQuestion(key,id,'KKU-AELT · Reading inference',`${passage}\n\nWhat can be inferred about the speakers?`,'They supported the finding but recognized its limits.',['They rejected every observation.','They believed context was irrelevant.','They refused to present any evidence.'],'The word “however” introduces the caution that follows the positive finding.','KKU-AELT');
    if(c.type===5) return englishQuestion(key,id,'KKU-AELT · Paraphrase',`${passage}\n\nWhich option best paraphrases “context must be considered”?`,'The circumstances surrounding the evidence are relevant.',['The evidence should be memorized without analysis.','Every result has exactly the same cause.','The research setting can be completely ignored.'],'“Context” refers to the circumstances in which the evidence was produced.','KKU-AELT');
    if(c.type===6) return englishQuestion(key,id,'KKU-AELT · Academic vocabulary in context',`A ${c.studyYear} discussion based on ${c.sample} observations states: “${t.vocab}”\n\nThe word “${t.term}” is closest in meaning to:`,t.meaning,['make permanent','copy exactly','argue without evidence'],`The surrounding academic context supports the meaning “${t.meaning}.”`,'KKU-AELT');
    if(c.type===7) return englishQuestion(key,id,'KKU-AELT · Reference',`${passage}\n\nThe phrase “These observations” refers to:`,`the ${c.sample} observations presented by the team`,[t.subject,'the seminar speakers','local conditions'],'The demonstrative phrase refers to the observations mentioned in the preceding sentence.','KKU-AELT');
    if(c.type===8) return englishQuestion(key,id,'KKU-AELT · Main idea',`${passage}\n\nWhat is the main idea?`,`Evidence about ${t.subject} supports a finding, but context remains important.`,['University seminars should never present data.','All observations produce universal conclusions.','The passage is mainly a schedule for a seminar.'],'The correct answer combines the finding with the qualification.','KKU-AELT');
    return englishQuestion(key,id,'KKU-AELT · Sentence completion',`Only after the team had reviewed all ${c.sample} observations ___ its conclusion.`,'did it announce',['it announced','it did announce','had it announce'],'“Only after” at the beginning requires inversion in the main clause.','KKU-AELT');
  }

  function conversationExamQuestion(key,index){
    const c=englishContext(index),p=c.person,id=index,time=9+c.cycle,place=c.place;
    const rows=[
      {category:'Requests',prompt:`${p.name}: “Could you help me carry these boxes to the ${place}?”\nYou: “___”`,answer:'Of course. Where should I put them?',wrong:['They were delivered yesterday.','The boxes are made of paper.','The room closes at six.']},
      {category:'Clarification',prompt:`You: “The meeting starts at ${time}, correct?”\n${p.name}: “Sorry, could you say that again?”\nYou: “___”`,answer:`I asked whether it starts at ${time}.`,wrong:['I have never attended a meeting.','The building is very tall.','No, I do not own a clock.']},
      {category:'Directions',prompt:`${p.name}: “Excuse me, how can I get to the ${place}?”\nYou: “___”`,answer:'Go straight and turn left at the next corner.',wrong:['It costs twenty dollars.','I visited it last year.','Yes, I enjoy walking.']},
      {category:'Apologies',prompt:`${p.name}: “I am sorry I missed our appointment on ${c.day}.”\nYou: “___”`,answer:'That is all right. Let us arrange another time.',wrong:['The appointment is made of glass.','I bought three tickets.','Turn right at the traffic light.']},
      {category:'Suggestions',prompt:`${p.name}: “We need a quiet place to study on ${c.day}.”\nYou: “___”`,answer:`Why don't we meet at the ${place}?`,wrong:['I studied for two hours yesterday.','The test contains fifty questions.','No, the bus was not expensive.']},
      {category:'Telephone English',prompt:`At ${time}:00 on ${c.day}, a caller phones the ${place}.\nCaller: “May I speak to ${p.name}, please?”\nReceptionist: “___”`,answer:'Certainly. Please hold for a moment.',wrong:['The office is beside the bank.','I spoke English last week.','The document has ten pages.']},
      {category:'Customer service',prompt:`At the ${place} on ${c.day}, ${p.name} says: “This item is damaged. Could I exchange it before ${time}:00?”\nClerk: “___”`,answer:'Certainly. Do you have the receipt?',wrong:['The store opened ten years ago.','It is displayed near the window.','I exchange messages every day.']},
      {category:'Making plans',prompt:`${p.name}: “Are you free to visit the ${place} at ${time}:00 on ${c.day}?”\nYou: “___”`,answer:'Yes, that time works for me.',wrong:['It takes ten minutes by train.','The tickets were printed in color.','I was free last month.']},
      {category:'Health and safety',prompt:`At ${time}:00 on ${c.day} near the ${place}, ${p.name} says: “I feel dizzy after standing in the sun.”\nYou: “___”`,answer:'Sit down in the shade and drink some water.',wrong:['You should run as fast as possible.','The weather report is on television.','I bought a new pair of shoes.']},
      {category:'Workplace communication',prompt:`Manager: “Can you send the revised file before ${time}:00?”\n${p.name}: “___”`,answer:'Yes. I will send it as soon as I finish checking it.',wrong:['The file cabinet is beside the door.','I received three messages yesterday.','The revision was a long document.']}
    ];
    const row=rows[c.type];
    return englishQuestion(key,id,`Conversation · ${row.category}`,row.prompt,row.answer,row.wrong,`“${row.answer}” is the most natural and useful response in this situation.`,'Conversation');
  }

  const tenseProfiles=[
    {name:'Present Simple',marker:'every weekday',form:a=>a.third,explanation:'Use the present simple for routines and repeated actions.'},
    {name:'Present Continuous',marker:'right now',form:a=>`is ${a.ing}`,explanation:'Use “is + verb-ing” for an action happening now.'},
    {name:'Present Perfect',marker:'already',form:a=>`has ${a.participle}`,explanation:'Use “has + past participle” for a completed action connected to the present.'},
    {name:'Present Perfect Continuous',marker:'for two hours',form:a=>`has been ${a.ing}`,explanation:'Use “has been + verb-ing” for an action continuing up to now.'},
    {name:'Past Simple',marker:'yesterday',form:a=>a.past,explanation:'Use the past form for a completed action at a finished past time.'},
    {name:'Past Continuous',marker:'at 8 p.m. last night',form:a=>`was ${a.ing}`,explanation:'Use “was + verb-ing” for an action in progress at a past time.'},
    {name:'Past Perfect',marker:'before the meeting began',form:a=>`had ${a.participle}`,explanation:'Use “had + past participle” for an earlier past action.'},
    {name:'Past Perfect Continuous',marker:'for an hour before the bus arrived',form:a=>`had been ${a.ing}`,explanation:'Use “had been + verb-ing” for duration before another past event.'},
    {name:'Future Simple',marker:'tomorrow',form:a=>`will ${a.base}`,explanation:'Use “will + base verb” for a future action or prediction.'},
    {name:'Future Continuous',marker:'at this time tomorrow',form:a=>`will be ${a.ing}`,explanation:'Use “will be + verb-ing” for an action in progress at a future time.'},
    {name:'Future Perfect',marker:'by next Friday',form:a=>`will have ${a.participle}`,explanation:'Use “will have + past participle” for an action completed before a future deadline.'},
    {name:'Future Perfect Continuous',marker:'for two hours by 6 p.m. tomorrow',form:a=>`will have been ${a.ing}`,explanation:'Use “will have been + verb-ing” to emphasize duration up to a future point.'}
  ];
  function tenseExamQuestion(key,index){
    const tense=tenseProfiles[index%tenseProfiles.length],variant=Math.floor(index/tenseProfiles.length),cycle=Math.floor(variant/10),slot=variant%10,p=examPeople[slot],a=examActions[(slot+cycle*3+index%12)%examActions.length],correct=tense.form(a);
    const pool=[a.base,a.third,a.past,a.ing,`is ${a.ing}`,`has ${a.participle}`,`has been ${a.ing}`,`was ${a.ing}`,`had ${a.participle}`,`had been ${a.ing}`,`will ${a.base}`,`will be ${a.ing}`,`will have ${a.participle}`,`will have been ${a.ing}`];
    return englishQuestion(key,index,`12 Tenses · ${tense.name}`,`Choose the correct verb form: ${p.name} ___ ${a.object} ${tense.marker}.`,correct,wrongOptions(seededShuffle([...new Set(pool)],`tense-options-${index}`),correct),`${tense.explanation} The correct form is “${correct}.”`,'Tenses');
  }

  const english = {
    p1_3:buildEnglishExam('p1_3',p13ExamQuestion),
    p4_6:buildEnglishExam('p4_6',p46ExamQuestion),
    m1_3:buildEnglishExam('m1_3',m13ExamQuestion),
    m4_6:buildEnglishExam('m4_6',m46ExamQuestion),
    toefl:buildEnglishExam('toefl',toeflExamQuestion),
    toeic:buildEnglishExam('toeic',toeicExamQuestion),
    ielts:buildEnglishExam('ielts',ieltsExamQuestion),
    kku_aelt:buildEnglishExam('kku_aelt',kkuAeltExamQuestion),
    conversations:buildEnglishExam('conversations',conversationExamQuestion),
    tenses:buildEnglishExam('tenses',tenseExamQuestion)
  };
  const math = {
    p3:completeMathBank('p3',p3),
    p4:completeMathBank('p4',p4),
    p5:completeMathBank('p5',p5),
    p6:completeMathBank('p6',p6),
    m1:completeMathBank('m1',m1),
    m2:completeMathBank('m2',m2),
    m3:completeMathBank('m3',m3)
  };

  window.AR_QUIZ_BANK = {
    english,
    math,
    labels:{english:englishLabels,math:{p3:'ป.3',p4:'ป.4',p5:'ป.5',p6:'ป.6',m1:'ม.1',m2:'ม.2',m3:'ม.3'}},
    meta:{englishCount:Object.values(english).reduce((sum,items)=>sum+items.length,0),englishPerSet:500,englishSetCount:Object.keys(english).length,englishQuestionLanguage:'en',englishExamStyle:true,mathCount:Object.values(math).reduce((sum,items)=>sum+items.length,0),mathPerGrade:500,mathWordProblemsPerGrade:250,official:false,version:'2026-09'}
  };
})();
