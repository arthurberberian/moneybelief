
import re

with open('KMSI_Adaptado_content.txt', 'r') as f:
    content = f.read()

# Encontrar o início da seção 'Versão Adaptada ao Contexto Brasileiro'
adapted_version_start = content.find('Versão Adaptada ao Contexto Brasileiro:')
if adapted_version_start == -1:
    print('Erro: Seção \'Versão Adaptada ao Contexto Brasileiro\' não encontrada.')
    exit()

adapted_content = content[adapted_version_start:]

# Extrair as questões e seus números
questions = []
# Regex para capturar o número da questão e o texto da afirmação
# Ajustado para lidar com o caso do item 3 que tem uma linha extra de escala de Likert
question_pattern = re.compile(r'\n(\d+)\. ([^\n]+)(?:\n1 = Discordo totalmente \| 2 = Discordo \| 3 = Discordo um pouco \| 4 = Concordo um pouco \| 5 = Concordo \| 6 = Concordo totalmente)?\n')

matches = question_pattern.finditer(adapted_content)
for match in matches:
    q_num = int(match.group(1))
    q_text = match.group(2).strip()
    questions.append({'number': q_num, 'text': q_text})

# Extrair Procedimentos de Pontuação
scoring_start = content.find('Procedimentos de Pontuação (traduzido):')
scoring_end = content.find('Interpretação dos Escores (traduzido):')
scoring_text = content[scoring_start:scoring_end].strip()

# Extrair Interpretação dos Escores
interpretation_start = content.find('Interpretação dos Escores (traduzido):')
interpretation_text = content[interpretation_start:].strip()

# Salvar as informações extraídas em arquivos separados
with open('kmsi_questions.txt', 'w') as f:
    for q in questions:
        f.write(f'{q["number"]}. {q["text"]}\n')

with open('kmsi_scoring.txt', 'w') as f:
    f.write(scoring_text)

with open('kmsi_interpretation.txt', 'w') as f:
    f.write(interpretation_text)


