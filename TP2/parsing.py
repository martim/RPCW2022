import json

def criar_pagina_filme(filme_id, filme, atores):
    f = open("arquivo/filmes/"+ filme_id + ".html", "w")
    f.write(f'''<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <title>{filme['title']}</title>
    </head>
    <body>
        <h1><b>{filme['title']}</b></h1>
        <ul>
            <li><b>Ano</b>: {filme['year']}</li>
            <li><b>Elenco</b>:
                <ul>
                ''')
    for ator in sorted(filme['cast']):
        f.write(f'''\t<li><a href="http://localhost:7777/atores/{atores[ator]['id']}">{ator}</a></li>\n\t\t\t\t''')
    f.write(f'''</ul>
            </li>
            <li><b>Género</b>:
                <ul>''')
    for genero in filme['genres']:
        f.write(f'''\n\t\t\t\t\t<li>{genero}</li>''')
    f.write(f'''\n\t\t\t\t</ul>
    \t\t</li>
    \t</ul>
    </body>
</html>''')
    
def criar_pagina_ator(ator_nome, ator):
    filmes_sorted = list(sorted(ator['filmes'], key=lambda x: x['title']))
    f = open("arquivo/atores/" + ator['id'] + ".html", "w")
    f.write(f'''<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <title>{ator_nome}</title>
    </head>
    <body>
        <h1><b>{ator_nome}</b></h1>
        <h3><b>Participa em:</b></h3>
        <ul>
        ''')
    for filme in filmes_sorted:
         f.write(f'''\t<li><a href="http://localhost:7777/filmes/{filme['id']}">{filme['title']}</a></li>\n\t\t''')
    f.write(f'''</ul>
    </body>
</html>''')

def criar_pagina_principal_filmes(filmes):
    filmes_sorted = dict(sorted(filmes.items(), key=lambda x: x[1]['title']))
    f = open("arquivo/filmes/index.html", "w")
    f.write(f'''<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <title>Lista de Filmes</title>
    </head>
    <body>
        <h1><b>Lista de Filmes</b></h1>
        <ul>
        ''')
    for filme in filmes_sorted:
         f.write(f'''\t<li><a href="http://localhost:7777/filmes/{filme}">{filmes_sorted[filme]['title']}</a></li>\n\t\t''')
    f.write(f'''</ul>
    </body>
</html>''')

def criar_pagina_principal_atores(atores):
    atores_sorted = dict(sorted(atores.items(), key=lambda x: x[0]))
    f = open("arquivo/atores/index.html", "w")
    f.write(f'''<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <title>Lista de Atores</title>
    </head>
    <body>
        <h1><b>Lista de Atores</b></h1>
        <ul>
        ''')
    for ator in atores_sorted:
         f.write(f'''\t<li><a href="http://localhost:7777/atores/{atores_sorted[ator]['id']}">{ator}</a></li>\n\t\t''')
    f.write(f'''</ul>
    </body>
</html>''')

with open('cinemaATP.json', 'r') as f:
    data = json.load(f)
filmes = {}
atores = {}
filmes_count = 1
ator_count = 1

for filme in data:
    filme_key = 'f' + str(filmes_count)
    filmes[filme_key] = filme
    for ator in filme["cast"]:
        if ator not in atores:
            ator_key = 'a' + str(ator_count)
            atores[ator] = { 'id' : ator_key , 'filmes' : [] }
            ator_count += 1
        atores[ator]['filmes'].append({ 'id' : filme_key ,'title' : filme["title"]})
    filmes_count += 1

for filme in filmes:
    criar_pagina_filme(filme, filmes[filme], atores)

for ator in atores:
    criar_pagina_ator(ator,atores[ator])

criar_pagina_principal_filmes(filmes)

criar_pagina_principal_atores(atores)
