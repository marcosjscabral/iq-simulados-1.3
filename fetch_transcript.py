import urllib.request
import json
import re
import sys

def get_transcript(video_id):
    url = f"https://www.youtube.com/watch?v={video_id}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching page: {e}")
        return
        
    match = re.search(r"ytInitialPlayerResponse\s*=\s*({.+?})\s*;", html)
    if not match:
        print("Could not find ytInitialPlayerResponse")
        return
        
    try:
        data = json.loads(match.group(1))
    except Exception as e:
        print(f"Error parsing JSON: {e}")
        return
        
    captions = data.get('captions', {}).get('playerCaptionsTracklistRenderer', {}).get('captionTracks', [])
    if not captions:
        print("No captions found")
        return
        
    caption_url = captions[0]['baseUrl']
    try:
        xml_content = urllib.request.urlopen(caption_url).read().decode('utf-8')
        # Extract text from XML
        texts = re.findall(r'<text[^>]*>([^<]+)</text>', xml_content)
        # Decode HTML entities
        import html as html_lib
        texts = [html_lib.unescape(t) for t in texts]
        
        print("--- TRANSCRIPT START ---")
        for i in range(0, len(texts), 10):
            print(" ".join(texts[i:i+10]))
        print("--- TRANSCRIPT END ---")
    except Exception as e:
        print(f"Error fetching/parsing captions: {e}")

if __name__ == "__main__":
    get_transcript("JI1NrhISihs")
