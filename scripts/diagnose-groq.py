"""One tiny real request; print only allowlisted error metadata, never prompts/keys."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import httpx
from app.prototype.config import cfg
with httpx.Client(timeout=30) as c:
    r = c.post('https://api.groq.com/openai/v1/chat/completions',
        headers={'Authorization':'Bearer '+cfg.GROQ_API_KEY},
        json={'model':cfg.GROQ_MODEL,'messages':[{'role':'user','content':'Return JSON {"ok":true}'}],
              'max_completion_tokens':80,'reasoning_effort':'low','response_format':{'type':'json_object'}})
    print('status:',r.status_code,'content-type:',r.headers.get('content-type'),'server:',r.headers.get('server'))
    try:
        data = r.json()
        error = data.get('error',{})
        print('error type:',str(error.get('type',''))[:100],'code:',str(error.get('code',''))[:100])
        message = str(error.get('message','')).lower()
        print('error categories:',[w for w in ['country','region','permission','model','organization','vpn','blocked','denied','access','unsupported'] if w in message])
        if r.status_code == 200: print('reported_tokens:',data.get('usage',{}).get('total_tokens'))
    except ValueError:
        print('non-JSON response; cloudflare:', 'cloudflare' in r.text.lower(), 'access denied:', 'access denied' in r.text.lower())
