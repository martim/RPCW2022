import json

with open('arq-son.json') as f:
    content = json.load(f)

for id_count, data in enumerate(content['musicas']):
    data['id'] = id_count

with open('arq-son.json', 'w') as f:
    f.write(json.dumps(content, indent=4, ensure_ascii=False))