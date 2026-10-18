/* Original Waggle Workshop × PakTV Ghar browser-only playroom. No child profiles. */
(()=>{"use strict";
const $=id=>document.getElementById(id);
const board=$("gameBoard"),feedback=$("gameFeedback"),stars=$("gameStars");
const gameNames={letters:"Letter Garden",numbers:"Count & Smile",colours:"Colour Pop",shapes:"Shape Safari",memory:"Animal Pairs",builder:"Rainbow Bricks"};
const descriptions={letters:"Find the right alphabet letter.",numbers:"Count the little friends and choose a number.",colours:"Can you spot the colour?",shapes:"Find the matching shape.",memory:"Turn the cards to match the animals.",builder:"Paint a colourful brick picture. Make anything you imagine!"};
const letterChoices=[["A","Apple","🍎"],["B","Ball","⚽"],["C","Cat","🐱"],["D","Drum","🥁"],["E","Elephant","🐘"],["F","Flower","🌼"],["G","Goat","🐐"],["H","Hat","🎩"],["I","Ice cream","🍨"],["J","Juice","🧃"],["K","Kite","🪁"],["L","Lion","🦁"],["M","Mango","🥭"],["N","Nest","🪺"],["O","Orange","🍊"],["P","Parrot","🦜"]];
const colours=[["Red","#e7525c"],["Blue","#459ff0"],["Yellow","#ffcb54"],["Green","#4bb978"],["Purple","#9568db"],["Orange","#f58c48"],["Pink","#ef83a4"],["Brown","#9d684d"]];
const shapes=[["Circle","●"],["Square","■"],["Triangle","▲"],["Star","★"],["Heart","♥"],["Diamond","◆"]];
const animals=["🦁","🐼","🦋","🐸","🐯","🐰","🐙","🦄","🐨","🦊"];
let current="letters",mode="little",score=0,round=0,generation=0,activeColour="#69bd91",memoryState=null;
function elem(tag,cl,text){const el=document.createElement(tag);if(cl)el.className=cl;if(text!==undefined)el.textContent=String(text);return el;}
const rand=max=>Math.floor(Math.random()*max);
function pick(arr){return arr[rand(arr.length)];}
function shuffle(src){let a=src.slice();for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function distinctCorrect(correct,options,count){const rest=shuffle(options.filter(x=>x!==correct));return shuffle([correct,...rest.slice(0,count-1)]);}
function announce(text,type=""){feedback.textContent=text;feedback.className="feedback "+type;}
function win(){score++;stars.textContent="⭐ "+score+" "+(score===1?"star":"stars");announce(pick(["Lovely work! 🌟","You did it! ✨","Fantastic! 🥳","Excellent! 🎉"]),"yay");}
function reset(){
 generation++;score=0;round=0;stars.textContent="⭐ 0 stars";mode=$("ageMode").value;
 board.replaceChildren();$("gameHeading").textContent=gameNames[current];
 $("gameDescription").textContent=descriptions[current];
 announce(current==="builder"?"Choose a colour, then tap a brick.":"Choose an answer to play.");
 for(const button of document.querySelectorAll("[data-game]"))button.setAttribute("aria-pressed",String(button.dataset.game===current));
 if(current==="memory")startMemory();else if(current==="builder")startBuilder();else nextQuestion();
}
function nextQuestion(){
 board.replaceChildren();round++;
 if(current==="letters")lettersRound();else if(current==="numbers")numbersRound();
 else if(current==="colours")coloursRound();else if(current==="shapes")shapesRound();
}
function question(text,subtitle){
 const el=elem("div","question",text);
 if(subtitle)el.append(elem("small","",subtitle));board.append(el);return el;
}
function answerButtons(choices,correct,format){
 const grid=elem("div","answer-grid"),myGen=generation;
 for(const value of choices){
  const button=elem("button","",value);
  button.type="button";
  if(format)format(button,value);
  button.addEventListener("click",()=>{
   if(generation!==myGen||grid.dataset.done==="yes")return;
   if(value===correct){
    grid.dataset.done="yes";button.classList.add("right");
    for(const b of grid.querySelectorAll("button"))b.disabled=true;
    win();setTimeout(()=>{if(generation===myGen)nextQuestion();},1000);
   }else{
    button.classList.add("wrong");button.disabled=true;
    announce("Good try! Have another go. 💛","try");
   }
  });
  grid.append(button);
 }
 board.append(grid);
}
function lettersRound(){
 const max=mode==="little"?8:letterChoices.length;
 const item=letterChoices[rand(max)];
 question(item[2]+" "+item[1],"Which letter does "+item[1]+" start with?");
 answerButtons(distinctCorrect(item[0],letterChoices.slice(0,max).map(x=>x[0]),mode==="little"?3:4),item[0]);
}
function numbersRound(){
 const count=1+rand(mode==="little"?5:10),things=pick(["⭐","🍊","🐣","🦋","🌸"]);
 question(things.repeat(count),"How many can you see?");
 const possibilities=Array.from({length:mode==="little"?5:10},(_,i)=>i+1).map(String);
 answerButtons(distinctCorrect(String(count),possibilities,mode==="little"?3:4),String(count));
}
function coloursRound(){
 const arr=colours.slice(0,mode==="little"?5:8);
 const correct=pick(arr);const candidates=distinctCorrect(correct[0],arr.map(v=>v[0]),mode==="little"?3:4);
 question("Find "+correct[0]+"!","Tap the "+correct[0].toLowerCase()+" colour.");
 answerButtons(candidates,correct[0],(button,name)=>{
  button.classList.add("color-choice");
  button.style.background=arr.find(x=>x[0]===name)[1];
  button.setAttribute("aria-label",name);
  button.title=name;
 });
}
function shapesRound(){
 const arr=shapes.slice(0,mode==="little"?4:6),correct=pick(arr);
 const show=elem("div","question-art",correct[1]);show.setAttribute("aria-hidden","true");
 board.append(show);question("What shape is this?","Choose the name of the shape.");
 answerButtons(distinctCorrect(correct[0],arr.map(x=>x[0]),mode==="little"?3:4),correct[0]);
}
function startMemory(){
 const pairCount=mode==="little"?3:6;const chosen=shuffle(animals).slice(0,pairCount);
 const deck=shuffle(chosen.concat(chosen).map((emoji,i)=>({emoji,id:i})));
 const grid=elem("div","memory-grid"),myGen=generation;
 memoryState={open:[],matched:new Set(),busy:false};
 question("Find the matching animals!","Turn two cards at a time.");
 for(const card of deck){
  const button=elem("button","","?");
  button.type="button";button.setAttribute("aria-label","Face-down animal card");
  button.addEventListener("click",()=>{
   if(myGen!==generation||memoryState.busy||memoryState.matched.has(card.id)||memoryState.open.some(x=>x.card.id===card.id))return;
   button.textContent=card.emoji;button.classList.add("up");
   button.setAttribute("aria-label","Animal "+card.emoji);
   memoryState.open.push({card,button});
   if(memoryState.open.length!==2)return;
   const [a,b]=memoryState.open;
   if(a.card.emoji===b.card.emoji){
     memoryState.matched.add(a.card.id);memoryState.matched.add(b.card.id);
     a.button.classList.add("matched");b.button.classList.add("matched");
     a.button.disabled=true;b.button.disabled=true;memoryState.open=[];win();
     if(memoryState.matched.size===deck.length)announce("Every animal matched! Brilliant! 🦁🥳","yay");
   }else{
     memoryState.busy=true;announce("Not a pair yet — remember where they are!","try");
     setTimeout(()=>{
       if(myGen!==generation)return;
       a.button.textContent="?";b.button.textContent="?";
       a.button.setAttribute("aria-label","Face-down animal card");b.button.setAttribute("aria-label","Face-down animal card");
       a.button.classList.remove("up");b.button.classList.remove("up");memoryState.open=[];memoryState.busy=false;
     },950);
   }
  });
  grid.append(button);
 }
 board.append(grid);
}
function startBuilder(){
 const container=elem("div","builder"),palette=elem("div","brick-colours");
 question("Build a rainbow masterpiece!","Choose a colour and paint the squares.");
 const swatches=["#69bd91","#f37c73","#ffd36e","#83b6ed","#af88e5","#ff9c59","#fffefa"];
 activeColour=swatches[0];
 function select(){
  for(const button of palette.querySelectorAll("button"))button.setAttribute("aria-pressed",String(button.dataset.color===activeColour));
 }
 for(const [i,colour] of swatches.entries()){
  const b=elem("button");b.type="button";b.dataset.color=colour;b.style.background=colour;
  b.setAttribute("aria-label",i===6?"White eraser":"Colour "+["green","red","yellow","blue","purple","orange"][i]);
  b.addEventListener("click",()=>{activeColour=colour;select();});
  palette.append(b);
 }
 select();
 const grid=elem("div","brick-grid"),n=mode==="little"?32:48;
 for(let i=0;i<n;i++){
  const b=elem("button");b.type="button";b.style.background="#fff";b.setAttribute("aria-label","Brick "+(i+1)+", paint with chosen colour");
  b.addEventListener("click",()=>{b.style.background=activeColour;announce("Looking colourful! Keep creating. 🎨","yay");});
  grid.append(b);
 }
 container.append(palette,grid);board.append(container);
}
for(const button of document.querySelectorAll("[data-game]"))button.addEventListener("click",()=>{current=button.dataset.game;reset();});
$("restartGame").addEventListener("click",reset);
$("ageMode").addEventListener("change",reset);
reset();
})();