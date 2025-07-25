
import re
import json

# Carregar o conteúdo dos arquivos extraídos
with open("kmsi_questions.txt", "r") as f:
    questions_raw = f.readlines()

with open("kmsi_scoring.txt", "r") as f:
    scoring_raw = f.read()

with open("kmsi_interpretation.txt", "r") as f:
    interpretation_raw = f.read()

# Processar questões
questions = []
for line in questions_raw:
    match = re.match(r"^(\d+)\. (.*)", line)
    if match:
        questions.append({"number": int(match.group(1)), "text": match.group(2).strip()})

# Processar regras de pontuação
scoring_rules = {}
scoring_sections = re.findall(r"([A-Za-zÀ-ú ]+ \([A-Za-z ]+\)): Itens ([\d, ]+)", scoring_raw)
for section, items in scoring_sections:
    dimension_name = section.split(" (")[0].strip()
    item_numbers = [int(i.strip()) for i in items.split(",")]
    scoring_rules[dimension_name] = item_numbers

# Processar regras de interpretação
interpretation_rules = {}
current_dimension = None

# Dividir o texto de interpretação em seções por dimensão
dimensions_text = re.split(r"\n([A-Za-zÀ-ú ]+)\n•", interpretation_raw)

# A primeira parte é o cabeçalho, as demais são as dimensões
for i in range(1, len(dimensions_text), 2):
    dimension_name = dimensions_text[i].strip()
    interpretation_rules[dimension_name] = []
    
    # As regras para a dimensão atual estão na próxima parte
    rules_for_dimension = dimensions_text[i+1].strip().split("\n• ")
    for rule in rules_for_dimension:
        if rule.strip(): # Evitar linhas vazias
            interpretation_rules[dimension_name].append(rule.strip())

# Estruturar os dados em um dicionário
kmsi_data = {
    "title": "Inventário de Crenças sobre o Dinheiro (KMSI - Adaptado)",
    "version_info": "(Klontz, ). Versão Brasileira (Gouveia et al., 2022)",
    "instructions": "Por favor, leia cada frase abaixo e marque o quanto você concorda com as afirmações, utilizando a seguinte escala:\n\n1 = Discordo totalmente | 2 = Discordo | 3 = Discordo um pouco | 4 = Concordo um pouco | 5 = Concordo | 6 = Concordo totalmente\n\nUse essa pontuação para determinar o quanto você se identifica com cada afirmação sobre o dinheiro.",
    "likert_scale": [
        {"value": 1, "text": "Discordo totalmente"},
        {"value": 2, "text": "Discordo"},
        {"value": 3, "text": "Discordo um pouco"},
        {"value": 4, "text": "Concordo um pouco"},
        {"value": 5, "text": "Concordo"},
        {"value": 6, "text": "Concordo totalmente"}
    ],
    "questions": questions,
    "scoring_rules": scoring_rules,
    "interpretation_rules": interpretation_rules
}

# Salvar em um arquivo JSON
with open("kmsi_data.json", "w", encoding="utf-8") as f:
    json.dump(kmsi_data, f, ensure_ascii=False, indent=4)


