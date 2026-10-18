/* Update the drama title strip embedded directly in the HTML player. */
(()=>{"use strict";
const title=document.getElementById("playerTitle"),source=document.getElementById("playerSource");
const glowTitle=document.getElementById("dramaGlowTitle"),glowChannel=document.getElementById("dramaGlowChannel");
if(!title||!source||!glowTitle||!glowChannel)return;
function update(){glowTitle.textContent=title.textContent.trim()||"Pakistani Drama";glowChannel.textContent=source.textContent.trim()||"PakTV Ghar";}
const o=new MutationObserver(update);
o.observe(title,{childList:true,characterData:true,subtree:true});
o.observe(source,{childList:true,characterData:true,subtree:true});update();
})();