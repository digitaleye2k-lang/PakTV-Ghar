/* TV drama player title and channel are displayed as decorative projections.
   Text is sourced from the active player and inserted only as textContent. */
(()=>{"use strict";
const overlay=document.getElementById("playerOverlay"),title=document.getElementById("playerTitle"),source=document.getElementById("playerSource");
if(!overlay||!title||!source)return;
const ambience=document.createElement("div");ambience.className="drama-ambience";ambience.setAttribute("aria-hidden","true");
const left=document.createElement("div"),right=document.createElement("div");
left.className=right.className="drama-ambience-track";
const kicker=document.createElement("span"),name=document.createElement("span"),channelLabel=document.createElement("span"),channel=document.createElement("span");
kicker.className=channelLabel.className="drama-ambience-kicker";kicker.textContent="NOW SHOWING";channelLabel.textContent="ON AIR FROM";
name.className="drama-ambience-title";channel.className="drama-ambience-channel";
left.append(kicker,name);right.append(channelLabel,channel);ambience.append(left,right);
overlay.insertBefore(ambience,overlay.querySelector(".player-panel"));
function refresh(){name.textContent=title.textContent.trim()||"Pakistani Drama";channel.textContent=source.textContent.trim()||"PakTV Ghar";}
const observer=new MutationObserver(refresh);observer.observe(title,{childList:true,characterData:true,subtree:true});observer.observe(source,{childList:true,characterData:true,subtree:true});refresh();
})();