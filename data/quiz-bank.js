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
    let filler = 1;
    while(options.length < 4){
      const fallback = `${correct} (${++filler})`;
      if(!options.includes(fallback)) options.push(fallback);
    }
    const choices = seededShuffle(options.slice(0,4),id);
    return {id,subject,level,category,question:prompt,choices,answer:choices.indexOf(String(correct)),explanation,track};
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
    foundation:'Foundation · ป.3–ป.4',
    primary:'Primary Plus · ป.5–ป.6',
    junior:'Junior · ม.1–ม.3',
    competitive:'Competitive · สอบแข่งขัน'
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
    if(type===6){const hour=1+k%10,mins=(k%4)*15,add=15+15*(k%3),total=hour*60+mins+add;const answer=`${Math.floor(total/60)}:${String(total%60).padStart(2,'0')} น.`;return question(id,'math','p3','เวลา',`เริ่มอ่านหนังสือเวลา ${hour}:${String(mins).padStart(2,'0')} น. อ่าน ${add} นาที จะเสร็จเวลาใด`,answer,[`${hour}:${String((mins+add)%60).padStart(2,'0')} น.`,`${Math.floor(total/60)+1}:${String(total%60).padStart(2,'0')} น.`,`${hour}:00 น.`],`บวกเวลา ${add} นาที ได้ ${answer}`,track)}
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
    if(type===0){const d=4+k%9,a=1+k%(d-1),b=1+(k*2)%(d-1),sum=a+b;return question(id,'math','p5','เศษส่วน',`${a}/${d} + ${b}/${d} = ?`,`${sum}/${d}`,[`${sum}/${d*2}`,`${a+b+1}/${d}`,`${a*b}/${d}`],`ส่วนเท่ากัน บวกเฉพาะตัวเศษ: ${sum}/${d}`,track)}
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
    if(type===0){const a=1+k%5,b=2+k%7,c=1+(k*2)%4,d=3+(k*3)%8,den=b*d,num=a*d+c*b;return question(id,'math','p6','เศษส่วนต่างส่วน',`${a}/${b} + ${c}/${d} = ?`,`${num}/${den}`,[`${a+c}/${b+d}`,`${num+1}/${den}`,`${a*c}/${b*d}`],`ทำส่วนให้เท่ากัน ได้ (${a}×${d}+${c}×${b})/${den} = ${num}/${den}`,track)}
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
    if(type===6){const x=-5+k%11,y=-4+(k*3)%9;return question(id,'math','m1','พิกัด',`จุด (${x}, ${y}) มีพิกัด x เท่าไร`,x,[y,-x,-y],`พิกัดตัวหน้าเป็นค่า x จึงเท่ากับ ${x}`,track)}
    if(type===7){const angle=30+(k%6)*10,ans=180-angle;return numericQuestion(id,'m1','มุม',`มุมสองมุมบนเส้นตรง มุมหนึ่ง ${angle}° อีกมุมกี่องศา`,ans,[90-angle,180+angle,angle],`มุมบนเส้นตรงรวม 180° จึงได้ ${ans}°`,track)}
    if(type===8){const a=10+k%20,b=a+3,c=a+6,d=a+9,ans=(a+b+c+d)/4;return numericQuestion(id,'m1','สถิติ',`ค่าเฉลี่ยของ ${a}, ${b}, ${c}, ${d} คือเท่าไร`,ans,[ans+1.5,ans-1.5,a+b+c+d],`ผลรวมหารจำนวนข้อมูล: ${(a+b+c+d)}/4 = ${ans}`,track)}
    const red=2+k%6,blue=3+(k*2)%7,total=red+blue;return question(id,'math','m1','ความน่าจะเป็น',`ถุงมีลูกบอลแดง ${red} ลูก น้ำเงิน ${blue} ลูก หยิบ 1 ลูก ความน่าจะเป็นที่จะได้สีแดงคือเท่าไร`,`${red}/${total}`,[`${blue}/${total}`,`1/${total}`,`${red}/${blue}`],`กรณีที่ต้องการ ${red} จากทั้งหมด ${total} จึงเป็น ${red}/${total}`,track);
  }

  function m2(index){
    const k=Math.floor(index/10),type=index%10,id=`math-m2-${index+1}`,track=mathTrack(index);
    if(type===0){const triple=[[3,4,5],[5,12,13],[6,8,10],[8,15,17],[9,12,15]][k%5];return numericQuestion(id,'m2','พีทาโกรัส',`สามเหลี่ยมมุมฉากมีด้านประกอบมุมฉาก ${triple[0]} และ ${triple[1]} หน่วย ด้านตรงข้ามมุมฉากยาวเท่าไร`,triple[2],[triple[0]+triple[1],triple[2]-1,triple[2]+1],`√(${triple[0]}²+${triple[1]}²) = ${triple[2]}`,track)}
    if(type===1){const root=2+k%18,n=root*root;return numericQuestion(id,'m2','รากที่สอง',`√${n} = ?`,root,[root+1,root-1,n/2],`${root}² = ${n}`,track)}
    if(type===2){const x=2+k%9,y=3+(k*2)%10,sum=x+y,diff=x-y;return numericQuestion(id,'m2','ระบบสมการ',`x + y = ${sum} และ x − y = ${diff} แล้ว x เท่ากับเท่าไร`,x,[y,sum,diff],`บวกสองสมการได้ 2x = ${2*x} ดังนั้น x = ${x}`,track)}
    if(type===3){const a=2+k%7,b=3+(k*2)%8;return question(id,'math','m2','พหุนาม',`กระจาย (${a}x + ${b})(x + 1) ได้ข้อใด`,`${a}x² + ${a+b}x + ${b}`,[`${a}x² + ${b}x + 1`,`${a}x² + ${a}x + ${b}`,`${a+b}x² + ${b}`],`คูณแจกแจงทุกพจน์แล้วรวมพจน์กลาง`,track)}
    if(type===4){const r=7*(1+k%3),h=2+k%8,ans=22/7*r*r*h;return numericQuestion(id,'m2','ทรงกระบอก',`ทรงกระบอกรัศมี ${r} ซม. สูง ${h} ซม. มีปริมาตรกี่ลบ.ซม. (π=22/7)`,ans,[2*22/7*r*h,22/7*r*r,ans+h],`V = πr²h = ${ans}`,track)}
    if(type===5){const x1=1+k%7,y1=2+(k*2)%8,x2=x1+4,y2=y1+8,ans=(y2-y1)/(x2-x1);return numericQuestion(id,'m2','ความชัน',`เส้นตรงผ่าน (${x1},${y1}) และ (${x2},${y2}) มีความชันเท่าไร`,ans,[1/ans,ans+1,y2-y1],`m = (${y2}−${y1})/(${x2}−${x1}) = ${ans}`,track)}
    if(type===6){const a=1+k%5,b=2+(k*2)%6,total=a+b;return question(id,'math','m2','ความน่าจะเป็น',`กล่องมีบัตรเลขคู่ ${a} ใบ และเลขคี่ ${b} ใบ สุ่ม 1 ใบ โอกาสได้เลขคู่คือ`,`${a}/${total}`,[`${b}/${total}`,`1/${total}`,`${a}/${b}`],`กรณีเลขคู่ ${a} จากทั้งหมด ${total}`,track)}
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
    if(type===5){const red=2+k%5,blue=3+(k*2)%6,total=red+blue;return question(id,'math','m3','ความน่าจะเป็น',`ถุงมีแดง ${red} ลูก น้ำเงิน ${blue} ลูก หยิบ 2 ลูกโดยไม่คืน ความน่าจะเป็นที่ได้แดงทั้งคู่คือ`,`${red}/${total} × ${red-1}/${total-1}`,[`${red}/${total} × ${red}/${total}`,`${blue}/${total} × ${red}/${total}`,`2/${total}`],`ครั้งแรก ${red}/${total} และครั้งที่สองเหลือแดง ${red-1} จาก ${total-1}`,track)}
    if(type===6){const values=[4+k%8,8+k%8,12+k%8,16+k%8,20+k%8].sort((a,b)=>a-b);return numericQuestion(id,'m3','สถิติ',`มัธยฐานของ ${values.join(', ')} คือเท่าไร`,values[2],[values[1],values[3],values.reduce((a,b)=>a+b,0)/5],`ข้อมูล 5 ค่าเรียงแล้ว ค่ากลางคือ ${values[2]}`,track)}
    if(type===7){const a=2+k%5,m=2+k%4,n=1+(k*2)%4,ans=a**(m+n);return numericQuestion(id,'m3','เลขยกกำลัง',`${a}^${m} × ${a}^${n} = ?`,ans,[a**(m*n),a**(m-n),ans+a],`ฐานเดียวกันคูณกัน บวกเลขชี้กำลัง: ${a}^${m+n} = ${ans}`,track)}
    if(type===8){const first=2+k%9,diff=3+(k*2)%8,n=15,ans=first+(n-1)*diff;return numericQuestion(id,'m3','ลำดับเลขคณิต',`ลำดับเลขคณิตมี a₁=${first}, d=${diff} แล้ว a₁₅ เท่ากับเท่าไร`,ans,[first+n*diff,ans-diff,ans+diff],`a₁₅ = ${first} + 14(${diff}) = ${ans}`,track)}
    const chickens=10+k%20,rabbits=4+(k*3)%12,heads=chickens+rabbits,legs=2*chickens+4*rabbits;return numericQuestion(id,'m3','โจทย์เชาวน์แข่งขัน',`ในคอกมีไก่และกระต่ายรวม ${heads} ตัว นับขาได้ ${legs} ขา มีกระต่ายกี่ตัว`,rabbits,[chickens,heads-rabbits+2,rabbits+2],`ให้ r เป็นกระต่าย: 2(${heads}−r)+4r=${legs} จึงได้ r=${rabbits}`,track);
  }

  const english = {
    foundation:Array.from({length:60},(_,index)=>foundationQuestion(index)),
    primary:Array.from({length:60},(_,index)=>primaryQuestion(index)),
    junior:Array.from({length:60},(_,index)=>juniorQuestion(index)),
    competitive:Array.from({length:60},(_,index)=>competitiveQuestion(index))
  };
  const math = {
    p3:Array.from({length:500},(_,index)=>p3(index)),
    p4:Array.from({length:500},(_,index)=>p4(index)),
    p5:Array.from({length:500},(_,index)=>p5(index)),
    p6:Array.from({length:500},(_,index)=>p6(index)),
    m1:Array.from({length:500},(_,index)=>m1(index)),
    m2:Array.from({length:500},(_,index)=>m2(index)),
    m3:Array.from({length:500},(_,index)=>m3(index))
  };

  window.AR_QUIZ_BANK = {
    english,
    math,
    labels:{english:englishLabels,math:{p3:'ป.3',p4:'ป.4',p5:'ป.5',p6:'ป.6',m1:'ม.1',m2:'ม.2',m3:'ม.3'}},
    meta:{englishCount:Object.values(english).reduce((sum,items)=>sum+items.length,0),mathCount:Object.values(math).reduce((sum,items)=>sum+items.length,0),mathPerGrade:500,official:false,version:'2026-09'}
  };
})();
