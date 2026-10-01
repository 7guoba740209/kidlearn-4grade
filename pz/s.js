(function(){var log=[];function L(s){log.push(s);}
window.addEventListener('error',function(e){L('JS-ERROR: '+(e.message||'')+' @'+(e.filename||'').split('/').pop()+':'+(e.lineno||''));});
function dump(){var p=document.createElement('pre');p.id='DIAG';p.textContent=log.join('\n');document.body.appendChild(p);}
window.addEventListener('load',function(){setTimeout(function(){
  location.hash='#/cn/4a/u1/1';
  setTimeout(function(){
    var br=document.getElementById('btnRead');
    L('语文：btnRead='+!!br);
    if(br){var h0=location.hash;br.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
      setTimeout(function(){
        L('  点后 hash='+location.hash+' | 跳页='+(location.hash!==h0?'❌':'✅没跳'));
        L('  speaking='+speechSynthesis.speaking);
        L('  songBar显示='+(document.getElementById('songBar')?!document.getElementById('songBar').hidden:'-'));
        L('  高亮段落='+document.querySelectorAll('#textBox p.now').length);
        L('  hint='+(document.getElementById('readHint')||{}).textContent);
        L('');
        location.hash='#/en/w/4a/M1';
        setTimeout(function(){
          var rows=document.querySelectorAll('.js-say');var b=0;
          rows.forEach(function(r){if(typeof r.onclick==='function')b++;});
          L('英语：.js-say='+rows.length+' 已绑定='+b);
          if(rows.length){speechSynthesis.cancel();
            var w=rows[0].getAttribute('data-w');
            rows[0].dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
            setTimeout(function(){L('  点"'+w+'" → speaking='+speechSynthesis.speaking);
              L('');
              location.hash='#/en/g/scramble/4a/M1';
              setTimeout(function(){
                var z=document.getElementById('sZhSay');
                L('游戏页：#sZhSay='+!!z+' 已绑定='+(z&&typeof z.onclick==='function'));
                if(z){speechSynthesis.cancel();z.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
                  setTimeout(function(){L('  点「再听一遍」→ speaking='+speechSynthesis.speaking);dump();},700);}
                else dump();
              },900);},700);}else dump();
        },800);
      },800);}else{L('无 btnRead');dump();}
  },700);
},800);});})();
