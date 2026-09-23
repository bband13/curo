(() => {
  const labels = {
    English:{find:'Find care',how:'How it works',needs:'Care needs',about:'About Curo',contact:'Contact',saved:'Saved',access:'Accessibility',start:'Start finding care',browse:'Browse hospitals',explore:'Explore the prototype',feedback:'Send feedback'},
    Hindi:{find:'इलाज खोजें',how:'यह कैसे काम करता है',needs:'देखभाल की जरूरतें',about:'क्यूरो के बारे में',contact:'संपर्क',saved:'सहेजे गए',access:'सुलभता',start:'इलाज खोजना शुरू करें',browse:'अस्पताल देखें',explore:'प्रोटोटाइप देखें',feedback:'प्रतिक्रिया भेजें'},
    Punjabi:{find:'ਇਲਾਜ ਲੱਭੋ',how:'ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ',needs:'ਦੇਖਭਾਲ ਦੀਆਂ ਲੋੜਾਂ',about:'ਕਿਊਰੋ ਬਾਰੇ',contact:'ਸੰਪਰਕ',saved:'ਸੁਰੱਖਿਅਤ',access:'ਪਹੁੰਚਯੋਗਤਾ',start:'ਇਲਾਜ ਲੱਭਣਾ ਸ਼ੁਰੂ ਕਰੋ',browse:'ਹਸਪਤਾਲ ਵੇਖੋ',explore:'ਪ੍ਰੋਟੋਟਾਈਪ ਵੇਖੋ',feedback:'ਫੀਡਬੈਕ ਭੇਜੋ'},
    Bengali:{find:'চিকিৎসা খুঁজুন',how:'কীভাবে কাজ করে',needs:'চিকিৎসার প্রয়োজন',about:'কিউরো সম্পর্কে',contact:'যোগাযোগ',saved:'সংরক্ষিত',access:'অ্যাক্সেসিবিলিটি',start:'চিকিৎসা খোঁজা শুরু করুন',browse:'হাসপাতাল দেখুন',explore:'প্রোটোটাইপ দেখুন',feedback:'মতামত পাঠান'},
    Tamil:{find:'சிகிச்சையைத் தேடுங்கள்',how:'எப்படி செயல்படுகிறது',needs:'சிகிச்சை தேவைகள்',about:'க்யூரோ பற்றி',contact:'தொடர்பு',saved:'சேமித்தவை',access:'அணுகல்தன்மை',start:'சிகிச்சையைத் தேடத் தொடங்குங்கள்',browse:'மருத்துவமனைகளைப் பார்க்கவும்',explore:'முன்மாதிரியைப் பார்க்கவும்',feedback:'கருத்தை அனுப்பவும்'}
  };
  function apply(){
    const lang=localStorage.getItem('curoLang')||'English', t=labels[lang]||labels.English;
    document.querySelectorAll('.desktop-nav a').forEach(a=>{const h=a.getAttribute('href')||''; if(h.includes('hospitals'))a.textContent=t.find; else if(h.includes('how-it-works'))a.textContent=t.how; else if(h.includes('services'))a.textContent=t.needs; else if(h.includes('about'))a.textContent=t.about});
    document.querySelectorAll('.mobile-menu a').forEach(a=>{const h=a.getAttribute('href')||''; if(h.includes('hospitals'))a.textContent=t.find; else if(h.includes('how-it-works'))a.textContent=t.how; else if(h.includes('services'))a.textContent=t.needs; else if(h.includes('about'))a.textContent=t.about});
    document.querySelectorAll('.footer-links a').forEach(a=>{const h=a.getAttribute('href')||''; if(h.includes('hospitals'))a.textContent=t.find; else if(h.includes('how-it-works'))a.textContent=t.how; else if(h.includes('services'))a.textContent=t.needs; else if(h.includes('about'))a.textContent=t.about; else if(h.includes('contact'))a.textContent=t.contact; else if(h.includes('saved'))a.textContent=t.saved});
    const access=document.getElementById('accessibilityBtn'); if(access)access.textContent=t.access;
    document.querySelectorAll('.language-btn').forEach(b=>b.innerHTML=`<span>◎</span> ${lang} <span class="chevron">⌄</span>`);
  }
  apply();
  document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setTimeout(apply,0)));
  window.addEventListener('storage',e=>{if(e.key==='curoLang')apply()});
})();
