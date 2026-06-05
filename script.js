'use strict';
const W=100,H=100,TILE_BASE=8,CHUNK_SIZE=10,CHUNKS_X=W/CHUNK_SIZE,CHUNKS_Y=H/CHUNK_SIZE,MAX_ENTITIES=500,PH_MAX=80;
const SEASONS=['spring','summer','autumn','winter'];
const SEASON_NAMES={spring:'Spring',summer:'Summer',autumn:'Autumn',winter:'Winter'};
const SEASON_TEMP={spring:0,summer:6,autumn:-1.5,winter:-8};
const BIOMES={
plain:{col:'#3d6e3d',fert:1.0,water:40,maxP:96,temp:22,humid:.45},
forest:{col:'#1a4a1a',fert:1.2,water:55,maxP:128,temp:19,humid:.65},
desert:{col:'#c8a045',fert:.35,water:12,maxP:32,temp:31,humid:.18},
wetland:{col:'#1a5a7a',fert:1.1,water:75,maxP:112,temp:24,humid:.75},
tundra:{col:'#7aa0c0',fert:.45,water:20,maxP:40,temp:-4,humid:.40},
mountain:{col:'#6a6060',fert:.3,water:15,maxP:24,temp:8,humid:.25},
river:{col:'#2060a0',fert:.9,water:90,maxP:72,temp:20,humid:.70},
lava:{col:'#c83010',fert:.05,water:2,maxP:4,temp:60,humid:.05},
ice:{col:'#c0e0f8',fert:.2,water:30,maxP:16,temp:-12,humid:.35}
};
const BIOME_VARS={
plain:['#3d6e3d','#395f39','#427646','#3a6040'],
forest:['#1a4a1a','#173e17','#1d521d','#163b16'],
desert:['#c8a045','#c49a3a','#ccaa4e','#be9535'],
wetland:['#1a5a7a','#175070','#1d6282','#155268'],
tundra:['#7aa0c0','#7498b8','#7ea8ca','#7292b2'],
mountain:['#6a6060','#615858','#706868','#5d5454'],
river:['#2060a0','#1c5898','#2266a8','#185490'],
lava:['#c83010','#d04020','#b82a08','#e04018'],
ice:['#c0e0f8','#b0d4f0','#cce8fc','#a8ccec']
};
const LOCI=['speed','resilience','fertility','camouflage','metabolism','acuity'];
const TRAIT_RULES={
speed:{dom:'swift',rec:'steady',speedΔ:.15,resΔ:0,fertΔ:0,metaΔ:0,sensΔ:0},
resilience:{dom:'hardy',rec:'fragile',speedΔ:0,resΔ:.20,fertΔ:0,metaΔ:-.01,sensΔ:0},
fertility:{dom:'fecund',rec:'sparse',speedΔ:0,resΔ:0,fertΔ:.15,metaΔ:0,sensΔ:0},
camouflage:{dom:'concealed',rec:'visible',speedΔ:0,resΔ:.05,fertΔ:0,metaΔ:0,sensΔ:0},
metabolism:{dom:'efficient',rec:'wasteful',speedΔ:0,resΔ:0,fertΔ:0,metaΔ:-.02,sensΔ:0},
acuity:{dom:'keen',rec:'dull',speedΔ:0,resΔ:0,fertΔ:0,metaΔ:0,sensΔ:.20}
};
const BELIEFS={
sun_worship:{id:'sun_worship',name:'Solar',emoji:'☀',peaceBon:.2,coopBon:.3,fertMod:.1,mortComf:.15,col:'#e8c030'},
ancestor:{id:'ancestor',name:'Ancestors',emoji:'👻',peaceBon:.35,coopBon:.4,fertMod:.05,mortComf:.4,col:'#8888cc'},
nature_harmony:{id:'nature_harmony',name:'Nature',emoji:'🌿',peaceBon:.5,coopBon:.25,fertMod:-.05,mortComf:.25,col:'#40c040'},
predator_cult:{id:'predator_cult',name:'Hunt',emoji:'⚔',peaceBon:-.2,coopBon:.1,fertMod:.15,mortComf:.05,col:'#e04040'}
};
const BELIEF_IDS=Object.keys(BELIEFS);
const SPECIES={
human:{id:'human',name:'Human',diet:'omni',emoji:'🧑',baseColor:'#f5d0a0',metab:.05,maxAge:6000,mature:36,gestT:9,litMin:1,litMax:2,repE:.7,repH:.7,repHng:.4,repThs:.4,predPow:.5,grazR:2,waterN:.05,sens:3,move:1,mass:25,tempMin:5,tempMax:30,canTool:true,bipedal:true,tamable:false},
elf:{id:'elf',name:'Elf',diet:'herb',emoji:'🧝',baseColor:'#c0e0c0',metab:.04,maxAge:8000,mature:48,gestT:12,litMin:1,litMax:1,repE:.7,repH:.7,repHng:.3,repThs:.3,predPow:.1,grazR:3,waterN:.04,sens:4,move:1,mass:20,tempMin:2,tempMax:28,canTool:true,bipedal:true,tamable:false},
orc:{id:'orc',name:'Orc',diet:'carn',emoji:'👹',baseColor:'#a06040',metab:.06,maxAge:4000,mature:30,gestT:8,litMin:1,litMax:3,repE:.7,repH:.7,repHng:.5,repThs:.5,predPow:.9,grazR:0,waterN:.07,sens:2,move:1,mass:28,tempMin:0,tempMax:35,canTool:true,bipedal:true,tamable:false},
dwarf:{id:'dwarf',name:'Dwarf',diet:'omni',emoji:'🧔',baseColor:'#e0b080',metab:.05,maxAge:7000,mature:40,gestT:10,litMin:1,litMax:2,repE:.7,repH:.7,repHng:.35,repThs:.35,predPow:.6,grazR:1,waterN:.05,sens:2,move:1,mass:20,tempMin:-5,tempMax:25,canTool:true,bipedal:true,tamable:false},
cat:{id:'cat',name:'Cat',diet:'carn',emoji:'🐈',baseColor:'#f0a050',metab:.03,maxAge:5000,mature:24,gestT:5,litMin:2,litMax:4,repE:.6,repH:.6,repHng:.3,repThs:.3,predPow:.3,grazR:0,waterN:.04,sens:3,move:1,mass:8,tempMin:5,tempMax:32,tamable:true,tameDifficulty:0.4},
chicken:{id:'chicken',name:'Chicken',diet:'herb',emoji:'🐔',baseColor:'#e0d0a0',metab:.02,maxAge:2000,mature:12,gestT:3,litMin:3,litMax:6,repE:.5,repH:.5,repHng:.2,repThs:.2,predPow:0,grazR:4,waterN:.03,sens:1,move:1,mass:5,tempMin:8,tempMax:30,tamable:true,tameDifficulty:0.2},
sheep:{id:'sheep',name:'Sheep',diet:'herb',emoji:'🐑',baseColor:'#e0e0e0',metab:.03,maxAge:4000,mature:20,gestT:5,litMin:1,litMax:2,repE:.6,repH:.6,repHng:.25,repThs:.25,predPow:0,grazR:5,waterN:.04,sens:1,move:1,mass:12,tempMin:-2,tempMax:28,tamable:true,tameDifficulty:0.3},
dog:{id:'dog',name:'Dog',diet:'carn',emoji:'🐕',baseColor:'#b08050',metab:.04,maxAge:5000,mature:24,gestT:5,litMin:2,litMax:4,repE:.6,repH:.6,repHng:.3,repThs:.3,predPow:.5,grazR:0,waterN:.05,sens:4,move:1,mass:15,tempMin:-5,tempMax:30,tamable:true,tameDifficulty:0.35},
wolf:{id:'wolf',name:'Wolf',diet:'carn',emoji:'🐺',baseColor:'#808080',metab:.05,maxAge:6000,mature:30,gestT:6,litMin:2,litMax:5,repE:.6,repH:.6,repHng:.4,repThs:.4,predPow:.8,grazR:0,waterN:.06,sens:4,move:1,mass:20,tempMin:-10,tempMax:25,tamable:true,tameDifficulty:0.7},
fox:{id:'fox',name:'Fox',diet:'carn',emoji:'🦊',baseColor:'#e08040',metab:.04,maxAge:4000,mature:20,gestT:5,litMin:2,litMax:4,repE:.6,repH:.6,repHng:.3,repThs:.3,predPow:.6,grazR:0,waterN:.05,sens:3,move:1,mass:10,tempMin:-5,tempMax:28,tamable:true,tameDifficulty:0.5},
cow:{id:'cow',name:'Cow',diet:'herb',emoji:'🐄',baseColor:'#e0c0a0',metab:.04,maxAge:6000,mature:30,gestT:9,litMin:1,litMax:1,repE:.6,repH:.6,repHng:.2,repThs:.2,predPow:0,grazR:6,waterN:.06,sens:1,move:1,mass:30,tempMin:0,tempMax:30,tamable:true,tameDifficulty:0.25},
buffalo:{id:'buffalo',name:'Buffalo',diet:'herb',emoji:'🐃',baseColor:'#806040',metab:.05,maxAge:7000,mature:36,gestT:10,litMin:1,litMax:1,repE:.6,repH:.6,repHng:.2,repThs:.2,predPow:0,grazR:7,waterN:.07,sens:1,move:1,mass:40,tempMin:-5,tempMax:30,tamable:true,tameDifficulty:0.3},
pig:{id:'pig',name:'Pig',diet:'omni',emoji:'🐖',baseColor:'#f0a0a0',metab:.04,maxAge:5000,mature:24,gestT:6,litMin:2,litMax:5,repE:.6,repH:.6,repHng:.3,repThs:.3,predPow:.1,grazR:2,waterN:.05,sens:1,move:1,mass:18,tempMin:5,tempMax:30,tamable:true,tameDifficulty:0.2},
frog:{id:'frog',name:'Frog',diet:'omni',emoji:'🐸',baseColor:'#60b030',metab:.02,maxAge:1000,mature:8,gestT:2,litMin:5,litMax:15,repE:.4,repH:.4,repHng:.1,repThs:.1,predPow:.1,grazR:1,waterN:.08,sens:1,move:1,mass:1,tempMin:10,tempMax:32,aquatic:true,tamable:false},
fish:{id:'fish',name:'Fish',diet:'omni',emoji:'🐟',baseColor:'#4080c0',metab:.02,maxAge:2000,mature:10,gestT:2,litMin:5,litMax:10,repE:.4,repH:.4,repHng:.1,repThs:.1,predPow:.1,grazR:1,waterN:.9,sens:1,move:1,mass:2,tempMin:5,tempMax:28,aquatic:true,tamable:false},
cobra:{id:'cobra',name:'Cobra',diet:'carn',emoji:'🐍',baseColor:'#6b4c3b',metab:.04,maxAge:4000,mature:30,gestT:6,litMin:5,litMax:12,repE:.5,repH:.5,repHng:.3,repThs:.3,predPow:.6,grazR:0,waterN:.05,sens:2,move:1,mass:5,tempMin:15,tempMax:35,venomous:true,tamable:false},
python:{id:'python',name:'Python',diet:'carn',emoji:'🐍',baseColor:'#4b6b3b',metab:.03,maxAge:5000,mature:36,gestT:8,litMin:3,litMax:8,repE:.5,repH:.5,repHng:.3,repThs:.3,predPow:.7,grazR:0,waterN:.06,sens:1,move:1,mass:12,tempMin:18,tempMax:32,venomous:false,constrict:true,tamable:false},
bee:{id:'bee',name:'Bee',diet:'herb',emoji:'🐝',baseColor:'#f0c040',metab:.01,maxAge:500,mature:5,gestT:1,litMin:1,litMax:3,repE:.3,repH:.3,repHng:.1,repThs:.1,predPow:0,grazR:.5,waterN:.02,sens:2,move:1,mass:1,tempMin:15,tempMax:35,flying:true,insect:true,tamable:false},
butterfly:{id:'butterfly',name:'Butterfly',diet:'herb',emoji:'🦋',baseColor:'#e0a0f0',metab:.01,maxAge:300,mature:4,gestT:1,litMin:2,litMax:4,repE:.3,repH:.3,repHng:.1,repThs:.1,predPow:0,grazR:.2,waterN:.01,sens:2,move:1,mass:.5,tempMin:18,tempMax:35,flying:true,insect:true,tamable:false},
worm:{id:'worm',name:'Worm',diet:'herb',emoji:'🪱',baseColor:'#c080a0',metab:.01,maxAge:800,mature:6,gestT:2,litMin:1,litMax:5,repE:.3,repH:.3,repHng:.1,repThs:.1,predPow:0,grazR:.1,waterN:.02,sens:0,move:1,mass:.5,tempMin:5,tempMax:25,underground:true,insect:true,tamable:false}
};
const GOV_TYPES={
tribe:{name:'Tribe',symbol:'🏕',warBias:.3,taxRate:.1,techRate:.02},
kingdom:{name:'Kingdom',symbol:'👑',warBias:.2,taxRate:.2,techRate:.05},
republic:{name:'Republic',symbol:'🏛',warBias:.1,taxRate:.25,techRate:.08},
theocracy:{name:'Theocracy',symbol:'⛪',warBias:.15,taxRate:.15,techRate:.04},
federation:{name:'Federation',symbol:'🌐',warBias:.05,taxRate:.3,techRate:.10}
};
const DIP_STATES={neutral:'neutral',war:'war',alliance:'alliance',trade:'trade',vassal:'vassal'};
const POL_RANKS=['Commoner','Elder','Warrior','Shaman','Noble','General','High Priest','Minister','King/Queen','Emperor'];
const RES_TYPES={
oak:{id:'oak',name:'Oak Tree',emoji:'🌳',wood:40,stone:0,food:0,gold:0,silver:0,diamond:0,iron:0,max:40,regen:.005,biomes:['plain','forest'],col:'#2a6e1a',col2:'#1a4e0a',trunkCol:'#6b3e1a'},
pine:{id:'pine',name:'Pine Tree',emoji:'🌲',wood:35,stone:0,food:0,gold:0,silver:0,diamond:0,iron:0,max:35,regen:.004,biomes:['tundra','mountain','forest'],col:'#1a5a2a',col2:'#0d3a18',trunkCol:'#5a3010'},
palm:{id:'palm',name:'Palm Tree',emoji:'🌴',wood:25,stone:0,food:8,gold:0,silver:0,diamond:0,iron:0,max:25,regen:.006,biomes:['desert','wetland'],col:'#3a8a1a',col2:'#2a6e10',trunkCol:'#9a7a30'},
dead:{id:'dead',name:'Dead Tree',emoji:'🪵',wood:15,stone:0,food:0,gold:0,silver:0,diamond:0,iron:0,max:15,regen:.001,biomes:['desert','lava'],col:'#5a4030',col2:'#3a2818',trunkCol:'#4a3020'},
cherry:{id:'cherry',name:'Cherry Tree',emoji:'🌸',wood:30,stone:0,food:12,gold:0,silver:0,diamond:0,iron:0,max:30,regen:.006,biomes:['plain','wetland'],col:'#e878a8',col2:'#c85888',trunkCol:'#7a4020'},
rock:{id:'rock',name:'Rock',emoji:'🪨',wood:0,stone:30,food:0,gold:0,silver:0,diamond:0,iron:5,max:30,regen:.002,biomes:['mountain','plain','tundra'],col:'#7a7a7a',col2:'#5a5a5a',trunkCol:'#7a7a7a'},
boulder:{id:'boulder',name:'Boulder',emoji:'⛰',wood:0,stone:60,food:0,gold:0,silver:0,diamond:0,iron:10,max:60,regen:.001,biomes:['mountain'],col:'#6a6060',col2:'#4a4040',trunkCol:'#6a6060'},
berry:{id:'berry',name:'Berry Bush',emoji:'🫐',wood:5,stone:0,food:20,gold:0,silver:0,diamond:0,iron:0,max:20,regen:.012,biomes:['plain','forest','wetland'],col:'#5090c0',col2:'#3870a0',trunkCol:'#3a6030'},
gold_vein:{id:'gold_vein',name:'Gold Vein',emoji:'✨',wood:0,stone:5,food:0,gold:15,silver:5,diamond:0,iron:0,max:20,regen:.001,biomes:['mountain','desert'],col:'#ffd700',col2:'#daa520',trunkCol:'#b8860b'},
silver_vein:{id:'silver_vein',name:'Silver Vein',emoji:'🥈',wood:0,stone:5,food:0,gold:0,silver:20,diamond:0,iron:0,max:20,regen:.001,biomes:['tundra','mountain'],col:'#c0c0c0',col2:'#a0a0a0',trunkCol:'#808080'},
diamond_vein:{id:'diamond_vein',name:'Diamond Vein',emoji:'💎',wood:0,stone:10,food:0,gold:0,silver:0,diamond:5,iron:0,max:10,regen:.0005,biomes:['mountain','lava'],col:'#b0e0ff',col2:'#80c0e0',trunkCol:'#6090a0'},
iron_vein:{id:'iron_vein',name:'Iron Vein',emoji:'⚙️',wood:0,stone:10,food:0,gold:0,silver:0,diamond:0,iron:30,max:40,regen:.002,biomes:['mountain','plain'],col:'#a08060',col2:'#806040',trunkCol:'#604020'}
};
const FOOD_TYPES={
bread:{name:'Bread',emoji:'🍞',baseVal:15},
tea:{name:'Tea',emoji:'🍵',baseVal:5},
wheat:{name:'Wheat',emoji:'🌾',baseVal:10},
barley:{name:'Barley',emoji:'🌾',baseVal:10},
berry:{name:'Berry',emoji:'🫐',baseVal:8},
apple:{name:'Apple',emoji:'🍎',baseVal:12},
banana:{name:'Banana',emoji:'🍌',baseVal:10},
melon:{name:'Melon',emoji:'🍈',baseVal:18},
corn:{name:'Corn',emoji:'🌽',baseVal:14},
beef:{name:'Beef',emoji:'🥩',baseVal:25},
pork:{name:'Pork',emoji:'🥓',baseVal:22},
juice:{name:'Juice',emoji:'🧃',baseVal:8},
vegetable:{name:'Vegetable',emoji:'🥕',baseVal:7}
};
const ERA_THRESHOLDS={medieval:0,renaissance:2000,industrial:5000,modern:9000};
const FIRST_NAMES=['Aldric','Bryn','Cedric','Dalia','Eldrin','Fiona','Gareth','Helga','Ivor','Juna','Kael','Lina','Magnus','Nyssa','Orin','Petra','Quinn','Rowan','Sari','Toren'];
const LAST_NAMES=['Stoneforge','Riverwood','Ironhand','Swiftarrow','Deepdelver','Lightfoot','Goldweaver','Thornfield','Starhollow','Windwalker'];
const TRIBE_COLORS=['#e85050','#50a0e8','#50e870','#e8b830','#c050e0','#50d8d8','#e87830','#a0a0f8','#f06090','#60b860'];
const FACTION_ROOF_COLS=['#4a80cc','#cc4a4a','#4acc4a','#cc8a2a','#8a4acc','#4accc0','#cc4a90','#c0c020'];
const WORLD_PRESETS={
WORLD_MIX_V1:{map:['wwwwgggdddgggwww','wgggvvvgggggddww','gvvvtttpppggdwww','gggbbbrrrgggddww','wwgggggggggddddw'],mapping:{w:'wetland',g:'plain',d:'desert',v:'forest',t:'tundra',p:'plain',b:'forest',r:'river'},surround:'plain'},
DESERT_OASIS_V1:{map:['ddddddddd','dddlllddd','ddllllldd','dddlllddd','ddddddddd'],mapping:{d:'desert',l:'wetland'},surround:'desert'},
DARK_SWAMP_V1:{map:['ggggggggg','gttttttgg','gttttttgg','ghhggghhg','ggggggggg'],mapping:{g:'wetland',t:'forest',h:'plain'},surround:'forest'},
SNOW_VILLAGE_V1:{map:['******tt*****','**hhh**tt*****','******tt*****','**hhh****tt***','***********tt'],mapping:{'*':'ice',t:'tundra',h:'plain'},surround:'ice'},
COASTAL_VILLAGE_V1:{map:['~~##~~##~~','~#hh##hh#~','~~##~~##~~','~~~#~#~~~~'],mapping:{'~':'river','#':'desert',h:'plain'},surround:'river'}
};
let _seed=42;
function setSeed(s){_seed=Math.abs(s)%2147483647||1234567;}
function rng(){_seed=(_seed*16807)%2147483647;return(_seed-1)/2147483646;}
function rngI(a,b){return Math.floor(rng()*(b-a+1))+a;}
function rngChoice(arr){return arr[Math.floor(rng()*arr.length)];}
function seedFromString(str){let h=5381;for(let i=0;i<str.length;i++)h=((h*33)^str.charCodeAt(i))>>>0;return h||12345;}
function isDom(a){return a&&a[0]===a[0].toUpperCase()&&a[0]!==a[0].toLowerCase();}
function flipAllele(a){if(!a)return a;let c=a[0];return(isDom(a)?c.toLowerCase():c.toUpperCase())+a.slice(1);}
function mkGenome(mutRate=.02,founderTags=[]){const loci={};for(const l of LOCI){const fc=l[0];loci[l]={first:rng()>.5?fc.toUpperCase():fc,second:rng()>.5?fc.toUpperCase():fc};}return{loci,mutRate,founderTags:[...founderTags],mutHistory:[],fitness:calcFitness(loci),heterozygosity:calcHet(loci)};}
function calcFitness(loci){let dom=0,total=0;for(const l in loci){if(isDom(loci[l].first)||isDom(loci[l].second))dom++;total++;}return total>0?Math.min(1,0.35+dom/total*0.5):0.5;}
function calcHet(loci){let sum=0,n=0;for(const l in loci){sum+=(loci[l].first!==loci[l].second)?1:0;n++;}return n>0?sum/n:0;}
function crossover(ga,gb,kinshipCoeff=0,tick=0){let mutRate=Math.max(ga.mutRate,gb.mutRate);if(kinshipCoeff>.125)mutRate=Math.min(.3,mutRate+kinshipCoeff*.05);const loci={};const hist=[];for(const l of LOCI){const pa=ga.loci[l]||{first:'x',second:'x'};const pb=gb.loci[l]||{first:'x',second:'x'};let a=rng()>.5?pa.first:pa.second;let b=rng()>.5?pb.first:pb.second;const oa=a,ob=b;if(rng()<mutRate){a=flipAllele(a);hist.push({locus:l,prev:{first:oa,second:b},cur:{first:a,second:b},reason:'random',tick,harmful:!isDom(a)&&isDom(oa)});}if(rng()<mutRate){b=flipAllele(b);hist.push({locus:l,prev:{first:a,second:ob},cur:{first:a,second:b},reason:'random',tick,harmful:!isDom(b)&&isDom(ob)});}loci[l]={first:a,second:b};}const common=ga.founderTags.filter(t=>gb.founderTags.includes(t));const founderTags=common.length>0?common:[...new Set([...ga.founderTags,...gb.founderTags])];const fit=Math.min(1,(ga.fitness+gb.fitness)*.5+calcHet(loci)*.05);return{loci,mutRate,founderTags,mutHistory:[...ga.mutHistory.slice(-20),...gb.mutHistory.slice(-20),...hist],fitness:fit,heterozygosity:calcHet(loci)};}
function expressGenome(g){const traits={};let speedB=0,resB=0,fertB=0,metaB=0,sensB=0;for(const l of LOCI){const p=g.loci[l];if(!p)continue;const rule=TRAIT_RULES[l];const dom=isDom(p.first)||isDom(p.second);traits[l]=dom?rule.dom:rule.rec;if(dom){speedB+=rule.speedΔ;resB+=rule.resΔ;fertB+=rule.fertΔ;metaB+=rule.metaΔ;sensB+=rule.sensΔ;}}return{traits,speedBonus:speedB,resBonus:resB,fertBonus:fertB,metaDelta:metaB,sensBonus:sensB,adaptScore:g.fitness};}
function applyMutation(genome,locus,reason,tick){if(!genome.loci[locus])return;const old=genome.loci[locus];const newP={first:flipAllele(old.first),second:flipAllele(old.second)};genome.mutHistory.push({locus,prev:old,cur:newP,reason,tick,harmful:!isDom(newP.first)&&isDom(old.first)});if(genome.mutHistory.length>40)genome.mutHistory=genome.mutHistory.slice(-40);genome.loci[locus]=newP;genome.fitness=calcFitness(genome.loci);genome.heterozygosity=calcHet(genome.loci);}
const lineageGraph={nodes:{},parents:{},children:{}};
function lgAddNode(id,familyId,lineageId,gen,parentIds,founderTags){lineageGraph.nodes[id]={id,familyId,lineageId,gen,parentIds:[...parentIds],founderTags:[...founderTags]};if(!lineageGraph.parents[id])lineageGraph.parents[id]=new Set();if(!lineageGraph.children[id])lineageGraph.children[id]=new Set();for(const pid of parentIds){if(!lineageGraph.children[pid])lineageGraph.children[pid]=new Set();lineageGraph.children[pid].add(id);lineageGraph.parents[id].add(pid);}}
function lgAncestors(id,maxDepth=8){const result={};const q=[[id,0]];while(q.length){const[cur,depth]=q.shift();if(depth>=maxDepth)continue;const pars=lineageGraph.parents[cur];if(!pars)continue;for(const p of pars){const d=depth+1;if(!(p in result)||d<result[p]){result[p]=d;q.push([p,d]);}}}return result;}
function kinshipCoefficient(a,b,maxDepth=8){if(a===b)return 1.0;const aAnc=lgAncestors(a,maxDepth);const bAnc=lgAncestors(b,maxDepth);let coeff=0;if(bAnc[a]!=null)coeff+=Math.pow(.5,bAnc[a]);if(aAnc[b]!=null)coeff+=Math.pow(.5,aAnc[b]);for(const anc in aAnc){if(bAnc[anc]!=null)coeff+=Math.pow(.5,aAnc[anc]+bAnc[anc]);}return Math.min(coeff,1.0);}
function preventInbreeding(a,b,threshold=.125){const k=kinshipCoefficient(a,b);return{allowed:k<threshold,kinship:k};}
function bloodlinePurity(id,tag,maxDepth=8){const node=lineageGraph.nodes[id];if(!node)return 0;const hasTag=n=>n&&n.founderTags&&n.founderTags.includes(tag);let weighted=hasTag(node)?1:0,total=1;const ancs=lgAncestors(id,maxDepth);for(const aid in ancs){const w=Math.pow(.5,ancs[aid]);total+=w;if(hasTag(lineageGraph.nodes[aid]))weighted+=w;}return total>0?weighted/total:0;}
let world=[],entities=[],nextId=1,tick=0,resObjects=[],nextResId=1;
let paused=false,speed=1,selectedTool='plain',viewMode='normal',isDrawing=false;
let events=[],popHistory={},totalMutations=0,inbreedingWarnings=0,worldSeedCode='';
let factions=[],nextFactionId=1,tribes=[],nextTribeId=1;
let fireTiles=new Set(),lavaTiles=new Set();
let cam={x:0,y:0,zoom:1,panActive:false,panStartX:0,panStartY:0,panCamX:0,panCamY:0};
const ZOOM_MIN=0.25,ZOOM_MAX=5;
function getEra(t){if(t>=ERA_THRESHOLDS.modern)return'modern';if(t>=ERA_THRESHOLDS.industrial)return'industrial';if(t>=ERA_THRESHOLDS.renaissance)return'renaissance';return'medieval';}
function generateName(){const first=rngChoice(FIRST_NAMES);const last=rngChoice(LAST_NAMES);return{first,last,full:first+' '+last};}
function generatePersonalInfo(speciesId){const sp=SPECIES[speciesId];const sex=rng()>.5?'female':'male';const name=generateName();let height=0;if(sp&&sp.bipedal){if(speciesId==='dwarf')height=rngI(120,150);else if(speciesId==='elf')height=rngI(165,190);else height=rngI(150,185);}const weight=Math.round((sp?sp.mass:10)*(0.8+rng()*0.4));return{name,sex,height,weight};}
function getTile(x,y){if(x<0||x>=W||y<0||y>=H)return null;return world[y*W+x];}
function markChunkDirty(cx,cy){if(cx>=0&&cx<CHUNKS_X&&cy>=0&&cy<CHUNKS_Y)chunkDirty[cy*CHUNKS_X+cx]=1;}
function markTileDirty(tx,ty){markChunkDirty(Math.floor(tx/CHUNK_SIZE),Math.floor(ty/CHUNK_SIZE));}
function markAllDirty(){chunkDirty.fill(1);}
let chunkDirty=new Uint8Array(CHUNKS_X*CHUNKS_Y).fill(1);
function initWorldFromPreset(presetName){const preset=WORLD_PRESETS[presetName];if(!preset)return false;world=[];fireTiles.clear();lavaTiles.clear();const mapRows=preset.map;const mapHeight=mapRows.length;const mapWidth=mapRows[0].length;const offsetX=Math.floor((W-mapWidth)/2);const offsetY=Math.floor((H-mapHeight)/2);for(let y=0;y<H;y++){for(let x=0;x<W;x++){const b=BIOMES[preset.surround]||BIOMES.plain;world.push({x,y,biome:preset.surround,plants:b.maxP*(0.4+rng()*0.6),maxP:b.maxP,water:b.water*(0.7+rng()*0.3),maxW:b.water*1.5,fert:b.fert,nutrients:b.fert*30,fireLevel:0,lavaLevel:0,occupants:new Set(),variation:rngI(0,3)});}}for(let py=0;py<mapHeight;py++){const row=mapRows[py];for(let px=0;px<row.length;px++){const ch=row[px];const biomeKey=preset.mapping[ch];if(!biomeKey)continue;const wx=offsetX+px;const wy=offsetY+py;if(wx<0||wx>=W||wy<0||wy>=H)continue;const tile=getTile(wx,wy);if(!tile)continue;const b=BIOMES[biomeKey];tile.biome=biomeKey;tile.maxP=b.maxP;tile.plants=b.maxP*(0.6+rng()*0.4);tile.maxW=b.water*1.5;tile.water=b.water*(0.8+rng()*0.2);tile.fert=b.fert;if(biomeKey==='lava'){lavaTiles.add(`${wx},${wy}`);tile.lavaLevel=1;}}}if(presetName==='COASTAL_VILLAGE_V1'){for(let y=0;y<H;y++){for(let x=0;x<W;x++){if(x<offsetX||x>=offsetX+mapWidth||y<offsetY||y>=offsetY+mapHeight){const tile=getTile(x,y);if(tile)tile.biome='river';}}}}resObjects=[];nextResId=1;for(let y=0;y<H;y++){for(let x=0;x<W;x++){const tile=getTile(x,y);if(tile&&tile.biome!=='river'&&tile.biome!=='lava'){const res=spawnResObject(tile.biome,x,y);if(res)resObjects.push(res);}}}markAllDirty();minimapDirty=true;return true;}
function initWorld(){world=[];fireTiles.clear();lavaTiles.clear();const noise=(x,y)=>{const nx=x/W,ny=y/H;return Math.sin(nx*9.1+ny*6.3)*.4+Math.sin(nx*4.2-ny*11.7)*.3+Math.cos(nx*17+ny*8.1)*.15+Math.sin(nx*2.7+ny*3.4)*.15;};const moisture=(x,y)=>{const nx=x/W,ny=y/H;return Math.cos(nx*5.3+ny*7.8)*.5+Math.sin(nx*11-ny*4.2)*.5;};for(let y=0;y<H;y++){for(let x=0;x<W;x++){let biome='plain';const n=noise(x+_seed%100,y+(_seed>>8)%100);const m=moisture(x,y);if(n>.55)biome='mountain';else if(n>.35)biome='forest';else if(n>.1)biome='plain';else if(m>.35)biome='wetland';else if(m<-.4)biome='desert';else if(n<-.4)biome='tundra';else biome='plain';const isRiverX=(x===Math.floor(W*.22)||x===Math.floor(W*.52)||x===Math.floor(W*.78));const isRiverY=(y>H*.1&&y<H*.9);if(isRiverX&&isRiverY&&biome!=='mountain')biome='river';const fx=x/W,fy=y/H;if(fx>.72&&fx<.82&&fy>.1&&fy<.85)biome='mountain';const b=BIOMES[biome];world.push({x,y,biome,plants:b.maxP*(.4+rng()*.6),maxP:b.maxP,water:b.water*(.7+rng()*.3),maxW:b.water*1.5,fert:b.fert,nutrients:b.fert*30,fireLevel:0,lavaLevel:0,occupants:new Set(),variation:rngI(0,3)});}}chunkDirty.fill(1);}
function spawnResObject(biome,x,y){const weightMap={plain:[{t:'oak',w:30},{t:'berry',w:20},{t:'rock',w:10},{t:'cherry',w:15},{t:'iron_vein',w:5}],forest:[{t:'oak',w:40},{t:'pine',w:20},{t:'berry',w:25},{t:'cherry',w:10}],desert:[{t:'palm',w:35},{t:'dead',w:30},{t:'rock',w:20},{t:'boulder',w:10},{t:'gold_vein',w:5}],wetland:[{t:'palm',w:25},{t:'berry',w:30},{t:'cherry',w:20},{t:'oak',w:15}],tundra:[{t:'pine',w:40},{t:'rock',w:25},{t:'boulder',w:15},{t:'silver_vein',w:5}],mountain:[{t:'boulder',w:30},{t:'rock',w:30},{t:'pine',w:15},{t:'diamond_vein',w:3},{t:'gold_vein',w:5},{t:'iron_vein',w:10}],river:[{t:'cherry',w:25},{t:'berry',w:30},{t:'oak',w:20}],lava:[{t:'dead',w:40},{t:'rock',w:30},{t:'boulder',w:15},{t:'diamond_vein',w:5}],ice:[{t:'pine',w:35},{t:'rock',w:25},{t:'boulder',w:20},{t:'silver_vein',w:5}]};const weights=weightMap[biome];if(!weights||rng()>.62)return null;const total=weights.reduce((s,w)=>s+w.w,0);let r=rng()*total;let typeId=weights[0].t;for(const w of weights){r-=w.w;if(r<=0){typeId=w.t;break;}}const rt=RES_TYPES[typeId];if(!rt)return null;const maxA=rt.max*(.5+rng()*.5);return{id:nextResId++,type:typeId,x,y,amount:maxA,maxAmount:maxA,depleted:false,growTimer:0};}
function getResAt(x,y){return resObjects.find(r=>r.x===x&&r.y===y&&!r.depleted)||null;}
function stepResources(){for(const r of resObjects){if(r.depleted){r.growTimer--;if(r.growTimer<=0){r.amount=Math.min(r.maxAmount,r.amount+r.maxAmount*.25);if(r.amount>=r.maxAmount*.2){r.depleted=false;markTileDirty(r.x,r.y);}}}else{const rt=RES_TYPES[r.type];if(rt)r.amount=Math.min(r.maxAmount,r.amount+rt.regen);}}}
function spawnEntity(speciesId,x,y,ageTicks=0,gen=0,parentIds=[],genome=null){const sp=SPECIES[speciesId];if(!sp)return null;const info=generatePersonalInfo(speciesId);const sex=info.sex;const g=genome||mkGenome(.02,[]);const pheno=expressGenome(g);const favFood=rngChoice(Object.keys(FOOD_TYPES));let skinColor=sp.baseColor;if(speciesId==='human'){const skins=['#f5d0a0','#8d5524','#c68642','#e0ac69','#3b2f2f'];skinColor=rngChoice(skins);}const entity={id:`E${String(nextId++).padStart(5,'0')}`,species:speciesId,sp,sex,x,y,age:ageTicks,health:.9+rng()*.1,energy:.7+rng()*.3,hunger:.1+rng()*.2,thirst:.1+rng()*.2,alive:true,gen,parents:[...parentIds],repCd:0,gestTick:0,pregnant:false,genome:g,pheno,beliefId:rng()>.65?rngChoice(BELIEF_IDS):'',devotion:rng()*.5,faithCd:0,rituals:0,diseaseLevel:0,immunity:.5+rng()*.5,lifespan:sp.maxAge*(.8+rng()*.4),offspringCount:0,lastAction:'spawned',kinshipWarn:false,founderTag:rng()>.7?rngChoice(['ALPHA','BETA','GAMMA']):'',tribeId:null,polRank:0,inventory:{items:[]},favoriteFood:favFood,gold:0,homeX:null,homeY:null,firstName:info.name.first,lastName:info.name.last,fullName:info.name.full,height:info.height,weight:info.weight,skinColor,shirtColor:sp.canTool?'#c0c0c0':'',pantsColor:sp.canTool?'#606060':'',hairColor:'#4a3520',accentColor:'',toolHeld:null,tamedBy:null,poisonTicks:0,poisonStrength:0};if(entity.founderTag)entity.genome.founderTags=[entity.founderTag];lgAddNode(entity.id,'family_'+speciesId,'lin_'+speciesId,gen,parentIds,g.founderTags);const tile=getTile(x,y);if(tile)tile.occupants.add(entity.id);entities.push(entity);markTileDirty(x,y);return entity;}
function attemptTame(tamer,target){if(!target.sp.tamable||target.tamedBy)return false;if(tamer.sp.canTool&&target.sp.tamable){const difficulty=target.sp.tameDifficulty||0.5;if(rng()>difficulty){target.tamedBy=tamer.id;target.tribeId=tamer.tribeId;addEv('tame',`${tamer.firstName} tamed a ${target.sp.name}!`,'#a0ffa0');return true;}else{target.health-=.1;return false;}}return false;}
function applyVenom(attacker,victim){if(attacker.sp.venomous){victim.poisonTicks=300+rngI(0,200);victim.poisonStrength=0.03+rng()*.02;addEv('combat',`${victim.firstName} was bitten by ${attacker.sp.name}!`,'#ff4444');}}
function curePoison(entity){entity.poisonTicks=0;entity.poisonStrength=0;}
function renameEntity(entity,newFirst,newLast){if(newFirst)entity.firstName=newFirst;if(newLast)entity.lastName=newLast;entity.fullName=(entity.firstName||'')+' '+(entity.lastName||'');addEv('system',`${entity.id} renamed to ${entity.fullName}`,'#aaaaff');}
function stepCellularAutomata(){const newFire=new Set();for(const key of fireTiles){const[fx,fy]=key.split(',').map(Number);const t=getTile(fx,fy);if(!t)continue;t.fireLevel=Math.max(0,t.fireLevel-0.02);if(t.fireLevel<=0){fireTiles.delete(key);markTileDirty(fx,fy);continue;}t.plants=Math.max(0,t.plants-t.fireLevel*2);t.water=Math.max(0,t.water-t.fireLevel*1);markTileDirty(fx,fy);const dirs=[[-1,0],[1,0],[0,-1],[0,1]];for(const[dx,dy]of dirs){const nx=fx+dx,ny=fy+dy;const nt=getTile(nx,ny);if(nt&&nt.biome!=='river'&&nt.biome!=='wetland'&&nt.biome!=='mountain'&&nt.plants>10&&rng()<t.fireLevel*.2){const nk=`${nx},${ny}`;if(!fireTiles.has(nk)){newFire.add(nk);nt.fireLevel=0.5+rng()*.3;markTileDirty(nx,ny);}}}}for(const k of newFire)fireTiles.add(k);for(const key of lavaTiles){const[lx,ly]=key.split(',').map(Number);const t=getTile(lx,ly);if(!t)continue;if(rng()<.05){const dirs=[[-1,0],[1,0],[0,-1],[0,1]];const[dx,dy]=rngChoice(dirs);const nx=lx+dx,ny=ly+dy;const nt=getTile(nx,ny);if(nt&&nt.biome!=='river'&&rng()<.3){nt.biome='lava';lavaTiles.add(`${nx},${ny}`);markTileDirty(nx,ny);}if(getTile(lx,ly)?.biome==='river'){getTile(lx,ly).biome='mountain';lavaTiles.delete(key);markTileDirty(lx,ly);}}}}
function getSeason(){return SEASONS[Math.floor(tick/96)%4];}
function getYear(){return Math.floor(tick/384)+1;}
function getTemp(biome,season){return(BIOMES[biome]?.temp||22)+(SEASON_TEMP[season]||0);}
function hasTool(entity,tool){return entity.inventory.items.some(i=>i.type==='tool'&&i.tool===tool);}

// FIX: stepEntityAI is now properly closed with its own }
function stepEntityAI(entity){
  const sp=entity.sp;
  const tileNow=getTile(entity.x,entity.y);
  if(!tileNow)return;
  if(entity.poisonTicks>0){
    entity.health-=entity.poisonStrength;
    entity.poisonTicks--;
    if(getEra(tick)!=='medieval'&&entity.gold>=5){entity.gold-=5;curePoison(entity);}
  }
  if(sp.canTool){
    if(hasTool(entity,'fishing_rod')&&(tileNow.biome==='river'||tileNow.biome==='wetland')&&rng()<.05){
      entity.lastAction='fish';
      entity.inventory.items.push({type:'food',foodType:'fish',amount:1});
      entity.hunger=Math.max(0,entity.hunger-.1);
      addEv('action',`${entity.firstName} caught a fish!`,'#80c0ff');
    }
    if(entity.hunger>.7&&entity.inventory.items.some(i=>i.type==='food')){
      const foodIndex=entity.inventory.items.findIndex(i=>i.type==='food');
      if(foodIndex>=0){entity.hunger=Math.max(0,entity.hunger-.2);entity.inventory.items.splice(foodIndex,1);}
    }
    const nearbyTameTarget=entities.find(e=>e.alive&&e.sp.tamable&&!e.tamedBy&&Math.abs(e.x-entity.x)<=1&&Math.abs(e.y-entity.y)<=1);
    if(nearbyTameTarget&&rng()<.02)attemptTame(entity,nearbyTameTarget);
  }
  if(entity.hunger>.5&&(sp.diet==='herb'||sp.diet==='omni')){
    let best=null,ba=0;
    for(let dx=-sp.sens;dx<=sp.sens;dx++){
      for(let dy=-sp.sens;dy<=sp.sens;dy++){
        const t2=getTile(entity.x+dx,entity.y+dy);
        if(t2&&t2.plants>ba&&t2.biome!=='lava'){ba=t2.plants;best={x:entity.x+dx,y:entity.y+dy};}
      }
    }
    if(best){entity.x=best.x;entity.y=best.y;entity.lastAction='graze';}
  }
  if(entity.thirst>.6){
    let best=null,bd=999;
    for(let dx=-sp.sens*2;dx<=sp.sens*2;dx++){
      for(let dy=-sp.sens*2;dy<=sp.sens*2;dy++){
        const t2=getTile(entity.x+dx,entity.y+dy);
        if(t2&&(t2.biome==='river'||t2.biome==='wetland')&&t2.water>5){
          const d=Math.abs(dx)+Math.abs(dy);
          if(d<bd){bd=d;best={x:entity.x+dx,y:entity.y+dy};}
        }
      }
    }
    if(best){entity.x=best.x;entity.y=best.y;entity.lastAction='drink';}
  }
  if(sp.predPow>0&&entity.hunger>.5){
    for(let dx=-sp.sens*2;dx<=sp.sens*2;dx++){
      for(let dy=-sp.sens*2;dy<=sp.sens*2;dy++){
        const t2=getTile(entity.x+dx,entity.y+dy);
        if(!t2||t2.occupants.size===0)continue;
        for(const oid of t2.occupants){
          const prey=entities.find(e=>e.id===oid&&e.alive&&e.species!==entity.species);
          if(prey&&prey.id!==entity.id){
            entity.x=prey.x;entity.y=prey.y;entity.lastAction='hunt';
            if(rng()<sp.predPow*.4){
              prey.alive=false;
              entity.hunger=Math.max(0,entity.hunger-.5);
              if(entity.sp.venomous)applyVenom(entity,prey);
              const pt=getTile(prey.x,prey.y);
              if(pt)pt.occupants.delete(prey.id);
              markTileDirty(prey.x,prey.y);
            }
            break;
          }
        }
      }
    }
  }
  // Clamp position
  entity.x=Math.max(0,Math.min(W-1,entity.x));
  entity.y=Math.max(0,Math.min(H-1,entity.y));
} // <-- FIX: this closing brace was missing in original

function stepSim(){
  const season=getSeason();
  const isWinter=season==='winter',isSummer=season==='summer';
  const growMod=isWinter?.2:isSummer?1.3:1;
  let tP=0,mP=0,tW=0,mW=0;
  for(const t of world){
    const b=BIOMES[t.biome]||BIOMES.plain;
    const rainMod=(t.biome==='river'||t.biome==='wetland')?1.3:1;
    const old_p=t.plants,old_w=t.water;
    t.plants=Math.min(t.maxP,t.plants+b.fert*growMod*.3*rainMod);
    t.water=Math.min(t.maxW,t.water+(isWinter?.1:.3)*rainMod);
    if(t.biome==='desert')t.water=Math.max(0,t.water-.12);
    if(t.biome==='lava'){t.plants=0;t.water=Math.max(0,t.water-.5);}
    t.nutrients=Math.min(100,t.nutrients+b.fert*.05);
    if(Math.abs(t.plants-old_p)>.5||Math.abs(t.water-old_w)>.5)markTileDirty(t.x,t.y);
    tP+=t.plants;mP+=t.maxP;tW+=t.water;mW+=t.maxW;
  }
  const barP=document.getElementById('bar-p');
  const barW=document.getElementById('bar-w');
  if(barP)barP.style.width=Math.round(tP/mP*100)+'%';
  if(barW)barW.style.width=Math.round(tW/mW*100)+'%';
  stepCellularAutomata();
  stepResources();
  const toRemove=[];
  // FIX: births array declared here, populated during entity loop, applied after
  const births=[];
  let bCount=0,dCount=0,mutCount=0;
  for(const entity of entities){
    if(!entity.alive)continue;
    entity.age++;
    stepEntityAI(entity);
    const tileNow=getTile(entity.x,entity.y);
    if(tileNow?.biome==='lava'){entity.alive=false;dCount++;toRemove.push(entity);continue;}
    if(entity.health<=0||entity.age>=entity.lifespan||entity.hunger>=1||entity.thirst>=1){entity.alive=false;dCount++;toRemove.push(entity);continue;}
    entity.hunger=Math.min(1,entity.hunger+entity.sp.metab);
    entity.thirst=Math.min(1,entity.thirst+entity.sp.waterN);
    entity.energy=Math.max(0,entity.energy-entity.sp.metab*.3);
    if(entity.diseaseLevel>0){entity.health=Math.max(0,entity.health-entity.diseaseLevel*.005);entity.diseaseLevel=Math.max(0,entity.diseaseLevel-.001);}
    if(entity.repCd>0)entity.repCd--;
    if(entity.sex==='female'&&!entity.pregnant&&entity.energy>entity.sp.repE&&entity.health>entity.sp.repH&&entity.age>=entity.sp.mature&&entity.repCd===0&&entity.hunger<entity.sp.repHng&&entity.thirst<entity.sp.repThs){
      const mates=entities.filter(e=>e.alive&&e.species===entity.species&&e.sex==='male'&&Math.abs(e.x-entity.x)<=1&&Math.abs(e.y-entity.y)<=1&&e.age>=entity.sp.mature&&e.repCd===0);
      if(mates.length>0){
        const mate=rngChoice(mates);
        const{allowed,kinship}=preventInbreeding(entity.id,mate.id);
        if(allowed){
          entity.pregnant=true;
          entity.gestTick=entity.sp.gestT;
          entity.repCd=48;mate.repCd=24;
          entity.genome=crossover(entity.genome,mate.genome,kinship,tick);
          entity.pheno=expressGenome(entity.genome);
          const newMuts=entity.genome.mutHistory.filter(m=>m.tick===tick).length;
          totalMutations+=newMuts;mutCount+=newMuts;
        }else{inbreedingWarnings++;entity.kinshipWarn=true;mate.kinshipWarn=true;}
      }
    }
    if(entity.pregnant){
      entity.gestTick--;
      if(entity.gestTick<=0){
        entity.pregnant=false;
        const count=rngI(entity.sp.litMin,entity.sp.litMax);
        entity.offspringCount=(entity.offspringCount||0)+count;
        // FIX: push to births array instead of calling spawnEntity inside entity loop
        for(let i=0;i<count;i++){
          births.push({species:entity.species,x:Math.max(0,Math.min(W-1,entity.x+rngI(-1,1))),y:Math.max(0,Math.min(H-1,entity.y+rngI(-1,1))),gen:entity.gen+1,parents:[entity.id],genome:entity.genome,tribeId:entity.tribeId});
        }
        bCount+=count;
      }
    }
    const ct=getTile(entity.x,entity.y);
    if(ct)ct.occupants.add(entity.id);
  }
  // FIX: apply births after entity loop finishes
  for(const b of births){
    if(entities.filter(e=>e.alive).length<MAX_ENTITIES){
      const child=spawnEntity(b.species,b.x,b.y,0,b.gen,b.parents,b.genome);
      if(child&&b.tribeId)addToTribe(child,b.tribeId);
    }
  }
  for(const o of toRemove){
    const t=getTile(o.x,o.y);
    if(t)t.occupants.delete(o.id);
    const idx=entities.indexOf(o);
    if(idx>=0)entities.splice(idx,1);
    markTileDirty(o.x,o.y);
  }
  if(tick%10===0)stepPolitics();
  if(tick%50===0)stepEconomy();
  tick++;
  updateStats();
  if(tick%500===0&&tick>0)autoSave();
}

const canvas=document.getElementById('world'),ctx=canvas.getContext('2d'),cwDiv=document.getElementById('cw');
function resizeCanvas(){canvas.width=cwDiv.clientWidth;canvas.height=cwDiv.clientHeight;markAllDirty();}
window.addEventListener('resize',resizeCanvas);
function worldToScreen(wx,wy){const tileS=TILE_BASE*cam.zoom;return{sx:Math.round((wx*tileS)-cam.x),sy:Math.round((wy*tileS)-cam.y)};}
function screenToWorld(sx,sy){const tileS=TILE_BASE*cam.zoom;return{wx:(sx+cam.x)/tileS,wy:(sy+cam.y)/tileS};}
function screenToTile(sx,sy){const w=screenToWorld(sx,sy);return{x:Math.floor(w.wx),y:Math.floor(w.wy)};}
function clampCamera(){const tileS=TILE_BASE*cam.zoom;const worldPxW=W*tileS,worldPxH=H*tileS;const margin=50;cam.x=Math.max(-margin,Math.min(worldPxW-canvas.width+margin,cam.x));cam.y=Math.max(-margin,Math.min(worldPxH-canvas.height+margin,cam.y));}
function shadeCol(hex,amt){try{const r=Math.max(0,Math.min(255,parseInt(hex.slice(1,3),16)+amt));const g=Math.max(0,Math.min(255,parseInt(hex.slice(3,5),16)+amt));const b=Math.max(0,Math.min(255,parseInt(hex.slice(5,7),16)+amt));return`rgb(${r},${g},${b})`;}catch{return hex;}}
function px(ctx,ox,oy,col,s,bx,by){ctx.fillStyle=col;ctx.fillRect(Math.round(bx+ox*s),Math.round(by+oy*s),Math.max(1,Math.ceil(s)),Math.max(1,Math.ceil(s)));}
function drawHumanoidSprite(ctx,bx,by,s,skinCol,shirtCol,pantsCol,hairCol,accentCol,action,sex,polRank,toolHeld){if(s<0.5)return;ctx.fillStyle='rgba(0,0,0,0.22)';ctx.fillRect(Math.round(bx+2*s),Math.round(by+13*s),Math.round(12*s),Math.round(2*s));px(ctx,4,10,pantsCol,s,bx,by);px(ctx,5,10,pantsCol,s,bx,by);px(ctx,4,11,pantsCol,s,bx,by);px(ctx,5,11,pantsCol,s,bx,by);px(ctx,9,10,pantsCol,s,bx,by);px(ctx,10,10,pantsCol,s,bx,by);px(ctx,9,11,pantsCol,s,bx,by);px(ctx,10,11,pantsCol,s,bx,by);const footCol=shadeCol(pantsCol,-30);px(ctx,4,12,footCol,s,bx,by);px(ctx,5,12,footCol,s,bx,by);px(ctx,9,12,footCol,s,bx,by);px(ctx,10,12,footCol,s,bx,by);for(let row=6;row<=9;row++)for(let col=3;col<=12;col++)px(ctx,col,row,shirtCol,s,bx,by);for(let col=3;col<=12;col++)px(ctx,col,9,shadeCol(shirtCol,-20),s,bx,by);for(let row=6;row<=10;row++){px(ctx,2,row,skinCol,s,bx,by);px(ctx,3,row,skinCol,s,bx,by);px(ctx,12,row,skinCol,s,bx,by);px(ctx,13,row,skinCol,s,bx,by);}if(accentCol){px(ctx,7,7,accentCol,s,bx,by);px(ctx,8,7,accentCol,s,bx,by);}for(let row=2;row<=5;row++)for(let col=4;col<=11;col++)px(ctx,col,row,skinCol,s,bx,by);for(let col=4;col<=11;col++)px(ctx,col,1,hairCol,s,bx,by);px(ctx,3,2,hairCol,s,bx,by);px(ctx,12,2,hairCol,s,bx,by);if(sex==='female'){px(ctx,3,3,hairCol,s,bx,by);px(ctx,12,3,hairCol,s,bx,by);px(ctx,3,4,hairCol,s,bx,by);px(ctx,12,4,hairCol,s,bx,by);}const eyeCol='#1a1a2e';px(ctx,6,3,eyeCol,s,bx,by);px(ctx,9,3,eyeCol,s,bx,by);px(ctx,7,5,'rgba(180,80,80,0.7)',s,bx,by);px(ctx,8,5,'rgba(180,80,80,0.7)',s,bx,by);if(polRank>=8){for(let c=4;c<=11;c++)px(ctx,c,0,'#ffd700',s,bx,by);}else if(polRank>=4){for(let c=4;c<=11;c++)px(ctx,c,1,'#d4a820',s,bx,by);}else if(polRank>=2){px(ctx,4,1,'#888',s,bx,by);px(ctx,11,1,'#888',s,bx,by);}if(action==='hunt'||action==='fight'){for(let row=3;row<=12;row++)px(ctx,14,row,'#8B6914',s,bx,by);px(ctx,14,2,'#c0c0c0',s,bx,by);}else if(action==='gather'||action==='carry'){px(ctx,1,7,'#8B6914',s,bx,by);px(ctx,0,7,'#a07830',s,bx,by);}else if(action==='build'){for(let row=8;row<=12;row++)px(ctx,14,row,'#8B6914',s,bx,by);px(ctx,13,7,'#808080',s,bx,by);}else if(toolHeld==='fishing_rod'){px(ctx,13,4,'#8B5A2B',s,bx,by);px(ctx,14,4,'#8B5A2B',s,bx,by);}}
function drawAnimalSprite(ctx,bx,by,s,species){const sp=SPECIES[species];if(!sp)return;const cx=bx+8*s,cy=by+8*s;if(species==='cat'||species==='dog'||species==='wolf'||species==='fox'){ctx.fillStyle=sp.baseColor;ctx.beginPath();ctx.ellipse(cx,cy,5*s,3*s,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=shadeCol(sp.baseColor,-20);ctx.beginPath();ctx.arc(cx-4*s,cy-3*s,2*s,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+4*s,cy-3*s,2*s,0,Math.PI*2);ctx.fill();ctx.fillStyle='#000';ctx.beginPath();ctx.arc(cx-2*s,cy-1*s,s*.8,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+2*s,cy-1*s,s*.8,0,Math.PI*2);ctx.fill();}else if(species==='chicken'){ctx.fillStyle=sp.baseColor;ctx.beginPath();ctx.arc(cx,cy-1*s,3*s,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff0000';ctx.beginPath();ctx.arc(cx+3*s,cy-2*s,1.5*s,0,Math.PI*2);ctx.fill();}else if(species==='sheep'){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cx,cy,6*s,0,Math.PI*2);ctx.fill();ctx.fillStyle='#000';ctx.beginPath();ctx.arc(cx-2*s,cy-1*s,s*.8,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+2*s,cy-1*s,s*.8,0,Math.PI*2);ctx.fill();}else if(species==='cow'||species==='buffalo'){ctx.fillStyle=sp.baseColor;ctx.beginPath();ctx.arc(cx,cy,7*s,0,Math.PI*2);ctx.fill();ctx.fillStyle='#000';ctx.beginPath();ctx.arc(cx-2*s,cy-2*s,1.5*s,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+2*s,cy-2*s,1.5*s,0,Math.PI*2);ctx.fill();}else if(species==='pig'){ctx.fillStyle='#f0a0a0';ctx.beginPath();ctx.ellipse(cx,cy,5*s,4*s,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#000';ctx.beginPath();ctx.arc(cx-2*s,cy-1*s,s,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+2*s,cy-1*s,s,0,Math.PI*2);ctx.fill();}else if(species==='frog'){ctx.fillStyle=sp.baseColor;ctx.beginPath();ctx.ellipse(cx,cy+1*s,4*s,3*s,0,0,Math.PI*2);ctx.fill();}else if(species==='fish'){ctx.fillStyle=sp.baseColor;ctx.beginPath();ctx.ellipse(cx,cy,6*s,2*s,0,0,Math.PI*2);ctx.fill();}else if(species==='cobra'||species==='python'){ctx.fillStyle=sp.baseColor;ctx.beginPath();ctx.ellipse(cx,cy,8*s,3*s,.2,0,Math.PI*2);ctx.fill();}else if(species==='bee'){ctx.fillStyle='#f0c040';ctx.beginPath();ctx.ellipse(cx,cy,3*s,2*s,0,0,Math.PI*2);ctx.fill();}else if(species==='butterfly'){ctx.fillStyle='#e0a0f0';ctx.beginPath();ctx.ellipse(cx-2*s,cy,3*s,2*s,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(cx+2*s,cy,3*s,2*s,0,0,Math.PI*2);ctx.fill();}else if(species==='worm'){ctx.fillStyle=sp.baseColor;for(let i=0;i<3;i++)ctx.fillRect(cx-3*s+i*3*s,cy-1*s,2*s,2*s);}else{ctx.fillStyle=sp.baseColor;ctx.beginPath();ctx.ellipse(cx,cy,5*s,3*s,0,0,Math.PI*2);ctx.fill();}}
function drawEntitySprite(ctx,bx,by,s,entity){if(!entity||!entity.sp)return;if(entity.sp.bipedal&&entity.sp.canTool){drawHumanoidSprite(ctx,bx,by,s,entity.skinColor,entity.shirtColor,entity.pantsColor,entity.hairColor,entity.accentColor,entity.lastAction,entity.sex,entity.polRank,entity.toolHeld);}else{drawAnimalSprite(ctx,bx,by,s,entity.species);}}
function tilePaletteColor(biome,x,y){const vars=BIOME_VARS[biome]||BIOME_VARS.plain;const hash=(x*17+y*31+Math.floor(tick/60)*3)%vars.length;return vars[hash];}
function renderWorld(){
  if(!canvas||!ctx)return;
  const cw=canvas.width,ch=canvas.height;
  if(cw===0||ch===0)return; // FIX: skip render if canvas has no size
  ctx.clearRect(0,0,cw,ch);
  const tileS=TILE_BASE*cam.zoom;
  const season=getSeason();
  const isWinter=season==='winter';
  const txMin=Math.max(0,Math.floor(cam.x/tileS));
  const tyMin=Math.max(0,Math.floor(cam.y/tileS));
  const txMax=Math.min(W-1,Math.ceil((cam.x+cw)/tileS));
  const tyMax=Math.min(H-1,Math.ceil((cam.y+ch)/tileS));
  for(let ty=tyMin;ty<=tyMax;ty++){
    for(let tx=txMin;tx<=txMax;tx++){
      const t=world[ty*W+tx];
      if(!t)continue;
      const px2=Math.round(tx*tileS-cam.x);
      const py2=Math.round(ty*tileS-cam.y);
      const ts=Math.ceil(tileS)+1;
      if(viewMode==='genetics'){
        let avgFit=.5;
        if(t.occupants.size>0){let sum=0;for(const oid of t.occupants){const o=entities.find(x=>x.id===oid&&x.alive);if(o)sum+=o.genome.fitness;}avgFit=sum/Math.max(1,t.occupants.size);}
        const r=Math.round(30+avgFit*160),g2=Math.round(20+avgFit*50),b2=Math.round(80+avgFit*120);
        ctx.fillStyle=`rgb(${r},${g2},${b2})`;ctx.fillRect(px2,py2,ts,ts);
      }else if(viewMode==='faith'){
        let avgDev=0,n=0;
        for(const oid of t.occupants){const o=entities.find(x=>x.id===oid&&x.alive);if(o&&o.beliefId){avgDev+=o.devotion;n++;}}
        const d=n>0?avgDev/n:0;
        ctx.fillStyle=n>0?`rgb(${20+Math.round(d*160)},${20+Math.round(d*160)},${20+Math.round(d*60)})`:'#0d0d14';
        ctx.fillRect(px2,py2,ts,ts);
      }else if(viewMode==='health'){
        let avgH=0,n=0;
        for(const oid of t.occupants){const o=entities.find(x=>x.id===oid&&x.alive);if(o){avgH+=o.health;n++;}}
        const h=n>0?avgH/n:.5;
        ctx.fillStyle=`rgb(${20+Math.round((1-h)*180)},${20+Math.round(h*160)},20)`;
        ctx.fillRect(px2,py2,ts,ts);
      }else if(viewMode==='politics'){
        let col='#14141e';
        const occs=[...t.occupants].map(id=>entities.find(o=>o.id===id&&o.alive)).filter(Boolean);
        if(occs.length>0){const tr=tribeOfOrg(occs[0]);if(tr)col=tr.color+'88';}
        else{for(const tr of tribes){if(tr.territory.has(`${tx},${ty}`)){col=tr.color+'30';break;}}}
        ctx.fillStyle=col;ctx.fillRect(px2,py2,ts,ts);
        ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(px2,py2+ts-1,ts,1);ctx.fillRect(px2+ts-1,py2,1,ts);
      }else if(viewMode==='biome'){
        ctx.fillStyle=BIOMES[t.biome]?.col||'#3d6e3d';ctx.fillRect(px2,py2,ts,ts);
      }else{
        ctx.fillStyle=tilePaletteColor(t.biome,tx,ty);ctx.fillRect(px2,py2,ts,ts);
        if(t.plants>t.maxP*.5&&t.biome!=='river'&&t.biome!=='mountain'&&t.biome!=='lava'){ctx.fillStyle='rgba(80,220,80,0.10)';ctx.fillRect(px2+1,py2+1,ts-2,ts-2);}
        if(t.biome==='river'||t.biome==='wetland'){const sh=Math.sin(tick*.12+tx*.9+ty*.6)*.09+.09;ctx.fillStyle=`rgba(80,170,255,${sh})`;ctx.fillRect(px2,py2,ts,ts);}
        if(t.biome==='ice'){ctx.fillStyle='rgba(200,240,255,0.15)';ctx.fillRect(px2,py2,ts,ts);}
        if(t.biome==='lava'){const glow=Math.sin(tick*.2+tx*.5+ty*.7)*.15+.25;ctx.fillStyle=`rgba(255,100,20,${glow})`;ctx.fillRect(px2,py2,ts,ts);}
        if(t.fireLevel>0){ctx.fillStyle=`rgba(255,150,20,${t.fireLevel*.6})`;ctx.fillRect(px2,py2,ts,ts);}
        if(isWinter&&t.biome!=='desert'&&t.biome!=='lava'){const sn=Math.sin(tick*.07+tx*.5+ty*.8)*.07+.05;ctx.fillStyle=`rgba(210,230,255,${sn})`;ctx.fillRect(px2,py2,ts,ts);}
        if(cam.zoom>1.5){ctx.fillStyle='rgba(0,0,0,0.12)';ctx.fillRect(px2,py2+ts-1,ts,1);ctx.fillRect(px2+ts-1,py2,1,ts);}
      }
    }
  }
  for(const entity of entities){
    if(!entity.alive)continue;
    const{sx,sy}=worldToScreen(entity.x,entity.y);
    if(sx+tileS<0||sx>cw||sy+tileS<0||sy>ch)continue;
    drawEntitySprite(ctx,sx,sy,tileS/16,entity);
  }
  if(viewMode==='politics'&&cam.zoom>=1){
    for(const tr of tribes){
      ctx.strokeStyle=tr.color;ctx.lineWidth=1.5;ctx.setLineDash([3,3]);
      for(const key of tr.territory){
        const[kx,ky]=key.split(',').map(Number);
        const right=tr.territory.has(`${kx+1},${ky}`);
        const down=tr.territory.has(`${kx},${ky+1}`);
        const{sx,sy}=worldToScreen(kx,ky);
        if(!right){ctx.beginPath();ctx.moveTo(sx+tileS,sy);ctx.lineTo(sx+tileS,sy+tileS);ctx.stroke();}
        if(!down){ctx.beginPath();ctx.moveTo(sx,sy+tileS);ctx.lineTo(sx+tileS,sy+tileS);ctx.stroke();}
      }
      ctx.setLineDash([]);
    }
  }
  drawMinimap();
}
const miniCanvas=document.getElementById('minimap-canvas'),miniCtx=miniCanvas.getContext('2d');
let minimapDirty=true;
function drawMinimap(){
  if(!miniCanvas||!miniCtx)return;
  const mw=miniCanvas.width,mh=miniCanvas.height;
  const scale=mw/W;
  if(minimapDirty){
    const img=miniCtx.createImageData(mw,mh);
    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        const t=world[y*W+x];
        if(!t)continue;
        const col=hexToRgb(BIOMES[t.biome]?.col||'#3d6e3d');
        const idx=(Math.floor(y*scale)*mw+Math.floor(x*scale))*4;
        if(idx>=0&&idx+3<img.data.length){img.data[idx]=col[0];img.data[idx+1]=col[1];img.data[idx+2]=col[2];img.data[idx+3]=255;}
      }
    }
    miniCtx.putImageData(img,0,0);
    minimapDirty=false;
  }
  for(const entity of entities){
    if(!entity.alive)continue;
    const px2=Math.round(entity.x*scale),py2=Math.round(entity.y*scale);
    miniCtx.fillStyle=entity.sp.baseColor;miniCtx.fillRect(px2,py2,1,1);
  }
  const tileS=TILE_BASE*cam.zoom;
  const vx=Math.round(cam.x/tileS*scale);
  const vy=Math.round(cam.y/tileS*scale);
  const vw=Math.round(canvas.width/tileS*scale);
  const vh=Math.round(canvas.height/tileS*scale);
  miniCtx.strokeStyle='rgba(255,255,255,0.7)';miniCtx.lineWidth=1;miniCtx.strokeRect(vx,vy,vw,vh);
}
function hexToRgb(hex){try{const r=parseInt(hex.slice(1,3),16);const g=parseInt(hex.slice(3,5),16);const b=parseInt(hex.slice(5,7),16);return[r,g,b];}catch{return[61,110,61];}}
function updateStats(){
  const al=entities.filter(o=>o.alive);
  const tbTick=document.getElementById('tb-tick');if(tbTick)tbTick.textContent=tick;
  const tbSeason=document.getElementById('tb-season');if(tbSeason)tbSeason.textContent=SEASON_NAMES[getSeason()];
  const tbAlive=document.getElementById('tb-alive');if(tbAlive)tbAlive.textContent=al.length;
  const tbYear=document.getElementById('tb-year');if(tbYear)tbYear.textContent=getYear();
  const maxGen=al.length>0?Math.max(...al.map(o=>o.gen)):0;
  const tbGen=document.getElementById('tb-gen');if(tbGen)tbGen.textContent=maxGen;
  const tbKin=document.getElementById('tb-kin');if(tbKin)tbKin.textContent=inbreedingWarnings;
  const tbTribes=document.getElementById('tb-tribes');if(tbTribes)tbTribes.textContent=tribes.length;
  const speciesCounts={};
  for(const e of al){if(!speciesCounts[e.species])speciesCounts[e.species]=0;speciesCounts[e.species]++;}
  const popList=document.getElementById('pop-species-list');
  if(popList)popList.innerHTML=Object.entries(speciesCounts).map(([k,v])=>`<span style="margin-right:8px">${SPECIES[k]?.emoji||''} ${v}</span>`).join('');
  if(al.length>0){
    const cnFit=document.getElementById('cn-fit');if(cnFit)cnFit.textContent=(al.reduce((s,o)=>s+o.genome.fitness,0)/al.length).toFixed(2);
    const cnHet=document.getElementById('cn-het');if(cnHet)cnHet.textContent=(al.reduce((s,o)=>s+o.genome.heterozygosity,0)/al.length).toFixed(2);
  }
  const cnMut=document.getElementById('cn-mut');if(cnMut)cnMut.textContent=totalMutations;
  if(!popHistory.h)popHistory={h:[],c:[],o:[]};
  popHistory.h.push(speciesCounts['human']||0);
  popHistory.c.push(speciesCounts['wolf']||0);
  popHistory.o.push(speciesCounts['orc']||0);
  if(popHistory.h.length>PH_MAX){popHistory.h.shift();popHistory.c.shift();popHistory.o.shift();}
  drawPopChart();
  updateTribeList();
}
function drawPopChart(){
  const c=document.getElementById('popchart');if(!c)return;
  const cx2=c.getContext('2d');cx2.clearRect(0,0,c.width,c.height);
  const mx=Math.max(1,...popHistory.h,...popHistory.c,...popHistory.o);
  function line(data,col){if(data.length<2)return;cx2.strokeStyle=col;cx2.lineWidth=1.5;cx2.beginPath();data.forEach((v,i)=>{const px2=(i/(PH_MAX-1))*c.width;const py2=c.height-(v/mx)*c.height;i===0?cx2.moveTo(px2,py2):cx2.lineTo(px2,py2);});cx2.stroke();}
  line(popHistory.h,'#60c060');line(popHistory.c,'#e05050');line(popHistory.o,'#d08030');
}
function updateTribeList(){
  const el=document.getElementById('tribelist');if(!el)return;
  if(tribes.length===0){el.innerHTML='<div style="color:var(--muted);font-size:9px;padding:4px">No tribes yet</div>';return;}
  el.innerHTML=tribes.map(t=>{
    const count=t.memberIds.size;
    const rel=Object.entries(t.diplomacy||{}).map(([id,s])=>{const ot=getTribe(parseInt(id));const sym={war:'⚔',alliance:'🤝',trade:'💰',vassal:'⬇',neutral:'—'}[s]||'—';return`${sym}${ot?.name||'?'}`;}).join(' ');
    const gov=GOV_TYPES[t.govType]||GOV_TYPES.tribe;
    return`<div class="tribe-row" onclick="focusTribe(${t.id})"><div class="tribe-color" style="background:${t.color}"></div><div class="tribe-info"><div class="tribe-name">${t.name} ${gov.symbol}</div><div class="tribe-sub">${count} members · T:${(t.tech||0).toFixed(1)} · ${rel||'isolated'}</div></div></div>`;
  }).join('');
}
function focusTribe(id){const t=getTribe(id);if(!t)return;const tileS=TILE_BASE*cam.zoom;cam.x=t.capital.x*tileS-canvas.width/2;cam.y=t.capital.y*tileS-canvas.height/2;clampCamera();}
function addEv(type,msg,col){events.unshift({tick,type,msg,col:col||'#6668a0'});if(events.length>80)events.pop();const el=document.getElementById('evlog');if(!el)return;el.innerHTML=events.slice(0,20).map(e=>`<div class="ev"><span class="etime">[${e.tick}]</span> <span class="emsg" style="color:${e.col}">${e.msg}</span></div>`).join('');}
function notif(msg){const n=document.getElementById('notif');if(!n)return;n.textContent=msg;n.classList.add('show');setTimeout(()=>n.classList.remove('show'),2200);}
function getTileAtEvent(e){const rect=canvas.getBoundingClientRect();return screenToTile(e.clientX-rect.left,e.clientY-rect.top);}
canvas.addEventListener('contextmenu',e=>{e.preventDefault();const{x,y}=getTileAtEvent(e);const tile=getTile(x,y);if(tile&&tile.occupants.size>0){const occupant=entities.find(o=>o.id===[...tile.occupants][0]&&o.alive);if(occupant&&occupant.sp.canTool){const newFirst=prompt('Enter new first name:',occupant.firstName);const newLast=prompt('Enter new last name:',occupant.lastName);if(newFirst||newLast)renameEntity(occupant,newFirst,newLast);}}});
canvas.addEventListener('mousedown',e=>{if(e.button===2){cam.panActive=true;cam.panStartX=e.clientX;cam.panStartY=e.clientY;cam.panCamX=cam.x;cam.panCamY=cam.y;canvas.style.cursor='grabbing';}else if(e.button===0){isDrawing=true;handleToolAction(e);}});
canvas.addEventListener('mousemove',e=>{if(cam.panActive){cam.x=cam.panCamX-(e.clientX-cam.panStartX);cam.y=cam.panCamY-(e.clientY-cam.panStartY);clampCamera();}else if(isDrawing){handleToolAction(e);}showTooltip(e);updateImpactAimer(e);});
canvas.addEventListener('mouseup',e=>{if(e.button===2){cam.panActive=false;canvas.style.cursor='crosshair';}else if(e.button===0){isDrawing=false;}});
canvas.addEventListener('mouseleave',()=>{isDrawing=false;cam.panActive=false;canvas.style.cursor='crosshair';const tt=document.getElementById('tt');if(tt)tt.style.display='none';const aimer=document.getElementById('impact-aimer');if(aimer)aimer.style.display='none';});
canvas.addEventListener('wheel',e=>{e.preventDefault();const rect=canvas.getBoundingClientRect();const mx=e.clientX-rect.left,my=e.clientY-rect.top;const wBefore=screenToWorld(mx,my);const delta=e.deltaY>0?0.85:1.18;cam.zoom=Math.max(ZOOM_MIN,Math.min(ZOOM_MAX,cam.zoom*delta));const wAfter=screenToWorld(mx,my);const tileS=TILE_BASE*cam.zoom;cam.x+=(wBefore.wx-wAfter.wx)*tileS;cam.y+=(wBefore.wy-wAfter.wy)*tileS;clampCamera();minimapDirty=true;},{passive:false});
miniCanvas.addEventListener('click',e=>{const rect=miniCanvas.getBoundingClientRect();const mx=e.clientX-rect.left,my=e.clientY-rect.top;const tileS=TILE_BASE*cam.zoom;const wx=mx/miniCanvas.width*W;const wy=my/miniCanvas.height*H;cam.x=wx*tileS-canvas.width/2;cam.y=wy*tileS-canvas.height/2;clampCamera();});
const IMPACT_TOOLS=['bomb','meteor','volcano','flood','fire','disease_tile'];
function updateImpactAimer(e){const aimer=document.getElementById('impact-aimer');if(!aimer)return;if(!IMPACT_TOOLS.includes(selectedTool)){aimer.style.display='none';return;}const rect=canvas.getBoundingClientRect();const radii={bomb:30,meteor:50,volcano:70,flood:40,fire:35,disease_tile:35};const r=radii[selectedTool]||30;aimer.style.display='block';aimer.style.left=(e.clientX-rect.left)+'px';aimer.style.top=(e.clientY-rect.top)+'px';aimer.style.width=r*2+'px';aimer.style.height=r*2+'px';}
function handleToolAction(e){const{x,y}=getTileAtEvent(e);if(x<0||x>=W||y<0||y>=H)return;const tile=getTile(x,y);if(!tile)return;if(selectedTool==='erase'){entities.filter(o=>o.alive&&o.x===x&&o.y===y).forEach(o=>{o.alive=false;const t2=getTile(o.x,o.y);if(t2)t2.occupants.delete(o.id);});markTileDirty(x,y);return;}if(BIOMES[selectedTool]){for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const tx=x+dx,ty=y+dy;const t2=getTile(tx,ty);if(!t2)continue;t2.biome=selectedTool;const b=BIOMES[selectedTool];t2.maxP=b.maxP;t2.plants=Math.min(t2.plants,b.maxP);t2.maxW=b.water*1.5;t2.water=Math.min(t2.water,t2.maxW);t2.fert=b.fert;if(selectedTool==='lava'){t2.lavaLevel=1;lavaTiles.add(`${tx},${ty}`);}markTileDirty(tx,ty);}minimapDirty=true;return;}const spawnKey=selectedTool.replace('spawn_','');if(SPECIES[spawnKey]){if(tile.biome!=='mountain'){spawnEntity(spawnKey,x,y,20);}return;}if(selectedTool==='bomb'){impactExplosion(x,y,3,0.6);}else if(selectedTool==='meteor'){impactExplosion(x,y,5,1.0);for(let dx=-5;dx<=5;dx++)for(let dy=-5;dy<=5;dy++){if(Math.sqrt(dx*dx+dy*dy)<2){const t2=getTile(x+dx,y+dy);if(t2){t2.biome='mountain';markTileDirty(x+dx,y+dy);}}}}else if(selectedTool==='volcano'){for(let dx=-3;dx<=3;dx++)for(let dy=-3;dy<=3;dy++){const t2=getTile(x+dx,y+dy);if(!t2)continue;if(Math.sqrt(dx*dx+dy*dy)<=3){t2.biome='lava';t2.lavaLevel=1;lavaTiles.add(`${x+dx},${y+dy}`);}markTileDirty(x+dx,y+dy);}impactExplosion(x,y,3,0.8);addEv('god','🌋 Volcanic eruption!','#c83010');notif('🌋 Eruption!');}else if(selectedTool==='flood'){for(let dx=-3;dx<=3;dx++)for(let dy=-3;dy<=3;dy++){const t2=getTile(x+dx,y+dy);if(t2&&Math.sqrt(dx*dx+dy*dy)<=3){t2.water=t2.maxW;t2.biome='wetland';}markTileDirty(x+dx,y+dy);}}else if(selectedTool==='fire'){for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++){const t2=getTile(x+dx,y+dy);if(t2&&Math.sqrt(dx*dx+dy*dy)<=2&&t2.biome!=='river'&&t2.biome!=='wetland'){t2.fireLevel=0.6+rng()*.4;fireTiles.add(`${x+dx},${y+dy}`);markTileDirty(x+dx,y+dy);}}}else if(selectedTool==='disease_tile'){const nearby=entities.filter(o=>o.alive&&Math.abs(o.x-x)<=3&&Math.abs(o.y-y)<=3);for(const org of nearby){org.diseaseLevel=Math.min(1,org.diseaseLevel+.5);}addEv('god',`🦠 Infection spread to ${nearby.length} entities`,'#a32d2d');}}
function impactExplosion(cx,cy,radius,power){for(let dx=-radius;dx<=radius;dx++)for(let dy=-radius;dy<=radius;dy++){const dist=Math.sqrt(dx*dx+dy*dy);if(dist>radius)continue;const dmg=power*(1-dist/radius);const t=getTile(cx+dx,cy+dy);if(t){t.plants=Math.max(0,t.plants-dmg*50);t.water=Math.max(0,t.water-dmg*20);markTileDirty(cx+dx,cy+dy);}entities.filter(o=>o.alive&&o.x===cx+dx&&o.y===cy+dy).forEach(o=>{o.health=Math.max(0,o.health-dmg);if(o.health<=0){o.alive=false;const t2=getTile(o.x,o.y);if(t2)t2.occupants.delete(o.id);}});}addEv('impact',`💥 Explosion at (${cx},${cy})`,'#e08030');}
function showTooltip(e){const{x,y}=getTileAtEvent(e);const tile=getTile(x,y);const tt=document.getElementById('tt');if(!tt)return;if(!tile){tt.style.display='none';return;}const ents=entities.filter(o=>o.alive&&o.x===x&&o.y===y);let ttN='',ttB='';if(ents.length>0){const entity=ents[0];ttN=`${entity.sp.emoji} ${entity.fullName} (${entity.sp.name})`;ttB=`${entity.sex} · Gen${entity.gen} · Age ${entity.age}/${Math.floor(entity.lifespan)}<br>`;ttB+=`❤ ${(entity.health*100).toFixed(0)}% ⚡ ${(entity.energy*100).toFixed(0)}% 🍖 ${(entity.hunger*100).toFixed(0)}%<br>`;if(entity.height)ttB+=`Height: ${entity.height}cm · Weight: ${entity.weight}kg<br>`;if(entity.poisonTicks>0)ttB+=`☠️ Poison: ${Math.ceil(entity.poisonTicks)} ticks<br>`;if(entity.tamedBy){const owner=entities.find(e=>e.id===entity.tamedBy);if(owner)ttB+=`🦮 Tamed by ${owner.firstName||owner.id}<br>`;}ttB+=`Fav: ${FOOD_TYPES[entity.favoriteFood]?.emoji||''} ${entity.favoriteFood||''}<br>`;if(ents.length>1)ttB+=`+${ents.length-1} more`;}else{ttN=`${tile.biome.charAt(0).toUpperCase()+tile.biome.slice(1)} (${x},${y})`;ttB=`Plants:${tile.plants.toFixed(0)}/${tile.maxP} Water:${tile.water.toFixed(0)}/${(tile.maxW||0).toFixed(0)}`;}document.getElementById('tt-n').textContent=ttN;document.getElementById('tt-b').innerHTML=ttB;tt.style.display='block';const rect=canvas.getBoundingClientRect();tt.style.left=Math.min(e.clientX-rect.left+14,canvas.clientWidth-220)+'px';tt.style.top=Math.max(4,e.clientY-rect.top-8)+'px';}
function createTribe(name,founderOrg,govType='tribe'){const col=TRIBE_COLORS[(nextTribeId-1)%TRIBE_COLORS.length];const t={id:nextTribeId++,name,color:col,govType,leaderIds:[founderOrg.id],memberIds:new Set([founderOrg.id]),territory:new Set(),capital:{x:founderOrg.x,y:founderOrg.y},faith:founderOrg.beliefId||'',tech:0,treasury:10,laws:{warAllowed:true,inbreedingPenalty:true,religionMandatory:false},diplomacy:{},age:0,stats:{wars:0,alliances:0,births:0,deaths:0,migrations:0},rebellion:0};founderOrg.tribeId=t.id;founderOrg.polRank=2;return t;}
function getTribe(id){return tribes.find(t=>t.id===id);}
function addToTribe(org,tribeId){const t=getTribe(tribeId);if(!t)return;t.memberIds.add(org.id);org.tribeId=tribeId;if(!org.polRank)org.polRank=0;}
function tribeOfOrg(org){if(!org||!org.tribeId)return null;return getTribe(org.tribeId);}
function tribeRelation(aId,bId){if(aId===bId)return'self';const ta=getTribe(aId);if(!ta)return'neutral';return ta.diplomacy[bId]||ta.diplomacy[String(bId)]||'neutral';}
function setDiplomacy(aId,bId,state){const ta=getTribe(aId),tb=getTribe(bId);if(ta)ta.diplomacy[bId]=state;if(tb)tb.diplomacy[aId]=state;}
function stepPolitics(){const tribesToRemove=[];for(const t of tribes){t.age++;const members=entities.filter(o=>o.alive&&o.tribeId===t.id);if(members.length===0){tribesToRemove.push(t);continue;}t.memberIds=new Set(members.map(o=>o.id));t.tech+=GOV_TYPES[t.govType].techRate*members.length*.001;t.treasury=Math.min(9999,t.treasury+members.length*GOV_TYPES[t.govType].taxRate*.01);const avgHunger=members.reduce((s,o)=>s+o.hunger,0)/members.length;const avgHealth=members.reduce((s,o)=>s+o.health,0)/members.length;t.rebellion=Math.max(0,Math.min(1,avgHunger*.4+(1-avgHealth)*.3-t.tech*.1));if(t.rebellion>.8&&rng()<.05){const rebels=members.filter(()=>rng()<.4);if(rebels.length>=3){const rLeader=rebels[0];for(const r of rebels){t.memberIds.delete(r.id);r.tribeId=null;}const newT=createTribe(`Rebel-${t.id}`,rLeader,'tribe');for(const r of rebels.slice(1))addToTribe(r,newT.id);tribes.push(newT);setDiplomacy(t.id,newT.id,DIP_STATES.war);addEv('politics',`⚔ Rebellion! ${t.name} splits → ${newT.name}`,'#e04040');}}members.forEach(o=>{if(!o.polRank)o.polRank=0;if(o.age>o.sp?.mature*4&&o.polRank<2)o.polRank=1;});t.territory=new Set();for(const m of members){for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++){const tx=m.x+dx,ty=m.y+dy;if(tx>=0&&tx<W&&ty>=0&&ty<H)t.territory.add(`${tx},${ty}`);}}if(GOV_TYPES[t.govType].warBias>0){for(const[otherId,state]of Object.entries(t.diplomacy||{})){if(state===DIP_STATES.war){const enemies=entities.filter(o=>o.alive&&o.tribeId===parseInt(otherId));const myWarriors=members.filter(o=>o.polRank>=2);if(myWarriors.length>0&&enemies.length>0){const warrior=rngChoice(myWarriors);const enemy=enemies.find(e=>Math.abs(e.x-warrior.x)+Math.abs(e.y-warrior.y)<5);if(enemy&&rng()<.08){enemy.health=Math.max(0,enemy.health-.3);if(enemy.health<=0){enemy.alive=false;const et=getTile(enemy.x,enemy.y);if(et)et.occupants.delete(enemy.id);t.stats.wars++;addEv('politics',`⚔ ${t.name} warrior killed ${enemy.id.slice(-4)}`,'#e05050');}}}}}}if(rng()<.002&&tribes.length>1){const other=rngChoice(tribes.filter(x=>x.id!==t.id));if(!other)continue;const rel=tribeRelation(t.id,other.id);if(rel==='neutral'&&rng()<.4){setDiplomacy(t.id,other.id,rng()<.5?DIP_STATES.trade:DIP_STATES.alliance);addEv('politics',`🤝 ${t.name} + ${other.name}: ${t.diplomacy[other.id]}`,'#a0a0ff');}else if(rel==='neutral'&&rng()<.2&&GOV_TYPES[t.govType].warBias>.15){setDiplomacy(t.id,other.id,DIP_STATES.war);addEv('politics',`⚔ ${t.name} declares WAR on ${other.name}`,'#e04040');}}}for(const t of tribesToRemove){addEv('politics',`🏚 Tribe dissolved: ${t.name}`,'#666');tribes.splice(tribes.indexOf(t),1);}if(tick%200===0){const unaffiliated=entities.filter(o=>o.alive&&!o.tribeId&&o.sp?.canTool);for(const org of unaffiliated){if(org.tribeId)continue;const nearby=unaffiliated.filter(o=>!o.tribeId&&o.id!==org.id&&Math.abs(o.x-org.x)<=3&&Math.abs(o.y-org.y)<=3);if(nearby.length>=4&&tribes.length<30){const tName=rngChoice(['Iron','Stone','River','Moon','Sun','Shadow','Blood','Silver','Golden','Storm','Dark','Holy'])+rngChoice(['Claw','Fang','Root','Path','Hand','Wing','Fire','Wind','Peak','Shore','Song','Eye']);const nt=createTribe(tName,org);for(const n of nearby.slice(0,rngI(2,8)))addToTribe(n,nt.id);tribes.push(nt);addEv('politics',`🏕 New tribe formed: ${tName} (${nt.memberIds.size} members)`,'#d4a820');}}}}
function createFaction(name,tribeId,capitalX,capitalY){const f={id:nextFactionId++,name,tribeId,color:TRIBE_COLORS[(nextFactionId-2)%TRIBE_COLORS.length],roofCol:FACTION_ROOF_COLS[(nextFactionId-2)%FACTION_ROOF_COLS.length],capital:{x:capitalX,y:capitalY},buildingIds:[],population:0,tech:0,treasury:0,stockpile:{wood:0,stone:0,food:0},expansionCd:0,warTargets:new Set()};factions.push(f);const bld=spawnBuilding('tent',capitalX,capitalY,f.id,f.roofCol);if(bld)f.buildingIds.push(bld.id);addEv('econ',`🏕 ${name} founded at (${capitalX},${capitalY})`,'#d4a820');return f;}
function getFaction(id){return factions.find(f=>f.id===id)||null;}
function spawnBuilding(type,x,y,factionId,roofCol){const bt={tent:{level:0,name:'Tent',cap:3,costW:5,costS:0,hp:30},hut:{level:1,name:'Hut',cap:5,costW:15,costS:5,hp:60},house:{level:2,name:'House',cap:8,costW:30,costS:20,hp:100},townhall:{level:3,name:'Town Hall',cap:20,costW:60,costS:50,hp:200},fortress:{level:4,name:'Fortress',cap:30,costW:50,costS:120,hp:400},market:{level:2,name:'Market',cap:0,costW:25,costS:15,hp:80},temple:{level:2,name:'Temple',cap:0,costW:20,costS:30,hp:80}}[type];if(!bt)return null;const bld={id:nextBldId++,type,x,y,factionId,roofCol:roofCol||'#4a80cc',hp:bt.hp,maxHp:bt.hp,residents:new Set(),storage:{wood:0,stone:0,food:0},age:0};buildings.push(bld);markTileDirty(x,y);return bld;}
let buildings=[],nextBldId=1;
function stepEconomy(){for(const f of factions){if(f.expansionCd>0)f.expansionCd--;f.population=entities.filter(o=>o.alive&&o.tribeId===f.tribeId).length;const foodNeeded=f.population*.005;f.stockpile.food=Math.max(0,f.stockpile.food-foodNeeded);tryUpgradeFaction(f);if(f.expansionCd===0&&f.population>8&&(f.stockpile.wood>=15||f.stockpile.stone>=5)){tryExpandFaction(f);}}for(const bld of buildings){bld.age++;const f=getFaction(bld.factionId);if(f){if(bld.type==='market')f.stockpile.food+=.02;if(bld.type==='temple')f.treasury+=.01;}if(bld.hp<bld.maxHp&&bld.hp>0)bld.hp=Math.min(bld.maxHp,bld.hp+0.05);markTileDirty(bld.x,bld.y);}const dead=buildings.filter(b=>b.hp<=0);for(const b of dead){const f=getFaction(b.factionId);if(f)f.buildingIds=f.buildingIds.filter(id=>id!==b.id);buildings.splice(buildings.indexOf(b),1);markTileDirty(b.x,b.y);addEv('econ',`💥 Building destroyed at (${b.x},${b.y})`,'#e04040');}}
function tryUpgradeFaction(f){const blds=buildings.filter(b=>b.factionId===f.id);const tent=blds.filter(b=>b.type==='tent');const hut=blds.filter(b=>b.type==='hut');const house=blds.filter(b=>b.type==='house');for(const b of tent){if(f.population>=4&&f.stockpile.wood>=15&&f.stockpile.stone>=5){f.stockpile.wood-=15;f.stockpile.stone-=5;b.type='hut';b.hp=60;b.maxHp=60;markTileDirty(b.x,b.y);addEv('econ',`🛖 ${f.name} upgraded to Hut`,'#d4a820');}}for(const b of hut){if(f.population>=10&&f.stockpile.wood>=30&&f.stockpile.stone>=20&&blds.length>=3){f.stockpile.wood-=30;f.stockpile.stone-=20;b.type='house';b.hp=100;b.maxHp=100;markTileDirty(b.x,b.y);addEv('econ',`🏠 ${f.name} built a House!`,'#60c060');}}if(house.length>=5&&!blds.find(b=>b.type==='townhall')&&f.stockpile.wood>=60&&f.stockpile.stone>=50){f.stockpile.wood-=60;f.stockpile.stone-=50;const th=spawnBuilding('townhall',f.capital.x,f.capital.y+1,f.id,f.roofCol);if(th){f.buildingIds.push(th.id);addEv('econ',`🏛 ${f.name} built a Town Hall!`,'#6c75ff');}}if(blds.find(b=>b.type==='townhall')&&!blds.find(b=>b.type==='fortress')&&f.warTargets.size>0&&f.stockpile.wood>=50&&f.stockpile.stone>=120){f.stockpile.wood-=50;f.stockpile.stone-=120;const fort=spawnBuilding('fortress',f.capital.x+1,f.capital.y,f.id,f.roofCol);if(fort){f.buildingIds.push(fort.id);addEv('econ',`🏰 ${f.name} built a Fortress!`,'#9050e0');}}}
function tryExpandFaction(f){const blds=buildings.filter(b=>b.factionId===f.id);if(blds.length>=f.population/3||blds.length>=20)return;const ref=blds[Math.floor(rng()*blds.length)];if(!ref)return;const dirs=[[-1,0],[1,0],[0,-1],[0,1],[-2,0],[2,0],[0,-2],[0,2],[-1,-1],[1,1],[-1,1],[1,-1]];for(const[dx,dy]of dirs){const nx=ref.x+dx,ny=ref.y+dy;if(nx<1||nx>=W-1||ny<1||ny>=H-1)continue;const t=getTile(nx,ny);if(!t||t.biome==='river'||t.biome==='mountain'||t.biome==='lava')continue;if(buildings.find(b=>b.x===nx&&b.y===ny))continue;const ri=resObjects.findIndex(r=>r.x===nx&&r.y===ny);if(ri>=0)resObjects.splice(ri,1);const newBld=spawnBuilding('tent',nx,ny,f.id,f.roofCol);if(newBld){f.buildingIds.push(newBld.id);f.stockpile.wood=Math.max(0,f.stockpile.wood-5);f.expansionCd=rngI(80,160);}return;}}

// FIX: renderGenetics now defined (was missing entirely, caused crash on button click)
function renderGenetics(){
  const el=document.getElementById('gw-body');if(!el)return;
  const al=entities.filter(o=>o.alive&&o.sp?.canTool);
  if(al.length===0){el.innerHTML='<div style="color:var(--muted);padding:8px">No sentient entities alive.</div>';return;}
  const sample=al.slice(0,12);
  let html='<div style="font-size:8px;color:var(--muted);margin-bottom:6px">Showing up to 12 sentient entities · Tick '+tick+'</div>';
  html+='<div style="display:grid;grid-template-columns:76px 52px 52px 80px;gap:2px;font-size:8px;color:var(--muted);margin-bottom:2px"><span>Entity</span><span>Fitness</span><span>Het.</span><span>Traits</span></div>';
  for(const e of sample){
    const tr=Object.values(e.pheno?.traits||{}).join(', ')||'—';
    html+=`<div class="locus-row">
      <span style="color:#fff">${e.firstName} <span style="color:var(--muted)">${e.species}</span></span>
      <span class="${e.genome.fitness>.6?'dom':'rec'}">${e.genome.fitness.toFixed(2)}</span>
      <span style="color:var(--info)">${e.genome.heterozygosity.toFixed(2)}</span>
      <span style="color:var(--muted);font-size:7px">${tr.slice(0,30)}</span>
    </div>`;
  }
  html+='<div style="margin-top:8px;font-size:8px;color:var(--muted)">Population genetics</div>';
  html+=`<div class="srow"><span>Total mutations</span><span class="sval">${totalMutations}</span></div>`;
  html+=`<div class="srow"><span>Inbreeding warnings</span><span class="sval">${inbreedingWarnings}</span></div>`;
  html+=`<div class="srow"><span>Max generation</span><span class="sval">${al.length>0?Math.max(...al.map(o=>o.gen)):0}</span></div>`;
  el.innerHTML=html;
}

// FIX: renderPolitics now defined (was missing entirely, caused crash on button click)
function renderPolitics(){
  const el=document.getElementById('pol-body');if(!el)return;
  if(tribes.length===0){el.innerHTML='<div style="color:var(--muted);padding:8px">No tribes formed yet. Entities form tribes automatically over time.</div>';return;}
  let html='<div style="font-size:8px;color:var(--muted);margin-bottom:6px">'+tribes.length+' active tribes · Tick '+tick+'</div>';
  for(const t of tribes){
    const gov=GOV_TYPES[t.govType]||GOV_TYPES.tribe;
    const members=entities.filter(o=>o.alive&&o.tribeId===t.id);
    const leader=members.find(o=>t.leaderIds.includes(o.id));
    const dipLines=Object.entries(t.diplomacy||{}).map(([id,s])=>{
      const ot=getTribe(parseInt(id));
      const col={war:'#e04040',alliance:'#60c060',trade:'#d4a820',vassal:'#a0a0ff',neutral:'#666'}[s]||'#666';
      return`<span style="color:${col}">${{war:'⚔',alliance:'🤝',trade:'💰',vassal:'⬇',neutral:'—'}[s]} ${ot?.name||'?'}</span>`;
    }).join(' ');
    html+=`<div style="background:var(--bg2);border:1px solid ${t.color}40;border-radius:5px;padding:6px;margin-bottom:6px">
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
        <div style="width:10px;height:10px;background:${t.color};border-radius:2px"></div>
        <b style="color:#fff">${t.name}</b>
        <span style="color:var(--muted)">${gov.symbol} ${gov.name}</span>
      </div>
      <div class="srow"><span>Members</span><span class="sval">${members.length}</span></div>
      <div class="srow"><span>Leader</span><span class="sval">${leader?leader.firstName:'—'}</span></div>
      <div class="srow"><span>Tech</span><span class="sval">${(t.tech||0).toFixed(2)}</span></div>
      <div class="srow"><span>Treasury</span><span class="sval">💰${(t.treasury||0).toFixed(1)}</span></div>
      <div class="srow"><span>Rebellion</span><span class="sval" style="color:${(t.rebellion||0)>.5?'#e04040':'#60c060'}">${((t.rebellion||0)*100).toFixed(0)}%</span></div>
      <div class="srow"><span>Faith</span><span class="sval">${t.faith?BELIEFS[t.faith]?.emoji+' '+BELIEFS[t.faith]?.name:'—'}</span></div>
      <div style="margin-top:3px;font-size:8px;color:var(--muted)">Diplomacy: ${dipLines||'isolated'}</div>
    </div>`;
  }
  el.innerHTML=html;
}

function initGame(seedStr){
  worldSeedCode=seedStr||'';
  const numSeed=seedStr?seedFromString(seedStr):(Date.now()%999999999);
  setSeed(numSeed);
  if(!worldSeedCode)worldSeedCode=String(numSeed).slice(0,8);
  tick=0;entities=[];nextId=1;tribes=[];nextTribeId=1;factions=[];nextFactionId=1;buildings=[];nextBldId=1;events=[];popHistory={h:[],c:[],o:[]};totalMutations=0;inbreedingWarnings=0;
  lineageGraph.nodes={};lineageGraph.parents={};lineageGraph.children={};
  fireTiles.clear();lavaTiles.clear();resObjects=[];nextResId=1;
  cam={x:0,y:0,zoom:1,panActive:false,panStartX:0,panStartY:0,panCamX:0,panCamY:0};
  const tbSeed=document.getElementById('tb-seedcode');if(tbSeed)tbSeed.textContent=`🌱 ${worldSeedCode}`;
  if(seedStr&&WORLD_PRESETS[seedStr]){initWorldFromPreset(seedStr);}else{initWorld();}
  const startSpecies=['human','elf','dwarf','orc','cat','dog','sheep','cow','pig','chicken','wolf','fox','frog','fish','bee'];
  for(const sp of startSpecies){
    for(let i=0;i<rngI(2,5);i++){
      let x,y,t,tries=0;
      do{x=rngI(5,W-6);y=rngI(5,H-6);t=getTile(x,y);tries++;}while((!t||t.biome==='mountain'||t.biome==='river'||t.biome==='lava')&&tries<20);
      spawnEntity(sp,x,y,rngI(20,60));
    }
  }
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const tile=getTile(x,y);if(tile&&tile.biome!=='river'&&tile.biome!=='lava'&&rng()<0.3){const res=spawnResObject(tile.biome,x,y);if(res)resObjects.push(res);}}
  minimapDirty=true;
  addEv('system',`🌱 The Seeds v0.6.2 · Seed: ${worldSeedCode}`,'#6c75ff');
  updateStats();
}
function centerCamera(){const tileS=TILE_BASE*cam.zoom;cam.x=(W*tileS-canvas.width)/2;cam.y=(H*tileS-canvas.height)/2;clampCamera();}
let lastT=0,INTERVAL=280,loopStarted=false;
function loop(now){if(!paused&&now-lastT>=INTERVAL/speed){stepSim();lastT=now;}renderWorld();requestAnimationFrame(loop);}
function startLoop(){if(!loopStarted){loopStarted=true;requestAnimationFrame(loop);}}
const SAVE_PREFIX='seeds_save_',SAVE_SLOTS=5;
function serializeWorld(){return{version:'0.6.2',seed:worldSeedCode,tick,nextId,nextTribeId,totalMutations,inbreedingWarnings,world:world.map(t=>({x:t.x,y:t.y,biome:t.biome,plants:Math.round(t.plants*10)/10,water:Math.round(t.water*10)/10,maxP:t.maxP,maxW:t.maxW,fert:t.fert,nutrients:Math.round(t.nutrients*10)/10,fireLevel:t.fireLevel,variation:t.variation})),entities:entities.filter(e=>e.alive).map(e=>({id:e.id,species:e.species,sex:e.sex,x:e.x,y:e.y,age:Math.round(e.age),gen:e.gen,parents:e.parents,health:Math.round(e.health*1000)/1000,energy:Math.round(e.energy*1000)/1000,hunger:Math.round(e.hunger*1000)/1000,thirst:Math.round(e.thirst*1000)/1000,genome:{loci:e.genome.loci,mutRate:e.genome.mutRate,founderTags:e.genome.founderTags,fitness:e.genome.fitness,heterozygosity:e.genome.heterozygosity,mutHistory:e.genome.mutHistory.slice(-10)},beliefId:e.beliefId,devotion:Math.round(e.devotion*100)/100,diseaseLevel:Math.round(e.diseaseLevel*100)/100,immunity:Math.round(e.immunity*100)/100,lifespan:Math.round(e.lifespan),founderTag:e.founderTag,tribeId:e.tribeId,polRank:e.polRank,repCd:e.repCd,pregnant:e.pregnant,gestTick:e.gestTick,offspringCount:e.offspringCount,kinshipWarn:e.kinshipWarn,firstName:e.firstName,lastName:e.lastName,fullName:e.fullName,height:e.height,weight:e.weight,skinColor:e.skinColor,favoriteFood:e.favoriteFood,gold:e.gold,tamedBy:e.tamedBy,poisonTicks:e.poisonTicks,poisonStrength:e.poisonStrength,inventory:e.inventory})),tribes:tribes.map(t=>({...t,memberIds:[...t.memberIds],territory:[...t.territory],leaderIds:[...t.leaderIds]})),resObjects:resObjects.map(r=>({...r})),buildings:buildings.map(b=>({...b,residents:[...b.residents]})),factions:factions.map(f=>({...f,warTargets:[...f.warTargets]})),lineageNodes:Object.values(lineageGraph.nodes),events:events.slice(0,30),popHistory,cam:{x:cam.x,y:cam.y,zoom:cam.zoom},fireTiles:[...fireTiles],lavaTiles:[...lavaTiles]};}
function deserializeWorld(data){if(!data||data.version!=='0.6.2')return false;try{setSeed(seedFromString(data.seed||'random'));worldSeedCode=data.seed||'';tick=data.tick||0;nextId=data.nextId||1;nextTribeId=data.nextTribeId||1;totalMutations=data.totalMutations||0;inbreedingWarnings=data.inbreedingWarnings||0;world=data.world.map(t=>({...t,occupants:new Set(),maxW:t.maxW||(BIOMES[t.biome]?.water||40)*1.5}));entities=[];for(const o of data.entities){const sp=SPECIES[o.species];if(!sp)continue;const entity={...o,sp,alive:true,pheno:expressGenome(o.genome),lastAction:'idle',faithCd:0,rituals:0};const tile=getTile(o.x,o.y);if(tile)tile.occupants.add(o.id);entities.push(entity);}tribes=data.tribes.map(t=>({...t,memberIds:new Set(Array.isArray(t.memberIds)?t.memberIds:[...t.memberIds]),territory:new Set(Array.isArray(t.territory)?t.territory:[...t.territory]),leaderIds:Array.isArray(t.leaderIds)?t.leaderIds:[...(t.leaderIds||[])],diplomacy:t.diplomacy||{},stats:t.stats||{wars:0,alliances:0,births:0,deaths:0,migrations:0}}));resObjects=data.resObjects||[];buildings=(data.buildings||[]).map(b=>({...b,residents:new Set(Array.isArray(b.residents)?b.residents:[])}));factions=data.factions||[];lineageGraph.nodes={};lineageGraph.parents={};lineageGraph.children={};for(const n of(data.lineageNodes||[])){lgAddNode(n.id,n.familyId,n.lineageId,n.gen,n.parentIds,n.founderTags);}events=data.events||[];popHistory=data.popHistory||{h:[],c:[],o:[]};if(data.cam){cam.x=data.cam.x;cam.y=data.cam.y;cam.zoom=data.cam.zoom||1;}fireTiles=new Set(data.fireTiles||[]);lavaTiles=new Set(data.lavaTiles||[]);markAllDirty();minimapDirty=true;const tbSeed=document.getElementById('tb-seedcode');if(tbSeed)tbSeed.textContent=worldSeedCode?`🌱 ${worldSeedCode}`:'';return true;}catch(err){console.error('Load error:',err);return false;}}
function saveToSlot(slotIndex,name){const data=serializeWorld();const meta={name:name||`World ${slotIndex+1}`,tick,year:getYear(),alive:entities.filter(o=>o.alive).length,tribes:tribes.length,date:new Date().toLocaleString(),seed:worldSeedCode};try{localStorage.setItem(SAVE_PREFIX+slotIndex,JSON.stringify(data));localStorage.setItem(SAVE_PREFIX+slotIndex+'_meta',JSON.stringify(meta));return true;}catch(e){console.error('Save error:',e);return false;}}
function loadFromSlot(slotIndex){try{const raw=localStorage.getItem(SAVE_PREFIX+slotIndex);if(!raw)return false;const data=JSON.parse(raw);return deserializeWorld(data);}catch(e){console.error('Load error:',e);return false;}}
function getSlotMetas(){return Array.from({length:SAVE_SLOTS},(_,i)=>{try{const m=localStorage.getItem(SAVE_PREFIX+i+'_meta');return m?{...JSON.parse(m),index:i}:null;}catch{return null;}}).filter(Boolean);}
function autoSave(){saveToSlot(0,'Auto-Save');const flash=document.getElementById('autosave-flash');if(flash){flash.classList.add('show');setTimeout(()=>flash.classList.remove('show'),2500);}}
function openSaveUI(){const win=document.getElementById('savewin');const isHidden=getComputedStyle(win).display==='none';win.style.display=isHidden?'block':'none';if(isHidden)renderSaveUI();}
function renderSaveUI(){const body=document.getElementById('save-body');const metas=getSlotMetas();let html='<div style="font-size:9px;color:var(--muted);margin-bottom:8px">Select a slot to save to:</div>';for(let i=0;i<SAVE_SLOTS;i++){const meta=metas.find(m=>m.index===i);if(meta){html+=`<div class="slot-row" onclick="doSave(${i})"><div class="slot-info"><div class="sn">Slot ${i+1}: ${meta.name}</div><div class="sm">Tick ${meta.tick} · Y${meta.year} · ${meta.alive} alive · ${meta.tribes} tribes · ${meta.date}</div></div><button class="slot-btn" onclick="event.stopPropagation();deleteSlot(${i})">✕</button></div>`;}else{html+=`<div class="slot-row" onclick="doSave(${i})"><div class="slot-info"><div class="sn" style="color:var(--muted)">Slot ${i+1} — Empty</div></div></div>`;}}html+=`<div style="border-top:1px solid var(--border);margin-top:8px;padding-top:8px;display:flex;gap:6px"><button onclick="exportWorldJSON()" style="flex:1;background:none;border:1px solid var(--accent2);border-radius:4px;padding:4px;cursor:pointer;color:var(--accent2);font-family:var(--font);font-size:9px">⬇ Export JSON</button><label style="flex:1;background:none;border:1px solid var(--border2);border-radius:4px;padding:4px;cursor:pointer;color:var(--muted);font-family:var(--font);font-size:9px;text-align:center">⬆ Import JSON<input type="file" accept=".json" style="display:none" onchange="importWorldJSON(event)"></label></div>`;body.innerHTML=html;}
function doSave(slotIndex){const name=prompt('Save name:',`World ${slotIndex+1}`)??`World ${slotIndex+1}`;if(saveToSlot(slotIndex,name)){notif(`💾 Saved to Slot ${slotIndex+1}`);}else{notif('⚠ Save failed (storage full?)');}document.getElementById('savewin').style.display='none';}
function deleteSlot(i){localStorage.removeItem(SAVE_PREFIX+i);localStorage.removeItem(SAVE_PREFIX+i+'_meta');renderSaveUI();}
function exportWorldJSON(){const data=serializeWorld();const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`seeds_${worldSeedCode||'world'}_tick${tick}.json`;a.click();URL.revokeObjectURL(a.href);notif('⬇ World exported!');}
function importWorldJSON(evt){const file=evt.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=e=>{try{const data=JSON.parse(e.target.result);if(deserializeWorld(data)){updateStats();document.getElementById('savewin').style.display='none';notif('⬆ World imported!');}else notif('⚠ Import failed — invalid format');}catch(err){notif('⚠ Import error: '+err.message);}};reader.readAsText(file);evt.target.value='';}
function loadSlotAndStart(slotIndex){document.getElementById('save-slots').style.display='none';document.getElementById('title-screen').style.display='none';document.getElementById('app').style.display='flex';resizeCanvas();if(loadFromSlot(slotIndex)){updateStats();notif('📂 World loaded!');}else{notif('⚠ Load failed — starting new world');initGame('');centerCamera();}startLoop();}
function deleteSaveSlot(i){deleteSlot(i);document.getElementById('btn-load-game').click();}
document.addEventListener('keydown',e=>{if(getComputedStyle(document.getElementById('app')).display==='none')return;if(e.code==='Space'){e.preventDefault();document.getElementById('btn-pause').click();}if(e.code==='KeyG')document.getElementById('btn-gen').click();if(e.code==='KeyP')document.getElementById('btn-pol').click();if(e.code==='KeyS'&&e.ctrlKey){e.preventDefault();openSaveUI();}if(e.code==='Equal'||e.code==='NumpadAdd'){cam.zoom=Math.min(ZOOM_MAX,cam.zoom*1.2);markAllDirty();}if(e.code==='Minus'||e.code==='NumpadSubtract'){cam.zoom=Math.max(ZOOM_MIN,cam.zoom/1.2);markAllDirty();}if(e.code==='Home'){centerCamera();}});
(function(){
  const tc=document.getElementById('title-canvas');
  const tcx=tc.getContext('2d');
  let tpArticles=[];
  function resizeTitle(){tc.width=window.innerWidth;tc.height=window.innerHeight;}
  resizeTitle();
  window.addEventListener('resize',resizeTitle);
  for(let i=0;i<60;i++)tpArticles.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*1.5+.5,col:`hsla(${220+Math.random()*60},80%,70%,${Math.random()*.4+.1})`});
  function animTitle(){
    if(document.getElementById('title-screen').style.display==='none')return;
    tcx.clearRect(0,0,tc.width,tc.height);
    for(let i=0;i<tpArticles.length;i++)for(let j=i+1;j<tpArticles.length;j++){const a=tpArticles[i],b=tpArticles[j];const d=Math.hypot(a.x-b.x,a.y-b.y);if(d<120){tcx.strokeStyle=`rgba(108,117,255,${(1-d/120)*.15})`;tcx.lineWidth=.5;tcx.beginPath();tcx.moveTo(a.x,a.y);tcx.lineTo(b.x,b.y);tcx.stroke();}}
    for(const p of tpArticles){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=tc.width;if(p.x>tc.width)p.x=0;if(p.y<0)p.y=tc.height;if(p.y>tc.height)p.y=0;tcx.fillStyle=p.col;tcx.beginPath();tcx.arc(p.x,p.y,p.r,0,Math.PI*2);tcx.fill();}
    requestAnimationFrame(animTitle);
  }
  requestAnimationFrame(animTitle);
  document.getElementById('btn-rand-seed').addEventListener('click',()=>{const seeds=['GoldenAge','IronDawn','StormBorn','FrostRoot','VoidSeed','OmegaRun','AlphaPrime'];document.getElementById('seed-input').value=rngChoice(seeds)+(Math.floor(Math.random()*999)+1);});
  document.getElementById('btn-new-game').addEventListener('click',()=>{const seedVal=document.getElementById('seed-input').value.trim()||'';document.getElementById('title-screen').style.display='none';document.getElementById('app').style.display='flex';resizeCanvas();initGame(seedVal);centerCamera();startLoop();});
  document.getElementById('btn-load-game').addEventListener('click',()=>{document.getElementById('save-slots').style.display='flex';const list=document.getElementById('slot-list');const metas=getSlotMetas();if(metas.length===0){list.innerHTML='';document.getElementById('no-saves').style.display='block';}else{document.getElementById('no-saves').style.display='none';list.innerHTML=metas.map(m=>`<div class="slot-row" onclick="loadSlotAndStart(${m.index})"><div class="slot-info"><div class="sn">Slot ${m.index+1}: ${m.name}</div><div class="sm">Tick ${m.tick} · Y${m.year} · ${m.alive} alive · ${m.date}</div><div class="sm">Seed: ${m.seed||'random'}</div></div><button class="slot-btn" onclick="event.stopPropagation();deleteSaveSlot(${m.index})">✕</button></div>`).join('');}});
  document.getElementById('sp-close').addEventListener('click',()=>{document.getElementById('save-slots').style.display='none';});
})();
document.getElementById('btn-pause').addEventListener('click',function(){paused=!paused;this.textContent=paused?'▶ Play':'⏸ Pause';this.classList.toggle('on',paused);});
document.getElementById('btn-save').addEventListener('click',openSaveUI);
document.getElementById('saveclose').addEventListener('click',()=>{document.getElementById('savewin').style.display='none';});
document.getElementById('btn-gen').addEventListener('click',()=>{const w=document.getElementById('genwin');const isHidden=getComputedStyle(w).display==='none';w.style.display=isHidden?'block':'none';if(isHidden)renderGenetics();});
document.getElementById('gwclose').addEventListener('click',()=>{document.getElementById('genwin').style.display='none';});
document.getElementById('btn-pol').addEventListener('click',()=>{const w=document.getElementById('polwin');const isHidden=getComputedStyle(w).display==='none';w.style.display=isHidden?'block':'none';if(isHidden)renderPolitics();});
document.getElementById('polclose').addEventListener('click',()=>{document.getElementById('polwin').style.display='none';});
document.getElementById('btn-menu').addEventListener('click',()=>{paused=true;const pauseBtn=document.getElementById('btn-pause');pauseBtn.textContent='▶ Play';pauseBtn.classList.add('on');document.getElementById('app').style.display='none';document.getElementById('title-screen').style.display='flex';});
document.getElementById('logo-btn').addEventListener('click',()=>{document.getElementById('genwin').style.display='none';document.getElementById('polwin').style.display='none';document.getElementById('savewin').style.display='none';});
document.querySelectorAll('.tbtn2[data-tool]').forEach(b=>{b.addEventListener('click',function(){document.querySelectorAll('.tbtn2[data-tool]').forEach(x=>x.classList.remove('sel'));this.classList.add('sel');selectedTool=this.dataset.tool;});});
document.querySelectorAll('.tbtn2[data-view]').forEach(b=>{b.addEventListener('click',function(){document.querySelectorAll('.tbtn2[data-view]').forEach(x=>x.classList.remove('sel'));this.classList.add('sel');viewMode=this.dataset.view;});});
document.querySelectorAll('.sbtn').forEach(b=>{b.addEventListener('click',function(){document.querySelectorAll('.sbtn').forEach(x=>x.classList.remove('on'));this.classList.add('on');speed=parseFloat(this.dataset.spd);});});
document.getElementById('gp-rain').addEventListener('click',()=>{for(const t of world)t.water=Math.min(t.maxW,t.water+18);minimapDirty=true;addEv('god','🌧 Divine rain','#3080d8');notif('🌧 The rains come!');});
document.getElementById('gp-fertile').addEventListener('click',()=>{for(const t of world){t.plants=Math.min(t.maxP,t.plants+35);t.nutrients=Math.min(100,t.nutrients+25);}addEv('god','🌱 Fertile season','#e89820');notif('🌱 Life flourishes!');});
document.getElementById('gp-evolve').addEventListener('click',()=>{let mut=0;const al=entities.filter(o=>o.alive);for(const org of al){applyMutation(org.genome,rngChoice(LOCI),'god_intervene',tick);org.pheno=expressGenome(org.genome);totalMutations++;mut++;}addEv('god',`🧬 Force evolution: ${mut} mutated`,'#6c75ff');notif(`🧬 ${mut} mutations!`);});
document.getElementById('gp-bless').addEventListener('click',()=>{let n=0;for(const org of entities.filter(o=>o.alive)){org.beliefId='sun_worship';org.devotion=Math.min(1,org.devotion+.5);org.health=Math.min(1,org.health+.1);org.energy=Math.min(1,org.energy+.15);n++;}addEv('god',`✨ Sun blessing ×${n}`,'#e89820');notif(`✨ ${n} blessed!`);});
document.getElementById('gp-peace').addEventListener('click',()=>{let cnt=0;for(const ta of tribes)for(const id of Object.keys(ta.diplomacy||{})){if(ta.diplomacy[parseInt(id)]==='war'){setDiplomacy(ta.id,parseInt(id),'neutral');cnt++;}}addEv('god',`☮ Divine peace — ${cnt} wars ended`,'#60c060');notif(`☮ Peace! ${cnt} wars ended`);});
document.getElementById('gp-drought').addEventListener('click',()=>{for(const t of world){t.water=Math.max(0,t.water*.15);t.plants=Math.max(0,t.plants*.35);}for(const org of entities.filter(o=>o.alive)){org.thirst=Math.min(1,org.thirst+.45);org.hunger=Math.min(1,org.hunger+.2);}minimapDirty=true;addEv('god','🔥 Drought!','#e04040');notif('🔥 The land burns!');});
document.getElementById('gp-storm').addEventListener('click',()=>{let killed=0;for(const org of entities.filter(o=>o.alive)){if(rng()<.28){org.health=Math.max(0,org.health-.6);if(org.health<=0){org.alive=false;killed++;}}applyMutation(org.genome,rngChoice(LOCI),'radiation',tick);org.pheno=expressGenome(org.genome);totalMutations++;}addEv('god',`⚡ Storm killed ${killed}`,'#e04040');notif(`⚡ ${killed} perished!`);});
document.getElementById('gp-plague').addEventListener('click',()=>{let n=0;for(const org of entities.filter(o=>o.alive)){if(rng()<.55){org.diseaseLevel=Math.min(1,org.diseaseLevel+.45);n++;applyMutation(org.genome,'resilience','plague',tick);org.pheno=expressGenome(org.genome);totalMutations++;}}addEv('god',`🦠 Plague infected ${n}`,'#a32d2d');notif(`🦠 Plague! ${n} infected!`);});
document.getElementById('gp-cull').addEventListener('click',()=>{let culled=0;for(const org of [...entities]){if(org.alive&&org.genome.fitness<.35&&rng()<.7){org.alive=false;culled++;const t=getTile(org.x,org.y);if(t)t.occupants.delete(org.id);}}addEv('god',`☠ Culled ${culled} weak`,'#888');notif(`☠ ${culled} culled.`);});
document.getElementById('gp-war').addEventListener('click',()=>{if(tribes.length>=2){const ta=rngChoice(tribes);const others=tribes.filter(t=>t.id!==ta.id);if(others.length>0){const tb=rngChoice(others);setDiplomacy(ta.id,tb.id,DIP_STATES.war);addEv('politics',`⚔ God ignites war: ${ta.name} vs ${tb.name}`,'#e04040');notif(`⚔ War: ${ta.name} vs ${tb.name}`);}}else notif('Need 2+ tribes for war');});
document.getElementById('gp-anoint').addEventListener('click',()=>{const al=entities.filter(o=>o.alive);if(al.length===0)return;const chosen=al.reduce((a,b)=>a.genome.fitness>b.genome.fitness?a:b);chosen.polRank=8;chosen.health=1;chosen.energy=1;const tr=tribeOfOrg(chosen);if(tr)tr.leaderIds=[chosen.id];addEv('politics',`👑 Anointed King: ${chosen.fullName} of ${tr?.name||'???'}`,'#d4a820');notif(`👑 King: ${chosen.fullName}`);});
document.getElementById('gp-revelation').addEventListener('click',()=>{const belief=rngChoice(BELIEF_IDS);for(const org of entities.filter(o=>o.alive)){if(rng()<.6){org.beliefId=belief;org.devotion=Math.min(1,org.devotion+.4);}}addEv('god',`📜 Revelation: ${BELIEFS[belief].emoji} ${BELIEFS[belief].name} spreads`,'#9050e0');notif(`📜 ${BELIEFS[belief].name} revealed!`);});